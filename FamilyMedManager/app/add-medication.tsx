import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddMedicationScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/add-medication/basic-info');
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
          <Text style={styles.headerTitle}>Add Medication</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={80} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Add New Medication</Text>
          <Text style={styles.subtitle}>
            Let's add a new medication to your family's inventory. We'll guide you through a simple 4-step process.
          </Text>

          {/* Steps Overview */}
          <View style={styles.stepsOverview}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Basic Information</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Assign to Family</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Inventory Tracking</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Review & Confirm</Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: 50,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  stepsOverview: {
    width: '100%',
    maxWidth: 300,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepNumberText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: theme.typography.base,
    color: '#FFFFFF',
    fontWeight: theme.typography.medium,
  },
  bottomActions: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 34,
    paddingTop: theme.spacing.lg,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  getStartedButtonText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
  },
});
