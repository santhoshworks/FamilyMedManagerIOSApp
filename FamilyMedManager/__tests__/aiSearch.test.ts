import { AIService } from '../services/aiService';
import { LoggingService } from '../services/loggingService';
import { AISearchInput } from '../types/aiSearch';
import { Medication } from '../types/medication';

// Mock data for testing
const mockMedications: Medication[] = [
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

const mockSearchInput: AISearchInput = {
  symptoms: ['headache', 'fever'],
  patientType: 'adult',
  severity: 'moderate',
  additionalContext: 'Started this morning, feeling tired',
};

describe('AI Search Feature', () => {
  describe('AIService', () => {
    test('should return fallback response when API key is not configured', async () => {
      // This test will use the fallback response since we don't have a real API key
      const response = await AIService.getRecommendations(mockSearchInput, mockMedications);
      
      expect(response).toBeDefined();
      expect(response.recommendations).toBeDefined();
      expect(response.firstAidInstructions).toBeDefined();
      expect(response.generalAdvice).toBeDefined();
      expect(typeof response.seekMedicalAttention).toBe('boolean');
      expect(Array.isArray(response.recommendations)).toBe(true);
      expect(Array.isArray(response.firstAidInstructions)).toBe(true);
    });

    test('should include available medications in recommendations', async () => {
      const response = await AIService.getRecommendations(mockSearchInput, mockMedications);
      
      // Check if any of our mock medications are mentioned in recommendations
      const recommendationText = JSON.stringify(response.recommendations).toLowerCase();
      const hasIbuprofen = recommendationText.includes('ibuprofen');
      const hasAcetaminophen = recommendationText.includes('acetaminophen');
      
      expect(hasIbuprofen || hasAcetaminophen).toBe(true);
    });

    test('should provide first aid instructions for symptoms', async () => {
      const response = await AIService.getRecommendations(mockSearchInput, mockMedications);
      
      expect(response.firstAidInstructions.length).toBeGreaterThan(0);
      expect(response.firstAidInstructions[0]).toHaveProperty('step');
      expect(response.firstAidInstructions[0]).toHaveProperty('instruction');
    });
  });

  describe('LoggingService', () => {
    beforeEach(async () => {
      // Clear logs before each test
      await LoggingService.clearAISearchLogs();
    });

    test('should log AI search interactions', async () => {
      await LoggingService.logAISearchInteraction({
        symptoms: mockSearchInput.symptoms,
        patientType: mockSearchInput.patientType,
        severity: mockSearchInput.severity,
        additionalContext: mockSearchInput.additionalContext,
        recommendationsCount: 2,
        seekMedicalAttention: false,
        completed: true,
      });

      const logs = await LoggingService.getAISearchLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].symptoms).toEqual(mockSearchInput.symptoms);
      expect(logs[0].patientType).toBe(mockSearchInput.patientType);
      expect(logs[0].completed).toBe(true);
    });

    test('should get recent search count', async () => {
      // Log a few interactions
      for (let i = 0; i < 3; i++) {
        await LoggingService.logAISearchInteraction({
          symptoms: ['headache'],
          patientType: 'adult',
          severity: 'mild',
          recommendationsCount: 1,
          seekMedicalAttention: false,
          completed: true,
        });
      }

      const recentCount = await LoggingService.getRecentSearchCount(7);
      expect(recentCount).toBe(3);
    });

    test('should limit stored logs to 50 entries', async () => {
      // Log 55 interactions
      for (let i = 0; i < 55; i++) {
        await LoggingService.logAISearchInteraction({
          symptoms: ['headache'],
          patientType: 'adult',
          severity: 'mild',
          recommendationsCount: 1,
          seekMedicalAttention: false,
          completed: true,
        });
      }

      const logs = await LoggingService.getAISearchLogs();
      expect(logs.length).toBe(50);
    });
  });
});
