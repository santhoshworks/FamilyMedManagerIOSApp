import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../../services/dataService';
import { FamilyMember, Medication } from '../../types/medication';

const medicationForms = [
  { id: 'tablet', label: 'Tablet', icon: 'medical' },
  { id: 'capsule', label: 'Capsule', icon: 'ellipse' },
  { id: 'liquid', label: 'Liquid', icon: 'water' },
  { id: 'injection', label: 'Injection', icon: 'medical' },
  { id: 'cream', label: 'Cream/Ointment', icon: 'hand-left' },
  { id: 'inhaler', label: 'Inhaler', icon: 'fitness' },
];

const stockLevels = ['good', 'low', 'critical'];

export default function EditMedication() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [medicationForm, setMedicationForm] = useState('');
  const [stockLevel, setStockLevel] = useState('good');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    loadMedicationData();
  }, [id]);

  const loadMedicationData = async () => {
    try {
      const [medications, members] = await Promise.all([
        DataService.getMedications(),
        DataService.getFamilyMembers(),
      ]);

      const medication = medications.find(med => med.id === id);
      if (!medication) {
        Alert.alert('Error', 'Medication not found');
        router.back();
        return;
      }

      // Populate form with existing data
      setMedicationName(medication.name || '');
      setDosage(medication.dosage || '');
      setMedicationForm(medication.form || '');
      setStockLevel(medication.stockLevel || 'good');
      setAssignedTo(medication.assignedMembers || []);
      setFamilyMembers(members || []);
    } catch (error) {
      console.error('Error loading medication data:', error);
      Alert.alert('Error', 'Failed to load medication data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!medicationName.trim() || !dosage.trim() || !medicationForm) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const updatedMedication: Medication = {
        id: id as string,
        name: medicationName.trim(),
        dosage: dosage.trim(),
        form: medicationForm,
        assignedMembers: assignedTo,
        stockLevel,
        daysLeft: 0, // This should be calculated based on actual logic
        createdAt: new Date().toISOString(), // Keep original creation date in real app
      };

      await DataService.updateMedication(updatedMedication);

      // Navigate back immediately after successful save
      router.back();

      // Show success message without blocking navigation
      Alert.alert(
        'Success!',
        'Medication has been updated successfully.'
      );
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFamilyMember = (memberId: string) => {
    setAssignedTo(prev => {
      const currentAssigned = prev || [];
      return currentAssigned.includes(memberId)
        ? currentAssigned.filter(id => id !== memberId)
        : [...currentAssigned, memberId];
    });
  };

  const renderFormOption = (form: typeof medicationForms[0]) => (
    <TouchableOpacity
      key={form.id}
      style={[
        styles.formOption,
        medicationForm === form.id && styles.selectedFormOption
      ]}
      onPress={() => setMedicationForm(form.id)}
    >
      <Ionicons
        name={form.icon as any}
        size={24}
        color={medicationForm === form.id ? '#FFFFFF' : '#4A90E2'}
      />
      <Text style={[
        styles.formOptionText,
        medicationForm === form.id && styles.selectedFormOptionText
      ]}>
        {form.label}
      </Text>
    </TouchableOpacity>
  );

  const renderStockOption = (level: string) => (
    <TouchableOpacity
      key={level}
      style={[
        styles.stockOption,
        stockLevel === level && styles.selectedStockOption
      ]}
      onPress={() => setStockLevel(level)}
    >
      <Text style={[
        styles.stockOptionText,
        stockLevel === level && styles.selectedStockOptionText
      ]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading medication...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Medication</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Medication Name */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Medication Name *</Text>
              <TextInput
                style={styles.textInput}
                value={medicationName}
                onChangeText={setMedicationName}
                placeholder="e.g., Aspirin, Ibuprofen"
                placeholderTextColor="rgb(255, 255, 255)"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Dosage */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Dosage/Strength *</Text>
              <TextInput
                style={styles.textInput}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 500mg, 10ml, 1 tablet"
                placeholderTextColor="rgb(255, 255, 255)"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Medication Form */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Medication Form *</Text>
              <View style={styles.formGrid}>
                {medicationForms.map(renderFormOption)}
              </View>
            </View>

            {/* Stock Level */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Stock Level</Text>
              <View style={styles.stockGrid}>
                {stockLevels.map(renderStockOption)}
              </View>
            </View>

            {/* Assign to Family Members */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Assign to Family Members</Text>
              <Text style={styles.sublabel}>Select who this medication is for</Text>
              {familyMembers.length === 0 ? (
                <View style={styles.noMembersContainer}>
                  <Text style={styles.noMembersText}>
                    No family members added yet.
                  </Text>
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={() => router.push('/manage-family-members')}
                  >
                    <Text style={styles.addMemberButtonText}>Add Family Members</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.membersList}>
                  {familyMembers && familyMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberOption,
                        assignedTo && assignedTo.includes(member.id) && styles.selectedMemberOption,
                      ]}
                      onPress={() => toggleFamilyMember(member.id)}
                    >
                      <View style={styles.memberInfo}>
                        <Text
                          style={[
                            styles.memberName,
                            assignedTo && assignedTo.includes(member.id) && styles.selectedMemberName,
                          ]}
                        >
                          {member.name}
                        </Text>
                        <Text
                          style={[
                            styles.memberRelation,
                            assignedTo && assignedTo.includes(member.id) && styles.selectedMemberRelation,
                          ]}
                        >
                          {member.relationship}
                        </Text>
                      </View>
                      {assignedTo && assignedTo.includes(member.id) && (
                        <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 120,
  },
  selectedFormOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  formOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    fontSize: 14,
  },
  selectedFormOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stockGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  stockOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedStockOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  stockOptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  selectedStockOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noMembersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noMembersText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  addMemberButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  membersList: {
    gap: 12,
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedMemberOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderColor: '#4A90E2',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedMemberName: {
    color: '#FFFFFF',
  },
  memberRelation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedMemberRelation: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
});
