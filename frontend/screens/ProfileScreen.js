import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Alert, TextInput, ActivityIndicator, Switch, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { useTheme } from '../context/ThemeContext';
import api, { API_URL } from '../api';
import PressableButton from '../components/PressableButton';

// ─── BMI / BMR Calculation Helpers ───
const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
};

const getBMICategory = (bmi, theme) => {
    if (!bmi) return { label: '—', color: theme.textSecondary };
    if (bmi < 18.5) return { label: 'Underweight', color: theme.accent };
    if (bmi < 25) return { label: 'Normal', color: theme.primary };
    if (bmi < 30) return { label: 'Overweight', color: theme.accent };
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
    const [uploading, setUploading] = useState(false);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
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
            setEditedName(res.data.name);
        } catch (err) {
            console.error('Failed to fetch profile', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!editedName.trim()) {
            Alert.alert('Validation', 'Name cannot be empty.');
            return;
        }
        try {
            await api.put('/user/profile', { name: editedName.trim() });
            setUser(prev => ({ ...prev, name: editedName.trim() }));
            setIsEditingName(false);
            // Alert.alert('Success', 'Name updated!');
        } catch (err) {
            Alert.alert('Error', 'Failed to update name.');
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your avatar.');
            return;
        }

        Alert.alert(
            'Change Profile Picture',
            'Select an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Gallery', onPress: chooseFromGallery },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const chooseFromGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('avatar', { uri, name: filename, type });

            const res = await api.post('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUser(prev => ({ ...prev, profile_picture_url: res.data.imageUrl }));
            Alert.alert('Success', 'Profile picture updated!');
        } catch (err) {
            console.error('Upload error', err);
            Alert.alert('Error', 'Failed to upload image.');
        } finally {
            setUploading(false);
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
                <PressableButton variant="primary" label="Try Again" onPress={fetchProfile} />
            </View>
        );
    }

    const bmi = calculateBMI(user.weight, user.height);
    const bmiCategory = getBMICategory(bmi, theme);
    const age = user.dob ? Math.floor((Date.now() - new Date(user.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : user.age || 25;
    const bmr = calculateBMR(user.weight, user.height, age, user.gender);
    const avatarSource = user.profile_picture_url 
        ? { uri: API_URL.replace('/api', '') + user.profile_picture_url } 
        : null;

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickImage} disabled={uploading}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary, borderColor: theme.border, borderWidth: 2 }]}>
                            {uploading ? (
                                <ActivityIndicator color={theme.textInverse} />
                            ) : avatarSource ? (
                                <Image source={avatarSource} style={styles.avatarImage} />
                            ) : (
                                <Text style={[styles.avatarText, { color: theme.textInverse }]}>{user.name?.charAt(0) || '?'}</Text>
                            )}
                            <View style={[styles.cameraBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Text style={{ fontSize: 10 }}>📷</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    
                    {isEditingName ? (
                        <View style={styles.editNameRow}>
                            <TextInput
                                style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.primary }]}
                                value={editedName}
                                onChangeText={setEditedName}
                                autoFocus
                                placeholder="Enter name"
                                placeholderTextColor={theme.textSecondary}
                            />
                            <TouchableOpacity style={styles.editIconBtn} onPress={handleUpdateName}>
                                <Text style={{ fontSize: 18 }}>✅</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editIconBtn} onPress={() => setIsEditingName(false)}>
                                <Text style={{ fontSize: 18 }}>❌</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={() => setIsEditingName(true)} 
                            style={styles.nameRow}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                            <View style={[styles.editBadge, { backgroundColor: theme.surfaceLight }]}>
                                <Text style={{ fontSize: 10 }}>✏️</Text>
                            </View>
                        </TouchableOpacity>
                    )}
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
                            trackColor={{ false: theme.border, true: theme.primary }}
                            thumbColor={theme.textInverse}
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
                </TouchableOpacity>

                {/* Identity Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Identity & Location</Text>
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="DOB" value={user.dob ? new Date(user.dob).toDateString() : 'Not Set'} />
                    <InfoRow label="Location" value={user.pincode && user.city ? `${user.city}, ${user.pincode}` : 'Not Set'} />
                </View>

                {/* Security Card */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Security</Text>
                    {!showChangePassword ? (
                        <PressableButton 
                            variant="secondary" 
                            label="Change Password" 
                            onPress={() => setShowChangePassword(true)} 
                        />
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
                                    <Text style={[styles.miniBtnText, { color: theme.textInverse }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.miniBtn, { backgroundColor: theme.primary }]} onPress={handleChangePassword} disabled={pwLoading}>
                                    {pwLoading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.miniBtnText, { color: theme.textInverse }]}>Update</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Logout */}
                <PressableButton 
                    variant="danger" 
                    label="Sign Out" 
                    onPress={handleLogout} 
                    style={{ marginTop: SPACING.md }}
                />

                <Text style={[styles.version, { color: theme.textSecondary }]}>VitalIQ v2.5.0</Text>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
    inner: { padding: SPACING.xxl },
    header: { alignItems: 'center', marginBottom: SPACING.xxl },
    avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, overflow: 'visible' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
    avatarText: { fontSize: 40, fontWeight: '900' },
    cameraBadge: { 
        position: 'absolute', bottom: 0, right: 0, 
        width: 32, height: 32, borderRadius: 16, 
        borderWidth: 2, justifyContent: 'center', alignItems: 'center',
        ...SHADOW.sm 
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: FONT.xxl, fontWeight: '900' },
    editBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    editNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    nameInput: { fontSize: FONT.xxl, fontWeight: '900', borderBottomWidth: 2, minWidth: 150, textAlign: 'center', paddingVertical: 0 },
    editIconBtn: { padding: 5 },
    roleBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill, marginTop: SPACING.sm },
    roleText: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: FONT.xs },
    themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    themeLabel: { fontSize: FONT.md, fontWeight: 'bold' },
    themeDesc: { fontSize: FONT.xs, marginTop: 2 },
    analyticsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    analyticsItem: { flex: 1, alignItems: 'center' },
    analyticsDivider: { height: 40, width: 1 },
    analyticsLabel: { fontSize: FONT.xs, fontWeight: 'bold', marginBottom: SPACING.xs },
    analyticsValue: { fontSize: FONT.xxl, fontWeight: '900' },
    analyticsUnit: { fontSize: 10, marginTop: 2 },
    categoryBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm, marginTop: SPACING.xs },
    categoryText: { fontSize: 10, fontWeight: 'bold' },
    card: { width: '100%', padding: SPACING.xl, borderRadius: RADIUS.xl, marginBottom: SPACING.lg, borderWidth: 1, ...SHADOW.sm },
    cardTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 1.5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1 },
    rowLabel: { fontSize: FONT.md, fontWeight: '500' },
    rowValue: { fontSize: FONT.md, fontWeight: 'bold' },
    input: { padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1 },
    pwActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.sm },
    miniBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, marginLeft: SPACING.sm },
    miniBtnText: { fontWeight: 'bold' },
    version: { textAlign: 'center', marginTop: SPACING.xl, fontSize: FONT.xs },
});
