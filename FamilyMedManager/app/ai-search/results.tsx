import { theme } from '@/constants/theme';
import { AIService } from '@/services/aiService';
import { LoggingService } from '@/services/loggingService';
import { DataService } from '@/services/newDataService';
import { AISearchInput, AISearchResponse } from '@/types/aiSearch';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<AISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse the input parameters
      const symptoms = params.symptoms ? JSON.parse(params.symptoms as string) : [];
      const patientType = params.patientType as 'adult' | 'child';
      const severity = params.severity as 'mild' | 'moderate' | 'severe';
      const additionalContext = params.additionalContext as string || '';

      // Create AI search input
      const searchInput: AISearchInput = {
        symptoms,
        patientType,
        severity,
        additionalContext,
      };

      // Get current medication inventory
      const medications = await DataService.getMedications();

      // Call AI service
      const response = await AIService.getRecommendations(searchInput, medications);
      setAiResponse(response);

    } catch (err) {
      console.error('Error getting AI recommendations:', err);
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Log the interaction
    if (aiResponse && params.symptoms) {
      try {
        await LoggingService.logAISearchInteraction({
          symptoms: JSON.parse(params.symptoms as string),
          patientType: params.patientType as 'adult' | 'child',
          severity: params.severity as 'mild' | 'moderate' | 'severe',
          additionalContext: params.additionalContext as string,
          recommendationsCount: aiResponse.recommendations.length,
          seekMedicalAttention: aiResponse.seekMedicalAttention ?? false,
          completed: true,
        });
      } catch (error) {
        console.error('Error logging AI search interaction:', error);
      }
    }

    // Navigate back to dashboard
    router.push('/(tabs)');
  };

  const handleRetry = () => {
    loadAIRecommendations();
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'Are you sure you want to call emergency services?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call 911',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:911');
          },
        },
      ]
    );
  };

  const renderMedicationRecommendation = (recommendation: any, index: number) => {
    return (
      <View key={index} style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <View style={[
            styles.priorityIndicator,
            {
              backgroundColor:
                recommendation.priority === 'high' ? '#EF4444' :
                  recommendation.priority === 'medium' ? '#F59E0B' : '#10B981'
            }
          ]} />
          <View style={styles.recommendationInfo}>
            <Text style={styles.medicationName}>{recommendation.medicationName}</Text>
            <Text style={styles.medicationDosage}>{recommendation.dosage}</Text>
          </View>
          <View style={[
            styles.availabilityBadge,
            {
              backgroundColor: recommendation.isOTC
                ? '#3B82F6' // Blue for OTC
                : recommendation.available
                  ? '#10B981' // Green for available
                  : '#EF4444' // Red for out of stock
            }
          ]}>
            <Text style={styles.availabilityText}>
              {recommendation.isOTC
                ? 'OTC'
                : recommendation.available
                  ? 'Available'
                  : 'Out of Stock'
              }
            </Text>
          </View>
        </View>
        <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
        {recommendation.isOTC && recommendation.otcNote && (
          <Text style={styles.otcNote}>{recommendation.otcNote}</Text>
        )}
        {!recommendation.isOTC && recommendation.available && recommendation.currentStock && (
          <Text style={styles.stockInfo}>Stock: {recommendation.currentStock} units</Text>
        )}
        {recommendation.isOTC && (
          <Text style={styles.otcInfo}>💡 Available at pharmacies and stores</Text>
        )}
      </View>
    );
  };

  const renderFirstAidStep = (step: any, index: number) => {
    return (
      <View key={index} style={styles.firstAidStep}>
        <View style={[
          styles.stepNumber,
          step.important && styles.stepNumberImportant
        ]}>
          <Text style={styles.stepNumberText}>{step.step}</Text>
        </View>
        <Text style={[
          styles.stepInstruction,
          step.important && styles.stepInstructionImportant
        ]}>
          {step.instruction}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.gradient, styles.gradientBackground]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
              <Ionicons name="home" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Getting AI recommendations...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.gradient, styles.gradientBackground]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
              <Ionicons name="home" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.gradient, styles.gradientBackground]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Recommendations</Text>
          <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Your Recommendations</Text>
          <Text style={styles.subtitle}>
            Based on your symptoms, available medications, and OTC options
          </Text>

          {aiResponse && (
            <>
              {/* Warning Message */}
              {aiResponse.warningMessage && (
                <View style={styles.alertCard}>
                  <View style={styles.warningContainer}>
                    <Ionicons name="warning-outline" size={24} color="#F59E0B" />
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>Warning</Text>
                      <Text style={styles.warningText}>{aiResponse.warningMessage}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Seek Medical Attention Alert */}
              {aiResponse.seekMedicalAttention && (
                <View style={styles.alertCard}>
                  <View style={styles.alertContainer}>
                    <Ionicons name="medical-outline" size={24} color="#EF4444" />
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>Medical Attention Required</Text>
                      <Text style={styles.alertText}>
                        Please consider seeking professional medical attention for these symptoms.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Medication Recommendations */}
              {aiResponse.recommendations.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medical" size={20} color="#4A90E2" />
                    <Text style={styles.sectionTitle}>Recommended Medications</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    {aiResponse.recommendations.map(renderMedicationRecommendation)}
                  </View>
                </View>
              )}

              {/* First Aid Instructions */}
              {aiResponse.firstAidInstructions.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bandage" size={20} color="#10B981" />
                    <Text style={styles.sectionTitle}>First Aid Instructions</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    {aiResponse.firstAidInstructions.map(renderFirstAidStep)}
                  </View>
                </View>
              )}

              {/* General Advice */}
              {aiResponse.generalAdvice && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bulb" size={20} color="#F59E0B" />
                    <Text style={styles.sectionTitle}>General Advice</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    <View style={styles.adviceContainer}>
                      <Text style={styles.adviceText}>{aiResponse.generalAdvice}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Emergency Call Section */}
              <View style={styles.emergencyCard}>
                <View style={styles.emergencyHeader}>
                  <Ionicons name="warning" size={24} color="#EF4444" />
                  <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
                </View>
                <Text style={styles.emergencyDescription}>
                  If this is a medical emergency, don't wait. Call emergency services immediately.
                </Text>
                <TouchableOpacity
                  style={styles.emergencyButton}
                  onPress={handleEmergencyCall}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.emergencyButtonText}>Call 911</Text>
                </TouchableOpacity>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerCard}>
                <View style={styles.disclaimer}>
                  <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
                  <View style={styles.disclaimerContent}>
                    <Text style={styles.disclaimerTitle}>Important Notice</Text>
                    <Text style={styles.disclaimerText}>
                      This information is for educational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for medical concerns.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Got It</Text>
            <Ionicons name="checkmark" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  gradient: {
    flex: 1,
  },
  gradientBackground: {
    backgroundColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xl,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  confirmButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: theme.typography.base,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: theme.typography.base,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    marginLeft: theme.spacing.md,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.typography.base,
    lineHeight: 20,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  alertText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.typography.base,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...theme.shadows.sm,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: theme.spacing.sm,
  },
  recommendationInfo: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  medicationName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    marginBottom: 4,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  medicationDosage: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  availabilityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  availabilityText: {
    fontSize: theme.typography.xs,
    color: '#FFFFFF',
    fontWeight: theme.typography.medium,
  },
  recommendationReason: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  stockInfo: {
    fontSize: theme.typography.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: theme.spacing.sm,
  },

  otcNote: {
    fontSize: theme.typography.sm,
    color: '#3B82F6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  otcInfo: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  firstAidStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  stepNumberImportant: {
    backgroundColor: '#EF4444',
  },
  stepNumberText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
  },
  stepInstruction: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 18,
  },
  stepInstructionImportant: {
    fontWeight: theme.typography.medium,
    color: '#FFFFFF',
  },
  adviceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  adviceText: {
    fontSize: theme.typography.base,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
  },
  disclaimerText: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  // New card-based styles
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  alertContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  alertTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionContent: {
    padding: theme.spacing.lg,
  },
  emergencyCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    ...theme.shadows.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emergencyTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.bold,
    color: '#EF4444',
    marginLeft: theme.spacing.md,
  },
  emergencyDescription: {
    fontSize: theme.typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  emergencyButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  disclaimerContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  disclaimerTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
});
