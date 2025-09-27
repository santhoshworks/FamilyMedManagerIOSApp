import * as SQLite from 'expo-sqlite';
import { FamilyMember, Medication } from '../types/medication';

// Database configuration
const DATABASE_NAME = 'FamilyMedManager.db';
const DATABASE_VERSION = 1;

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
    form: 'tablet',
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
    form: 'capsule',
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
    form: 'liquid',
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
    form: 'tablet',
    assignedMembers: ['4'],
    daysLeft: 8,
    stockLevel: 'good',
    currentCount: 16,
    totalCount: 20,
  },
];

export class SQLiteDataService {
  private static db: SQLite.SQLiteDatabase | null = null;
  private static initialized = false;

  // Initialize database connection
  private static async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return this.db;
  }

  // Create database tables
  private static async createTables(): Promise<void> {
    const db = await this.getDatabase();

    // Create family_members table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('adult', 'child')),
        relationship TEXT,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create medications table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dosage TEXT,
        form TEXT,
        frequency TEXT,
        timing TEXT,
        days_left INTEGER DEFAULT 0,
        stock_level TEXT DEFAULT 'good',
        last_taken DATETIME,
        current_count INTEGER,
        total_count INTEGER,
        refill_reminder TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create medication_assignments table for many-to-many relationship
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medication_assignments (
        medication_id TEXT,
        family_member_id TEXT,
        PRIMARY KEY (medication_id, family_member_id),
        FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
        FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE
      );
    `);

    console.log('Database tables created successfully');
  }

  // Initialize database with sample data if empty
  private static async initializeSampleData(): Promise<void> {
    const db = await this.getDatabase();

    // Check if data already exists
    const familyCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM family_members');
    const medicationCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM medications');

    if ((familyCount as any)?.count === 0) {
      console.log('Initializing sample family members...');
      for (const member of sampleFamilyMembers) {
        await db.runAsync(
          'INSERT INTO family_members (id, name, type, color) VALUES (?, ?, ?, ?)',
          [member.id, member.name, member.type, member.color]
        );
      }
    }

    if ((medicationCount as any)?.count === 0) {
      console.log('Initializing sample medications...');
      for (const medication of sampleMedications) {
        // Insert medication
        await db.runAsync(`
          INSERT INTO medications (
            id, name, dosage, days_left, stock_level, current_count, total_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          medication.id,
          medication.name,
          medication.dosage,
          medication.daysLeft,
          medication.stockLevel,
          medication.currentCount || 0,
          medication.totalCount || 0
        ]);

        // Insert medication assignments
        for (const memberId of medication.assignedMembers) {
          await db.runAsync(
            'INSERT INTO medication_assignments (medication_id, family_member_id) VALUES (?, ?)',
            [medication.id, memberId]
          );
        }
      }
    }

    console.log('Sample data initialization completed');
  }

  // Public initialization method
  static async initializeData(): Promise<void> {
    try {
      if (this.initialized) {
        return;
      }

      await this.createTables();
      await this.initializeSampleData();
      this.initialized = true;

      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  // Get all family members
  static async getFamilyMembers(): Promise<FamilyMember[]> {
    try {
      const db = await this.getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM family_members ORDER BY name');

      return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        relationship: row.relationship,
        color: row.color,
      }));
    } catch (error) {
      console.error('Error getting family members:', error);
      return [];
    }
  }

  // Get all medications with assigned members
  static async getMedications(): Promise<Medication[]> {
    try {
      const db = await this.getDatabase();

      // Get all medications
      const medications = await db.getAllAsync('SELECT * FROM medications ORDER BY name');

      // Get assignments for each medication
      const result: Medication[] = [];
      for (const med of medications as any[]) {
        const assignments = await db.getAllAsync(
          'SELECT family_member_id FROM medication_assignments WHERE medication_id = ?',
          [med.id]
        );

        result.push({
          id: med.id,
          name: med.name,
          dosage: med.dosage || '',
          form: med.form,
          frequency: med.frequency,
          timing: med.timing,
          assignedMembers: assignments.map((a: any) => a.family_member_id),
          daysLeft: med.days_left || 0,
          stockLevel: med.stock_level || 'good',
          lastTaken: med.last_taken ? new Date(med.last_taken) : undefined,
          currentCount: med.current_count,
          totalCount: med.total_count,
          refillReminder: med.refill_reminder,
          createdAt: med.created_at,
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  }

  // Save family members
  static async saveFamilyMembers(members: FamilyMember[]): Promise<void> {
    try {
      const db = await this.getDatabase();

      // Clear existing data
      await db.runAsync('DELETE FROM family_members');

      // Insert new data
      for (const member of members) {
        await db.runAsync(
          'INSERT INTO family_members (id, name, type, relationship, color) VALUES (?, ?, ?, ?, ?)',
          [member.id, member.name, member.type, member.relationship || null, member.color]
        );
      }

      console.log('Family members saved successfully');
    } catch (error) {
      console.error('Error saving family members:', error);
      throw error;
    }
  }

  // Save medications
  static async saveMedications(medications: Medication[]): Promise<void> {
    try {
      const db = await this.getDatabase();

      // Clear existing data
      await db.runAsync('DELETE FROM medications');
      await db.runAsync('DELETE FROM medication_assignments');

      // Insert new data
      for (const medication of medications) {
        // Insert medication
        await db.runAsync(`
          INSERT INTO medications (
            id, name, dosage, form, frequency, timing, days_left, stock_level,
            last_taken, current_count, total_count, refill_reminder
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          medication.id,
          medication.name,
          medication.dosage || '',
          medication.form || null,
          medication.frequency || null,
          medication.timing || null,
          medication.daysLeft || 0,
          medication.stockLevel || 'good',
          medication.lastTaken ? medication.lastTaken.toISOString() : null,
          medication.currentCount || null,
          medication.totalCount || null,
          medication.refillReminder || null
        ]);

        // Insert medication assignments
        for (const memberId of medication.assignedMembers) {
          await db.runAsync(
            'INSERT INTO medication_assignments (medication_id, family_member_id) VALUES (?, ?)',
            [medication.id, memberId]
          );
        }
      }

      console.log('Medications saved successfully');
    } catch (error) {
      console.error('Error saving medications:', error);
      throw error;
    }
  }

  // Add a new family member
  static async addFamilyMember(member: FamilyMember): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.runAsync(
        'INSERT INTO family_members (id, name, type, relationship, color) VALUES (?, ?, ?, ?, ?)',
        [member.id, member.name, member.type, member.relationship || null, member.color]
      );
      console.log('Family member added successfully');
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  }

  // Update a family member
  static async updateFamilyMember(member: FamilyMember): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.runAsync(
        'UPDATE family_members SET name = ?, type = ?, relationship = ?, color = ? WHERE id = ?',
        [member.name, member.type, member.relationship || null, member.color, member.id]
      );
      console.log('Family member updated successfully');
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  }

  // Delete a family member
  static async deleteFamilyMember(memberId: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      // Delete assignments first (foreign key constraint)
      await db.runAsync('DELETE FROM medication_assignments WHERE family_member_id = ?', [memberId]);
      // Delete the family member
      await db.runAsync('DELETE FROM family_members WHERE id = ?', [memberId]);
      console.log('Family member deleted successfully');
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  }

  // Add a new medication
  static async addMedication(medication: Medication): Promise<void> {
    try {
      const db = await this.getDatabase();

      // Insert medication
      await db.runAsync(`
        INSERT INTO medications (
          id, name, dosage, form, frequency, timing, days_left, stock_level,
          last_taken, current_count, total_count, refill_reminder
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        medication.id,
        medication.name,
        medication.dosage || '',
        medication.form || null,
        medication.frequency || null,
        medication.timing || null,
        medication.daysLeft || 0,
        medication.stockLevel || 'good',
        medication.lastTaken ? medication.lastTaken.toISOString() : null,
        medication.currentCount || null,
        medication.totalCount || null,
        medication.refillReminder || null
      ]);

      // Insert medication assignments
      for (const memberId of medication.assignedMembers) {
        await db.runAsync(
          'INSERT INTO medication_assignments (medication_id, family_member_id) VALUES (?, ?)',
          [medication.id, memberId]
        );
      }

      console.log('Medication added successfully');
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }

  // Update a medication
  static async updateMedication(medication: Medication): Promise<void> {
    try {
      const db = await this.getDatabase();

      // Update medication
      await db.runAsync(`
        UPDATE medications SET
          name = ?, dosage = ?, form = ?, frequency = ?, timing = ?,
          days_left = ?, stock_level = ?, last_taken = ?, current_count = ?,
          total_count = ?, refill_reminder = ?
        WHERE id = ?
      `, [
        medication.name,
        medication.dosage || '',
        medication.form || null,
        medication.frequency || null,
        medication.timing || null,
        medication.daysLeft || 0,
        medication.stockLevel || 'good',
        medication.lastTaken ? medication.lastTaken.toISOString() : null,
        medication.currentCount || null,
        medication.totalCount || null,
        medication.refillReminder || null,
        medication.id
      ]);

      // Update assignments - delete old ones and insert new ones
      await db.runAsync('DELETE FROM medication_assignments WHERE medication_id = ?', [medication.id]);
      for (const memberId of medication.assignedMembers) {
        await db.runAsync(
          'INSERT INTO medication_assignments (medication_id, family_member_id) VALUES (?, ?)',
          [medication.id, memberId]
        );
      }

      console.log('Medication updated successfully');
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  }

  // Delete a medication
  static async deleteMedication(medicationId: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      // Delete assignments first (foreign key constraint)
      await db.runAsync('DELETE FROM medication_assignments WHERE medication_id = ?', [medicationId]);
      // Delete the medication
      await db.runAsync('DELETE FROM medications WHERE id = ?', [medicationId]);
      console.log('Medication deleted successfully');
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }

  // Record a dose taken
  static async takeDose(medicationId: string): Promise<void> {
    try {
      const db = await this.getDatabase();

      // Get current medication data
      const medication = await db.getFirstAsync(
        'SELECT * FROM medications WHERE id = ?',
        [medicationId]
      ) as any;

      if (!medication) {
        throw new Error('Medication not found');
      }

      // Update current count and days_left by decrementing by 1 (clamped at 0).
      // The previous implementation tried to recompute days_left from counts which caused
      // unexpected jumps. Keep behavior consistent with the fallback DataService:
      // - current_count: decrement by 1, floor at 0
      // - days_left: decrement by 1, floor at 0
      // - stock_level: derived from days_left thresholds
      const prevCurrent = typeof medication.current_count === 'number' ? medication.current_count : 0;
      const prevDaysLeft = typeof medication.days_left === 'number' ? medication.days_left : 0;

      const newCurrentCount = Math.max(0, prevCurrent - 1);
      const newDaysLeft = Math.max(0, prevDaysLeft - 1);

      let newStockLevel = 'good';
      if (newDaysLeft <= 3) {
        newStockLevel = 'critical';
      } else if (newDaysLeft <= 10) {
        newStockLevel = 'low';
      }

      console.log(`SQLite takeDose for ${medicationId}: current_count ${prevCurrent} -> ${newCurrentCount}, days_left ${prevDaysLeft} -> ${newDaysLeft}, stock ${medication.stock_level} -> ${newStockLevel}`);

      await db.runAsync(
        'UPDATE medications SET current_count = ?, days_left = ?, stock_level = ?, last_taken = ? WHERE id = ?',
        [newCurrentCount, newDaysLeft, newStockLevel, new Date().toISOString(), medicationId]
      );

      console.log('Dose recorded successfully');
    } catch (error) {
      console.error('Error recording dose:', error);
      throw error;
    }
  }

  // Migration utility to import data from old storage
  static async migrateFromOldStorage(familyMembers: FamilyMember[], medications: Medication[]): Promise<void> {
    try {
      console.log('Starting migration from old storage...');

      // Clear existing data
      const db = await this.getDatabase();
      await db.runAsync('DELETE FROM medication_assignments');
      await db.runAsync('DELETE FROM medications');
      await db.runAsync('DELETE FROM family_members');

      // Import family members
      for (const member of familyMembers) {
        await this.addFamilyMember(member);
      }

      // Import medications
      for (const medication of medications) {
        await this.addMedication(medication);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  // Debug and utility methods
  static async clearAllData(): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.runAsync('DELETE FROM medication_assignments');
      await db.runAsync('DELETE FROM medications');
      await db.runAsync('DELETE FROM family_members');
      console.log('All data cleared from SQLite database');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  static async debugStorage(): Promise<void> {
    try {
      const db = await this.getDatabase();
      const familyCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM family_members');
      const medicationCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM medications');
      const assignmentCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM medication_assignments');

      console.log('=== SQLITE STORAGE DEBUG ===');
      console.log('Family Members:', (familyCount as any)?.count || 0);
      console.log('Medications:', (medicationCount as any)?.count || 0);
      console.log('Assignments:', (assignmentCount as any)?.count || 0);
      console.log('Database file:', DATABASE_NAME);
    } catch (error) {
      console.error('Error debugging storage:', error);
    }
  }

  // Get database statistics
  static async getStorageStats(): Promise<{
    familyMembersCount: number;
    medicationsCount: number;
    assignmentsCount: number;
    databaseSize?: number;
  }> {
    try {
      const db = await this.getDatabase();
      const familyCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM family_members');
      const medicationCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM medications');
      const assignmentCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM medication_assignments');

      return {
        familyMembersCount: (familyCount as any)?.count || 0,
        medicationsCount: (medicationCount as any)?.count || 0,
        assignmentsCount: (assignmentCount as any)?.count || 0,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        familyMembersCount: 0,
        medicationsCount: 0,
        assignmentsCount: 0,
      };
    }
  }
}