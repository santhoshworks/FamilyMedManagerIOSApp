import { AISearchInput, AISearchResponse, FirstAidInstruction, MedicationRecommendation } from '../types/aiSearch';
import { Medication } from '../types/medication';

export class AIService {
  /**
   * Get AI recommendations based on symptoms and available medications
   */
  static async getRecommendations(
    input: AISearchInput,
    availableMedications: Medication[]
  ): Promise<AISearchResponse> {
    try {
      // Check if API key is configured
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        console.warn('OpenAI API key not configured, using fallback response');
        return this.getFallbackResponse(input, availableMedications);
      }

      // Format the prompt with user input and medication inventory
      const prompt = this.buildPrompt(input, availableMedications);

      // Make HTTP request to OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a helpful medical assistant that provides first aid recommendations and medication suggestions based on available inventory. 
            
            IMPORTANT DISCLAIMERS:
            - Always recommend seeking professional medical attention for serious symptoms
            - Only suggest medications from the provided inventory
            - Provide dosage information based on standard guidelines
            - Include appropriate warnings and contraindications
            - This is for informational purposes only and not a substitute for professional medical advice
            
            Respond in JSON format with the following structure:
            {
              "recommendations": [
                {
                  "medicationId": "string",
                  "medicationName": "string", 
                  "dosage": "string",
                  "reason": "string",
                  "priority": "high|medium|low",
                  "available": boolean,
                  "currentStock": number
                }
              ],
              "firstAidInstructions": [
                {
                  "step": number,
                  "instruction": "string",
                  "important": boolean
                }
              ],
              "generalAdvice": "string",
              "warningMessage": "string (optional)",
              "seekMedicalAttention": boolean
            }`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const completion = await response.json();
      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error('No response from AI service');
      }

      // Parse the JSON response
      const aiResponse: AISearchResponse = JSON.parse(responseText);

      // Validate and enhance the response
      return this.validateAndEnhanceResponse(aiResponse, availableMedications);

    } catch (error) {
      console.error('Error getting AI recommendations:', error);

      // Return a fallback response
      return this.getFallbackResponse(input, availableMedications);
    }
  }

  /**
   * Build the prompt for the AI with user input and medication inventory
   */
  private static buildPrompt(input: AISearchInput, medications: Medication[]): string {
    const symptomsText = input.symptoms.join(', ');
    const medicationsText = medications.map(med =>
      `- ${med.name} (${med.dosage}) - Stock: ${med.currentCount || 0} units, Status: ${med.stockLevel}`
    ).join('\n');

    return `
Patient Information:
- Type: ${input.patientType}
- Symptoms: ${symptomsText}
- Severity: ${input.severity}
${input.additionalContext ? `- Additional Context: ${input.additionalContext}` : ''}

Available Medications in Inventory:
${medicationsText}

Please provide:
1. Medication recommendations from the available inventory only
2. Step-by-step first aid instructions
3. General advice for managing these symptoms
4. Any warnings or when to seek medical attention

Focus on safe, appropriate recommendations for a ${input.patientType} with ${input.severity} ${symptomsText}.
    `.trim();
  }

  /**
   * Validate and enhance the AI response
   */
  private static validateAndEnhanceResponse(
    response: AISearchResponse,
    availableMedications: Medication[]
  ): AISearchResponse {
    // Ensure all recommended medications exist in inventory
    const validRecommendations = response.recommendations.filter(rec => {
      const medication = availableMedications.find(med => med.id === rec.medicationId);
      return medication !== undefined;
    });

    // Update availability and stock information
    const enhancedRecommendations = validRecommendations.map(rec => {
      const medication = availableMedications.find(med => med.id === rec.medicationId);
      return {
        ...rec,
        available: medication ? (medication.currentCount || 0) > 0 : false,
        currentStock: medication?.currentCount || 0,
      };
    });

    return {
      ...response,
      recommendations: enhancedRecommendations,
    };
  }

  /**
   * Provide a fallback response when AI service fails
   */
  private static getFallbackResponse(
    input: AISearchInput,
    medications: Medication[]
  ): AISearchResponse {
    const generalMedications = medications.filter(med =>
      med.name.toLowerCase().includes('ibuprofen') ||
      med.name.toLowerCase().includes('acetaminophen') ||
      med.name.toLowerCase().includes('tylenol') ||
      med.name.toLowerCase().includes('advil')
    );

    const recommendations: MedicationRecommendation[] = generalMedications.map(med => ({
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      reason: 'General pain and fever relief',
      priority: 'medium' as const,
      available: (med.currentCount || 0) > 0,
      currentStock: med.currentCount || 0,
    }));

    const firstAidInstructions: FirstAidInstruction[] = [
      { step: 1, instruction: 'Rest and stay hydrated', important: true },
      { step: 2, instruction: 'Monitor symptoms closely', important: false },
      { step: 3, instruction: 'Seek medical attention if symptoms worsen', important: true },
    ];

    return {
      recommendations,
      firstAidInstructions,
      generalAdvice: 'Please rest, stay hydrated, and monitor your symptoms. If symptoms persist or worsen, consult a healthcare professional.',
      warningMessage: 'AI service temporarily unavailable. These are general recommendations only.',
      seekMedicalAttention: input.severity === 'severe',
    };
  }
}
