import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function BasicInfoScreen() {
  const router = useRouter();
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [medicationForm, setMedicationForm] = useState('');

  const medicationForms = [
    { id: 'tablet', label: 'Tablet', icon: 'medical-outline' },
    { id: 'capsule', label: 'Capsule', icon: 'ellipse-outline' },
    { id: 'liquid', label: 'Liquid', icon: 'water-outline' },
    { id: 'injection', label: 'Injection', icon: 'medical-outline' },
    { id: 'cream', label: 'Cream', icon: 'hand-left-outline' },
    { id: 'inhaler', label: 'Inhaler', icon: 'fitness-outline' },
  ];

  const handleNext = () => {
    if (!medicationName.trim()) {
      Alert.alert('Required Field', 'Please enter the medication name');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Required Field', 'Please enter the dosage');
      return;
    }
    if (!medicationForm) {
      Alert.alert('Required Field', 'Please select the medication form');
      return;
    }

    // Pass data to next step
    const medicationData = {
      medicationName,
      dosage,
      medicationForm,
    };

    router.push({
      pathname: '/add-medication/assignment',
      params: medicationData,
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
            <Text style={styles.stepText}>Step 1 of 4</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          {/* <View style={styles.iconContainer}>
            <Ionicons name="medical" size={48} color="#FFFFFF" />
          </View> */}

          <Text style={styles.title}>Tell us about your medication</Text>
          {/* <Text style={styles.subtitle}>
            We'll need some basic information to get started
          </Text> */}

          {/* Form */}
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
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next: Assign to Family</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: 50,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: theme.typography.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.xxl,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    flex: 1,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.base,
    color: theme.colors.fieldDefaultText,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  formOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
    minWidth: '45%',
  },
  selectedFormOption: {
    backgroundColor: theme.colors.fieldSelected,
    borderColor: theme.colors.fieldSelectedBorder,
  },
  formOptionText: {
    fontSize: theme.typography.sm,
    color: theme.colors.fieldDefaultText,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.medium,
  },
  selectedFormOptionText: {
    color: theme.colors.fieldSelectedText,
    fontWeight: theme.typography.semibold,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.lg,
  },
  nextButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    marginRight: theme.spacing.sm,
  },
});
