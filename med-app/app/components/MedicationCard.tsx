import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Alert 
} from 'react-native';
import { Medication } from '../Data/medData';
import Ionicons from '@expo/vector-icons/Ionicons';

interface MedicationCardProps {
  medication: Medication;
  onToggleMedication: (id: number) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onToggleMedication }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    if (!medication.isTaken) {
      Alert.alert(
        'Confirm',
        `Have you taken ${medication.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => onToggleMedication(medication.id) }
        ]
      );
    } else {
      onToggleMedication(medication.id);
    }
  };

  return (
    <View style={[styles.card, medication.isTaken && styles.takenCard]}>
      {/* Main Card Content */}
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.medInfo}>
          <Text style={styles.name}>{medication.name}</Text>
          <Text style={styles.dose}>{medication.dose}</Text>
          {medication.description && (
            <Text style={styles.description}>{medication.description}</Text>
          )}
        </View>
        
        <View style={styles.rightSection}>
          <Text style={styles.time}>{medication.time}</Text>
          <TouchableOpacity 
            onPress={handleToggle}
            style={[
              styles.statusButton,
              medication.isTaken ? styles.takenButton : styles.notTakenButton
            ]}
          >
            <Ionicons 
              name={medication.isTaken ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.detailsContainer}>
          <View style={styles.expandIndicator}>
               <Ionicons name="chevron-up" size={20} color="#666" />
               <Text style={styles.expandIndicatorText}>Medication Details</Text>
          </View>

          {medication.symptoms && (
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Treats:</Text>
              {medication.symptoms.map((symptom, index) => (
                <Text key={index} style={styles.detailText}>• {symptom}</Text>
              ))}
            </View>
          )}

          {medication.instructions && (
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Instructions:</Text>
              <Text style={styles.detailText}>{medication.instructions}</Text>
            </View>
          )}

          {medication.warnings && medication.warnings.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailTitle, styles.warningTitle]}>Warnings:</Text>
              {medication.warnings.map((warning, index) => (
                <Text key={index} style={[styles.detailText, styles.warningText]}>⚠️ {warning}</Text>
              ))}
            </View>
          )}

          {(medication.shape || medication.color) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Appearance:</Text>
              <Text style={styles.detailText}>
                {medication.color} {medication.shape}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  takenCard: {
    backgroundColor: '#f0f8ff',
    opacity: 0.9,
  },
  mainContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  medInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dose: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takenButton: {
    backgroundColor: '#2ecc71',
  },
  notTakenButton: {
    backgroundColor: '#e74c3c',
  },
  detailsContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailSection: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  warningTitle: {
    color: '#e74c3c',
  },
  warningText: {
    color: '#e74c3c',
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  expandIndicatorText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  }
});

export default MedicationCard;