import { theme } from '@/constants/theme';
import { SEVERITY_LEVELS, SeverityLevel } from '@/types/aiSearch';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function SeverityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe' | null>(null);

  const handleSeveritySelect = (severity: 'mild' | 'moderate' | 'severe') => {
    setSelectedSeverity(severity);
  };

  const handleNext = () => {
    if (selectedSeverity) {
      router.push({
        pathname: '/ai-search/additional-context',
        params: {
          symptoms: params.symptoms,
          patientType: params.patientType,
          severity: selectedSeverity,
        }
      });
    }
  };

  const renderSeverityCard = (severityLevel: SeverityLevel) => {
    const isSelected = selectedSeverity === severityLevel.id;

    return (
      <TouchableOpacity
        key={severityLevel.id}
        style={[
          styles.severityCard,
          isSelected && styles.severityCardSelected,
          { borderColor: isSelected ? severityLevel.color : 'transparent' }
        ]}
        onPress={() => handleSeveritySelect(severityLevel.id)}
      >
        <View style={[
          styles.severityIcon,
          isSelected && styles.severityIconSelected,
          { backgroundColor: isSelected ? severityLevel.color : 'rgba(255, 255, 255, 0.1)' }
        ]}>
          <Ionicons
            name={severityLevel.icon as any}
            size={32}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.severityContent}>
          <Text style={[
            styles.severityTitle,
            isSelected && styles.severityTitleSelected
          ]}>
            {severityLevel.name}
          </Text>
          <Text style={[
            styles.severityDescription,
            isSelected && styles.severityDescriptionSelected
          ]}>
            {severityLevel.description}
          </Text>
        </View>
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
            <Text style={styles.stepText}>Step 3 of 4</Text>
          </View>
          <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Severity Level</Text>
          <Text style={styles.subtitle}>
            How severe are the symptoms?
          </Text>

          {/* Severity Selection */}
          <View style={styles.severityContainer}>
            {SEVERITY_LEVELS.map(renderSeverityCard)}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedSeverity && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!selectedSeverity}
          >
            <Text style={[
              styles.nextButtonText,
              !selectedSeverity && styles.nextButtonTextDisabled
            ]}>
              Next: Additional Info
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={!selectedSeverity ? '#999' : '#4A90E2'}
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
  severityContainer: {
    marginTop: theme.spacing.xl,
  },
  severityCard: {
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.fieldDefaultBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityCardSelected: {
    backgroundColor: theme.colors.fieldSelected,
    borderColor: theme.colors.fieldSelectedBorder,
  },
  severityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  severityIconSelected: {
    // Color is set dynamically
  },
  severityContent: {
    flex: 1,
  },
  severityTitle: {
    fontSize: theme.typography.lg,
    color: theme.colors.fieldDefaultText,
    fontWeight: theme.typography.semibold,
    marginBottom: 4,
  },
  severityTitleSelected: {
    color: theme.colors.fieldSelectedText,
    fontWeight: theme.typography.bold,
  },
  severityDescription: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  severityDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkmark: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
