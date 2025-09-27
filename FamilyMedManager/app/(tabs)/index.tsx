import DrawerMenu from '@/components/DrawerMenu';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { DataService } from '../../services/dataService';
import { FamilyMember, MedicationWithMembers } from '../../types/medication';

export default function HomeScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<MedicationWithMembers[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Force cache refresh

  useEffect(() => {
    loadData();
  }, []);



  const loadData = async () => {
    try {
      console.log('Loading data...');
      await DataService.initializeData();
      const [meds, members] = await Promise.all([
        DataService.getMedications(),
        DataService.getFamilyMembers(),
      ]);

      console.log('Loaded medications:', meds.length);
      console.log('Loaded family members:', members.length);

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
    try {
      await DataService.takeDose(medicationId);
      Alert.alert('Success', 'Dose recorded successfully!');
      loadData(); // Refresh data
    } catch (error) {
      Alert.alert('Error', 'Failed to record dose');
    }
  };

  const handleMedicationDetails = (medication: MedicationWithMembers) => {
    // Store medication data for the details screen
    router.push({
      pathname: '/medication-details',
      params: {
        medicationData: JSON.stringify(medication)
      }
    });
  };



  const handleAddMedicine = () => {
    router.push('/add-medication');
  };

  const handleAddFamilyMember = () => {
    router.push('/add-family-member');
  };

  const getStockColor = (stockLevel: string) => {
    switch (stockLevel) {
      case 'good': return theme.colors.stockGood;
      case 'low': return theme.colors.stockLow;
      case 'critical': return theme.colors.stockCritical;
      default: return theme.colors.textTertiary;
    }
  };

  const getStockWidth = (daysLeft: number) => {
    if (daysLeft > 20) return '100%';
    if (daysLeft > 10) return '60%';
    if (daysLeft > 5) return '30%';
    return '15%';
  };

  const renderMedicationCard = (medication: MedicationWithMembers) => (
    <View key={medication.id} style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>
            {medication.name} {medication.dosage && `(${medication.dosage})`}
          </Text>
          {medication.stockLevel === 'critical' && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>LOW STOCK!</Text>
            </View>
          )}
        </View>
        <View style={styles.medicationActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleMedicationDetails(medication)}
          >
            <Text style={styles.detailsButtonText}>More Details</Text>
          </TouchableOpacity>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
        </View>
      </View>

      <View style={styles.membersContainer}>
        {medication.members.map(member => (
          <View
            key={member.id}
            style={[
              styles.memberTag,
              { backgroundColor: member.color },
              member.type === 'child' && styles.childMemberTag,
            ]}
          >
            <Ionicons
              name={member.type === 'adult' ? 'person' : 'lock-closed'}
              size={12}
              color="white"
            />
            <Text style={styles.memberName}>{member.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stockContainer}>
        <View style={styles.stockBar}>
          <View
            style={[
              styles.stockFill,
              {
                backgroundColor: getStockColor(medication.stockLevel),
                width: getStockWidth(medication.daysLeft),
              },
            ]}
          />
        </View>
        <Text style={styles.daysLeft}>Est. {medication.daysLeft} days left</Text>

        {medication.members.some(m => m.type === 'adult') && (
          <TouchableOpacity
            style={styles.takeDoseButton}
            onPress={() => handleTakeDose(medication.id)}
          >
            <Text style={styles.takeDoseText}>Take Dose</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={[styles.gradient, styles.gradientBackground]}>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family Med Manager</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Default State */}
          {medications.length === 0 && familyMembers.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="medical" size={64} color="rgba(255, 255, 255, 0.6)" />
              </View>
              <Text style={styles.emptyStateTitle}>Welcome to Family Med Manager</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start by adding your family members and medications to keep track of your family's health inventory.
              </Text>
              <View style={styles.emptyStateActions}>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={handleAddFamilyMember}
                >
                  <Ionicons name="person-add" size={20} color={theme.colors.primary} />
                  <Text style={styles.emptyStateButtonText}>Add Family Member</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={handleAddMedicine}
                >
                  <Ionicons name="medical" size={20} color={theme.colors.primary} />
                  <Text style={styles.emptyStateButtonText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {adultMedications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTextPrimary}>Adults' Medications</Text>
              {adultMedications.map(renderMedicationCard)}
            </View>
          )}

          {childMedications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTextPrimary}>Kids' Medications</Text>
              {childMedications.map(renderMedicationCard)}
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Footer with FABs */}
        <View style={styles.bottomFooter}>
          <TouchableOpacity
            style={[styles.footerButton, styles.addFamilyButton]}
            onPress={handleAddFamilyMember}
          >
            <Ionicons name="person-add" size={20} color="white" />
            <Text style={styles.footerButtonText}>Add Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.addMedicineButton]}
            onPress={handleAddMedicine}
          >
            <Ionicons name="medical" size={20} color="white" />
            <Text style={styles.footerButtonText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: 50,
    backgroundColor: 'transparent',
  },
  menuButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the fixed footer
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
  sectionTextPrimary: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.md,
  },
  medicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.medium,
  },
  medicationName: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  lowStockBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  lowStockText: {
    color: 'white',
    fontSize: theme.typography.xs,
    fontWeight: theme.typography.bold,
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
  bottomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // position: 'absolute',
    bottom: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    // paddingBottom: 34, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  addFamilyButton: {
    backgroundColor: theme.colors.warning,
  },
  addMedicineButton: {
    backgroundColor: theme.colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  refreshButton: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: theme.typography.xxl,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyStateSubtitle: {
    fontSize: theme.typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
  },
  footerButtonText: {
    color: 'white',
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.semibold,
    marginLeft: theme.spacing.sm,
  },
});
