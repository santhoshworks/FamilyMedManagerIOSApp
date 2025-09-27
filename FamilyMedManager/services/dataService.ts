import { FamilyMember, Medication } from '../types/medication';

// Simple persistent storage using localStorage for web compatibility
const STORAGE_KEYS = {
  FAMILY_MEMBERS: 'family_members',
  MEDICATIONS: 'medications',
};

// Sample data for initial setup
const sampleFamilyMembers: FamilyMember[] = [
  { id: '1', name: 'Dad', type: 'adult', color: '#4A90E2' },
  { id: '2', name: 'Mom', type: 'adult', color: '#E94B3C' },
  { id: '3', name: 'Sam', type: 'child', color: '#F5A623' },
  { id: '4', name: 'Mia', type: 'child', color: '#F5A623' },
];

const sampleMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    assignedMembers: ['1', '2'],
    daysLeft: 25,
    stockLevel: 'good',
    currentCount: 50,
    totalCount: 60,
  },
  {
    id: '2',
    name: 'Vitamin D',
    dosage: '2000IU',
    assignedMembers: ['1', '2'],
    daysLeft: 10,
    stockLevel: 'low',
    currentCount: 20,
    totalCount: 60,
  },
  {
    id: '3',
    name: 'Allergy Syrup',
    dosage: '',
    assignedMembers: ['3'],
    daysLeft: 3,
    stockLevel: 'critical',
    currentCount: 15,
    totalCount: 200,
  },
  {
    id: '4',
    name: 'Ibuprofen',
    dosage: '100mg',
    assignedMembers: ['4'],
    daysLeft: 8,
    stockLevel: 'good',
    currentCount: 16,
    totalCount: 20,
  },
];

// In-memory storage for React Native (will be replaced with AsyncStorage in production)
let memoryStorage: { [key: string]: any } = {};

// Helper functions for storage
const getStorageItem = (key: string): any => {
  try {
    // Try localStorage first (for web)
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    // Fall back to memory storage (for React Native)
    return memoryStorage[key] || null;
  } catch (error) {
    console.error('Error getting storage item:', error);
    return memoryStorage[key] || null;
  }
};

const setStorageItem = (key: string, value: any): void => {
  try {
    console.log(`setStorageItem called for key: ${key}, value length:`, Array.isArray(value) ? value.length : 'not array');
    // Try localStorage first (for web)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      console.log(`Successfully stored ${key} in localStorage`);
    } else {
      console.log('localStorage not available, using memory storage');
    }
    // Always store in memory as backup
    memoryStorage[key] = value;
    console.log(`Stored ${key} in memory storage:`, Array.isArray(value) ? value.length + ' items' : value);
  } catch (error) {
    console.error('Error setting storage item:', error);
    // Fall back to memory storage
    memoryStorage[key] = value;
    console.log('Fell back to memory storage');
  }
};

export class DataService {
  static async initializeData(): Promise<void> {
    try {
      const existingMembers = getStorageItem(STORAGE_KEYS.FAMILY_MEMBERS);
      const existingMedications = getStorageItem(STORAGE_KEYS.MEDICATIONS);

      // Always initialize with sample data if nothing exists
      if (!existingMembers || !Array.isArray(existingMembers) || existingMembers.length === 0) {
        console.log('Initializing sample family members...');
        setStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, sampleFamilyMembers);
      }

      if (!existingMedications || !Array.isArray(existingMedications) || existingMedications.length === 0) {
        console.log('Initializing sample medications...');
        setStorageItem(STORAGE_KEYS.MEDICATIONS, sampleMedications);
      }

      console.log('Data initialized successfully');
      console.log('Family members:', getStorageItem(STORAGE_KEYS.FAMILY_MEMBERS));
      console.log('Medications:', getStorageItem(STORAGE_KEYS.MEDICATIONS));
    } catch (error) {
      console.error('Error initializing data:', error);
      throw error;
    }
  }

  static async getFamilyMembers(): Promise<FamilyMember[]> {
    try {
      const members = getStorageItem(STORAGE_KEYS.FAMILY_MEMBERS) || [];
      return members;
    } catch (error) {
      console.error('Error getting family members:', error);
      return [];
    }
  }

  static async getMedications(): Promise<Medication[]> {
    try {
      const medications = getStorageItem(STORAGE_KEYS.MEDICATIONS) || [];
      return medications.map((med: any) => ({
        ...med,
        // Handle both old and new property names for backward compatibility
        assignedMembers: med.assignedMembers || med.assignedTo || [],
        stockLevel: med.stockLevel || 'good',
        daysLeft: med.daysLeft || 0,
        lastTaken: med.lastTaken ? new Date(med.lastTaken) : undefined
      }));
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  }

  static async saveFamilyMembers(members: FamilyMember[]): Promise<void> {
    try {
      setStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, members);
    } catch (error) {
      console.error('Error saving family members:', error);
      throw error;
    }
  }

  static async saveMedications(medications: Medication[]): Promise<void> {
    try {
      console.log('DataService.saveMedications called with:', medications.length, 'medications');
      const medicationsToStore = medications.map(med => ({
        ...med,
        lastTaken: med.lastTaken ? med.lastTaken.toISOString() : undefined
      }));
      console.log('Medications to store:', medicationsToStore.map(m => ({ id: m.id, name: m.name })));
      setStorageItem(STORAGE_KEYS.MEDICATIONS, medicationsToStore);
      console.log('Medications saved to storage successfully');
    } catch (error) {
      console.error('Error saving medications:', error);
      throw error;
    }
  }

  static async addFamilyMember(member: FamilyMember): Promise<void> {
    try {
      const members = await this.getFamilyMembers();
      const updatedMembers = [...members, member];
      await this.saveFamilyMembers(updatedMembers);
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  }

  static async updateFamilyMember(updatedMember: FamilyMember): Promise<void> {
    try {
      const members = await this.getFamilyMembers();
      const updatedMembers = members.map(member =>
        member.id === updatedMember.id ? updatedMember : member
      );
      await this.saveFamilyMembers(updatedMembers);
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  }

  static async deleteFamilyMember(memberId: string): Promise<void> {
    try {
      const members = await this.getFamilyMembers();
      const updatedMembers = members.filter(member => member.id !== memberId);
      await this.saveFamilyMembers(updatedMembers);
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  }

  static async addMedication(medication: Medication): Promise<void> {
    try {
      const medications = await this.getMedications();
      const updatedMedications = [...medications, medication];
      await this.saveMedications(updatedMedications);
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }

  static async deleteMedication(medicationId: string): Promise<void> {
    try {
      console.log('DataService.deleteMedication called with ID:', medicationId);

      // Validate input
      if (!medicationId || typeof medicationId !== 'string') {
        throw new Error('Invalid medication ID provided');
      }

      const medications = await this.getMedications();
      console.log('Current medications before delete:', medications.length, medications.map(m => ({ id: m.id, name: m.name })));

      const medicationToDelete = medications.find(med => med.id === medicationId);
      if (!medicationToDelete) {
        console.warn('Medication not found with ID:', medicationId);
        throw new Error(`Medication with ID ${medicationId} not found`);
      }

      console.log('Found medication to delete:', medicationToDelete.name);

      const updatedMedications = medications.filter(med => med.id !== medicationId);
      console.log('Medications after filter:', updatedMedications.length, updatedMedications.map(m => ({ id: m.id, name: m.name })));

      // Verify the filter worked
      if (updatedMedications.length !== medications.length - 1) {
        throw new Error('Failed to filter out the medication');
      }

      await this.saveMedications(updatedMedications);
      console.log('Medications saved successfully');

      // Verify the save worked by reading back
      const verifyMedications = await this.getMedications();
      console.log('Verification: medications after save:', verifyMedications.length);

      if (verifyMedications.find(med => med.id === medicationId)) {
        throw new Error('Medication still exists after delete operation');
      }

      console.log('Delete operation verified successfully');
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  static async updateMedication(updatedMedication: Medication): Promise<void> {
    try {
      const medications = await this.getMedications();
      const updatedMedications = medications.map(med =>
        med.id === updatedMedication.id ? updatedMedication : med
      );
      await this.saveMedications(updatedMedications);
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  static async takeDose(medicationId: string): Promise<void> {
    try {
      const medications = await this.getMedications();
      const updatedMedications = medications.map(med => {
        if (med.id === medicationId) {
          const newCount = med.currentCount ? med.currentCount - 1 : undefined;
          return {
            ...med,
            lastTaken: new Date(),
            currentCount: newCount,
          };
        }
        return med;
      });
      await this.saveMedications(updatedMedications);
    } catch (error) {
      console.error('Error recording dose:', error);
      throw error;
    }
  }

  // Debug methods
  static async clearAllData(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBERS);
        localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
        console.log('All data cleared');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static async debugStorage(): Promise<void> {
    try {
      console.log('=== STORAGE DEBUG ===');
      console.log('Family Members:', getStorageItem(STORAGE_KEYS.FAMILY_MEMBERS));
      console.log('Medications:', getStorageItem(STORAGE_KEYS.MEDICATIONS));
      console.log('LocalStorage available:', typeof window !== 'undefined' && !!window.localStorage);
    } catch (error) {
      console.error('Error debugging storage:', error);
    }
  }
}
