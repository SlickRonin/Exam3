import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function Add({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'initial' | 'schedule'>('initial');

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [shape, setShape] = useState('');
  const [imprint, setImprint] = useState('');
  const [volume, setVolume] = useState('');

  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');
  const [dose, setDose] = useState('');

  const handleSchedulePress = () => {
    if (!name || !type) {
      Alert.alert('Error', 'Please fill in name and type before scheduling.');
      return;
    }

    setStep('schedule'); // Move to schedule step
  };

  const handleAdd = () => {
    if (!frequency || !time || !dose) {
      Alert.alert('Error', 'Please complete the schedule.');
      return;
    }

    const newMedication = {
      name,
      type,
      frequency,
      time,
      dose,
      ...(type === 'Pill' && { color, shape, imprint }),
      ...(type === 'Liquid' && { color }),
    };

    console.log('Scheduled Medication:', newMedication);
    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent]}>
        <Text style={styles.title}>
          {step === 'initial' ? 'Add New Medication' : 'Schedule Medication'}
        </Text>

        {step === 'initial' ? (
          <>
            <Picker
              selectedValue={type}
              style={styles.input}
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="Select Type of Medicine" value="" />
              <Picker.Item label="Pill" value="Pill" />
              <Picker.Item label="Liquid" value="Liquid" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Medication Name"
              value={name}
              onChangeText={setName}
            />

            {type === 'Pill' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Color"
                  value={color}
                  onChangeText={setColor}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Shape"
                  value={shape}
                  onChangeText={setShape}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Imprint (optional)"
                  value={imprint}
                  onChangeText={setImprint}
                />
              </>
            )}

            {type === 'Liquid' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Color"
                  value={color}
                  onChangeText={setColor}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Picker
              selectedValue={frequency}
              style={styles.input}
              onValueChange={(itemValue) => setFrequency(itemValue)}
            >
              <Picker.Item label="How Often?" value="" />
              <Picker.Item label="Daily" value="Daily" />
              <Picker.Item label="Weekly" value="Weekly" />
              <Picker.Item label="Monthly" value="Monthly" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Time (e.g., 8:00 AM)"
              value={time}
              onChangeText={setTime}
            />

            <TextInput
              style={styles.input}
              placeholder={`Dose (e.g., ${type === 'Pill' ? '1 Tablet' : '1 Tablespoon'})`}
              value={dose}
              onChangeText={setDose}
            />
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          {step === 'initial' ? (
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={handleSchedulePress}
              disabled={!type}
            >
              <Text style={styles.buttonText}>Schedule</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  liquidModal: {
    backgroundColor: '#e3f2fd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scheduleButton: {
    backgroundColor: '#0984e3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#00b894',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
