import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../services/dataService';
import { Medication } from '../types/medication';

export default function ManageMedications() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const meds = await DataService.getMedications();
      setMedications(meds);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = (medicationId: string, medicationName: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medicationName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DataService.deleteMedication(medicationId);
            loadMedications();
          },
        },
      ]
    );
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={styles.medicationCard}>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationDosage}>{item.dosage}</Text>
      </View>
      <View style={styles.medicationActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/edit-medication/${item.id}`)}>
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteMedication(item.id, item.name)}>
          <Ionicons name="trash" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
      <Text style={styles.emptyStateText}>No medications found.</Text>
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
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
          <Text style={styles.headerTitle}>Medications</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<Text style={styles.title}>Manage Medications</Text>}
          ListEmptyComponent={renderEmptyState}
        />

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
    color: '#FFFFFF',
    fontSize: 18,
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for bottom button
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
  medicationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
