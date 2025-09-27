export interface Symptom {
  id: string;
  name: string;
  icon: string; // Ionicon name
  category: 'pain' | 'respiratory' | 'digestive' | 'skin' | 'general';
}

export interface PatientType {
  id: 'adult' | 'child';
  name: string;
  icon: string;
}

export interface SeverityLevel {
  id: 'mild' | 'moderate' | 'severe';
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface AISearchInput {
  symptoms: string[];
  patientType: 'adult' | 'child';
  severity: 'mild' | 'moderate' | 'severe';
  additionalContext?: string;
}

export interface MedicationRecommendation {
  medicationId: string;
  medicationName: string;
  dosage: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  available: boolean;
  currentStock?: number;
  isOTC?: boolean;
  otcNote?: string;
}

export interface FirstAidInstruction {
  step: number;
  instruction: string;
  important?: boolean;
}

export interface AISearchResponse {
  recommendations: MedicationRecommendation[];
  firstAidInstructions: FirstAidInstruction[];
  generalAdvice: string;
  warningMessage?: string;
  seekMedicalAttention?: boolean;
}

export interface AISearchSession {
  id: string;
  timestamp: Date;
  input: AISearchInput;
  response: AISearchResponse;
  userConfirmed: boolean;
}

// Common symptoms data
export const COMMON_SYMPTOMS: Symptom[] = [
  { id: 'headache', name: 'Headache', icon: 'head-outline', category: 'pain' },
  { id: 'fever', name: 'Fever', icon: 'thermometer-outline', category: 'general' },
  { id: 'cough', name: 'Cough', icon: 'medical-outline', category: 'respiratory' },
  { id: 'sore_throat', name: 'Sore Throat', icon: 'body-outline', category: 'respiratory' },
  { id: 'stomach_pain', name: 'Stomach Pain', icon: 'body-outline', category: 'digestive' },
  { id: 'nausea', name: 'Nausea', icon: 'sad-outline', category: 'digestive' },
  { id: 'runny_nose', name: 'Runny Nose', icon: 'water-outline', category: 'respiratory' },
  { id: 'muscle_pain', name: 'Muscle Pain', icon: 'fitness-outline', category: 'pain' },
  { id: 'rash', name: 'Rash', icon: 'warning-outline', category: 'skin' },
  { id: 'diarrhea', name: 'Diarrhea', icon: 'warning-outline', category: 'digestive' },
  { id: 'constipation', name: 'Constipation', icon: 'close-circle-outline', category: 'digestive' },
  { id: 'fatigue', name: 'Fatigue', icon: 'bed-outline', category: 'general' },
];

// Patient types
export const PATIENT_TYPES: PatientType[] = [
  { id: 'adult', name: 'Adult', icon: 'person-outline' },
  { id: 'child', name: 'Child', icon: 'happy-outline' },
];

// Severity levels
export const SEVERITY_LEVELS: SeverityLevel[] = [
  {
    id: 'mild',
    name: 'Mild',
    description: 'Manageable discomfort',
    color: '#10B981',
    icon: 'checkmark-circle-outline',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Noticeable symptoms',
    color: '#F59E0B',
    icon: 'warning-outline',
  },
  {
    id: 'severe',
    name: 'Severe',
    description: 'Significant discomfort',
    color: '#EF4444',
    icon: 'alert-circle-outline',
  },
];
