
export type RoutineType = 'AM' | 'PM';

export type ProductType = 'Detergente' | 'Siero' | 'Crema' | 'Esfoliante' | 'Retinoide' | 'SPF' | 'Trattamento';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: ProductType;
  usedIn: RoutineType[];
  cycleNights?: number[]; // 1, 2, 3, 4 (relevant for PM)
  notes?: string; // Brevi note
  description?: string; // Dati Tecnici e Funzione
  usageAdvice?: string; // Consigli di Applicazione
  isIrritant?: boolean;
  imageUrl?: string;
  dateOpened?: string; // ISO String YYYY-MM-DD
  pao?: number; // Period After Opening in months
}

export type SkinCondition = 'Normale' | 'Secca' | 'Sensibile' | 'Irritata' | 'Breakout';

export interface DailyLog {
  date: string; // ISO date string YYYY-MM-DD
  amCompleted: boolean;
  pmCompleted: boolean;
  notes: string;
  cycleDay: number; // 1-based index of the active cycle
  skinCondition?: SkinCondition;
}

export interface AppState {
  logs: Record<string, DailyLog>; // Keyed by date string
  products: Product[];
  startDate: string; // To calculate cycle
}

// New Types for Customization
export interface RoutineStep {
  id: string;
  label: string;      // e.g. "Detersione"
  productName: string; // e.g. "Neutrogena Gel" or reference to product
}

export interface CycleNightConfig {
  id: string;
  dayNumber: number; // 1, 2, 3...
  title: string;
  description: string;
  steps: RoutineStep[];
  colorTheme: 'orange' | 'pink' | 'green'; 
  isEnabled: boolean;
}

export interface RoutineSettings {
  amRoutine: RoutineStep[];
  pmCycle: CycleNightConfig[];
}
