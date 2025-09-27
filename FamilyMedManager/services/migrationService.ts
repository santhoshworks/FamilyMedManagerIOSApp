import { DataService } from './dataService';
import { SQLiteDataService } from './sqliteDataService';
import { FamilyMember, Medication } from '../types/medication';

export class MigrationService {
  private static migrationCompleted = false;

  /**
   * Migrate data from the old localStorage/memory storage to SQLite
   * This should be called once during app initialization
   */
  static async migrateToSQLite(): Promise<boolean> {
    try {
      console.log('Starting migration to SQLite...');

      // Check if migration has already been completed
      if (this.migrationCompleted) {
        console.log('Migration already completed');
        return true;
      }

      // Initialize the old data service to get existing data
      await DataService.initializeData();
      
      // Get existing data from old storage
      const existingFamilyMembers = await DataService.getFamilyMembers();
      const existingMedications = await DataService.getMedications();

      console.log(`Found ${existingFamilyMembers.length} family members and ${existingMedications.length} medications to migrate`);

      // Initialize SQLite database
      await SQLiteDataService.initializeData();

      // Check if SQLite already has data (to avoid duplicate migration)
      const sqliteStats = await SQLiteDataService.getStorageStats();
      if (sqliteStats.familyMembersCount > 0 || sqliteStats.medicationsCount > 0) {
        console.log('SQLite database already contains data, skipping migration');
        this.migrationCompleted = true;
        return true;
      }

      // Only migrate if there's data in the old storage
      if (existingFamilyMembers.length > 0 || existingMedications.length > 0) {
        // Migrate data to SQLite
        await SQLiteDataService.migrateFromOldStorage(existingFamilyMembers, existingMedications);
        
        // Verify migration
        const migratedStats = await SQLiteDataService.getStorageStats();
        console.log('Migration completed successfully:');
        console.log(`- Family Members: ${migratedStats.familyMembersCount}`);
        console.log(`- Medications: ${migratedStats.medicationsCount}`);
        console.log(`- Assignments: ${migratedStats.assignmentsCount}`);

        // Mark migration as completed
        this.migrationCompleted = true;
        
        // Optionally clear old storage after successful migration
        // await this.clearOldStorage();
        
        return true;
      } else {
        console.log('No data found in old storage, using SQLite sample data');
        this.migrationCompleted = true;
        return true;
      }
    } catch (error) {
      console.error('Error during migration:', error);
      return false;
    }
  }

  /**
   * Clear old storage after successful migration
   * This is optional and can be called manually if needed
   */
  static async clearOldStorage(): Promise<void> {
    try {
      console.log('Clearing old storage...');
      await DataService.clearAllData();
      console.log('Old storage cleared successfully');
    } catch (error) {
      console.error('Error clearing old storage:', error);
    }
  }

  /**
   * Rollback to old storage (emergency fallback)
   * This exports SQLite data back to the old storage format
   */
  static async rollbackToOldStorage(): Promise<boolean> {
    try {
      console.log('Rolling back to old storage...');

      // Get data from SQLite
      const familyMembers = await SQLiteDataService.getFamilyMembers();
      const medications = await SQLiteDataService.getMedications();

      // Save to old storage
      await DataService.saveFamilyMembers(familyMembers);
      await DataService.saveMedications(medications);

      console.log('Rollback completed successfully');
      return true;
    } catch (error) {
      console.error('Error during rollback:', error);
      return false;
    }
  }

  /**
   * Compare data between old and new storage systems
   * Useful for debugging and verification
   */
  static async compareStorageSystems(): Promise<{
    oldStorage: { familyMembers: number; medications: number };
    newStorage: { familyMembers: number; medications: number; assignments: number };
    match: boolean;
  }> {
    try {
      // Get data from old storage
      const oldFamilyMembers = await DataService.getFamilyMembers();
      const oldMedications = await DataService.getMedications();

      // Get stats from new storage
      const newStats = await SQLiteDataService.getStorageStats();

      const result = {
        oldStorage: {
          familyMembers: oldFamilyMembers.length,
          medications: oldMedications.length,
        },
        newStorage: {
          familyMembers: newStats.familyMembersCount,
          medications: newStats.medicationsCount,
          assignments: newStats.assignmentsCount,
        },
        match: oldFamilyMembers.length === newStats.familyMembersCount && 
               oldMedications.length === newStats.medicationsCount,
      };

      console.log('Storage comparison:', result);
      return result;
    } catch (error) {
      console.error('Error comparing storage systems:', error);
      return {
        oldStorage: { familyMembers: 0, medications: 0 },
        newStorage: { familyMembers: 0, medications: 0, assignments: 0 },
        match: false,
      };
    }
  }

  /**
   * Get migration status
   */
  static isMigrationCompleted(): boolean {
    return this.migrationCompleted;
  }

  /**
   * Force reset migration status (for testing purposes)
   */
  static resetMigrationStatus(): void {
    this.migrationCompleted = false;
  }

  /**
   * Backup current SQLite data to a JSON format
   * This can be used for data export or backup purposes
   */
  static async backupSQLiteData(): Promise<{
    familyMembers: FamilyMember[];
    medications: Medication[];
    timestamp: string;
  } | null> {
    try {
      const familyMembers = await SQLiteDataService.getFamilyMembers();
      const medications = await SQLiteDataService.getMedications();

      const backup = {
        familyMembers,
        medications,
        timestamp: new Date().toISOString(),
      };

      console.log('SQLite data backup created:', {
        familyMembers: familyMembers.length,
        medications: medications.length,
        timestamp: backup.timestamp,
      });

      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  /**
   * Restore SQLite data from a backup
   */
  static async restoreFromBackup(backup: {
    familyMembers: FamilyMember[];
    medications: Medication[];
    timestamp: string;
  }): Promise<boolean> {
    try {
      console.log(`Restoring data from backup created at ${backup.timestamp}...`);

      // Clear existing data
      await SQLiteDataService.clearAllData();

      // Restore data
      await SQLiteDataService.migrateFromOldStorage(backup.familyMembers, backup.medications);

      console.log('Data restored successfully from backup');
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }
}
