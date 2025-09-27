import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DataService } from '../services/newDataService';
import { FamilyMember } from '../types/medication';

export default function ManageFamilyMembersScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  // edit handled in separate screen; leftover modal state removed

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  // Reload members whenever this screen gains focus (for example when coming back from Add)
  useFocusEffect(
    React.useCallback(() => {
      loadFamilyMembers();
    }, [])
  );

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

  const handleEdit = (member: FamilyMember) => {
    // Navigate to dedicated edit screen to keep UX consistent with "Add" flow
    // use object form to satisfy expo-router's typed push
    router.push({ pathname: '/edit-family-member', params: { id: member.id } } as any);
  };

  // edit handled in separate screen

  const handleDelete = (member: FamilyMember) => {
    Alert.alert(
      'Delete Family Member',
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataService.deleteFamilyMember(member.id);
              await loadFamilyMembers();
              Alert.alert('Success', `${member.name} has been deleted`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete family member');
            }
          },
        },
      ]
    );
  };

  const renderFamilyMember = (member: FamilyMember) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={[styles.avatar, { backgroundColor: member.color }]}>
          <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberType}>{member.type === 'adult' ? 'Adult' : 'Child'}</Text>
        </View>
      </View>
      <View style={styles.memberActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(member)}>
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(member)}>
          <Ionicons name="trash" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
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
          <Text style={styles.headerTitle}>Family Members</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Manage Your Family</Text>

          {familyMembers.length > 0 ? (
            familyMembers.map(renderFamilyMember)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyStateText}>No family members found.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/add-family-member')}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.primaryButtonText}>Add Family Member</Text>
          </TouchableOpacity>
        </View>

        {/* Modal removed; edit flow now handled on a dedicated screen */}
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
  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  memberActions: {
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.fieldDefaultText,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.fieldDefault,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  typeButtonSelected: {
    backgroundColor: theme.colors.fieldSelected,
    borderColor: theme.colors.fieldSelectedBorder,
  },
  typeButtonText: {
    color: theme.colors.fieldDefaultText,
    fontSize: 16,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
});
