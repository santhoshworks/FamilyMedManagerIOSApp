export interface FamilyMember {
  id: string;
  name: string;
  type: 'adult' | 'child';
  relationship?: string; // e.g., 'Father', 'Mother', 'Son', 'Daughter'
  color: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  form?: string; // tablet, capsule, liquid, etc.
  frequency?: string; // daily, weekly, as needed
  timing?: string; // specific timing details
  assignedMembers: string[]; // Array of family member IDs
  daysLeft: number;
  stockLevel: string;
  lastTaken?: Date;
  currentCount?: number; // Current inventory count
  totalCount?: number; // Total inventory when full

  refillReminder?: string;
  createdAt?: string;
}

export interface MedicationWithMembers extends Medication {
  members: FamilyMember[];
}
