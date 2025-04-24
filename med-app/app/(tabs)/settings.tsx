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
import { createBaseTables, dropAllTables, insertBaseData } from '../../database/database'; 

export default function Settings() {
  const [allowReminders, setAllowReminders] = useState(false);
  const [beforeTime, setBeforeTime] = useState('10');
  const [afterTime, setAfterTime] = useState('5');

  const handleSave = () => {
    Alert.alert('Settings Saved', `Reminders: ${allowReminders ? 'On' : 'Off'}\nRemind Before: ${beforeTime} min\nRemind After: ${afterTime} min`);
  };

  const handleDropTables = () => {
    console.log('Drop Tables button pressed');
    try {
      dropAllTables();
      console.log('All tables dropped successfully');
    }
    catch (error) {
      console.error('Error dropping tables:', error);
      Alert.alert('Error', 'Failed to drop tables. Please try again.');
    }
  };

  const handleRecreateTables = () => {
    console.log('Recreate Tables button pressed');
    try {
      createBaseTables();
      console.log('All tables created or unmodified successfully');
    }
    catch (error) {
      console.error('Error creating tables:', error);
      Alert.alert('Error', 'Failed to create tables. Please try again.');
    }
  };

  const handleInsertTestData = () => {
    console.log('Insert Test Data button pressed');
    try {
      insertBaseData();
      console.log('Data inserted successfully');
    }
    catch (error) {
      console.error('Error inserting data:', error);
      Alert.alert('Error', 'Failed to insert data. Please try again.');
    }
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>

      {/* Database Operations Section */}
      <Text style={[styles.header, { marginTop: 40 }]}>Database Operations</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.dangerButton]} 
        onPress={handleDropTables}
      >
        <Text style={styles.buttonText}>Drop All Tables</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.warningButton]} 
        onPress={handleRecreateTables}
      >
        <Text style={styles.buttonText}>Recreate Tables</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.successButton]} 
        onPress={handleInsertTestData}
      >
        <Text style={styles.buttonText}>Insert Test Data</Text>
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
  dangerButton: {
    backgroundColor: '#e74c3c', // Red for destructive actions
  },
  warningButton: {
    backgroundColor: '#f39c12', // Orange for warnings
  },
  successButton: {
    backgroundColor: '#2ecc71', // Green for positive actions
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});