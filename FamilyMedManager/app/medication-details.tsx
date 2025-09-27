import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MedicationWithMembers } from '../types/medication';

export default function MedicationDetailsScreen() {
  const router = useRouter();
  const { medicationData } = useLocalSearchParams();
  const medication: MedicationWithMembers = JSON.parse(medicationData as string);

  const handleRefill = () => {
    Alert.alert('Refill', 'This feature is coming soon!');
  };

  const getStockColor = (stockLevel: string) => {
    switch (stockLevel) {
      case 'good': return theme.colors.stockGood;
      case 'low': return theme.colors.stockLow;
      case 'critical': return theme.colors.stockCritical;
      default: return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const DetailCard = ({ icon, title, value }: { icon: any; title: string; value: string }) => (
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
          <Text style={styles.headerTitle} numberOfLines={1}>{medication.name}</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push(`/edit-medication/${medication.id}`)}>
            <Ionicons name="pencil" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{medication.name}</Text>
            <Text style={styles.dosage}>{medication.dosage}</Text>
          </View>

          <View style={styles.stockStatusCard}>
            <Text style={styles.stockStatusTitle}>Inventory Status</Text>
            <View style={styles.stockStatusContent}>
              <Text style={[styles.stockStatusDays, { color: getStockColor(medication.stockLevel) }]}>
                {medication.daysLeft} days left
              </Text>
              <Text style={styles.stockStatusCount}>
                ({medication.currentCount}/{medication.totalCount} pills)
              </Text>
            </View>
          </View>

          <DetailCard icon="medkit-outline" title="Form" value={medication.form} />
          <DetailCard icon="people-outline" title="Assigned To" value={medication.members.map(m => m.name).join(', ')} />
          <DetailCard icon="time-outline" title="Last Taken" value={medication.lastTaken ? new Date(medication.lastTaken).toLocaleDateString() : 'Never'} />

        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRefill}>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.primaryButtonText}>Request Refill</Text>
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
});
