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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../../services/newDataService';
import { FamilyMember, Medication } from '../../types/medication';

const medicationForms = [
  { id: 'tablet', label: 'Tablet', icon: 'medical' },
  { id: 'capsule', label: 'Capsule', icon: 'ellipse' },
  { id: 'liquid', label: 'Liquid', icon: 'water' },
  { id: 'injection', label: 'Injection', icon: 'medical' },
  { id: 'cream', label: 'Cream', icon: 'hand-left' },
  { id: 'inhaler', label: 'Inhaler', icon: 'fitness' },
];

const stockLevels = ['good', 'low', 'critical'];

export default function EditMedication() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [originalMedication, setOriginalMedication] = useState<Medication | null>(null);
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

      setOriginalMedication(medication);

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
    if (!originalMedication) {
      Alert.alert('Error', 'Original medication data not found.');
      return;
    }

    if (!medicationName.trim() || !dosage.trim() || !medicationForm) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const updatedMedication: Medication = {
        ...originalMedication,
        name: medicationName.trim(),
        dosage: dosage.trim(),
        form: medicationForm,
        assignedMembers: assignedTo,
        stockLevel,
      };

      await DataService.updateMedication(updatedMedication);

      router.back();
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
        color={medicationForm === form.id ? theme.colors.fieldSelectedText : theme.colors.fieldDefaultText}
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
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading medication...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Medication</Text>
          <View style={{ width: 40 }} />
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
                placeholderTextColor={theme.colors.fieldDefaultPlaceholder}
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
                placeholderTextColor={theme.colors.fieldDefaultPlaceholder}
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
                      <View style={{ flex: 1 }}><Text style={styles.memberName}>{member.name}</Text></View>
                      {assignedTo && assignedTo.includes(member.id) && (
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.fieldDefault,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  selectedFormOption: {
    backgroundColor: theme.colors.fieldSelected,
    borderColor: theme.colors.fieldSelectedBorder,
  },
  formOptionText: {
    color: theme.colors.fieldDefaultText,
    marginLeft: 8,
    fontSize: 14,
  },
  selectedFormOptionText: {
    color: theme.colors.fieldSelectedText,
    fontWeight: '600',
  },
  stockGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  stockOption: {
    flex: 1,
    backgroundColor: theme.colors.fieldDefault,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  selectedStockOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 20,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
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
});