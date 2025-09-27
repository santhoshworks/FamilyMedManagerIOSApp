import { FamilyMember, Medication } from '../types/medication';
import { PlatformAwareDataService } from './platformAwareDataService';

/**
 * New DataService that automatically chooses the best storage method:
 * - SQLite for native platforms (iOS/Android)
 * - localStorage for web platforms
 *
 * This maintains the same API as the old DataService for backward compatibility
 * while providing optimal performance and data persistence across all platforms
 */
export class DataService {
  private static initialized = false;

  /**
   * Initialize the data service with platform-aware storage
   */
  static async initializeData(): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }

      console.log('Initializing platform-aware DataService...');

      // Initialize platform-aware storage
      await PlatformAwareDataService.initializeData();

      this.initialized = true;
      console.log('Platform-aware DataService initialized successfully');
    } catch (error) {
      console.error('Error initializing platform-aware DataService:', error);
      throw error;
    }
  }

  /**
   * Get all family members
   */
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    await this.ensureInitialized();
    return PlatformAwareDataService.getFamilyMembers();
  }

  /**
   * Get all medications
   */
  static async getMedications(): Promise<Medication[]> {
    await this.ensureInitialized();
    return PlatformAwareDataService.getMedications();
  }

  /**
   * Save family members
   */
  static async saveFamilyMembers(members: FamilyMember[]): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.saveFamilyMembers(members);
  }

  /**
   * Save medications
   */
  static async saveMedications(medications: Medication[]): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.saveMedications(medications);
  }

  /**
   * Add a new family member
   */
  static async addFamilyMember(member: FamilyMember): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.addFamilyMember(member);
  }

  /**
   * Update a family member
   */
  static async updateFamilyMember(member: FamilyMember): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.updateFamilyMember(member);
  }

  /**
   * Delete a family member
   */
  static async deleteFamilyMember(memberId: string): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.deleteFamilyMember(memberId);
  }

  /**
   * Add a new medication
   */
  static async addMedication(medication: Medication): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.addMedication(medication);
  }

  /**
   * Update a medication
   */
  static async updateMedication(medication: Medication): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.updateMedication(medication);
  }

  /**
   * Delete a medication
   */
  static async deleteMedication(medicationId: string): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.deleteMedication(medicationId);
  }

  /**
   * Record a dose taken
   */
  static async takeDose(medicationId: string): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.takeDose(medicationId);
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.clearAllData();
  }

  /**
   * Debug storage
   */
  static async debugStorage(): Promise<void> {
    await this.ensureInitialized();
    return PlatformAwareDataService.debugStorage();
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
    return PlatformAwareDataService.getStorageStats();
  }

  /**
   * Backup data
   */
  static async backupData(): Promise<{
    familyMembers: FamilyMember[];
    medications: Medication[];
    timestamp: string;
  } | null> {
    await this.ensureInitialized();
    const familyMembers = await PlatformAwareDataService.getFamilyMembers();
    const medications = await PlatformAwareDataService.getMedications();

    return {
      familyMembers,
      medications,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Restore data from backup
   */
  static async restoreFromBackup(backup: {
    familyMembers: FamilyMember[];
    medications: Medication[];
    timestamp: string;
  }): Promise<boolean> {
    try {
      await this.ensureInitialized();
      await PlatformAwareDataService.clearAllData();
      await PlatformAwareDataService.saveFamilyMembers(backup.familyMembers);
      await PlatformAwareDataService.saveMedications(backup.medications);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  /**
   * Get platform information
   */
  static getPlatformInfo(): {
    platform: string;
    isWeb: boolean;
    storageType: string;
  } {
    return PlatformAwareDataService.getPlatformInfo();
  }

  /**
   * Check if using native storage
   */
  static isUsingNativeStorage(): boolean {
    return PlatformAwareDataService.isUsingNativeStorage();
  }

  /**
   * Ensure the service is initialized
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeData();
    }
  }

  // Legacy methods for backward compatibility

  /**
   * @deprecated Use addFamilyMember instead
   */
  static async createFamilyMember(member: FamilyMember): Promise<void> {
    console.warn('createFamilyMember is deprecated, use addFamilyMember instead');
    return this.addFamilyMember(member);
  }

  /**
   * @deprecated Use addMedication instead
   */
  static async createMedication(medication: Medication): Promise<void> {
    console.warn('createMedication is deprecated, use addMedication instead');
    return this.addMedication(medication);
  }

  /**
   * Get a single family member by ID
   */
  static async getFamilyMember(memberId: string): Promise<FamilyMember | null> {
    const members = await this.getFamilyMembers();
    return members.find(member => member.id === memberId) || null;
  }

  /**
   * Get a single medication by ID
   */
  static async getMedication(medicationId: string): Promise<Medication | null> {
    const medications = await this.getMedications();
    return medications.find(medication => medication.id === medicationId) || null;
  }

  /**
   * Get medications assigned to a specific family member
   */
  static async getMedicationsForMember(memberId: string): Promise<Medication[]> {
    const medications = await this.getMedications();
    return medications.filter(medication =>
      medication.assignedMembers.includes(memberId)
    );
  }

  /**
   * Get medications with low stock
   */
  static async getLowStockMedications(): Promise<Medication[]> {
    const medications = await this.getMedications();
    return medications.filter(medication =>
      medication.stockLevel === 'low' || medication.stockLevel === 'critical'
    );
  }

  /**
   * Get medications that need refill soon
   */
  static async getMedicationsNeedingRefill(daysThreshold: number = 7): Promise<Medication[]> {
    const medications = await this.getMedications();
    return medications.filter(medication =>
      medication.daysLeft <= daysThreshold
    );
  }
}
