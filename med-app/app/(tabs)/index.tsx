import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import Add from '../add'; // Import the Add component
import Ionicons from '@expo/vector-icons/Ionicons';
import MedicationCard from '../components/MedicationCard';
import { Medication, sampleMedications, toggleMedicationStatus, getMedicationsForDay } from '../Data/medData';
import * as Types from '../../interface/interface';
import * as Database from '../../database/database';

/**
 * Generates the current week's days and dates for the calendar strip
 * Returns an object with two arrays: weekDays (['S', 'M', 'T', etc.]) and weekDates (['1', '2', '3', etc.])
 */
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

export default function HomeScreen() {
  const [medAndDescDataFromDB, setMedAndDescDataFromDB] = useState<Types.MedicineWithDescription[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state


  useEffect(() => {
    // Fetch products when the component mounts
    Database.fetchAllMedAndDesc().then((data) => {
      setMedAndDescDataFromDB(data ?? []);  // Set the fetched data into the state, fallback to an empty array if null
      //console.log('Fetched medicine and description:', data);
    }).catch((error) => {
      console.error('Error fetching medicine and description:', error);
    });
    }, []); 

  // Get the current week's days and dates for the calendar strip
  const { weekDays, weekDates } = getCurrentWeek();
  
  // State for tracking which date is selected in the calendar strip
  const [selectedDateIndex, setSelectedDateIndex] = useState(new Date().getDay()); // Default to today
  
  // State for managing medications data
  const [medications, setMedications] = useState(sampleMedications);
  
  // State for controlling the Add Medication modal visibility
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Get the current day index for highlighting today in the calendar
  const currentDayIndex = new Date().getDay();

  /**
   * Handles marking a medication as taken
   * @param id - The ID of the medication to mark as taken
   */
  const handleToggleMedication = (id: number) => {
    setMedications(prev => toggleMedicationStatus(prev, id));
  };

  /**
   * Filters medications for the selected day and merges with the taken status
   * from our medications state to ensure UI reflects current status
   */
  const filteredMedications = getMedicationsForDay(selectedDateIndex).map(med => ({
    ...med,
    isTaken: medications.find(m => m.id === med.id)?.isTaken || false
  }));

  return (
    <View style={styles.container}>
      {/* Calendar Strip - Shows days of week with dates */}
      <View style={styles.dateRow}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              selectedDateIndex === index && styles.selectedDate, // Highlight selected date
              currentDayIndex === index && styles.currentDay, // Highlight current day
            ]}
            onPress={() => setSelectedDateIndex(index)}
          >
            <Text style={styles.dayText}>{day}</Text>
            <Text
              style={[
                styles.dateText,
                selectedDateIndex === index && styles.selectedDateText, // White text for selected date
              ]}
            >
              {weekDates[index]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Medications List - Shows cards for each medication on selected day */}
      <ScrollView style={styles.medList}>
        {filteredMedications.map((med) => (
          <MedicationCard
            key={med.id}
            medication={med}
            onToggleMedication={handleToggleMedication}
          />
        ))}
      </ScrollView>

      {/* Add Medicine Button - Opens the Add Medication modal */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Medicine Modal - Rendered when isModalVisible is true */}
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

// Styles for the component - Maintained original styling with comments
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