import { theme } from '@/constants/theme';
import { PATIENT_TYPES, PatientType } from '@/types/aiSearch';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PatientTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedPatientType, setSelectedPatientType] = useState<'adult' | 'child' | null>(null);

  const handlePatientTypeSelect = (patientType: 'adult' | 'child') => {
    setSelectedPatientType(patientType);
  };

  const handleNext = () => {
    if (selectedPatientType) {
      router.push({
        pathname: '/ai-search/severity',
        params: {
          symptoms: params.symptoms,
          patientType: selectedPatientType,
        }
      });
    }
  };

  const renderPatientTypeCard = (patientType: PatientType) => {
    const isSelected = selectedPatientType === patientType.id;

    return (
      <TouchableOpacity
        key={patientType.id}
        style={[
          styles.patientTypeCard,
          isSelected && styles.patientTypeCardSelected
        ]}
        onPress={() => handlePatientTypeSelect(patientType.id)}
      >
        <View style={[
          styles.patientTypeIcon,
          isSelected && styles.patientTypeIconSelected
        ]}>
          <Ionicons
            name={patientType.icon as any}
            size={48}
            color={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'}
          />
        </View>
        <Text style={[
          styles.patientTypeText,
          isSelected && styles.patientTypeTextSelected
        ]}>
          {patientType.name}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
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
            <Text style={styles.stepText}>Step 2 of 4</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Patient Type</Text>
          <Text style={styles.subtitle}>
            Who is experiencing these symptoms?
          </Text>

          {/* Patient Type Selection */}
          <View style={styles.patientTypeContainer}>
            {PATIENT_TYPES.map(renderPatientTypeCard)}
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedPatientType && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!selectedPatientType}
          >
            <Text style={[
              styles.nextButtonText,
              !selectedPatientType && styles.nextButtonTextDisabled
            ]}>
              Next: Severity Level
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={!selectedPatientType ? '#999' : '#4A90E2'}
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
  patientTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
  },
  patientTypeCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 160,
    justifyContent: 'center',
  },
  patientTypeCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  patientTypeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  patientTypeIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  patientTypeText: {
    fontSize: theme.typography.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: theme.typography.semibold,
  },
  patientTypeTextSelected: {
    color: '#FFFFFF',
    fontWeight: theme.typography.bold,
  },
  checkmark: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
