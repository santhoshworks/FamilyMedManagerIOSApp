import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    // Debug storage on component mount
    DataService.debugStorage();
  }, []);

  const loadMedications = async () => {
    try {
      console.log('Loading medications...');
      const meds = await DataService.getMedications();
      console.log('Loaded medications:', meds.length, meds.map(m => ({ id: m.id, name: m.name })));
      setMedications(meds);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = async (medicationId: string, medicationName: string) => {
    console.log('handleDeleteMedication called for:', medicationName);
    await DataService.deleteMedication(medicationId);
    Alert.alert('Success', `${medicationName} has been deleted.`);
    loadMedications(); // Refresh the list
  };

  const getStockLevelColor = (stockLevel: string) => {
    switch (stockLevel.toLowerCase()) {
      case 'critical':
        return '#FF4444';
      case 'low':
        return '#FF8800';
      case 'good':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const getStockLevelIcon = (stockLevel: string) => {
    switch (stockLevel.toLowerCase()) {
      case 'critical':
        return 'alert-circle';
      case 'low':
        return 'warning';
      case 'good':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => {
    console.log('Rendering medication item:', { id: item.id, name: item.name });
    return (
      <View style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{item.name}</Text>
            <Text style={styles.medicationDosage}>{item.dosage}</Text>
            <Text style={styles.medicationForm}>{item.form}</Text>
          </View>
          <View style={styles.stockInfo}>
            <View style={[styles.stockBadge, { backgroundColor: getStockLevelColor(item.stockLevel) }]}>
              <Ionicons
                name={getStockLevelIcon(item.stockLevel) as any}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.stockText}>{item.stockLevel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.medicationDetails}>
          <Text style={styles.detailText}>
            Assigned to: {item.assignedMembers && item.assignedMembers.length > 0 ? item.assignedMembers.join(', ') : 'No one'}
          </Text>
          {item.lastTaken && (
            <Text style={styles.detailText}>
              Last taken: {new Date(item.lastTaken).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/edit-medication/${item.id}`)}
          >
            <Ionicons name="create-outline" size={20} color="#4A90E2" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMedication(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={80} color="rgba(255, 255, 255, 0.3)" />
      <Text style={styles.emptyTitle}>No Medications Added</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first medication to keep track of your family's health.
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => router.push('/add-medication/basic-info')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addFirstButtonText}>Add Your First Medication</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medication Management</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading medications...</Text>
            </View>
          ) : medications.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  {medications.length} medication{medications.length !== 1 ? 's' : ''} total
                </Text>
              </View>
              <FlatList
                data={medications}
                renderItem={renderMedicationItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>

        {/* Floating Add Button */}
        {medications.length > 0 && (
          <TouchableOpacity
            style={styles.floatingAddButton}
            onPress={() => router.push('/add-medication/basic-info')}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  statsContainer: {
    paddingVertical: 15,
  },
  statsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 100,
  },
  medicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  medicationForm: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  medicationDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.48,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.48,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
