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
import { DataService } from '../services/dataService';
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <View style={[styles.gradient, styles.gradientBackground]}>
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
                placeholderTextColor="#999"
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
                    color={selectedType === 'adult' ? 'white' : '#4A90E2'}
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
                    name="lock-closed"
                    size={20}
                    color={selectedType === 'child' ? 'white' : '#F5A623'}
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
              <Ionicons name="information-circle" size={20} color="#4A90E2" />
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
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>Add Family Member</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  gradient: {
    flex: 1,
  },
  gradientBackground: {
    backgroundColor: '#4A90E2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
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
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A90E2',
    lineHeight: 20,
    marginLeft: 12,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
