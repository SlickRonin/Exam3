import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Add from '../add';// Import the Add component
import Ionicons from '@expo/vector-icons/Ionicons';

const getCurrentWeek = () => {
  const today = new Date();
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const currentDate = today.getDate();

  // Generate the week days and dates
  const weekDays = [];
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(currentDate - currentDayIndex + i); // Adjust to get the correct day in the week
    weekDays.push(days[date.getDay()]);
    weekDates.push(date.getDate().toString());
  }

  return { weekDays, weekDates };
};

const medications = [
  {
    id: 1,
    name: 'Vitamin C',
    dose: '2 Capsule',
    time: '6:30 am',
    day: 0, // Sunday
  },
  {
    id: 2,
    name: 'Valtum plus 25',
    dose: '2 Pills',
    time: '8:00 am',
    day: 1, // Monday
  },
  {
    id: 3,
    name: 'Centrum',
    dose: '1 Capsule',
    time: '10:30 pm',
    day: 2, // Tuesday
  },
  {
    id: 4,
    name: 'Coldrain All in 1',
    dose: '1 Capsule',
    time: '12:30 pm',
    day: 3, // Wednesday
  },
  {
    id: 5,
    name: 'Neuherbs T',
    dose: '2 Capsule',
    time: '1:00 pm',
    day: 4, // Thursday
  },
];

export default function HomeScreen() {
  const { weekDays, weekDates } = getCurrentWeek();
  const [selectedDateIndex, setSelectedDateIndex] = useState(new Date().getDay()); // Default to today
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const currentDayIndex = new Date().getDay(); // Get the current day index

  // Filter medications for the selected day
  const filteredMedications = medications.filter(
    (med) => med.day === selectedDateIndex
  );

  return (
    <View style={styles.container}>
      {/* Calendar Strip */}
      <View style={styles.dateRow}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              selectedDateIndex === index && styles.selectedDate,
              currentDayIndex === index && styles.currentDay, // Highlight current day
            ]}
            onPress={() => setSelectedDateIndex(index)}
          >
            <Text style={styles.dayText}>{day}</Text>
            <Text
              style={[
                styles.dateText,
                selectedDateIndex === index && styles.selectedDateText,
              ]}
            >
              {weekDates[index]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Medications List */}
      <ScrollView style={styles.medList}>
        {filteredMedications.map((med) => (
          <View key={med.id} style={styles.medItem}>
            <View style={styles.medInfo}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDose}>{med.dose}</Text>
            </View>
            <Text style={styles.medTime}>{med.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Medicine Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Medicine Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <Add onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Softer background color
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5, // Reduced padding for better fit
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 10, // Adjust padding for better touch targets
    paddingHorizontal: 5,
    width: 50, // Reduced width to fit all 7 days
    borderRadius: 10,
    backgroundColor: '#e0e7ff', // Subtle background for unselected dates
  },
  selectedDate: {
    backgroundColor: '#6c5ce7', // Highlight selected date
    borderRadius: 10,
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  currentDay: {
    borderWidth: 2,
    borderColor: '#ff4757', // Distinct border for current day
    borderRadius: 10,
  },
  dayText: {
    color: '#555', // Softer text color
    fontSize: 14, // Slightly smaller font size for compactness
    fontWeight: '600', // Semi-bold for better readability
  },
  dateText: {
    fontSize: 18, // Adjusted font size
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff', // White text for selected date
  },
  medList: {
    flex: 1,
    marginTop: 10, // Add spacing between calendar and list
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16, // Softer corners
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 18, // Adjusted font size for better balance
    color: '#222',
  },
  medDose: {
    fontSize: 14, // Slightly smaller font size
    color: '#777', // Softer color for secondary text
  },
  medTime: {
    fontSize: 14,
    color: '#555', // Softer color for time
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6c5ce7',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
