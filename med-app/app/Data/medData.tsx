export interface Medication {
    id: number;
    name: string;
    dose: string;
    time: string;
    day: number; // 0 (Sunday) to 6 (Saturday)
    isTaken?: boolean; // Adding this for tracking
    description?: string;       // What the medication is for
    symptoms?: string[];       // Symptoms it treats
    instructions?: string;     // Special instructions
    warnings?: string[];       // Important warnings
    shape?: string;            // Physical shape (for visual identification)
    color?: string;            // Pill color
  }
  
  export const sampleMedications: Medication[] = [
    {
      id: 1,
      name: "Lisinopril",
      dose: "10mg",
      time: "8:00 AM",
      day: 0,
      description: "Blood pressure medication",
      symptoms: ["High blood pressure"],
      instructions: "Take with water in the morning",
      warnings: ["May cause dizziness", "Don't take with potassium supplements"],
      shape: "Round",
      color: "White"
    },
    {
      id: 2,
      name: "Metformin",
      dose: "500mg",
      time: "6:00 PM", 
      day: 1,
      description: "Diabetes medication",
      symptoms: ["High blood sugar"],
      instructions: "Take with evening meal",
      warnings: ["May cause stomach upset"],
      shape: "Oval",
      color: "Blue"
    },
    {
      id: 3,
      name: 'Centrum',
      dose: '1 Capsule',
      time: '10:30 pm',
      day: 2,
      description: "Multivitamin supplement",
      symptoms: ["Vitamin deficiency", "General health"],
      instructions: "Take with water before bed",
      warnings: ["May cause nausea if taken on empty stomach"],
      shape: "Oval",
      color: "Red"
    },
    {
      id: 4,
      name: 'Coldrain All in 1',
      dose: '1 Capsule',
      time: '12:30 pm',
      day: 3,
      description: "Cold and flu relief",
      symptoms: ["Runny nose", "Cough", "Fever"],
      instructions: "Take with food",
      warnings: ["May cause drowsiness", "Do not operate heavy machinery"],
      shape: "Capsule",
      color: "Green"
    },
    {
      id: 5,
      name: 'Neuherbs T',
      dose: '2 Capsule',
      time: '1:00 pm',
      day: 4,
      description: "Herbal supplement",
      symptoms: ["Stress relief", "Anxiety"],
      instructions: "Take after lunch",
      warnings: ["Consult doctor if pregnant"],
      shape: "Round",
      color: "Yellow"
    }
  ];
  
  // Helper function to mark medication as taken
  export const toggleMedicationStatus = (medications: Medication[], id: number): Medication[] => {
    return medications.map(med => 
      med.id === id ? { ...med, isTaken: !med.isTaken } : med
    );
  };
  
  
  // Get medications for a specific day
  export const getMedicationsForDay = (day: number): Medication[] => {
    return sampleMedications.filter(med => med.day === day);
  };