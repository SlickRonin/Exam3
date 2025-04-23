import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

export default function Settings() {
  const [allowReminders, setAllowReminders] = useState(false);
  const [beforeTime, setBeforeTime] = useState('10'); // in minutes
  const [afterTime, setAfterTime] = useState('5'); // in minutes

  const handleSave = () => {
    Alert.alert('Settings Saved', `Reminders: ${allowReminders ? 'On' : 'Off'}\nRemind Before: ${beforeTime} min\nRemind After: ${afterTime} min`);
    // Save logic goes here (AsyncStorage, API, etc.)
  };

  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, styles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[globalStyles.text, styles.header]}>Reminder Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Allow Reminders</Text>
        <Switch
          value={allowReminders}
          onValueChange={setAllowReminders}
        />
      </View>

      {allowReminders && (
        <>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Remind how many minutes before:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={beforeTime}
              onChangeText={setBeforeTime}
              placeholder="e.g. 10"
              placeholderTextColor="#999" // Placeholder color for better contrast
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Remind again how many minutes after:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={afterTime}
              onChangeText={setAfterTime}
              placeholder="e.g. 5"
              placeholderTextColor="#999" // Placeholder color for better contrast
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'stretch',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
