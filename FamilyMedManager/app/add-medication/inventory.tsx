import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function InventoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentCount, setCurrentCount] = useState('');
  const [totalCount, setTotalCount] = useState('');

  const [refillReminder, setRefillReminder] = useState(true);

  const handleNext = () => {
    if (!currentCount || !totalCount) {
      Alert.alert('Required Fields', 'Please enter both current count and total count');
      return;
    }

    const currentNum = parseInt(currentCount);
    const totalNum = parseInt(totalCount);

    if (isNaN(currentNum) || isNaN(totalNum) || currentNum < 0 || totalNum < 0) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for counts');
      return;
    }

    if (currentNum > totalNum) {
      Alert.alert('Invalid Input', 'Current count cannot be greater than total count');
      return;
    }

    // Calculate days left (assuming 1 pill per day for demo)
    const daysLeft = currentNum;
    let stockLevel = 'good';
    if (daysLeft <= 3) stockLevel = 'critical';
    else if (daysLeft <= 10) stockLevel = 'low';

    // Pass data to next step
    const medicationData = {
      ...params,
      currentCount: currentNum,
      totalCount: totalNum,
      daysLeft,
      stockLevel,
      refillReminder: refillReminder.toString(),
    };

    router.push({
      pathname: '/add-medication/confirmation',
      params: medicationData,
    });
  };

  const adjustCount = (type: 'current' | 'total', increment: boolean) => {
    const setter = type === 'current' ? setCurrentCount : setTotalCount;
    const current = type === 'current' ? currentCount : totalCount;
    const currentNum = parseInt(current) || 0;
    const newValue = increment ? currentNum + 1 : Math.max(0, currentNum - 1);
    setter(newValue.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.gradient, styles.gradientBackground]}>
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
            <Text style={styles.stepText}>Step 3 of 4</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Inventory Tracking</Text>
          <Text style={styles.subtitle}>
            Help us track your medication supply and stock levels
          </Text>

          {/* Inventory Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Inventory</Text>

            <View style={styles.countContainer}>
              <Text style={styles.countLabel}>Current Count</Text>
              <View style={styles.countInputContainer}>
                <TouchableOpacity
                  style={styles.countButton}
                  onPress={() => adjustCount('current', false)}
                >
                  <Ionicons name="remove" size={20} color="#4A90E2" />
                </TouchableOpacity>
                <TextInput
                  style={styles.countInput}
                  value={currentCount}
                  onChangeText={setCurrentCount}
                  placeholder="0"
                  placeholderTextColor="rgb(255, 255, 255)"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.countButton}
                  onPress={() => adjustCount('current', true)}
                >
                  <Ionicons name="add" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.countContainer}>
              <Text style={styles.countLabel}>Total Count (when full)</Text>
              <View style={styles.countInputContainer}>
                <TouchableOpacity
                  style={styles.countButton}
                  onPress={() => adjustCount('total', false)}
                >
                  <Ionicons name="remove" size={20} color="#4A90E2" />
                </TouchableOpacity>
                <TextInput
                  style={styles.countInput}
                  value={totalCount}
                  onChangeText={setTotalCount}
                  placeholder="0"
                  placeholderTextColor="rgb(255, 255, 255)"
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.countButton}
                  onPress={() => adjustCount('total', true)}
                >
                  <Ionicons name="add" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            </View>
          </View>



          {/* Refill Reminder Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.reminderToggle}
              onPress={() => setRefillReminder(!refillReminder)}
            >
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>Refill Reminders</Text>
                <Text style={styles.reminderSubtitle}>
                  Get notified when medication is running low
                </Text>
              </View>
              <View style={[
                styles.toggle,
                refillReminder && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleThumb,
                  refillReminder && styles.toggleThumbActive
                ]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!currentCount || !totalCount) && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!currentCount || !totalCount}
          >
            <Text style={[
              styles.nextButtonText,
              (!currentCount || !totalCount) && styles.disabledButtonText
            ]}>
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={(!currentCount || !totalCount) ? '#999' : '#4A90E2'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  gradientBackground: {
    backgroundColor: theme.colors.primary,
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
  progressText: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.xxl,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.md,
  },
  countContainer: {
    marginBottom: theme.spacing.lg,
  },
  countLabel: {
    fontSize: theme.typography.base,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  countInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  countButton: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countInput: {
    flex: 1,
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.base,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.base,
    color: '#FFFFFF',
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: theme.typography.base,
    fontWeight: theme.typography.semibold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reminderSubtitle: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
  },
  bottomActions: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 34,
    paddingTop: theme.spacing.lg,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    color: theme.colors.primary,
  },
  disabledButtonText: {
    color: theme.colors.textTertiary,
  },
});
