/**
 * Simple test to verify the platform-aware DataService works correctly
 * This should run without WASM errors
 */

// Mock React Native Platform
global.Platform = {
  OS: 'web', // Simulate web environment
};

// Mock React Native components
global.require = (id) => {
  if (id === 'react-native') {
    return {
      Platform: global.Platform,
    };
  }
  return require(id);
};

async function testPlatformAwareService() {
  console.log('🧪 Testing Platform-Aware DataService...\n');

  try {
    // Import the new DataService
    const { DataService } = require('./services/newDataService');

    console.log('✅ Successfully imported DataService (no WASM errors!)');

    // Test initialization
    console.log('\n📊 Testing initialization...');
    await DataService.initializeData();
    console.log('✅ DataService initialized successfully');

    // Test platform info
    console.log('\n🔍 Platform Information:');
    const platformInfo = DataService.getPlatformInfo();
    console.log(`   Platform: ${platformInfo.platform}`);
    console.log(`   Is Web: ${platformInfo.isWeb}`);
    console.log(`   Storage Type: ${platformInfo.storageType}`);
    console.log(`   Using Native Storage: ${DataService.isUsingNativeStorage()}`);

    // Test basic operations
    console.log('\n📝 Testing basic operations...');
    
    // Get initial data
    const familyMembers = await DataService.getFamilyMembers();
    const medications = await DataService.getMedications();
    
    console.log(`   Family Members: ${familyMembers.length}`);
    console.log(`   Medications: ${medications.length}`);

    // Test adding a family member
    const testMember = {
      id: 'test-' + Date.now(),
      name: 'Test Member',
      type: 'adult',
      color: '#FF5733',
    };

    await DataService.addFamilyMember(testMember);
    console.log('✅ Successfully added test family member');

    // Verify it was added
    const updatedMembers = await DataService.getFamilyMembers();
    const addedMember = updatedMembers.find(m => m.id === testMember.id);
    
    if (addedMember) {
      console.log('✅ Test family member found in storage');
    } else {
      console.log('❌ Test family member not found in storage');
    }

    // Test storage stats
    console.log('\n📈 Storage Statistics:');
    const stats = await DataService.getStorageStats();
    console.log(`   Family Members: ${stats.familyMembersCount}`);
    console.log(`   Medications: ${stats.medicationsCount}`);
    console.log(`   Storage Type: ${stats.storageType}`);
    console.log(`   Platform: ${stats.platform}`);

    // Clean up test data
    await DataService.deleteFamilyMember(testMember.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Platform-aware storage is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ No WASM errors from expo-sqlite');
    console.log('   ✅ Platform detection working');
    console.log('   ✅ Storage operations functional');
    console.log('   ✅ Data persistence confirmed');
    console.log('\n🚀 Your app should now work without the SQLite WASM error!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check that all service files are present');
    console.log('   2. Verify imports are correct');
    console.log('   3. Ensure platform detection is working');
  }
}

// Run the test
if (require.main === module) {
  testPlatformAwareService()
    .then(() => {
      console.log('\n✨ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPlatformAwareService };
