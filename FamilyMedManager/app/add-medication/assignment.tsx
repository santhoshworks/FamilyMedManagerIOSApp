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
import { DataService } from '../../services/newDataService';
import { FamilyMember } from '../../types/medication';

export default function AssignmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const members = await DataService.getFamilyMembers();
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleNext = () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Required Selection', 'Please select at least one family member');
      return;
    }

    // Pass data to next step
    const medicationData = {
      ...params,
      assignedMembers: selectedMembers,
    };

    router.push({
      pathname: '/add-medication/inventory',
      params: medicationData,
    });
  };

  const renderFamilyMember = (member: FamilyMember) => (
    <TouchableOpacity
      key={member.id}
      style={[
        styles.memberCard,
        selectedMembers.includes(member.id) && styles.selectedMemberCard
      ]}
      onPress={() => toggleMemberSelection(member.id)}
    >
      <View style={styles.memberInfo}>
        <View style={[
          styles.avatar,
          { backgroundColor: member.color || theme.colors.primary }
        ]}>
          <Text style={styles.avatarText}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={[
            styles.memberName,
            selectedMembers.includes(member.id) && styles.selectedMemberName
          ]}>
            {member.name}
          </Text>
          <Text style={[
            styles.memberType,
            selectedMembers.includes(member.id) && styles.selectedMemberType
          ]}>
            {member.type === 'adult' ? 'Adult' : 'Child'}
          </Text>
        </View>
      </View>
      <View style={styles.checkboxContainer}>
        {selectedMembers.includes(member.id) ? (
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        ) : (
          <View style={styles.uncheckedBox} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading family members...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

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
            <Text style={styles.stepText}>Step 2 of 4</Text>
          </View>
          <TouchableOpacity style={styles.placeholder} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Who will take this medication?</Text>
          <Text style={styles.subtitle}>
            Select the family members who will be taking this medication
          </Text>

          {/* Family Members List */}
          <View style={styles.membersContainer}>
            {familyMembers.length > 0 ? (
              familyMembers.map(renderFamilyMember)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="person-add" size={48} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.emptyStateText}>No family members found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add family members first to assign medications
                </Text>
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={() => router.push('/add-family-member')}
                >
                  <Text style={styles.addMemberButtonText}>Add Family Member</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedMembers.length === 0 && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={selectedMembers.length === 0}
          >
            <Text style={[
              styles.nextButtonText,
              selectedMembers.length === 0 && styles.disabledButtonText
            ]}>
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={selectedMembers.length === 0 ? '#999' : theme.colors.primary}
            />
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
  membersContainer: {
    marginBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMemberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedMemberName: {
    color: '#FFFFFF',
  },
  memberType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedMemberType: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkboxContainer: {
    marginLeft: 16,
  },
  uncheckedBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  addMemberButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 20,
  },
  nextButton: {
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  disabledButtonText: {
    color: '#999',
  },
});
