import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../services/dataService';
import { FamilyMember } from '../types/medication';

export default function ManageFamilyMembersScreen() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'adult' | 'child'>('adult');

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

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditType(member.type);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingMember) {
      Alert.alert('Error', 'Please enter a valid name');
      return;
    }

    try {
      const updatedMember: FamilyMember = {
        ...editingMember,
        name: editName.trim(),
        type: editType,
        color: editType === 'adult' ? '#4A90E2' : '#F5A623',
      };

      await DataService.updateFamilyMember(updatedMember);
      await loadFamilyMembers();
      setEditModalVisible(false);
      setEditingMember(null);
      Alert.alert('Success', 'Family member updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update family member');
    }
  };

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
          }
        }
      ]
    );
  };

  const renderFamilyMember = (member: FamilyMember) => (
    <View key={member.id} style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
          <Ionicons
            name={member.type === 'adult' ? 'person' : 'lock-closed'}
            size={24}
            color="white"
          />
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberType}>
            {member.type === 'adult' ? 'Adult' : 'Child'}
          </Text>
        </View>
      </View>

      <View style={styles.memberActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(member)}
        >
          <Ionicons name="pencil" size={18} color="#4A90E2" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(member)}
        >
          <Ionicons name="trash" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Manage Family Members</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-family-member')}
        >
          <Ionicons name="add" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.membersContainer}>
          {familyMembers.length > 0 ? (
            familyMembers.map(renderFamilyMember)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#B0B0B0" />
              <Text style={styles.emptyStateText}>No family members yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first family member to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/add-family-member')}
              >
                <Text style={styles.emptyStateButtonText}>Add Family Member</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Footer with Add Button */}
      <View style={styles.bottomFooter}>
        <TouchableOpacity
          style={styles.addFamilyFooterButton}
          onPress={() => router.push('/add-family-member')}
        >
          <Ionicons name="person-add" size={20} color="white" />
          <Text style={styles.footerButtonText}>Add Family Member</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Family Member</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    editType === 'adult' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setEditType('adult')}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={editType === 'adult' ? 'white' : '#4A90E2'}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    editType === 'adult' && styles.typeButtonTextSelected,
                  ]}>
                    Adult
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    editType === 'child' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setEditType('child')}
                >
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={editType === 'child' ? 'white' : '#F5A623'}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    editType === 'child' && styles.typeButtonTextSelected,
                  ]}>
                    Child
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the fixed footer
  },
  membersContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberType: {
    fontSize: 14,
    color: '#666',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
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
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  typeButtonSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A90E2',
    marginLeft: 8,
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  bottomFooter: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  addFamilyFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 12,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
