import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MedicationWithMembers } from '../types/medication';

export default function MedicationDetailsScreen() {
  const router = useRouter();
  const { medicationData } = useLocalSearchParams();
  
  const medication: MedicationWithMembers = JSON.parse(medicationData as string);

  const handleRefill = () => {
    Alert.prompt(
      'Refill Medication',
      `How many days worth of ${medication.name} would you like to add?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: (days?: string) => {
            const additionalDays = parseInt(days || '0');
            if (additionalDays > 0) {
              Alert.alert('Success', `Added ${additionalDays} days to ${medication.name}. Please return to the main screen to see updates.`);
            }
          }
        }
      ],
      'plain-text',
      '30'
    );
  };

  const handleAskQuestion = () => {
    Alert.alert('Ask a Question', 'This feature will connect you with a healthcare professional or AI assistant for medication-related questions.');
  };

  const getStockColor = (stockLevel: string) => {
    switch (stockLevel) {
      case 'good': return '#4CAF50';
      case 'low': return '#FF9800';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStockWidth = (daysLeft: number) => {
    if (daysLeft > 20) return '100%';
    if (daysLeft > 10) return '60%';
    if (daysLeft > 5) return '30%';
    return '15%';
  };

  const assignedNames = medication.members.map(m => m.name).join(', ');
  const inventoryText = medication.currentCount && medication.totalCount 
    ? `${medication.currentCount}/${medication.totalCount} ${medication.name.includes('Syrup') ? 'ml' : 'pills'}`
    : 'Not specified';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medication Name & Status */}
        <View style={styles.medicationHeader}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          {medication.stockLevel === 'critical' && (
            <View style={styles.criticalBadge}>
              <Ionicons name="warning" size={16} color="white" />
              <Text style={styles.criticalText}>LOW STOCK!</Text>
            </View>
          )}
        </View>

        {/* Priority Information Cards */}
        <View style={styles.prioritySection}>
          {/* Stock Level - Highest Priority */}
          <View style={[styles.infoCard, styles.priorityCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={20} color={getStockColor(medication.stockLevel)} />
              <Text style={styles.cardTitle}>Stock Status</Text>
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
              <Text style={styles.stockText}>
                {medication.daysLeft} days remaining • {medication.stockLevel.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Current Inventory */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube" size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Current Inventory</Text>
            </View>
            <Text style={styles.cardValue}>{inventoryText}</Text>
          </View>

          {/* Dosage Information */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Dosage</Text>
            </View>
            <Text style={styles.cardValue}>{medication.dosage || 'Not specified'}</Text>
          </View>

          {/* Assigned Family Members */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Assigned To</Text>
            </View>
            <View style={styles.membersContainer}>
              {medication.members.map(member => (
                <View
                  key={member.id}
                  style={[
                    styles.memberTag,
                    { backgroundColor: member.color },
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
          </View>

          {/* Last Taken */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Last Taken</Text>
            </View>
            <Text style={styles.cardValue}>
              {medication.lastTaken 
                ? new Date(medication.lastTaken).toLocaleDateString() 
                : 'Never recorded'
              }
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.askButton]}
          onPress={handleAskQuestion}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#4A90E2" />
          <Text style={styles.askButtonText}>Ask Question</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.refillButton]}
          onPress={handleRefill}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.refillButtonText}>Refill</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  medicationHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  medicationName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  criticalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  prioritySection: {
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  stockContainer: {
    marginTop: 8,
  },
  stockBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  stockFill: {
    height: '100%',
    borderRadius: 4,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  membersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  memberName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  askButton: {
    backgroundColor: '#E3F2FD',
  },
  askButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  refillButton: {
    backgroundColor: '#4A90E2',
  },
  refillButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
