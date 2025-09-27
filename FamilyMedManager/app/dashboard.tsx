import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { DataService } from '../services/dataService';
import { FamilyMember, MedicationWithMembers } from '../types/medication';

export default function DashboardScreen() {
  const [medications, setMedications] = useState<MedicationWithMembers[]>([]);
  const [, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'adults' | 'kids'>('adults');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await DataService.initializeData();
      const [meds, members] = await Promise.all([
        DataService.getMedications(),
        DataService.getFamilyMembers(),
      ]);

      // Combine medications with their assigned family members
      const medicationsWithMembers: MedicationWithMembers[] = meds.map(med => ({
        ...med,
        members: members.filter(member => med.assignedMembers.includes(member.id)),
      }));

      setMedications(medicationsWithMembers);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDose = async (medicationId: string) => {
    // Optimistically update UI, then persist. Revert on error.
    const previousMedications = medications;
    const computeStockLevelLocal = (daysLeft: number) => {
      if (typeof daysLeft !== 'number') return 'good';
      if (daysLeft <= 3) return 'critical';
      if (daysLeft <= 10) return 'low';
      return 'good';
    };

    try {
      const updated = medications.map(m => {
        if (m.id !== medicationId) return m;
        const newCurrent = typeof m.currentCount === 'number' ? Math.max(0, m.currentCount - 1) : m.currentCount;
        const newDaysLeft = typeof m.daysLeft === 'number' ? Math.max(0, m.daysLeft - 1) : m.daysLeft;
        return {
          ...m,
          currentCount: newCurrent,
          daysLeft: newDaysLeft,
          lastTaken: new Date(),
          stockLevel: computeStockLevelLocal(newDaysLeft),
        } as MedicationWithMembers;
      });

  setMedications(updated);

  await DataService.takeDose(medicationId);

  // Reload persisted data so all screens read the same source of truth
  await loadData();

  Alert.alert('Success', 'Dose recorded successfully!');
    } catch (error) {
      // revert
      setMedications(previousMedications);
      console.error('Failed to take dose:', error);
      Alert.alert('Error', 'Failed to record dose');
    }
  };

  const getStockColor = (stockLevel: string) => {
    switch (stockLevel) {
      case 'good': return theme.colors.stockGood;
      case 'low': return theme.colors.stockLow;
      case 'critical': return theme.colors.stockCritical;
      default: return theme.colors.textTertiary;
    }
  };



  const renderMedicationCard = (medication: MedicationWithMembers) => (
    <TouchableOpacity
      key={medication.id}
      style={[
        styles.medicationCard,
        medication.stockLevel === 'critical' && styles.medicationCardCritical
      ]}
      onPress={() => handleTakeDose(medication.id)}
    >
      <View style={styles.medicationCardHeader}>
        <View style={styles.medicationIconContainer}>
          <Ionicons
            name="medical"
            size={20}
            color={medication.stockLevel === 'critical' ? 'white' : theme.colors.primary}
          />
        </View>
        <View style={styles.medicationCardContent}>
          <Text style={[
            styles.medicationCardName,
            medication.stockLevel === 'critical' && styles.medicationCardNameCritical
          ]}>
            {medication.name}
          </Text>
          <Text style={[
            styles.medicationCardDosage,
            medication.stockLevel === 'critical' && styles.medicationCardDosageCritical
          ]}>
            {medication.dosage || 'No dosage specified'}
          </Text>
        </View>
        <View style={styles.medicationCardStatus}>
          <Text style={[
            styles.medicationCardDays,
            medication.stockLevel === 'critical' && styles.medicationCardDaysCritical
          ]}>
            {medication.daysLeft} days
          </Text>
          <View style={[
            styles.stockIndicator,
            { backgroundColor: getStockColor(medication.stockLevel) }
          ]} />
        </View>
      </View>

      <View style={styles.medicationCardFooter}>
        <View style={styles.membersRow}>
          {medication.members.slice(0, 3).map((member, index) => (
            <View
              key={member.id}
              style={[
                styles.memberAvatar,
                { backgroundColor: member.color },
                index > 0 && { marginLeft: -8 }
              ]}
            >
              <Text style={styles.memberAvatarText}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ))}
          {medication.members.length > 3 && (
            <View style={[styles.memberAvatar, styles.memberAvatarMore]}>
              <Text style={styles.memberAvatarText}>+{medication.members.length - 3}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.takeButton,
            medication.stockLevel === 'critical' && styles.takeButtonCritical
          ]}
          onPress={() => handleTakeDose(medication.id)}
        >
          <Ionicons
            name="checkmark"
            size={16}
            color={medication.stockLevel === 'critical' ? theme.colors.error : 'white'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const adultMedications = medications.filter(med =>
    med.members.some(member => member.type === 'adult')
  );

  const childMedications = medications.filter(med =>
    med.members.some(member => member.type === 'child')
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Manager</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedView === 'adults' && styles.toggleButtonActive
              ]}
              onPress={() => setSelectedView('adults')}
            >
              <Ionicons
                name="person"
                size={16}
                color={selectedView === 'adults' ? 'white' : theme.colors.textSecondary}
              />
              <Text style={[
                styles.toggleButtonText,
                selectedView === 'adults' && styles.toggleButtonTextActive
              ]}>
                Adults
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedView === 'kids' && styles.toggleButtonActive
              ]}
              onPress={() => setSelectedView('kids')}
            >
              <Ionicons
                name="happy"
                size={16}
                color={selectedView === 'kids' ? 'white' : theme.colors.textSecondary}
              />
              <Text style={[
                styles.toggleButtonText,
                selectedView === 'kids' && styles.toggleButtonTextActive
              ]}>
                Kids
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>Today's Medications</Text>
          <View style={styles.dateNavigation}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Medications List */}
        <View style={styles.medicationsSection}>
          {selectedView === 'adults' && adultMedications.length > 0 && (
            <>
              {adultMedications.map(renderMedicationCard)}
            </>
          )}

          {selectedView === 'kids' && childMedications.length > 0 && (
            <>
              {childMedications.map(renderMedicationCard)}
            </>
          )}

          {((selectedView === 'adults' && adultMedications.length === 0) ||
            (selectedView === 'kids' && childMedications.length === 0)) && (
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>
                  No medications found for {selectedView}
                </Text>
                <TouchableOpacity style={styles.addMedicationButton}>
                  <Text style={styles.addMedicationButtonText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add New Medication</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  menuButton: ViewStyle;
  headerTitle: TextStyle;
  content: ViewStyle;
  toggleContainer: ViewStyle;
  toggleWrapper: ViewStyle;
  toggleButton: ViewStyle;
  toggleButtonActive: ViewStyle;
  toggleButtonText: TextStyle;
  toggleButtonTextActive: TextStyle;
  dateSection: ViewStyle;
  dateText: TextStyle;
  dateNavigation: ViewStyle;
  medicationsSection: ViewStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  addMedicationButton: ViewStyle;
  addMedicationButtonText: TextStyle;
  bottomContainer: ViewStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  medicationCard: ViewStyle;
  medicationCardCritical: ViewStyle;
  medicationCardHeader: ViewStyle;
  medicationIconContainer: ViewStyle;
  medicationCardContent: ViewStyle;
  medicationCardName: TextStyle;
  medicationCardNameCritical: TextStyle;
  medicationCardDosage: TextStyle;
  medicationCardDosageCritical: TextStyle;
  medicationCardStatus: ViewStyle;
  medicationCardDays: TextStyle;
  medicationCardDaysCritical: TextStyle;
  stockIndicator: ViewStyle;
  medicationCardFooter: ViewStyle;
  membersRow: ViewStyle;
  memberAvatar: ViewStyle;
  memberAvatarMore: ViewStyle;
  memberAvatarText: TextStyle;
  takeButton: ViewStyle;
  takeButtonCritical: ViewStyle;
  membersContainer: ViewStyle;
  memberTag: ViewStyle;
  childMemberTag: ViewStyle;
  memberName: TextStyle;
  stockContainer: ViewStyle;
  stockBar: ViewStyle;
  stockFill: ViewStyle;
  daysLeft: TextStyle;
  takeDoseButton: ViewStyle;
  takeDoseText: TextStyle;
  fab: ViewStyle;
  fabText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  toggleContainer: {
    paddingVertical: theme.spacing.lg,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    ...theme.shadows.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textPrimary,
  },
  dateNavigation: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  medicationsSection: {
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.typography.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addMedicationButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  addMedicationButtonText: {
    color: 'white',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
  },
  section: {
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  medicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  medicationCardCritical: {
    backgroundColor: theme.colors.error,
  },
  medicationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  medicationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  medicationCardContent: {
    flex: 1,
  },
  medicationCardName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  medicationCardNameCritical: {
    color: 'white',
  },
  medicationCardDosage: {
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
  },
  medicationCardDosageCritical: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  medicationCardStatus: {
    alignItems: 'flex-end',
  },
  medicationCardDays: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  medicationCardDaysCritical: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  medicationCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  memberAvatarMore: {
    backgroundColor: theme.colors.textTertiary,
  },
  memberAvatarText: {
    fontSize: 10,
    fontWeight: theme.typography.bold,
    color: 'white',
  },
  takeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takeButtonCritical: {
    backgroundColor: 'white',
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  childMemberTag: {
    backgroundColor: theme.colors.warning,
  },
  memberName: {
    color: 'white',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
    marginLeft: theme.spacing.xs,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    marginRight: theme.spacing.md,
  },
  stockFill: {
    height: '100%',
    borderRadius: 3,
  },
  daysLeft: {
    fontSize: theme.typography.xs,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  takeDoseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  takeDoseText: {
    color: 'white',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl + 8,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  fabText: {
    color: 'white',
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.medium,
  },
});
