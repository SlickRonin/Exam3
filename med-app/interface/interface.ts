export interface Medicine {
    MedID: number;
    MedName: string;
    DosageQuantity: number;
    DosageMeasurment: string;
    FrequencyHours?: number | null;
    Timing?: string | null;
    LastTaken?: Date | string | null; // Can be Date object or ISO string
    Route: string;
    SpecialDescription?: string | null;
    UsageRequired: boolean;
    UsagePeriod?: number | null;
    SideEffects?: string | null;
    Interactions?: string | null;
    Quantity: number;
  }
  
export interface MedicineDescription {
    DosageForm?: string | null;
    Shape?: string | null;
    Colors?: string | null;
    Size?: string | null;
    Numbers?: string | null;
    Letters?: string | null;
    Symbols?: string | null;
    Texture?: string | null;
    Odor?: string | null;
    MedID: number; // Foreign key reference to Medicine
  }

export interface OverdueMedicine {
    MedID: number;
    MedName: string;
    FrequencyHours: number;
    LastTaken: string;
    CurrentTime: string;
    HoursDifference: number;
    OverdueBy: number;
  }

export interface MedicineWithDescription extends Medicine {
  description: MedicineDescription;
}

// NOTE: if you're trying to edit a voice theme (e.g., add, delete, modify), you need to corroborate the 'icon' variable for both this interface
// and the voiceThemes object
export interface VoiceTheme {
  color: string;
  icon: "record-voice-over" | "surround-sound" | "auto-stories" | "mic" | "stars" | "waves" | "air" | "star";
  description: string;
}

export interface VoiceThemeSelectorProps {
  selectedVoice: string;
  onVoiceSelected: (voice: string) => void;
}