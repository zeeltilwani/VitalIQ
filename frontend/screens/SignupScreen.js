import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Validation', 'Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters.');
            return;
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Validation', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/signup', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password.trim()
            });
            const { token, user } = res.data;
            await AsyncStorage.setItem('token', token);
            navigation.replace('Onboarding', { user });
        } catch (error) {
            const msg = error.response?.data?.error || error.message || 'Server unreachable.';
            Alert.alert('Registration Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

                    {/* Branding */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>🌱</Text>
                        <Text style={styles.title}>Join VitalIQ</Text>
                        <Text style={styles.subtitle}>Start your personalized health journey</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Create Account</Text>

                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor={COLORS.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={COLORS.textSecondary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={COLORS.textSecondary}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowPassword(prev => !prev)}
                            >
                                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator color={COLORS.textInverse} />
                            ) : (
                                <Text style={styles.btnText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}> Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl },

    header: { alignItems: 'center', marginBottom: SPACING.xxxl },
    logo: { fontSize: 50, marginBottom: SPACING.sm },
    title: { fontSize: FONT.hero, fontWeight: FONT.black, color: COLORS.text },
    subtitle: { fontSize: FONT.md, color: COLORS.textSecondary, marginTop: SPACING.xs },

    card: {
        backgroundColor: COLORS.surface, padding: SPACING.xxl, borderRadius: RADIUS.xl,
        borderWidth: 1, borderColor: COLORS.border, ...SHADOW.md,
    },
    cardTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.text, marginBottom: SPACING.xl },
    inputLabel: { color: COLORS.textSecondary, fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.sm },
    input: {
        backgroundColor: COLORS.bg, color: COLORS.text, padding: SPACING.lg,
        borderRadius: RADIUS.md, marginBottom: SPACING.lg, fontSize: FONT.md,
        borderWidth: 1, borderColor: COLORS.border,
    },

    // Password field with eye icon
    passwordWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.bg, borderRadius: RADIUS.md,
        borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
    },
    passwordInput: {
        flex: 1, color: COLORS.text, padding: SPACING.lg, fontSize: FONT.md,
    },
    eyeBtn: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg,
    },
    eyeIcon: { fontSize: 20 },

    btn: {
        backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.md,
        alignItems: 'center', marginTop: SPACING.sm, ...SHADOW.sm,
    },
    btnText: { color: COLORS.textInverse, fontSize: FONT.lg, fontWeight: FONT.bold },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xxxl },
    footerText: { color: COLORS.textSecondary, fontSize: FONT.md },
    footerLink: { color: COLORS.primary, fontWeight: FONT.bold, fontSize: FONT.md },
});
