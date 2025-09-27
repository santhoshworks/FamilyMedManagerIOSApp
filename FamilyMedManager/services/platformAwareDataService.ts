import { Platform } from 'react-native';
import { FamilyMember, Medication } from '../types/medication';

// Platform detection
const isWeb = Platform.OS === 'web';

// Import services conditionally
let SQLiteDataService: any = null;
let DataService: any = null;

if (!isWeb) {
  // Only import SQLite service on native platforms
  try {
    SQLiteDataService = require('./sqliteDataService').SQLiteDataService;
  } catch (error) {
    console.warn('SQLite not available, falling back to localStorage');
  }
}

if (isWeb || !SQLiteDataService) {
  // Import localStorage service for web or as fallback
  DataService = require('./dataService').DataService;
}

/**
 * Platform-aware DataService that automatically chooses the best storage method:
 * - SQLite for native platforms (iOS/Android)
 * - localStorage for web platforms
 * 
 * This maintains the same API across all platforms while providing optimal performance
 */
export class PlatformAwareDataService {
  private static initialized = false;
  private static usingNativeStorage = false;

  /**
   * Initialize the appropriate storage service based on platform
   */
  static async initializeData(): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }

      console.log(`Initializing storage for platform: ${Platform.OS}`);

      if (!isWeb && SQLiteDataService) {
        // Use SQLite for native platforms
        console.log('Using SQLite storage for native platform');
        await SQLiteDataService.initializeData();
        this.usingNativeStorage = true;
      } else {
        // Use localStorage for web or as fallback
        console.log('Using localStorage storage for web platform');
        await DataService.initializeData();
        this.usingNativeStorage = false;
      }

      this.initialized = true;
      console.log('Platform-aware storage initialized successfully');
    } catch (error) {
      console.error('Error initializing platform-aware storage:', error);
      throw error;
    }
  }

  /**
   * Get the appropriate service instance
   */
  private static getService() {
    if (!this.initialized) {
      throw new Error('DataService not initialized. Call initializeData() first.');
    }
    return this.usingNativeStorage ? SQLiteDataService : DataService;
  }

  /**
   * Get all family members
   */
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    await this.ensureInitialized();
    return this.getService().getFamilyMembers();
  }

  /**
   * Get all medications
   */
  static async getMedications(): Promise<Medication[]> {
    await this.ensureInitialized();
    return this.getService().getMedications();
  }

  /**
   * Save family members
   */
  static async saveFamilyMembers(members: FamilyMember[]): Promise<void> {
    await this.ensureInitialized();
    return this.getService().saveFamilyMembers(members);
  }

  /**
   * Save medications
   */
  static async saveMedications(medications: Medication[]): Promise<void> {
    await this.ensureInitialized();
    return this.getService().saveMedications(medications);
  }

  /**
   * Add a new family member
   */
  static async addFamilyMember(member: FamilyMember): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.addFamilyMember) {
      // Use native SQLite method if available
      return service.addFamilyMember(member);
    } else {
      // Fallback to save all members for localStorage
      const members = await this.getFamilyMembers();
      const existingIndex = members.findIndex(m => m.id === member.id);
      
      if (existingIndex >= 0) {
        members[existingIndex] = member;
      } else {
        members.push(member);
      }
      
      return this.saveFamilyMembers(members);
    }
  }

  /**
   * Update a family member
   */
  static async updateFamilyMember(member: FamilyMember): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.updateFamilyMember) {
      return service.updateFamilyMember(member);
    } else {
      // Fallback implementation
      const members = await this.getFamilyMembers();
      const index = members.findIndex(m => m.id === member.id);
      
      if (index >= 0) {
        members[index] = member;
        return this.saveFamilyMembers(members);
      } else {
        throw new Error('Family member not found');
      }
    }
  }

  /**
   * Delete a family member
   */
  static async deleteFamilyMember(memberId: string): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.deleteFamilyMember) {
      return service.deleteFamilyMember(memberId);
    } else {
      // Fallback implementation
      const members = await this.getFamilyMembers();
      const filteredMembers = members.filter(m => m.id !== memberId);
      return this.saveFamilyMembers(filteredMembers);
    }
  }

  /**
   * Add a new medication
   */
  static async addMedication(medication: Medication): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.addMedication) {
      return service.addMedication(medication);
    } else {
      // Fallback implementation
      const medications = await this.getMedications();
      const existingIndex = medications.findIndex(m => m.id === medication.id);
      
      if (existingIndex >= 0) {
        medications[existingIndex] = medication;
      } else {
        medications.push(medication);
      }
      
      return this.saveMedications(medications);
    }
  }

  /**
   * Update a medication
   */
  static async updateMedication(medication: Medication): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.updateMedication) {
      return service.updateMedication(medication);
    } else {
      // Fallback implementation
      const medications = await this.getMedications();
      const index = medications.findIndex(m => m.id === medication.id);
      
      if (index >= 0) {
        medications[index] = medication;
        return this.saveMedications(medications);
      } else {
        throw new Error('Medication not found');
      }
    }
  }

  /**
   * Delete a medication
   */
  static async deleteMedication(medicationId: string): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.deleteMedication) {
      return service.deleteMedication(medicationId);
    } else {
      // Fallback implementation
      const medications = await this.getMedications();
      const filteredMedications = medications.filter(m => m.id !== medicationId);
      return this.saveMedications(filteredMedications);
    }
  }

  /**
   * Record a dose taken
   */
  static async takeDose(medicationId: string): Promise<void> {
    await this.ensureInitialized();
    const service = this.getService();
    
    if (this.usingNativeStorage && service.takeDose) {
      return service.takeDose(medicationId);
    } else {
      // Fallback implementation using the old service method
      return service.takeDose(medicationId);
    }
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    return this.getService().clearAllData();
  }

  /**
   * Debug storage information
   */
  static async debugStorage(): Promise<void> {
    await this.ensureInitialized();
    console.log('=== PLATFORM-AWARE STORAGE DEBUG ===');
    console.log('Platform:', Platform.OS);
    console.log('Using native storage:', this.usingNativeStorage);
    console.log('Storage type:', this.usingNativeStorage ? 'SQLite' : 'localStorage');
    
    const service = this.getService();
    if (service.debugStorage) {
      return service.debugStorage();
    } else {
      const familyMembers = await this.getFamilyMembers();
      const medications = await this.getMedications();
      console.log('Family Members:', familyMembers.length);
      console.log('Medications:', medications.length);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    familyMembersCount: number;
    medicationsCount: number;
    assignmentsCount?: number;
    storageType: string;
    platform: string;
  }> {
    await this.ensureInitialized();
    const familyMembers = await this.getFamilyMembers();
    const medications = await this.getMedications();
    
    const stats = {
      familyMembersCount: familyMembers.length,
      medicationsCount: medications.length,
      storageType: this.usingNativeStorage ? 'SQLite' : 'localStorage',
      platform: Platform.OS,
    };

    // Add assignment count if using SQLite
    if (this.usingNativeStorage) {
      const service = this.getService();
      if (service.getStorageStats) {
        const nativeStats = await service.getStorageStats();
        return {
          ...stats,
          assignmentsCount: nativeStats.assignmentsCount,
        };
      }
    }

    return stats;
  }

  /**
   * Check if using native storage
   */
  static isUsingNativeStorage(): boolean {
    return this.usingNativeStorage;
  }

  /**
   * Get platform information
   */
  static getPlatformInfo(): {
    platform: string;
    isWeb: boolean;
    storageType: string;
  } {
    return {
      platform: Platform.OS,
      isWeb,
      storageType: this.usingNativeStorage ? 'SQLite' : 'localStorage',
    };
  }

  /**
   * Ensure the service is initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeData();
    }
  }
}
