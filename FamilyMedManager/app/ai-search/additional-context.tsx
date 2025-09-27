import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AdditionalContextScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [additionalContext, setAdditionalContext] = useState('');

  const handleNext = () => {
    // Navigate to results with all collected data
    router.push({
      pathname: '/ai-search/results',
      params: {
        symptoms: params.symptoms,
        patientType: params.patientType,
        severity: params.severity,
        additionalContext: additionalContext.trim(),
      }
    });
  };

  const handleSkip = () => {
    // Skip additional context and go to results
    router.push({
      pathname: '/ai-search/results',
      params: {
        symptoms: params.symptoms,
        patientType: params.patientType,
        severity: params.severity,
        additionalContext: '',
      }
    });
  };

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.stepText}>Step 4 of 4</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Text style={styles.title}>Additional Information</Text>
          <Text style={styles.subtitle}>
            Any additional symptoms or context? (Optional)
          </Text>

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Describe any other symptoms, duration, or relevant details..."
              placeholderTextColor={theme.colors.fieldDefaultPlaceholder}
              value={additionalContext}
              onChangeText={setAdditionalContext}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Helper Text */}
          <View style={styles.helperContainer}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.helperText}>
              This information helps provide more accurate recommendations
            </Text>
          </View>
        </KeyboardAvoidingView>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Get AI Recommendations</Text>
              <Ionicons name="search" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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
  nextButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  inputContainer: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  textInput: {
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.fieldDefaultText,
    fontSize: theme.typography.base,
    minHeight: 120,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  helperText: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  skipButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
});
