import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { DataService } from '../services/dataService';
import { FamilyMember, MedicationWithMembers } from '../types/medication';

export default function DashboardScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<MedicationWithMembers[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

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
      await loadData();
      Alert.alert('Success', 'Dose recorded successfully!');
    } catch (error) {
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
      default: return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const renderMedicationCard = (medication: MedicationWithMembers) => (
    <View key={medication.id} style={styles.medicationCard}>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        <Text style={styles.medicationDosage}>{medication.dosage}</Text>
      </View>
      <View style={styles.medicationStatus}>
        <View style={[styles.stockIndicator, { backgroundColor: getStockColor(medication.stockLevel) }]} />
        <Text style={styles.daysLeft}>{medication.daysLeft} days left</Text>
      </View>
      <TouchableOpacity style={styles.takeDoseButton} onPress={() => handleTakeDose(medication.id)}>
        <Text style={styles.takeDoseText}>Take Dose</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Ionicons name="medical" size={64} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/manage-medications')}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Dashboard</Text>

          {medications.length > 0 ? (
            medications.map(renderMedicationCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyStateText}>No medications scheduled for today.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/add-medication')}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.primaryButtonText}>Add New Medication</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  medicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  medicationDosage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  medicationStatus: {
    alignItems: 'flex-end',
    marginHorizontal: 16,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  daysLeft: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  takeDoseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  takeDoseText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    textAlign: 'center',
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
});
