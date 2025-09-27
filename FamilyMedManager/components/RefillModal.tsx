import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface RefillModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (newCount: number) => void;
  medicationName: string;
  currentCount: number;
  loading?: boolean;
}

export default function RefillModal({
  visible,
  onClose,
  onConfirm,
  medicationName,
  currentCount,
  loading = false,
}: RefillModalProps) {
  const [newCount, setNewCount] = useState('');

  const handleConfirm = () => {
    const count = parseInt(newCount.trim());
    
    if (isNaN(count) || count < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number (0 or greater).');
      return;
    }

    if (count < currentCount) {
      Alert.alert(
        'Confirm Refill',
        `The new count (${count}) is less than current count (${currentCount}). Are you sure this is correct?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: () => onConfirm(count) },
        ]
      );
    } else {
      onConfirm(count);
    }
  };

  const handleClose = () => {
    setNewCount('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="medical" size={24} color="#FFFFFF" />
              <Text style={styles.title}>Refill Medication</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.medicationName}>{medicationName}</Text>
              <Text style={styles.currentCountText}>
                Current count: {currentCount} doses
              </Text>

              <View style={styles.inputSection}>
                <Text style={styles.label}>New Count *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCount}
                  onChangeText={setNewCount}
                  placeholder="Enter new count"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                  autoFocus={true}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton, loading && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={loading || !newCount.trim()}
              >
                {loading ? (
                  <Text style={styles.confirmButtonText}>Updating...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    backdropFilter: 'blur(10px)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  content: {
    marginBottom: 24,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentCountText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 6,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
