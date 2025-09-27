# SQLite Migration Guide

This guide explains how to migrate your FamilyMedManager app from in-memory/localStorage storage to SQLite for better data persistence and performance.

## Overview

The migration process involves:
1. Installing SQLite dependencies ✅ (Already done)
2. Creating new SQLite-based data services ✅ (Already done)
3. Implementing automatic migration logic ✅ (Already done)
4. Updating app code to use the new services
5. Testing and deployment

## What's Been Implemented

### New Services Created:
- `SQLiteDataService`: Core SQLite operations with the same API as the old DataService
- `MigrationService`: Handles automatic migration from old storage to SQLite
- `newDataService`: Drop-in replacement for the old DataService with migration support

### Key Features:
- **Automatic Migration**: Data is automatically migrated on first run
- **Backward Compatibility**: Same API as the old DataService
- **Data Integrity**: Proper foreign key relationships and constraints
- **Backup/Restore**: Built-in backup and restore functionality
- **Rollback Support**: Emergency rollback to old storage if needed

## Migration Steps

### Step 1: Test the Migration (Recommended)

Run the migration test script:
```bash
node scripts/migrateSQLite.js
```

This will validate that all services work correctly in your environment.

### Step 2: Update Your App Code

Replace the old DataService import with the new one in all files:

**Before:**
```typescript
import { DataService } from '../services/dataService';
```

**After:**
```typescript
import { DataService } from '../services/newDataService';
```

### Files to Update:
- `app/(tabs)/index.tsx`
- `app/dashboard.tsx`
- `app/add-family-member.tsx`
- `app/manage-family-members.tsx`
- `app/manage-medications.tsx`
- `app/add-medication/confirmation.tsx`
- `app/edit-medication/[id].tsx`
- `app/ai-search/results.tsx`
- Any other files that import DataService

### Step 3: Test in Development

1. Start your development server:
   ```bash
   npm start
   ```

2. Launch the app and verify:
   - All existing data appears correctly
   - You can add new family members
   - You can add new medications
   - Dose tracking works
   - All CRUD operations function properly

3. Check the console logs for migration messages:
   ```
   Starting migration to SQLite...
   Found X family members and Y medications to migrate
   Migration completed successfully
   ```

### Step 4: Deploy to Production

The migration will happen automatically when users first run the updated app. The process:

1. App detects old storage data
2. Initializes SQLite database
3. Migrates all data to SQLite
4. Continues using SQLite for all operations

## Database Schema

### Tables Created:

**family_members**
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `type` (TEXT NOT NULL) - 'adult' or 'child'
- `relationship` (TEXT)
- `color` (TEXT NOT NULL)
- `created_at` (DATETIME)

**medications**
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `dosage` (TEXT)
- `form` (TEXT)
- `frequency` (TEXT)
- `timing` (TEXT)
- `days_left` (INTEGER)
- `stock_level` (TEXT)
- `last_taken` (DATETIME)
- `current_count` (INTEGER)
- `total_count` (INTEGER)
- `refill_reminder` (TEXT)
- `created_at` (DATETIME)

**medication_assignments**
- `medication_id` (TEXT)
- `family_member_id` (TEXT)
- Foreign key relationships with CASCADE delete

## Benefits of SQLite Migration

### Performance Improvements:
- Faster data queries and filtering
- Better memory usage
- Optimized for mobile devices

### Data Integrity:
- ACID transactions
- Foreign key constraints
- Data validation at database level

### Advanced Features:
- Complex queries (find medications by member, low stock, etc.)
- Better backup and restore capabilities
- Data export functionality

### Scalability:
- Can handle larger datasets
- Better performance as data grows
- Foundation for future features

## Troubleshooting

### Migration Issues:

**Problem**: Migration fails with SQLite errors
**Solution**: Check that expo-sqlite is properly installed and the app has write permissions

**Problem**: Data appears to be missing after migration
**Solution**: Check console logs for migration errors, use `DataService.compareStorageSystems()` to verify data

**Problem**: App crashes after migration
**Solution**: Ensure all DataService imports are updated to use newDataService

### Emergency Rollback:

If you need to rollback to the old storage system:

```typescript
import { MigrationService } from '../services/migrationService';

// Export SQLite data back to old storage
await MigrationService.rollbackToOldStorage();
```

Then revert your code to use the old DataService imports.

## Monitoring and Maintenance

### Check Migration Status:
```typescript
import { DataService } from '../services/newDataService';

const isCompleted = DataService.isMigrationCompleted();
console.log('Migration completed:', isCompleted);
```

### Get Storage Statistics:
```typescript
const stats = await DataService.getStorageStats();
console.log('Database stats:', stats);
```

### Create Backup:
```typescript
const backup = await DataService.backupData();
if (backup) {
  // Save backup to secure location
  console.log('Backup created:', backup.timestamp);
}
```

## Future Enhancements

With SQLite in place, you can now easily add:
- Advanced search and filtering
- Medication history tracking
- Usage analytics
- Data synchronization
- Offline-first capabilities
- Better reporting features

## Support

If you encounter any issues during migration:
1. Check the console logs for detailed error messages
2. Use the debugging methods: `DataService.debugStorage()`
3. Compare storage systems: `DataService.compareStorageSystems()`
4. Create a backup before making changes: `DataService.backupData()`

The migration is designed to be safe and reversible, but always backup your data before proceeding.
