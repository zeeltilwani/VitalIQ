import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';

import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
    const { loadTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Validation', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/login', {
                email: email.trim(),
                password: password.trim()
            });
            const { token, user } = res.data;
            await AsyncStorage.setItem('token', token);
            await loadTheme(user.id);

            if (!user.is_onboarded) {
                navigation.replace('Onboarding', { user });
            } else {
                navigation.replace('MainApp', { screen: 'Home', params: { user } });
            }
        } catch (error) {
            const msg = error.response?.data?.error || error.message || 'Something went wrong.';
            Alert.alert('Login Failed', msg);
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
                        <Text style={styles.logo}>🍃</Text>
                        <Text style={styles.title}>VitalIQ</Text>
                        <Text style={styles.subtitle}>Your personal health companion</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Sign In</Text>

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
                                placeholder="Enter your password"
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

                        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                            {loading ? (
                                <ActivityIndicator color={COLORS.textInverse} />
                            ) : (
                                <Text style={styles.btnText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.link}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.footerLink}> Create Account</Text>
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
    logo: { fontSize: 56, marginBottom: SPACING.sm },
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
    link: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xl, fontSize: FONT.sm },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xxxl },
    footerText: { color: COLORS.textSecondary, fontSize: FONT.md },
    footerLink: { color: COLORS.primary, fontWeight: FONT.bold, fontSize: FONT.md },
});
