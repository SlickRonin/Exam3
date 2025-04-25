import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import * as Types from '../../interface/interface';
import * as Database from '../../database/database';

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function Schedule() {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const daysInMonth = getDaysInMonth(month, year);

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [medAndDescDataFromDB, setmedAndDescDataFromDB] = useState<Types.MedicineWithDescription[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state
  
    // useEffect(() => {
    //   // Fetch products when the component mounts
    //   Database.fetchAllPlants().then((data) => {
    //     setPlantDataFromDB(data ?? []);  // Set the fetched data into the state, fallback to an empty array if null
    //     console.log('Fetched products:', data);
    //   }).catch((error) => {
    //     console.error('Error fetching products:', error);
    //   });
    // }, []); 

  const renderCalendar = () => {
    const calendarDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day;
      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayBox,
            isToday && styles.today,
            selectedDate === day && styles.selectedDay,
          ]}
          onPress={() => setSelectedDate(day)}
        >
          <Text
            style={[
              globalStyles.text,
              styles.dayText,
              selectedDate === day && styles.selectedDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    return calendarDays;
  };

  return (
    <ScrollView contentContainerStyle={[globalStyles.container, styles.container]}>
      <Text style={[globalStyles.text, styles.header]}>
        {today.toLocaleString('default', { month: 'long' })} {year}
      </Text>
      <View style={styles.calendarGrid}>{renderCalendar()}</View>

      {selectedDate && (
        <View style={[styles.detailsBox]}>
          <Text style={[globalStyles.text, styles.detailsText]}>
            Medications scheduled for {selectedDate} {today.toLocaleString('default', { month: 'long' })}:
          </Text>
          {/* Placeholder meds */}
          <Text style={[globalStyles.text, styles.medText]}>• Vitamin C - 8:00 AM</Text>
          <Text style={[globalStyles.text, styles.medText]}>• Omega 3 - 6:00 PM</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  dayBox: {
    width: 40,
    height: 40,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#e0e7ff', // Light base for days
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#6c5ce7',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', // Global text color on light background
  },
  detailsBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    width: '90%',
  },
  detailsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  medText: {
    fontSize: 14,
    marginTop: 4,
  },
});
