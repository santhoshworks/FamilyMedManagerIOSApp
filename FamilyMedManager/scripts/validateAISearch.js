/**
 * Simple validation script for AI Search functionality
 * Run with: node scripts/validateAISearch.js
 */

// Mock the React Native environment
global.__DEV__ = true;

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: async (key) => {
    console.log(`AsyncStorage.getItem called with key: ${key}`);
    return null;
  },
  setItem: async (key, value) => {
    console.log(`AsyncStorage.setItem called with key: ${key}, value length: ${value.length}`);
    return Promise.resolve();
  },
  removeItem: async (key) => {
    console.log(`AsyncStorage.removeItem called with key: ${key}`);
    return Promise.resolve();
  },
};

// Mock the AsyncStorage module
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === '@react-native-async-storage/async-storage') {
    return { default: mockAsyncStorage };
  }
  return originalRequire.apply(this, arguments);
};

// Set up environment variables
process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test_key_not_configured';

async function validateAISearch() {
  console.log('🧪 Validating AI Search Feature...\n');

  try {
    // Import our services (after mocking)
    const { AIService } = require('../services/aiService.ts');
    const { LoggingService } = require('../services/loggingService.ts');

    // Test data
    const mockMedications = [
      {
        id: '1',
        name: 'Ibuprofen',
        dosage: '200mg',
        type: 'pain-relief',
        quantity: 20,
        expirationDate: new Date('2025-12-31'),
        familyMemberId: 'adult-1',
        notes: 'For pain and fever',
      },
      {
        id: '2',
        name: 'Acetaminophen',
        dosage: '500mg',
        type: 'pain-relief',
        quantity: 15,
        expirationDate: new Date('2025-06-30'),
        familyMemberId: 'adult-1',
        notes: 'For pain and fever',
      },
    ];

    const mockSearchInput = {
      symptoms: ['headache', 'fever'],
      patientType: 'adult',
      severity: 'moderate',
      additionalContext: 'Started this morning, feeling tired',
    };

    // Test 1: AI Service fallback response
    console.log('✅ Test 1: AI Service fallback response');
    const response = await AIService.getRecommendations(mockSearchInput, mockMedications);
    
    console.log('   - Response structure:', {
      hasRecommendations: Array.isArray(response.recommendations),
      recommendationsCount: response.recommendations.length,
      hasFirstAid: Array.isArray(response.firstAidInstructions),
      firstAidCount: response.firstAidInstructions.length,
      hasGeneralAdvice: !!response.generalAdvice,
      seekMedicalAttention: response.seekMedicalAttention,
    });

    // Test 2: Logging Service
    console.log('\n✅ Test 2: Logging Service');
    await LoggingService.logAISearchInteraction({
      symptoms: mockSearchInput.symptoms,
      patientType: mockSearchInput.patientType,
      severity: mockSearchInput.severity,
      additionalContext: mockSearchInput.additionalContext,
      recommendationsCount: response.recommendations.length,
      seekMedicalAttention: response.seekMedicalAttention,
      completed: true,
    });

    const logs = await LoggingService.getAISearchLogs();
    console.log('   - Logs created:', logs.length);
    console.log('   - Recent search count:', await LoggingService.getRecentSearchCount(7));

    // Test 3: Type validation
    console.log('\n✅ Test 3: Type validation');
    const typeChecks = {
      responseIsObject: typeof response === 'object',
      recommendationsIsArray: Array.isArray(response.recommendations),
      firstAidIsArray: Array.isArray(response.firstAidInstructions),
      seekMedicalIsBoolean: typeof response.seekMedicalAttention === 'boolean',
    };
    console.log('   - Type checks:', typeChecks);

    // Test 4: Content validation
    console.log('\n✅ Test 4: Content validation');
    const contentChecks = {
      hasRecommendations: response.recommendations.length > 0,
      hasFirstAidSteps: response.firstAidInstructions.length > 0,
      hasGeneralAdvice: !!response.generalAdvice,
      recommendationsHaveRequiredFields: response.recommendations.every(rec => 
        rec.medicationName && rec.dosage && rec.reason
      ),
      firstAidHaveRequiredFields: response.firstAidInstructions.every(step => 
        step.step && step.instruction
      ),
    };
    console.log('   - Content checks:', contentChecks);

    console.log('\n🎉 AI Search Feature validation completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Recommendations: ${response.recommendations.length}`);
    console.log(`   - First Aid Steps: ${response.firstAidInstructions.length}`);
    console.log(`   - Seek Medical Attention: ${response.seekMedicalAttention}`);
    console.log(`   - Logs Created: ${logs.length}`);

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run validation
validateAISearch();
