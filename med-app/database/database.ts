// database/database.ts

import * as SQLite from 'expo-sqlite';
import * as Types from '../interface/interface';
//import { openDatabase } from 'expo-sqlite';

const db = SQLite.openDatabaseSync('exam3med.db');

export const createBaseTables = async () => {
    try {
        console.log('Starting table building');

        // Create Medicine table
        console.log('Creating Medicine table...');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Medicine (
                MedID INTEGER PRIMARY KEY AUTOINCREMENT,  /* Fixed: INTEGER + AUTOINCREMENT */
                MedName TEXT NOT NULL UNIQUE,
                DosageQuantity REAL NOT NULL,
                DosageMeasurment TEXT NOT NULL,
                FrequencyHours INTEGER,
                Timing TEXT,
                LastTaken TEXT,  /* SQLite doesn't have DATETIME - use TEXT or INTEGER */
                Route TEXT NOT NULL,
                SpecialDescription TEXT,
                UsageRequired INTEGER NOT NULL,  /* SQLite uses 0/1 for booleans */
                UsagePeriod INTEGER,
                SideEffects TEXT,
                Interactions TEXT,
                Quantity REAL NOT NULL
            );
        `);
        console.log('Medicine table created successfully.');

        // Create Player table
        console.log('Creating Medicine Description table...');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS MedicineDescription
                (
                DosageForm VARCHAR(20),
                Shape VARCHAR(20),
                Colors VARCHAR(40),
                Size VARCHAR(20),
                Numbers VARCHAR(20),
                Letters VARCHAR(20),
                Symbols VARCHAR(20),
                Texture VARCHAR(20),
                Odor VARCHAR(20),
                MedID INT NOT NULL,
                FOREIGN KEY (MedID) REFERENCES Medicine(MedID)
                );
        `);
        console.log('Medicine Discription Table created successfully.');

    } catch (error) {
        console.error('Error creating tables: ', error);
    }
};

export const dropAllTables = async () => {
    try {
        console.log('Dropping all tables...');

        // Drop tables if they exist
        await db.execAsync(`
            DROP TABLE IF EXISTS Medicine;
            DROP TABLE IF EXISTS MedicineDescription;
        `);

        console.log('All tables dropped successfully.');
    } catch (error) {
        console.error('Error dropping tables: ', error);
    }
};

export const getAMedicine = async (MedID: number): Promise<Types.Medicine | null> => {
    console.log(`MedID: ${MedID}`);
    try {
        const result = await db.getFirstAsync(
            `SELECT * FROM Medicine WHERE MedID = ? LIMIT 1`, 
            [MedID]
        );
        if (result !== null) {
            console.log('Medicine data:', result);
            return result as Types.Medicine;
        } else {
            console.log('No medicine found with the given ID');
            return null;
        }
    } catch (error) {
        console.error('Error fetching plant data:', error);
        return null;
    }
};

export const getAMedicineDescription = async (MedID: number): Promise<Types.MedicineDescription | null> => {
    console.log(`MedID: ${MedID}`);
    try {
        const result = await db.getFirstAsync(
            `SELECT * FROM MedicineDescription WHERE MedID = ? LIMIT 1`, 
            [MedID]
        );
        if (result !== null) {
            console.log('MedicineDescription data:', result);
            return result as Types.Medicine;
        } else {
            console.log('No medicine description found with the given ID');
            return null;
        }
    } catch (error) {
        console.error('Error fetching plant data:', error);
        return null;
    }
};

export const insertMedicine = async (medicine: Omit<Types.Medicine, 'MedID'>) => {
    try {
        await db.runAsync(
            `INSERT INTO Medicine (
                MedName, DosageQuantity, DosageMeasurment, 
                FrequencyHours, Timing, LastTaken, Route, 
                SpecialDescription, UsageRequired, UsagePeriod, 
                SideEffects, Interactions, Quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                medicine.MedName,
                medicine.DosageQuantity,
                medicine.DosageMeasurment,
                medicine.FrequencyHours || null,
                medicine.Timing || null,
                (medicine.LastTaken instanceof Date ? medicine.LastTaken.toISOString() : medicine.LastTaken) || null,
                medicine.Route,
                medicine.SpecialDescription || null,
                medicine.UsageRequired ? 1 : 0, // Convert boolean to SQLite integer (1 or 0)
                medicine.UsagePeriod || null,
                medicine.SideEffects || null,
                medicine.Interactions || null,
                medicine.Quantity
            ]
        );
        console.log('Medicine inserted successfully');
    } catch (error) {
        console.error('Error inserting medicine: ', error);
        throw error;
    }
};

export const insertMedicineDescription = async (description: Types.MedicineDescription) => {
    try {
        await db.runAsync(
            `INSERT INTO MedicineDescription (
                DosageForm, Shape, Colors, Size, Numbers,
                Letters, Symbols, Texture, Odor, MedID
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                description.DosageForm || null,
                description.Shape || null,
                description.Colors || null,
                description.Size || null,
                description.Numbers || null,
                description.Letters || null,
                description.Symbols || null,
                description.Texture || null,
                description.Odor || null,
                description.MedID // This is required (foreign key)
            ]
        );
        console.log('Medicine description inserted successfully');
    } catch (error) {
        console.error('Error inserting medicine description: ', error);
        throw error;
    }
};

export const fetchAllMedicine = async (): Promise<Types.Medicine[] | null> => {
    try {
        const plants = await db.getAllAsync<Types.Medicine>(`
            SELECT *
            FROM Medicine
            ORDER BY MedicineName ASC
        `);
        return plants;
    } catch (error) {
        console.error('Failed to fetch Medicine:', error);
        return null;
    }
};

export const fetchAllMedicineDescriptions = async (): Promise<Types.MedicineDescription[] | null> => {
    try {
        const MedDesc = await db.getAllAsync<Types.MedicineDescription>(`
            SELECT *
            FROM MedicineDescription
            ORDER BY MedID ASC
        `);
        return MedDesc;
    } catch (error) {
        console.error('Failed to fetch Medicine:', error);
        return null;
    }
};

export const fetchAllMedAndDesc = async (): Promise<Types.MedicineWithDescription[] | null> => {
    try {
        const medAndDesc = await db.getAllAsync<Types.MedicineWithDescription>(`
            SELECT m.*, md.* 
            FROM Medicine m
            LEFT JOIN MedicineDescription md ON m.MedID = md.MedID;
        `);
        return medAndDesc;
    } catch (error) {
        console.error('Failed to fetch Medicine and Description:', error);
        return null;
    }
};

// MedName TEXT NOT NULL UNIQUE,
//                 DosageQuantity REAL NOT NULL,
//                 DosageMeasurment TEXT NOT NULL,
//                 FrequencyHours INTEGER,
//                 Timing TEXT,
//                 LastTaken TEXT,  /* SQLite doesn't have DATETIME - use TEXT or INTEGER */
//                 Route TEXT NOT NULL,
//                 SpecialDescription TEXT,
//                 UsageRequired INTEGER NOT NULL,  /* SQLite uses 0/1 for booleans */
//                 UsagePeriod INTEGER,
//                 SideEffects TEXT,
//                 Interactions TEXT,
//                 Quantity REAL NOT NULL

export const insertBaseData = async () => {
    try {
        console.log('Inserting base data...');
        await db.execAsync(`
-- Medicine Inserts
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Ibuprofen', 1, 'tablet', 6, 'Morning and evening', '2023-05-15 08:00:00', 'oral', 'Take with food to avoid stomach upset', TRUE, 7, 'Upset stomach, dizziness', 'May interact with blood pressure medications', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Amoxicillin', 1, 'capsule', 8, NULL, '2023-05-14 12:00:00', 'oral', 'Complete full course even if symptoms improve', TRUE, 10, 'Diarrhea, rash', 'May reduce effectiveness of birth control pills', 20);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Lisinopril', 1, 'tablet', 24, 'Morning', '2023-05-15 07:30:00', 'oral', 'Take at the same time each day', TRUE, NULL, 'Dry cough, dizziness', 'Avoid potassium supplements', 90);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Atorvastatin', 1, 'tablet', 24, 'Evening', '2023-05-14 20:00:00', 'oral', 'Take with or without food', TRUE, NULL, 'Muscle pain, digestive issues', 'Grapefruit may increase side effects', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Albuterol Inhaler', 2, 'puff', NULL, 'As needed', '2023-05-15 09:00:00', 'inhalation', 'Shake well before use', FALSE, NULL, 'Nervousness, rapid heartbeat', 'May interact with beta-blockers', 200);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Omeprazole', 1, 'capsule', 24, 'Before breakfast', '2023-05-15 07:00:00', 'oral', 'Take before eating', TRUE, 14, 'Headache, diarrhea', 'May affect absorption of other drugs', 14);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Metformin', 1, 'tablet', 12, 'Morning and evening', '2023-05-14 19:00:00', 'oral', 'Take with meals to reduce stomach upset', TRUE, NULL, 'Nausea, diarrhea', 'Contrast dye may affect kidney function', 60);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Levothyroxine', 1, 'tablet', 24, 'Morning on empty stomach', '2023-05-15 06:00:00', 'oral', 'Take 30-60 minutes before breakfast', TRUE, NULL, 'Palpitations, weight loss', 'Calcium supplements may reduce absorption', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Sertraline', 1, 'tablet', 24, 'Morning or evening', '2023-05-14 08:00:00', 'oral', 'May take several weeks to feel full effect', TRUE, NULL, 'Nausea, insomnia', 'MAOIs can cause serious interactions', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Acetaminophen', 2, 'tablet', 6, NULL, '2023-05-15 10:00:00', 'oral', 'Do not exceed 4000mg per day', FALSE, 3, 'Liver damage in overdose', 'Alcohol increases risk of liver damage', 24);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Diphenhydramine', 1, 'capsule', NULL, 'At bedtime', '2023-05-14 22:00:00', 'oral', 'May cause drowsiness', FALSE, NULL, 'Drowsiness, dry mouth', 'May enhance alcohol effects', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Fluoxetine', 1, 'capsule', 24, 'Morning', '2023-05-15 08:30:00', 'oral', 'Swallow whole, do not crush', TRUE, NULL, 'Headache, nervousness', 'Do not take with MAOIs', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Simvastatin', 1, 'tablet', 24, 'Evening', '2023-05-14 21:00:00', 'oral', 'Take with or without food', TRUE, NULL, 'Muscle pain, constipation', 'Avoid grapefruit juice', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Loratadine', 1, 'tablet', 24, NULL, '2023-05-15 09:00:00', 'oral', 'Non-drowsy formula', FALSE, NULL, 'Headache, dry mouth', 'May interact with certain antifungals', 10);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Warfarin', 1, 'tablet', 24, 'Evening', '2023-05-14 18:00:00', 'oral', 'Maintain consistent vitamin K intake', TRUE, NULL, 'Bleeding, bruising', 'Many drug and food interactions', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Hydrochlorothiazide', 1, 'tablet', 24, 'Morning', '2023-05-15 07:00:00', 'oral', 'Take early to avoid nighttime urination', TRUE, NULL, 'Increased urination, dizziness', 'May increase lithium levels', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Insulin Glargine', 10, 'units', 24, 'Evening', '2023-05-14 20:30:00', 'injection', 'Inject under skin of abdomen, thigh or upper arm', TRUE, NULL, 'Low blood sugar, weight gain', 'Alcohol may increase hypoglycemia risk', 300);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Diazepam', 1, 'tablet', NULL, 'As needed', '2023-05-15 00:00:00', 'oral', 'Use only when necessary', FALSE, NULL, 'Drowsiness, dizziness', 'Alcohol increases CNS depression', 20);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Cephalexin', 1, 'capsule', 8, NULL, '2023-05-14 12:00:00', 'oral', 'Take with plenty of water', TRUE, 7, 'Diarrhea, stomach upset', 'Probenecid may increase levels', 40);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Prednisone', 2, 'tablet', 24, 'Morning with food', '2023-05-15 08:00:00', 'oral', 'Do not stop suddenly', TRUE, 5, 'Increased appetite, insomnia', 'May reduce vaccine effectiveness', 10);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Tramadol', 1, 'tablet', 6, NULL, '2023-05-14 15:00:00', 'oral', 'May cause drowsiness', FALSE, 3, 'Dizziness, constipation', 'Do not take with other CNS depressants', 18);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Montelukast', 1, 'tablet', 24, 'At bedtime', '2023-05-15 21:00:00', 'oral', 'For asthma maintenance', TRUE, NULL, 'Headache, stomach pain', 'May interact with phenobarbital', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Esomeprazole', 1, 'capsule', 24, 'Before breakfast', '2023-05-14 07:30:00', 'oral', 'Swallow whole, do not chew', TRUE, 14, 'Headache, diarrhea', 'May affect absorption of other drugs', 14);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Metoprolol', 1, 'tablet', 12, 'Morning and evening', '2023-05-15 08:00:00', 'oral', 'Do not stop suddenly', TRUE, NULL, 'Fatigue, dizziness', 'May interact with other heart medications', 60);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Losartan', 1, 'tablet', 24, NULL, '2023-05-14 09:00:00', 'oral', 'May take with or without food', TRUE, NULL, 'Dizziness, back pain', 'NSAIDs may reduce effectiveness', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Doxycycline', 1, 'tablet', 12, NULL, '2023-05-15 08:00:00', 'oral', 'Take with plenty of water, avoid lying down', TRUE, 10, 'Sun sensitivity, nausea', 'Dairy products may reduce absorption', 20);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Furosemide', 1, 'tablet', 24, 'Morning', '2023-05-14 07:00:00', 'oral', 'Take early to avoid nighttime urination', TRUE, NULL, 'Increased urination, dizziness', 'May increase lithium levels', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Cetirizine', 1, 'tablet', 24, NULL, '2023-05-15 09:00:00', 'oral', 'Non-drowsy formula', FALSE, NULL, 'Dry mouth, fatigue', 'May interact with CNS depressants', 30);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Gabapentin', 1, 'capsule', 8, NULL, '2023-05-14 08:00:00', 'oral', 'Dose may be gradually increased', TRUE, NULL, 'Dizziness, fatigue', 'Antacids may reduce absorption', 90);
INSERT INTO Medicine (MedName, DosageQuantity, DosageMeasurment, FrequencyHours, Timing, LastTaken, Route, SpecialDescription, UsageRequired, UsagePeriod, SideEffects, Interactions, Quantity) VALUES ('Pantoprazole', 1, 'tablet', 24, 'Before breakfast', '2023-05-15 07:00:00', 'oral', 'Swallow whole with water', TRUE, 14, 'Headache, diarrhea', 'May affect absorption of other drugs', 14);

-- Description Inserts (only for some medicines)
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'white', 'small', '500', 'IB', NULL, 'smooth', NULL, 1);
INSERT INTO MedicineDescription VALUES ('capsule', 'oblong', 'pink/white', 'medium', '500', 'AM', NULL, 'smooth', NULL, 2);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'blue', 'small', '10', 'L', NULL, 'smooth', NULL, 3);
INSERT INTO MedicineDescription VALUES ('tablet', 'oval', 'white', 'medium', '20', 'A', NULL, 'smooth', NULL, 4);
INSERT INTO MedicineDescription VALUES ('inhaler', 'cylindrical', 'blue', 'medium', NULL, NULL, NULL, NULL, 'medicinal', 5);
INSERT INTO MedicineDescription VALUES ('capsule', 'oblong', 'purple/white', 'small', '20', 'OM', NULL, 'smooth', NULL, 6);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'white', 'small', '500', 'MF', NULL, 'smooth', NULL, 7);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'pink', 'small', '50', 'LT', NULL, 'smooth', NULL, 8);
INSERT INTO MedicineDescription VALUES ('tablet', 'oval', 'blue', 'medium', '100', 'Z', NULL, 'smooth', NULL, 9);
INSERT INTO MedicineDescription VALUES ('tablet', 'caplet', 'white', 'medium', '500', 'APAP', NULL, 'smooth', NULL, 10);
INSERT INTO MedicineDescription VALUES ('capsule', 'oblong', 'pink', 'small', '25', 'D', NULL, 'smooth', NULL, 11);
INSERT INTO MedicineDescription VALUES ('capsule', 'oblong', 'green/white', 'medium', '20', 'FLX', NULL, 'smooth', NULL, 12);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'yellow', 'small', '40', 'S', NULL, 'smooth', NULL, 13);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'white', 'small', '10', 'L', NULL, 'smooth', NULL, 14);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'pink', 'small', '5', 'W', NULL, 'smooth', NULL, 15);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'white', 'small', '25', 'H', NULL, 'smooth', NULL, 16);
INSERT INTO MedicineDescription VALUES ('injection', 'vial', 'clear', 'small', NULL, NULL, NULL, 'liquid', NULL, 17);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'white', 'small', '5', 'D', NULL, 'smooth', NULL, 18);
INSERT INTO MedicineDescription VALUES ('capsule', 'oblong', 'red/white', 'medium', '500', 'CE', NULL, 'smooth', NULL, 19);
INSERT INTO MedicineDescription VALUES ('tablet', 'round', 'white', 'small', '10', 'P', NULL, 'smooth', NULL, 20);
        `);
        console.log('Base data inserted successfully.');
    } catch (error) {
        console.error('Error inserting base data:', error);
    }
};

export const getOverdueMedicines = async (): Promise<Types.OverdueMedicine[]> => {
    try {
      const currentTime = new Date().toISOString();
      
      // Explicitly type the results
      const results = await db.getAllAsync<Types.OverdueMedicine>(`
        SELECT 
          m.MedID, 
          m.FrequencyHours, 
          m.LastTaken,
          ((strftime('%s', ?) - strftime('%s', m.LastTaken)) / 3600.0) / m.FrequencyHours as OverdueBy
        FROM Medicine m
        WHERE 
          m.FrequencyHours IS NOT NULL 
          AND m.LastTaken IS NOT NULL
          AND ((strftime('%s', ?) - strftime('%s', m.LastTaken)) / 3600.0 >= m.FrequencyHours
          AND m.UsageRequired = 1
      `, [currentTime, currentTime]);
  
      console.log(`Found ${results.length} overdue medicines`);
      return results;
    } catch (error) {
      console.error('Error fetching overdue medicines:', error);
      throw error;
    }
  };