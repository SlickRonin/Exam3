import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import OpenAI from "openai";
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { AVPlaybackStatus } from 'expo-av/build/AV';
import { MaterialIcons } from '@expo/vector-icons';
import { OPENAI_API_KEY } from '@env';
import * as Types from '../../interface/interface';
import * as db from '../../database/database';
import { globalStyles } from '../../styles/globalStyles';
import CheckBox from 'react-native-elements/dist/checkbox/CheckBox'; // Add this import

// check for api key
if (!OPENAI_API_KEY) {
  console.error("OpenAI API key is missing. Please check your .env file.");
}
// instantiate OpenAI client
const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// FIXME: test voice themes and research accessibility reqs
const voiceThemes: Record<string, Types.VoiceTheme> = {
  alloy: { color: '#6200ee', icon: 'record-voice-over', description: 'Neutral, balanced voice with clear articulation' },
  echo: { color: '#3700b3', icon: 'surround-sound', description: 'Deep, resonant voice with a measured pace' },
  fable: { color: '#03dac4', icon: 'auto-stories', description: 'Warm, friendly voice with expressive tones' },
  onyx: { color: '#333333', icon: 'mic', description: 'Rich, authoritative voice with depth' },
  nova: { color: '#bb86fc', icon: 'stars', description: 'Bright, energetic voice with upbeat delivery' },
  shimmer: { color: '#018786', icon: 'waves', description: 'Soft, gentle voice with a soothing quality' },
  ballad: { color: '#32a852', icon: 'star', description: 'Warm, refined, and gently instructive, reminiscent of a friendly art instructor' },
  sage: { color: '#fcba03', icon: 'air', description: 'Friendly, clear, and reassuring, creating a calm atmosphere and making the listener feel confident and comfortable' },
};
// voice theme selector component; might reduce to single voice
// FIXME: fix this god-awful component mapping--columns, not rows
const VoiceThemeSelector: React.FC<Types.VoiceThemeSelectorProps> = ({ selectedVoice, onVoiceSelected }) => {
  return (
    <View style={styles.voiceThemeContainer}>
      <Text style={styles.voiceThemeTitle}>Select Voice Theme</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.voiceThemeScroll}>
        {Object.entries(voiceThemes).map(([voice, theme]) => (
          <TouchableOpacity
            key={voice}
            style={[
              styles.voiceThemeOption,
              { backgroundColor: theme.color },
              selectedVoice === voice && styles.selectedVoiceTheme
            ]}
            onPress={() => onVoiceSelected(voice)}
          >
            <MaterialIcons name={theme.icon} size={24} color="white" />
            <Text style={styles.voiceThemeName}>{voice.charAt(0).toUpperCase() + voice.slice(1)}</Text>
            <Text style={styles.voiceThemeDescription}>{theme.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default function AskAI() {
  // handlers
  const [ask, setAsk] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean }>({
    option1: false,
    option2: false,
    option3: false,
  });
  const [isOption1Selected, setIsOption1Selected] = useState(false); //CHANGED
  const [isOption2Selected, setIsOption2Selected] = useState(false);
  const [isOption3Selected, setIsOption3Selected] = useState(false);
  // user info
  const [baseMeds, setBaseMeds] = useState<Types.MedicineWithDescription[]>([]);
  const [medsTaken, setMedsTaken] = useState<string>('');
  const [medsNotTaken, setMedsNotTaken] = useState<string>('');
  const [medsOverdue, setMedsOverdue] = useState<string>('');
  const [overdueMeds, setOverdueMeds] = useState<Types.OverdueMedicine[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // FIXME: i do not know what this does
  useEffect(() => {
      // Fetch products when the component mounts
      db.fetchAllMedAndDesc().then((data) => {
        setBaseMeds(data ?? []);  // Set the fetched data into the state, fallback to an empty array if null
        // console.log('Fetched medicine and description:', data);
      }).catch((error) => {
        // console.error('Error fetching medicine and description:', error);
      });
      db.getOverdueMedicines().then((data) => {
        setOverdueMeds(data ?? []);  // Set the fetched data into the state, fallback to an empty array if null
        // console.log('Fetched overdue medicine:', data);
      }).catch((error) => {
        console.error('Error fetching medicine and description:', error);
      });
      // clean up audio when component unmounts
      return sound
        ? () => {
            sound.unloadAsync();
          }
        : undefined;
    }, [sound]);

  // user analysis outputs
  // NOTE: don't shorten the word 'analysis'; typing the last four letters makes all the difference
  const [finalAnalysis, setFinalAnalysis] = useState<string>('');
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  type ResponseType = {
      output_text?: string;
      data?: Array<{ content?: string }>;
      text?: string;
  };
  // helper to extract content from OpenAI response
  const extractContent = (response: ResponseType): string => {
    if (response.output_text) return response.output_text;
    if (response.data) {
      for (let item of response.data) {
        if (item.content) return item.content;
      }
    }
    if (response.text) return response.text;
    return JSON.stringify(response);
  };

  // stringify baseMeds for system prompt
  const baseMedsString = baseMeds.map((med) => `
  \n${(med.MedID) ? `${med.MedID}. ` : ''}${med.MedName}:
  \n- Dosage: ${med.DosageQuantity} ${med.DosageMeasurment}
  \n- Frequency: ${med.FrequencyHours} hours
  \n-Last Taken: ${med.LastTaken}
  \n- Description: ${med.SpecialDescription}
  \n- Side Effects: ${med.SideEffects}
  \n- Interations: ${med.Interactions}
  \n- Required?: ${(med.UsageRequired) ? 'Yes' : 'No'}
  `).join('\n');

  // meds required string
  const medsRequiredString = baseMeds.map((med) => (med.UsageRequired && med.LastTaken) ? `
  \n${med.MedName}:
  \n- Frequency: ${med.FrequencyHours} hours
  \n-Last Taken: ${med.LastTaken}
  `: '').join('\n');



  // overdue meds string
  const overdueMedsString = overdueMeds.map((med) => `
  \n${med.MedName}:
  \n- Frequency: ${med.FrequencyHours} hours
  \n-Last Taken: ${med.LastTaken}
  `).join('\n');


  // console.log("Base meds string:", baseMedsString);
  // console.log("Base meds string:", overdueMedsString);

  // FIXME: add name for AI assistant
  const systemPrompt = `You are ___________, a medication manager for people who struggle to keep track of their daily medicine 
  intake (e.g., senior citizens). Your job is to provide advice and answer questions regarding the user's current medicine 
  schedule: ${baseMedsString}. You are also responsible for researching any drug interactions (e.g., among medications, between 
  medications and food or drink) and answering any general health questions the user has. THIS WILL REQUIRE YOU TO USE THE 
  SEARCH FEATURE TO OBTAIN THE MOST RECENT AND ACCURATE MEDICAL DATA/ADVICE. Be clear and concise with your responses (i.e., 
  no unnecessary flourishes or redundant information) and answer using plaintext only (i.e., no markdown or any special 
  characters used for formatting). After every query, kindly remind the user that you are not a licensed professional and, for 
  any questions you cannot sufficiently answer, offer suggestions for which the user can acquire more reputable advice (e.g., 
  for health organizations: websites, articles, academic journals, etc.).
  `;

  /*
  // FIXME: in progress; async doesn't work; might not need if finalAnalysis handles basic user queries
  const handleAsk = () => {
    // placeholder response logic
    if (!ask.trim()) {
      setResponse('Please enter a question.');
      console.log('No question entered.');
    } else {
      setResponse(`You asked: "${ask}"`);
    }

    setLoading(true);
    try {
      const result = await client.responses.create({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: systemPrompt,
      });
      setResponse(result.output_text || "No response received.");
    } catch (error) {
      console.error("Error generating response:", error);
      setResponse("Failed to get a response.");
    } finally {
      setLoading(false);
    }
  };
  */

  // FIXME: in progress; implement toggle for meds taken/not taken/overdue; fix medsTaken and medsNotTaken types
  const runUserAnalysis = async () => {
    setMedsTaken(''); setMedsNotTaken(''); setMedsOverdue(''); setFinalAnalysis('');
    setLoading(true);

    
    // include meds taken
    if (isOption2Selected && medsRequiredString.length > 0) {
      setLoadingSection('medsTaken');
      try {
        const medsTakenResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: `Provide a list of medications the user has already taken after evaluating the list below and kindly 
          advise the user to not take them again today: ${medsRequiredString}`
        }) as ResponseType; // type assertion
        console.log("Meds taken response:", medsTakenResponse);
        const medsTakenContent = extractContent(medsTakenResponse);
        setMedsTaken(medsTakenContent);
        console.log("Meds taken content:", medsTakenContent);
      } catch (error) {
        console.error("Error generating medication advice:", error);
        setMedsTaken("Error generating analysis. Please try again.");
      }
    } else {
      console.log("No medications taken today.");
    }
    // include meds not taken
    if (isOption1Selected && medsRequiredString.length > 0) {
      setLoadingSection('medsNotTaken');
      try {
        const medsNotTakenResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: `Provide a list of medications the user has not yet taken after evaluating the list below and kindly 
          advise the user to take them today: ${medsRequiredString}`
        }) as ResponseType; // type assertion
        console.log("Meds not taken response:", medsNotTakenResponse);
        const medsNotTakenContent = extractContent(medsNotTakenResponse);
        setMedsNotTaken(medsNotTakenContent);
        console.log("Meds not taken content:", medsNotTakenContent);
      } catch (error) {
        console.error("Error generating medication advice:", error);
        setMedsTaken("Error generating analysis. Please try again.");
      }
    } else {
      console.log("All medications taken today.");
    }
    // include overdue meds
    if (isOption3Selected && overdueMedsString.length > 0) {
      setLoadingSection('medsOverdue');
      try {
        const medsOverdueResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: `Provide a list of medications the user has already taken (i.e., ${overdueMedsString}) and kindly 
          advise the user to take them today while insisting upon the urgency of taking their medication on time.`
        }) as ResponseType; // type assertion
        console.log("Meds overdue response:", medsOverdueResponse);
        const medsOverdueContent = extractContent(medsOverdueResponse);
        setMedsOverdue(medsOverdueContent);
        console.log("Meds overdue content:", medsOverdueContent);
      } catch (error) {
        console.error("Error generating medication advice:", error);
        setMedsTaken("Error generating analysis. Please try again.");
      }
    } else {
      console.log("No medications overdue today.");
    }

    setLoadingSection('finalAnalysis');
    try {
      const finalPrompt = `
      ${systemPrompt}\n\nBased on the information provided, please answer the user's query to the best of your ability.
      \nUser query: ${ask}
      `;
      const finalResponse = await client.responses.create({
        model: 'o4-mini',
        input: finalPrompt
      }) as ResponseType; // type assertion
      const finalContent = extractContent(finalResponse) + `\n\n${medsTaken}\n\n${medsNotTaken}\n\n${medsOverdue}`;
      console.log("Final analysis response:", finalContent);
      setFinalAnalysis(finalContent);
      
      if (finalAnalysis) {
        generateAudio(finalAnalysis);
      }
    } catch (error) {
      console.error("Error generating final recommendation:", error);
      setFinalAnalysis("Error generating recommendation. Please try again.");
    }
    
    setLoadingSection(null);
    setLoading(false);
    setAsk(''); // reset ask input
  }

  interface GenerateAudioProps {
    text: string;
  }

  const generateAudio = async (text: string): Promise<void> => {
    if (!text) return (console.error("No text provided for audio generation."));
    
    setAudioLoading(true);
    
    try {
      // Save any existing sound resources
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Call OpenAI TTS API
      const mp3 = await client.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice,
        input: text,
      });
      
      // Convert the response to a blob
      const audioData: ArrayBuffer = await mp3.arrayBuffer();
      
      // Create a temporary file path
      const fileUri: string = FileSystem.cacheDirectory + "temp_audio.mp3";
      
      // Write the audio data to a file
      await FileSystem.writeAsStringAsync(
        fileUri,
        arrayBufferToBase64(audioData),
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      
    } catch (error: unknown) {
      console.error("Error generating audio:", error);
      Alert.alert("Audio Error", "Could not generate audio from text.");
    } finally {
      setAudioLoading(false);
    }
  };
  
  // Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: any) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Handle Play/Pause Audio
  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const toggleCheckbox = (option: string, title: string) => {
    setSelectedOptions((prev) => {
      const updatedOptions = {
        ...prev,
        [option]: !prev[option],
      };

      // Update the ask state based on the checkbox selection
      if (updatedOptions[option]) {
        setAsk((prevAsk) => (prevAsk ? `${prevAsk}\n${title}` : title));
      } else {
        setAsk((prevAsk) =>
          prevAsk
            .split('\n')
            .filter((line) => line !== title)
            .join('\n')
        );
      }

      // Update the corresponding boolean state
      if (option === 'option1') setIsOption1Selected(updatedOptions[option]); //CHANGED
      if (option === 'option2') setIsOption2Selected(updatedOptions[option]);
      if (option === 'option3') setIsOption3Selected(updatedOptions[option]);

      return updatedOptions;
    });
  };

  return (
    <ScrollView contentContainerStyle={[globalStyles.container, styles.container]}>
      <Text style={[globalStyles.text, styles.headerText]}>Ask AI Anything</Text>

      {/* Checkboxes */}
      <View style={styles.checkboxContainer}>
        <CheckBox
          title="What medicines do I need to take today?"
          checked={selectedOptions.option1}
          onPress={() => toggleCheckbox('option1', 'What medicines do I need to take today?')}
        />
        <CheckBox
          title="What medicines have I already taken?"
          checked={selectedOptions.option2}
          onPress={() => toggleCheckbox('option2', 'What medicines have I already taken?')}
        />
        <CheckBox
          title="What medicines are overdue?"
          checked={selectedOptions.option3}
          onPress={() => toggleCheckbox('option3', 'What medicines are overdue?')}
        />
      </View>

      <VoiceThemeSelector 
        selectedVoice={selectedVoice} 
        onVoiceSelected={setSelectedVoice} 
      />

      <TextInput
        style={styles.ask}
        placeholder="Type your question here..."
        value={ask}
        onChangeText={setAsk}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={runUserAnalysis}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.loadingText}>Generating response...</Text>
        </View>
      )}

      {/* Audio Loading Indicator */}
      {audioLoading && (
        <View style={styles.audioLoadingContainer}>
          <ActivityIndicator size="small" color="#6c5ce7" />
          <Text style={styles.audioLoadingText}>Generating audio...</Text>
        </View>
      )}

      {/* Audio Controls */}
      {finalAnalysis && sound && !audioLoading && (
        <View style={styles.audioControlsContainer}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.audioButton}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={30} 
              color="white" 
            />
            <Text style={styles.audioButtonText}>
              {isPlaying ? "Pause" : "Play"} Audio
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && finalAnalysis !== '' && (
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{finalAnalysis}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  voiceThemeContainer: {
    maxHeight: '40%',
    width: '100%',
    marginBottom: 20,
  },
  voiceThemeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  voiceThemeScroll: {
    width: '100%',
  },
  voiceThemeOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  selectedVoiceTheme: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  voiceThemeName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 2,
  },
  voiceThemeDescription: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
  audioLoadingContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: 'gray',
  },
  audioControlsContainer: {
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
  },
  audioButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  ask: {
    width: '100%',
    minHeight: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  responseBox: {
    width: '100%',
    backgroundColor: '#f0f4f8',
    padding: 15,
    borderRadius: 10,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    width: '100%',
    marginBottom: 20,
  },
});
