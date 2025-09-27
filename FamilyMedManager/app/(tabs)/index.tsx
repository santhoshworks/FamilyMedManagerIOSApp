import DrawerMenu from '@/components/DrawerMenu';
import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SplashScreen, useRouter } from 'expo-router';
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
import { DataService } from '../../services/newDataService';
import { FamilyMember, MedicationWithMembers } from '../../types/medication';

export default function HomeScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<MedicationWithMembers[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

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
    try {
      await DataService.takeDose(medicationId);
      Alert.alert('Success', 'Dose recorded successfully!');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to record dose');
    }
  };

  const handleMedicationDetails = (medication: MedicationWithMembers) => {
    router.push({
      pathname: '/medication-details',
      params: { medicationData: JSON.stringify(medication) },
    });
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
    <TouchableOpacity key={medication.id} style={styles.medicationCard} onPress={() => handleMedicationDetails(medication)}>
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Ionicons name="medical" size={64} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.loadingText}>Loading your medications...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setDrawerVisible(true)}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FamilyMedManager</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/ai-search')}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {medications.length === 0 && familyMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyStateText}>Welcome!</Text>
              <Text style={styles.emptyStateSubtext}>Add family members and medications to get started.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Available Medications</Text>
              {medications.map(renderMedicationCard)}
            </>
          )}
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/add-medication')}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.primaryButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>

        <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
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
    fontSize: 20,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 20,
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
