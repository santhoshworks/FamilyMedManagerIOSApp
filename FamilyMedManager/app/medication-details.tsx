import RefillModal from '@/components/RefillModal';
import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../services/newDataService';
import { FamilyMember, MedicationWithMembers } from '../types/medication';

export default function MedicationDetailsScreen() {
  const router = useRouter();
  const { medicationData } = useLocalSearchParams();
  // Use local state so we can enrich the medication with members if needed
  const [medication, setMedication] = useState<MedicationWithMembers | null>(null);

  // Refill modal state
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refilling, setRefilling] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!medicationData) return;
        const parsed = JSON.parse(medicationData as string) as MedicationWithMembers;

        // If members are already present, use them. Otherwise, load family members and
        // map assignedMembers (ids) to full FamilyMember objects so UI can display names.
        if (parsed.members && Array.isArray(parsed.members) && parsed.members.length > 0) {
          setMedication(parsed);
          return;
        }

        // Fetch family members and map
        const allMembers = await DataService.getFamilyMembers();
        const mappedMembers: FamilyMember[] = (parsed.assignedMembers || []).map(id =>
          allMembers.find(m => m.id === id)
        ).filter(Boolean) as FamilyMember[];

        setMedication({
          ...parsed,
          members: mappedMembers,
        });
      } catch (error) {
        console.error('Failed to parse medication data or load members:', error);
      }
    };

    init();
  }, [medicationData]);

  // Helper function to compute stock level from counts
  const computeStockLevelFromCounts = (current?: number, total?: number) => {
    if (typeof current !== 'number' || typeof total !== 'number' || total <= 0) {
      return 'good';
    }
    const ratio = current / total;
    if (current <= 3 || ratio <= 0.05) return 'critical';
    if (current <= 10 || ratio <= 0.25) return 'low';
    return 'good';
  };

  const handleRefill = async (newCount: number) => {
    if (!medication) return;

    setRefilling(true);
    try {
      // Update medication with new count
      const updatedMedication = {
        ...medication,
        currentCount: newCount,
        totalCount: Math.max(medication.totalCount || 0, newCount), // Ensure totalCount is at least newCount
        daysLeft: newCount, // Assuming 1 dose per day
        stockLevel: computeStockLevelFromCounts(newCount, Math.max(medication.totalCount || 0, newCount)),
      };

      await DataService.updateMedication(updatedMedication);

      // Update local state to refresh the UI
      setMedication(updatedMedication);

      setShowRefillModal(false);

      Alert.alert(
        'Refill Successful!',
        `${medication.name} has been refilled to ${newCount} doses.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error refilling medication:', error);
      Alert.alert('Error', 'Failed to refill medication. Please try again.');
    } finally {
      setRefilling(false);
    }
  };

  const getStockColor = (stockLevel: string) => {
    switch (stockLevel) {
      case 'good': return theme.colors.stockGood;
      case 'low': return theme.colors.stockLow;
      case 'critical': return theme.colors.stockCritical;
      default: return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const DetailCard = ({ icon, title, value }: { icon: any; title: string; value?: string }) => (
    <View style={styles.detailCard}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => medication && router.push(`/edit-medication/${medication.id}`)}
          >
            <Ionicons name="pencil" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {medication ? (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{medication.name}</Text>
                <Text style={styles.dosage}>{medication.dosage}</Text>
              </View>

              <View style={styles.stockStatusCard}>
                <Text style={styles.stockStatusTitle}>Inventory Status</Text>
                <View style={styles.stockStatusContent}>
                  <Text style={[styles.stockStatusDays, { color: getStockColor(medication.stockLevel) }]}>
                    {medication.daysLeft} Doses left
                  </Text>
                  <Text style={styles.stockStatusCount}>
                    ({medication.currentCount}/{medication.totalCount} pills)
                  </Text>
                </View>
              </View>

              <DetailCard icon="medkit-outline" title="Form" value={medication.form} />
              <DetailCard
                icon="people-outline"
                title="Assigned To"
                value={
                  medication.members && medication.members.length > 0
                    ? medication.members.map(m => m.name).join(', ')
                    : (medication.assignedMembers && medication.assignedMembers.length > 0
                      ? medication.assignedMembers.join(', ')
                      : 'Unassigned')
                }
              />
              {/*  <DetailCard icon="time-outline" title="Last Taken" value={medication.lastTaken ? new Date(medication.lastTaken).toLocaleDateString() : 'Never'} /> */}
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.detailValue}>Loading...</Text>
            </View>
          )}

        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowRefillModal(true)}>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.primaryButtonText}>Request Refill</Text>
          </TouchableOpacity>
        </View>

        {/* Refill Modal */}
        {medication && (
          <RefillModal
            visible={showRefillModal}
            onClose={() => setShowRefillModal(false)}
            onConfirm={handleRefill}
            medicationName={medication.name}
            currentCount={medication.currentCount || 0}
            loading={refilling}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dosage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  stockStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  stockStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  stockStatusContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockStatusDays: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  stockStatusCount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  detailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTextContainer: {
    marginLeft: 16,
  },
  detailTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
