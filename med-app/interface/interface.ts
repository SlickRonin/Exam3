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
    FrequencyHours: number;
    LastTaken: string;
    OverdueBy: number;
  }