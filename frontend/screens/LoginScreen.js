import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
    const { theme, loadTheme } = useTheme();
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
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

                    {/* Branding */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>🍃</Text>
                        <Text style={[styles.title, { color: theme.text }]}>VitalIQ</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your personal health companion</Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Sign In</Text>

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                            placeholder="you@example.com"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
                        <View style={[styles.passwordWrapper, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.passwordInput, { color: theme.text }]}
                                placeholder="Enter your password"
                                placeholderTextColor={theme.textSecondary}
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

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={[styles.link, { color: theme.textSecondary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={[styles.footerLink, { color: theme.primary }]}> Create Account</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl },

    header: { alignItems: 'center', marginBottom: SPACING.xxxl },
    logo: { fontSize: 56, marginBottom: SPACING.sm },
    title: { fontSize: FONT.hero, fontWeight: FONT.black },
    subtitle: { fontSize: FONT.md, marginTop: SPACING.xs },

    card: {
        padding: SPACING.xxl, borderRadius: RADIUS.xl,
        borderWidth: 1, ...SHADOW.md,
    },
    cardTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, marginBottom: SPACING.xl },
    inputLabel: { fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.sm },
    input: {
        padding: SPACING.lg,
        borderRadius: RADIUS.md, marginBottom: SPACING.lg, fontSize: FONT.md,
        borderWidth: 1,
    },

    passwordWrapper: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1, marginBottom: SPACING.lg,
    },
    passwordInput: {
        flex: 1, padding: SPACING.lg, fontSize: FONT.md,
    },
    eyeBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg },
    eyeIcon: { fontSize: 20 },

    btn: {
        padding: SPACING.lg, borderRadius: RADIUS.md,
        alignItems: 'center', marginTop: SPACING.sm, ...SHADOW.sm,
    },
    btnText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },
    link: { textAlign: 'center', marginTop: SPACING.xl, fontSize: FONT.sm },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xxxl },
    footerText: { fontSize: FONT.md },
    footerLink: { fontWeight: FONT.bold, fontSize: FONT.md },
});
