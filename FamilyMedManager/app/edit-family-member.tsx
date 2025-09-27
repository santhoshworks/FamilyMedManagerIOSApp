import GradientBackground from '@/components/ui/GradientBackground';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function EditFamilyMemberScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState<'adult' | 'child'>('adult');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMember();
    }, [id]);

    const loadMember = async () => {
        try {
            const members = await DataService.getFamilyMembers();
            const member = members.find(m => m.id === id);
            if (!member) {
                Alert.alert('Error', 'Family member not found');
                router.back();
                return;
            }
            setName(member.name || '');
            setSelectedType(member.type || 'adult');
        } catch (error) {
            console.error('Error loading member:', error);
            Alert.alert('Error', 'Failed to load family member');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }

        setIsLoading(true);
        try {
            const members = await DataService.getFamilyMembers();
            const original = members.find(m => m.id === id);
            if (!original) {
                Alert.alert('Error', 'Original member not found');
                return;
            }

            const updatedMember: FamilyMember = {
                ...original,
                name: name.trim(),
                type: selectedType,
                color: selectedType === 'adult' ? '#4A90E2' : '#F5A623',
            };

            await DataService.updateFamilyMember(updatedMember);

            Alert.alert('Success', `${updatedMember.name} updated`, [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error) {
            console.error('Error updating member:', error);
            Alert.alert('Error', 'Failed to update family member');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
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
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Member</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
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

                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[styles.typeButton, selectedType === 'adult' && styles.typeButtonSelected]}
                                    onPress={() => setSelectedType('adult')}
                                >
                                    <Ionicons name="person" size={20} color={selectedType === 'adult' ? theme.colors.fieldSelectedText : theme.colors.primary} />
                                    <Text style={[styles.typeButtonText, selectedType === 'adult' && styles.typeButtonTextSelected]}>Adult</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.typeButton, selectedType === 'child' && styles.typeButtonSelected]}
                                    onPress={() => setSelectedType('child')}
                                >
                                    <Ionicons name="happy" size={20} color={selectedType === 'child' ? theme.colors.fieldSelectedText : theme.colors.warning} />
                                    <Text style={[styles.typeButtonText, selectedType === 'child' && styles.typeButtonTextSelected]}>Child</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} onPress={handleSave} disabled={isLoading}>
                        <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                        <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#FFFFFF', fontSize: 18 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, paddingTop: theme.spacing.xl },
    backButton: { padding: theme.spacing.sm },
    headerTitle: { fontSize: theme.typography.xl, fontWeight: theme.typography.semibold as any, color: theme.colors.sectionTextPrimary },
    placeholder: { width: 40 },
    content: { flex: 1, paddingHorizontal: theme.spacing.lg },
    form: { paddingTop: theme.spacing.xl },
    inputSection: { marginBottom: theme.spacing.lg },
    label: { fontSize: theme.typography.base, fontWeight: theme.typography.semibold as any, color: theme.colors.sectionTextPrimary, marginBottom: theme.spacing.sm },
    textInput: { backgroundColor: theme.colors.fieldDefault, borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: theme.typography.base, color: theme.colors.fieldDefaultText, borderWidth: 1, borderColor: theme.colors.fieldDefaultBorder },
    typeContainer: { flexDirection: 'row', gap: theme.spacing.sm },
    typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.fieldDefault, borderRadius: theme.borderRadius.md, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.colors.fieldDefaultBorder },
    typeButtonSelected: { backgroundColor: theme.colors.fieldSelected, borderColor: theme.colors.fieldSelectedBorder },
    typeButtonText: { fontSize: theme.typography.sm, fontWeight: theme.typography.medium as any, color: theme.colors.fieldDefaultText, marginLeft: theme.spacing.sm },
    typeButtonTextSelected: { color: theme.colors.fieldSelectedText },
    bottomContainer: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing.md, ...theme.shadows.md },
    saveButtonDisabled: { backgroundColor: theme.colors.border },
    saveButtonText: { color: theme.colors.primary, fontSize: theme.typography.base, fontWeight: theme.typography.semibold as any, marginLeft: theme.spacing.sm },
});
