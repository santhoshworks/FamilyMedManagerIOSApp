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

            IMPORTANT GUIDELINES:
            - Always recommend seeking professional medical attention for serious symptoms
            - FIRST: Suggest medications from the provided inventory if relevant and appropriate
            - IF NO RELEVANT MEDICATIONS are available in inventory, suggest appropriate OTC (Over-The-Counter) medications in the same format and clearly mark them as "OTC"
            - ONLY suggest medications that are directly relevant to the reported symptoms
            - DO NOT recommend irrelevant medications - if no appropriate medications exist, focus on first aid and general advice
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
                  "currentStock": number,
                  "isOTC": boolean,
                  "otcNote": "string (only if isOTC is true)"
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
          temperature: 0,
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
${medicationsText || 'No medications currently in inventory'}

MEDICATION RECOMMENDATION PRIORITY:
1. FIRST: Check if any medications in the inventory are relevant and appropriate for these specific symptoms
2. IF NO RELEVANT INVENTORY MEDICATIONS: Suggest appropriate OTC medications that directly address the symptoms (mark as isOTC: true)
3. DO NOT suggest medications that are not relevant to the reported symptoms
4. If no appropriate medications exist for the symptoms, focus on first aid and general care advice

Please provide:
1. Medication recommendations (inventory first, then relevant OTC if needed)
2. Step-by-step first aid instructions specific to these symptoms
3. General advice for managing these symptoms
4. Any warnings or when to seek medical attention

Focus on safe, appropriate, and RELEVANT recommendations for a ${input.patientType} with ${input.severity} symptoms: ${symptomsText}.
Only suggest medications that directly treat or alleviate the reported symptoms.
    `.trim();
  }

  /**
   * Validate and enhance the AI response
   */
  private static validateAndEnhanceResponse(
    response: AISearchResponse,
    availableMedications: Medication[]
  ): AISearchResponse {
    // Separate inventory medications from OTC recommendations
    const inventoryRecommendations = response.recommendations.filter(rec => !rec.isOTC);
    const otcRecommendations = response.recommendations.filter(rec => rec.isOTC);

    // Validate inventory medications exist in inventory
    const validInventoryRecommendations = inventoryRecommendations.filter(rec => {
      const medication = availableMedications.find(med => med.id === rec.medicationId);
      return medication !== undefined;
    });

    // Update availability and stock information for inventory medications
    const enhancedInventoryRecommendations = validInventoryRecommendations.map(rec => {
      const medication = availableMedications.find(med => med.id === rec.medicationId);
      return {
        ...rec,
        available: medication ? (medication.currentCount || 0) > 0 : false,
        currentStock: medication?.currentCount || 0,
        isOTC: false,
      };
    });

    // Keep OTC recommendations as-is but ensure they're marked correctly
    const enhancedOTCRecommendations = otcRecommendations.map(rec => ({
      ...rec,
      available: false, // OTC medications are not in inventory
      currentStock: 0,
      isOTC: true,
      medicationId: rec.medicationId || `otc_${rec.medicationName.toLowerCase().replace(/\s+/g, '_')}`,
    }));

    // Combine both types of recommendations
    const allRecommendations = [...enhancedInventoryRecommendations, ...enhancedOTCRecommendations];

    return {
      ...response,
      recommendations: allRecommendations,
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

    const inventoryRecommendations: MedicationRecommendation[] = generalMedications.map(med => ({
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      reason: 'General pain and fever relief',
      priority: 'medium' as const,
      available: (med.currentCount || 0) > 0,
      currentStock: med.currentCount || 0,
      isOTC: false,
    }));

    // Add common OTC recommendations if no relevant inventory medications
    const otcRecommendations: MedicationRecommendation[] = generalMedications.length === 0 ? [
      {
        medicationId: 'otc_ibuprofen',
        medicationName: 'Ibuprofen (Advil, Motrin)',
        dosage: 'Adults: 200-400mg every 4-6 hours',
        reason: 'Pain relief and fever reduction',
        priority: 'medium' as const,
        available: false,
        currentStock: 0,
        isOTC: true,
        otcNote: 'Available at pharmacies and stores without prescription',
      },
      {
        medicationId: 'otc_acetaminophen',
        medicationName: 'Acetaminophen (Tylenol)',
        dosage: 'Adults: 500-1000mg every 4-6 hours',
        reason: 'Pain relief and fever reduction',
        priority: 'medium' as const,
        available: false,
        currentStock: 0,
        isOTC: true,
        otcNote: 'Available at pharmacies and stores without prescription',
      },
    ] : [];

    const recommendations = [...inventoryRecommendations, ...otcRecommendations];

    const firstAidInstructions: FirstAidInstruction[] = [
      { step: 1, instruction: 'Rest and stay hydrated', important: true },
      { step: 2, instruction: 'Monitor symptoms closely', important: false },
      { step: 3, instruction: 'Seek medical attention if symptoms worsen', important: true },
    ];

    return {
      recommendations,
      firstAidInstructions,
      generalAdvice: 'Please rest, stay hydrated, and monitor your symptoms. If symptoms persist or worsen, consult a healthcare professional.',
      warningMessage: 'AI service temporarily unavailable. These are general recommendations including OTC options.',
      seekMedicalAttention: input.severity === 'severe',
    };
  }
}
