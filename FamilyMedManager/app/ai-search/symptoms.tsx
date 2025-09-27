import { theme } from '@/constants/theme';
import { COMMON_SYMPTOMS, Symptom } from '@/types/aiSearch';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function SymptomsScreen() {
  const router = useRouter();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleNext = () => {
    if (selectedSymptoms.length > 0) {
      // Pass selected symptoms to next screen via params
      router.push({
        pathname: '/ai-search/patient-type',
        params: { symptoms: JSON.stringify(selectedSymptoms) }
      });
    }
  };

  const renderSymptomCard = (symptom: Symptom) => {
    const isSelected = selectedSymptoms.includes(symptom.id);

    return (
      <TouchableOpacity
        key={symptom.id}
        style={[
          styles.symptomCard,
          isSelected && styles.symptomCardSelected
        ]}
        onPress={() => handleSymptomToggle(symptom.id)}
      >
        <View style={[
          styles.symptomIcon,
          isSelected && styles.symptomIconSelected
        ]}>
          <Ionicons
            name={symptom.icon as any}
            size={24}
            color={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
          />
        </View>
        <Text style={[
          styles.symptomText,
          isSelected && styles.symptomTextSelected
        ]}>
          {symptom.name}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
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
            <Text style={styles.stepText}>Step 1 of 4</Text>
          </View>
          <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Select Your Symptoms</Text>
          <Text style={styles.subtitle}>
            Choose the symptoms you're experiencing (select multiple if needed)
          </Text>

          {/* Symptoms Grid */}
          <View style={styles.symptomsGrid}>
            {COMMON_SYMPTOMS.map(renderSymptomCard)}
          </View>

          {/* Selected Count */}
          {selectedSymptoms.length > 0 && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedSymptoms.length === 0 && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={selectedSymptoms.length === 0}
          >
            <Text style={[
              styles.nextButtonText,
              selectedSymptoms.length === 0 && styles.nextButtonTextDisabled
            ]}>
              Next: Patient Type
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={selectedSymptoms.length === 0 ? '#999' : '#4A90E2'}
            />
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
  nextButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  nextButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  symptomCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  symptomIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  symptomText: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: theme.typography.medium,
  },
  symptomTextSelected: {
    color: '#FFFFFF',
    fontWeight: theme.typography.semibold,
  },
  checkmark: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  selectedCountText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
  },
});
