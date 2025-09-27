import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../../services/newDataService';

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create medication object
      // Helper: compute stock level from counts
      const computeStockLevelFromCounts = (current?: number, total?: number) => {
        // If counts aren't available, fall back to 'good'
        if (typeof current !== 'number' || typeof total !== 'number' || total <= 0) {
          return 'good';
        }
        const ratio = current / total;
        // Reasonable thresholds:
        // - critical: <= 5% or current <= 3
        // - low: <= 25% or current <= 10
        // - good: otherwise
        if (current <= 3 || ratio <= 0.05) return 'critical';
        if (current <= 10 || ratio <= 0.25) return 'low';
        return 'good';
      };

      const currentCountParsed = parseInt(params.currentCount as string);
      const totalCountParsed = parseInt(params.totalCount as string);

      const medication = {
        id: Date.now().toString(), // Simple ID generation
        name: params.medicationName as string,
        dosage: params.dosage as string,
        form: params.medicationForm as string,
        frequency: params.frequency as string,
        timing: params.timing as string,
        assignedMembers: Array.isArray(params.assignedMembers)
          ? params.assignedMembers
          : [params.assignedMembers].filter(Boolean),
        currentCount: currentCountParsed,
        totalCount: totalCountParsed,
        daysLeft: parseInt(params.daysLeft as string),
        stockLevel: computeStockLevelFromCounts(currentCountParsed, totalCountParsed),

        refillReminder: params.refillReminder as string,
        createdAt: new Date().toISOString(),
      };

      console.log('Saving medication:', medication);
      await DataService.addMedication(medication);
      console.log('Medication saved successfully');

      router.push('/');
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return theme.colors.stockCritical;
      case 'low': return theme.colors.stockLow;
      default: return theme.colors.stockGood;
    }
  };

  const getStockLevelText = (level: string) => {
    switch (level) {
      case 'critical': return 'Critical';
      case 'low': return 'Low';
      default: return 'Good';
    }
  };

  // Compute stock level for preview from params (so preview matches saved value)
  const previewCurrent = parseInt(params.currentCount as string);
  const previewTotal = parseInt(params.totalCount as string);
  const previewStockLevel = (() => {
    if (!Number.isFinite(previewCurrent) || !Number.isFinite(previewTotal) || previewTotal <= 0) return 'good';
    const r = previewCurrent / previewTotal;
    if (previewCurrent <= 3 || r <= 0.05) return 'critical';
    if (previewCurrent <= 10 || r <= 0.25) return 'low';
    return 'good';
  })();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Add Medication</Text>
            <Text style={styles.stepText}>Step 4 of 4</Text>
          </View>
          <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Review Your Medication</Text>
          <Text style={styles.subtitle}>
            Please review all details before saving
          </Text>

          {/* Medication Details */}
          <View style={styles.detailsContainer}>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{params.medicationName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dosage:</Text>
                <Text style={styles.detailValue}>{params.dosage}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Form:</Text>
                <Text style={styles.detailValue}>{params.medicationForm}</Text>
              </View>
            </View>

            {/* Assignment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned To</Text>
              <Text style={styles.detailValue}>
                {Array.isArray(params.assignedMembers)
                  ? params.assignedMembers.length
                  : 1} family member(s)
              </Text>
            </View>

            {/* Inventory */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inventory</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Count:</Text>
                <Text style={styles.detailValue}>{params.currentCount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Count:</Text>
                <Text style={styles.detailValue}>{params.totalCount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Doses Left:</Text>
                <Text style={styles.detailValue}>{params.daysLeft} days</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stock Level:</Text>
                <View style={styles.stockLevelContainer}>
                  <View style={[
                    styles.stockLevelDot,
                    { backgroundColor: getStockLevelColor(previewStockLevel) }
                  ]} />
                  <Text style={[
                    styles.detailValue,
                    { color: getStockLevelColor(previewStockLevel) }
                  ]}>
                    {getStockLevelText(previewStockLevel)}
                  </Text>
                </View>
              </View>
            </View>



            {/* Reminders */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Refill Reminders:</Text>
                <Text style={styles.detailValue}>
                  {params.refillReminder === 'true' ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Medication</Text>
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  stockLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  stockLevelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
