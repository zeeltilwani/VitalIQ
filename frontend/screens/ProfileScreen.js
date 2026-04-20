import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    danger: '#ef4444'
};

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();
    
    // Change Password State
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/profile');
            setUser(res.data);
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => {
                await AsyncStorage.removeItem('token');
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
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value || '—'}</Text>
        </View>
    );

    if (loading || !user) {
        return <View style={styles.loadingBox}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.name}>{user.name}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user.role || 'User'}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Identity & Location</Text>
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="DOB" value={user.dob ? new Date(user.dob).toDateString() : 'Not Set'} />
                    <InfoRow label="Location" value={user.pincode && user.city ? `${user.city}, ${user.pincode}` : 'Not Set'} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Physical Blueprint</Text>
                    <InfoRow label="Height" value={`${user.height} cm`} />
                    <InfoRow label="Weight" value={`${user.weight} kg`} />
                    <InfoRow label="Target" value={`${user.target_weight} kg`} />
                    <InfoRow label="Daily Goal" value={`${user.daily_calorie_goal} kcal`} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Security</Text>
                    {!showChangePassword ? (
                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowChangePassword(true)}>
                            <Text style={styles.secondaryBtnText}>Change Password</Text>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Current Password" 
                                placeholderTextColor={COLORS.muted}
                                secureTextEntry
                                value={oldPassword}
                                onChangeText={setOldPassword}
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="New Password" 
                                placeholderTextColor={COLORS.muted}
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Confirm Password" 
                                placeholderTextColor={COLORS.muted}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <View style={styles.pwActions}>
                                <TouchableOpacity style={[styles.miniBtn, {backgroundColor: COLORS.danger}]} onPress={() => setShowChangePassword(false)}>
                                    <Text style={styles.miniBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.miniBtn} onPress={handleChangePassword} disabled={pwLoading}>
                                    {pwLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.miniBtnText}>Update</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Secure Logout</Text>
                </TouchableOpacity>

                <Text style={styles.version}>VitalIQ v1.1.0 Build 2026</Text>
                <View style={{height: 100}} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    loadingBox: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
    inner: { padding: 25 },
    header: { alignItems: 'center', marginBottom: 30 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
    name: { fontSize: 24, fontWeight: '900', color: '#fff' },
    roleBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
    roleText: { color: COLORS.primary, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 11 },
    
    card: { backgroundColor: COLORS.card, width: '100%', padding: 25, borderRadius: 24, marginBottom: 20 },
    cardTitle: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
    rowLabel: { color: COLORS.muted, fontSize: 15 },
    rowValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
    
    input: { backgroundColor: COLORS.bg, color: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
    pwActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    miniBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginLeft: 10 },
    miniBtnText: { color: '#fff', fontWeight: 'bold' },
    secondaryBtn: { backgroundColor: 'rgba(148, 163, 184, 0.1)', padding: 15, borderRadius: 12, alignItems: 'center' },
    secondaryBtnText: { color: COLORS.muted, fontWeight: 'bold' },

    logoutBtn: { width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    logoutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16 },
    version: { color: COLORS.muted, textAlign: 'center', marginTop: 25, fontSize: 12 }
});
