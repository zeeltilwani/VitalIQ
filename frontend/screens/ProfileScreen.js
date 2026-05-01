import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Alert, TextInput, ActivityIndicator, Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

// ─── BMI / BMR Calculation Helpers ───
const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
};

const getBMICategory = (bmi, theme) => {
    if (!bmi) return { label: '—', color: theme.textSecondary };
    if (bmi < 18.5) return { label: 'Underweight', color: '#f59e0b' };
    if (bmi < 25) return { label: 'Normal', color: theme.primary };
    if (bmi < 30) return { label: 'Overweight', color: '#f97316' };
    return { label: 'Obese', color: theme.danger };
};

const calculateBMR = (weightKg, heightCm, age, gender) => {
    if (!weightKg || !heightCm || !age) return null;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === 'Female' ? Math.round(base - 161) : Math.round(base + 5);
};

export default function ProfileScreen({ navigation }) {
    const { isDarkMode, toggleTheme, theme, clearThemeState } = useTheme();
    const insets = useSafeAreaInsets();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setError(false);
        setLoading(true);
        try {
            const res = await api.get('/user/profile');
            setUser(res.data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => {
                await AsyncStorage.removeItem('token');
                clearThemeState();
                navigation.replace('Login');
            }}
        ]);
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Validation', 'All fields are required.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Validation', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters.');
            return;
        }

        setPwLoading(true);
        try {
            await api.post('/auth/change-password', { oldPassword, newPassword });
            Alert.alert('Success', 'Password updated successfully!');
            setShowChangePassword(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            Alert.alert('Update Failed', err.response?.data?.error || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    const InfoRow = ({ label, value }) => (
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>{value || '—'}</Text>
        </View>
    );

    if (loading) {
        return <View style={[styles.loadingBox, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
    }

    if (error || !user) {
        return (
            <View style={[styles.loadingBox, { backgroundColor: theme.bg }]}>
                <Text style={{ color: theme.danger, fontSize: 48, marginBottom: SPACING.lg }}>⚠️</Text>
                <Text style={{ color: theme.text, fontSize: FONT.lg, fontWeight: FONT.bold, marginBottom: SPACING.sm }}>
                    Something went wrong
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: FONT.sm, textAlign: 'center', marginBottom: SPACING.xl }}>
                    Could not load your profile. Please check your connection.
                </Text>
                <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={fetchProfile}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const bmi = calculateBMI(user.weight, user.height);
    const bmiCategory = getBMICategory(bmi, theme);
    const age = user.dob ? Math.floor((Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : user.age || 25;
    const bmr = calculateBMR(user.weight, user.height, age, user.gender);

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{user.name?.charAt(0) || '?'}</Text>
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: theme.primaryLight }]}>
                        <Text style={[styles.roleText, { color: theme.primary }]}>{user.goal || 'User'}</Text>
                    </View>
                </View>

                {/* Theme Toggle Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>🌗 Appearance</Text>
                    <View style={styles.themeRow}>
                        <View>
                            <Text style={[styles.themeLabel, { color: theme.text }]}>Dark Mode</Text>
                            <Text style={[styles.themeDesc, { color: theme.textSecondary }]}>Switch between dark and light themes</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#cbd5e1', true: theme.primary }}
                            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Health Analytics Card */}
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Analytics', { user })}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                        <Text style={[styles.cardTitle, { color: theme.primary }]}>📊 Health Analytics</Text>
                        <Text style={{ color: theme.primary, fontSize: FONT.xs, fontWeight: FONT.bold }}>View Full →</Text>
                    </View>

                    <View style={styles.analyticsRow}>
                        <View style={styles.analyticsItem}>
                            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>BMI</Text>
                            <Text style={[styles.analyticsValue, { color: theme.text }]}>
                                {bmi ? bmi.toFixed(1) : '—'}
                            </Text>
                            <View style={[styles.categoryBadge, { backgroundColor: bmiCategory.color + '20' }]}>
                                <Text style={[styles.categoryText, { color: bmiCategory.color }]}>
                                    {bmiCategory.label}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.analyticsDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.analyticsItem}>
                            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>BMR</Text>
                            <Text style={[styles.analyticsValue, { color: theme.text }]}>
                                {bmr || '—'}
                            </Text>
                            <Text style={[styles.analyticsUnit, { color: theme.textSecondary }]}>kcal/day</Text>
                        </View>
                        <View style={[styles.analyticsDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.analyticsItem}>
                            <Text style={[styles.analyticsLabel, { color: theme.textSecondary }]}>Goal</Text>
                            <Text style={[styles.analyticsValue, { color: theme.text }]}>
                                {user.daily_calorie_goal || '—'}
                            </Text>
                            <Text style={[styles.analyticsUnit, { color: theme.textSecondary }]}>kcal/day</Text>
                        </View>
                    </View>

                    {bmi && (
                        <View style={styles.bmiScaleBox}>
                            <Text style={[styles.bmiScaleLabel, { color: theme.textSecondary }]}>BMI Scale</Text>
                            <View style={styles.bmiScale}>
                                <View style={[styles.bmiSegment, { flex: 18.5, backgroundColor: '#f59e0b' }]} />
                                <View style={[styles.bmiSegment, { flex: 6.5, backgroundColor: theme.primary }]} />
                                <View style={[styles.bmiSegment, { flex: 5, backgroundColor: '#f97316' }]} />
                                <View style={[styles.bmiSegment, { flex: 10, backgroundColor: theme.danger }]} />
                            </View>
                            <View style={styles.bmiLabels}>
                                <Text style={[styles.bmiLabelText, { color: theme.textSecondary }]}>Under</Text>
                                <Text style={[styles.bmiLabelText, { color: theme.textSecondary }]}>Normal</Text>
                                <Text style={[styles.bmiLabelText, { color: theme.textSecondary }]}>Over</Text>
                                <Text style={[styles.bmiLabelText, { color: theme.textSecondary }]}>Obese</Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Identity Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Identity & Location</Text>
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="DOB" value={user.dob ? new Date(user.dob).toDateString() : 'Not Set'} />
                    <InfoRow label="Location" value={user.pincode && user.city ? `${user.city}, ${user.pincode}` : 'Not Set'} />
                </View>

                {/* Physical Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Physical Blueprint</Text>
                    <InfoRow label="Height" value={user.height ? `${user.height} cm` : '—'} />
                    <InfoRow label="Weight" value={user.weight ? `${user.weight} kg` : '—'} />
                    <InfoRow label="Target" value={user.target_weight ? `${user.target_weight} kg` : '—'} />
                    <InfoRow label="Daily Goal" value={user.daily_calorie_goal ? `${user.daily_calorie_goal} kcal` : '—'} />
                </View>

                {/* Security Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Security</Text>
                    {!showChangePassword ? (
                        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: theme.surfaceLight }]} onPress={() => setShowChangePassword(true)}>
                            <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>Change Password</Text>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                                placeholder="Current Password"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                                value={oldPassword}
                                onChangeText={setOldPassword}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                                placeholder="New Password"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                                placeholder="Confirm Password"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <View style={styles.pwActions}>
                                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: theme.danger }]} onPress={() => setShowChangePassword(false)}>
                                    <Text style={styles.miniBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: theme.primary }]} onPress={handleChangePassword} disabled={pwLoading}>
                                    {pwLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.miniBtnText}>Update</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.isDarkMode ? '#ef444420' : '#fee2e2', borderColor: '#ef444440' }]} onPress={handleLogout}>
                    <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: theme.textSecondary }]}>VitalIQ v2.2.0</Text>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
    inner: { padding: SPACING.xxl },

    retryBtn: { paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
    retryText: { color: '#fff', fontWeight: FONT.bold, fontSize: FONT.md },

    header: { alignItems: 'center', marginBottom: SPACING.xxl },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
    avatarText: { fontSize: 32, fontWeight: FONT.bold, color: '#fff' },
    name: { fontSize: FONT.xxl, fontWeight: FONT.black },
    roleBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill, marginTop: SPACING.sm },
    roleText: { fontWeight: FONT.bold, textTransform: 'uppercase', fontSize: FONT.xs },

    themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    themeLabel: { fontSize: FONT.md, fontWeight: FONT.bold },
    themeDesc: { fontSize: FONT.xs, marginTop: 2 },

    analyticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    analyticsItem: { flex: 1, alignItems: 'center' },
    analyticsDivider: { height: 40, width: 1 },
    analyticsLabel: { fontSize: FONT.xs, fontWeight: FONT.medium, marginBottom: SPACING.xs },
    analyticsValue: { fontSize: FONT.xxl, fontWeight: FONT.black },
    analyticsUnit: { fontSize: FONT.xs, marginTop: SPACING.xs },
    categoryBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, marginTop: SPACING.xs },
    categoryText: { fontSize: FONT.xs, fontWeight: FONT.bold },

    bmiScaleBox: { marginTop: SPACING.sm },
    bmiScaleLabel: { fontSize: FONT.xs, marginBottom: SPACING.sm },
    bmiScale: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
    bmiSegment: { height: '100%' },
    bmiLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
    bmiLabelText: { fontSize: 10 },

    card: { width: '100%', padding: SPACING.xl, borderRadius: RADIUS.xl, marginBottom: SPACING.lg, borderWidth: 1 },
    cardTitle: { fontSize: FONT.sm, fontWeight: FONT.bold, marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1 },
    rowLabel: { fontSize: FONT.md },
    rowValue: { fontSize: FONT.md, fontWeight: FONT.semibold },

    input: { padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1 },
    pwActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.sm },
    miniBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, marginLeft: SPACING.sm },
    miniBtnText: { color: '#fff', fontWeight: FONT.bold },
    secondaryBtn: { padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
    secondaryBtnText: { fontWeight: FONT.bold },

    logoutBtn: { width: '100%', padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: SPACING.sm, borderWidth: 1 },
    logoutText: { fontWeight: FONT.bold, fontSize: FONT.md },
    version: { textAlign: 'center', marginTop: SPACING.xl, fontSize: FONT.xs },
});
