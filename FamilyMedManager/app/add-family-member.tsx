import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DataService } from '../services/newDataService';
import { FamilyMember } from '../types/medication';

export default function AddFamilyMemberScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<'adult' | 'child'>('adult');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setIsLoading(true);
    try {
      // Create new family member
      const newMember: FamilyMember = {
        id: Date.now().toString(), // Simple ID generation
        name: name.trim(),
        type: selectedType,
        color: selectedType === 'adult' ? '#4A90E2' : '#F5A623', // Blue for adults, orange for children
      };

      // Add family member to database
      await DataService.addFamilyMember(newMember);

      Alert.alert(
        'Success',
        `${name} has been added as a family member!`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add family member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Member</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter family member's name"
                placeholderTextColor={theme.colors.fieldDefaultPlaceholder}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Type Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'adult' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType('adult')}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={selectedType === 'adult' ? theme.colors.fieldSelectedText : theme.colors.primary}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'adult' && styles.typeButtonTextSelected,
                  ]}>
                    Adult
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'child' && styles.typeButtonSelected,
                  ]}
                  onPress={() => setSelectedType('child')}
                >
                  <Ionicons
                    name="happy"
                    size={20}
                    color={selectedType === 'child' ? theme.colors.fieldSelectedText : theme.colors.warning}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'child' && styles.typeButtonTextSelected,
                  ]}>
                    Child
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                Adults can manage their own medications and take doses.
                Children's medications require adult supervision.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Adding...</Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                <Text style={styles.saveButtonText}>Add Family Member</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.xl,
    fontWeight: theme.typography.semibold,
    color: theme.colors.sectionTextPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  form: {
    paddingTop: theme.spacing.xl,
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: theme.colors.sectionTextPrimary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.typography.base,
    color: theme.colors.fieldDefaultText,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.fieldDefault,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.fieldDefaultBorder,
  },
  typeButtonSelected: {
    backgroundColor: theme.colors.fieldSelected,
    borderColor: theme.colors.fieldSelectedBorder,
  },
  typeButtonText: {
    fontSize: theme.typography.sm,
    fontWeight: theme.typography.medium,
    color: theme.colors.fieldDefaultText,
    marginLeft: theme.spacing.sm,
  },
  typeButtonTextSelected: {
    color: theme.colors.fieldSelectedText,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginLeft: theme.spacing.md,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: 'transparent',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.sectionTextPrimary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    marginLeft: theme.spacing.sm,
  },
});
