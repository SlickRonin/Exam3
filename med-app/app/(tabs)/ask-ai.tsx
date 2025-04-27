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
import { MaterialIcons } from '@expo/vector-icons';
import { OPENAI_API_KEY } from "@env";
import * as Types from '../../interface/interface';
import * as db from '../../database/database';
import { globalStyles } from '../../styles/globalStyles';

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voiceThemeScroll}>
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
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState(false);
  // user info
  const [baseMeds, setBaseMeds] = useState<Types.MedicineWithDescription[]>([]);
  const [medsTaken, setMedsTaken] = useState<string>('');
  const [medsNotTaken, setMedsNotTaken] = useState<string>('');
  const [overdueMeds, setOverdueMeds] = useState<Types.OverdueMedicine[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state
  useEffect(() => {
      // Fetch products when the component mounts
      db.fetchAllMedAndDesc().then((data) => {
        setBaseMeds(data ?? []);  // Set the fetched data into the state, fallback to an empty array if null
        //console.log('Fetched medicine and description:', data);
      }).catch((error) => {
        console.error('Error fetching medicine and description:', error);
      });
      db.getOverdueMedicines().then((data) => {
        setOverdueMeds(data ?? []);  // Set the fetched data into the state, fallback to an empty array if null
        //console.log('Fetched medicine and description:', data);
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

  // FIXME: in progress; implement toggle for meds taken/not taken/overdue
  const runUserAnalysis = async () => {
    setMedsTaken(''); setMedsNotTaken(''); setOverdueMeds([]); setFinalAnalysis('');

    // FIXME: add name for AI assistant
    const systemPrompt = `You are ___________, a medication manager for people who struggle to keep track of their daily medicine 
    intake (e.g., senior citizens). Your job is to provide advice and answer questions regarding the user's current medicine 
    schedule: ${baseMeds}. You are also responsible for researching any drug interactions (e.g., among medications, between 
    medications and food or drink) and answering any general health questions the user has. THIS WILL REQUIRE YOU TO USE THE 
    SEARCH FEATURE TO OBTAIN THE MOST RECENT AND ACCURATE MEDICAL DATA/ADVICE. Be clear and concise with your responses (i.e., 
    no unnecessary flourishes or redundant information) and answer using plaintext only (i.e., no markdown or any special 
    characters used for formatting). After every query, kindly inform the user that you are not a licensed professional and, for 
    any questions you cannot sufficiently answer, offer suggestions for which the user can acquire more reputable advice (e.g., 
    for health organizations: websites, articles, academic journals, etc.).
    `;

    // include meds taken
    if (medsTaken.length > 0 /* && someBooleanCheck */) {
      setLoadingSection('medsTaken');
      try {
        const medsTakenResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: `${systemPrompt}\n\nProvide a list of medications the user has already taken (i.e., ${medsTaken}) and kindly 
          advise the user not to take them again today.`
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
    if (medsNotTaken.length > 0 /* && someBooleanCheck */) {
      setLoadingSection('medsNotTaken');
      try {
        const medsNotTakenResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: `${systemPrompt}\n\nProvide a list of medications the user has not yet taken (i.e., ${medsNotTaken}) and kindly 
          advise the user to take them today.`
        }) as ResponseType; // type assertion
        console.log("Meds not taken response:", medsNotTakenResponse);
        const medsNotTakenContent = extractContent(medsNotTakenResponse);
        setMedsTaken(medsNotTakenContent);
        console.log("Meds not taken content:", medsNotTakenContent);
      } catch (error) {
        console.error("Error generating medication advice:", error);
        setMedsTaken("Error generating analysis. Please try again.");
      }
    } else {
      console.log("All medications taken today.");
    }
    // include overdue meds
    if (overdueMeds.length > 0 /* && someBooleanCheck */) {
      setLoadingSection('medsOverdue');
      try {
        const medsOverdueResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search_preview' }],
          input: `${systemPrompt}\n\nProvide a list of medications the user has already taken (i.e., ${overdueMeds}) and kindly 
          advise the user to take them today while insisting upon the urgency of taking their medication on time.`
        }) as ResponseType; // type assertion
        console.log("Meds overdue response:", medsOverdueResponse);
        const medsOverdueContent = extractContent(medsOverdueResponse);
        setMedsTaken(medsOverdueContent);
        console.log("Meds overdue content:", medsOverdueContent);
      } catch (error) {
        console.error("Error generating medication advice:", error);
        setMedsTaken("Error generating analysis. Please try again.");
      }
    } else {
      console.log("No medications overdue today.");
    }

    setLoadingSection('finalAnalysis');
    const finalPrompt = `
    ${systemPrompt}\n\nBased on the information provided, and the content of these (optional) arguments:
    \n- Medications taken: ${medsTaken}
    \n- Medications not taken: ${medsNotTaken}
    \n- Medications overdue: ${overdueMeds}
    \n\nPlease answer the user's query to the best of your ability.
    `;
  }
  // FIXME: in progress
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
      
    }
  };

  return (
    <ScrollView contentContainerStyle={[globalStyles.container, styles.container]}>
      <Text style={[globalStyles.text, styles.headerText]}>Ask AI Anything</Text>

      <TextInput
        style={styles.ask}
        placeholder="Type your question here..."
        value={ask}
        onChangeText={setAsk}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleAsk}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {response !== '' && (
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{response}</Text>
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
    marginRight: 10,
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
});
