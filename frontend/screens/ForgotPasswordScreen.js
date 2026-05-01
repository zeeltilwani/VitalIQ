import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert('Validation', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: email.trim() });
            setSent(true);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Text style={styles.icon}>🔐</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            {sent
                                ? 'A temporary password has been sent to your email.'
                                : 'Enter your email and we\'ll send you a temporary password.'}
                        </Text>
                    </View>

                    {!sent ? (
                        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email Address</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                                placeholder="you@example.com"
                                placeholderTextColor={theme.textSecondary}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <TouchableOpacity 
                                style={[styles.btn, { backgroundColor: theme.primary }]} 
                                onPress={handleReset} 
                                disabled={loading} 
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Send Reset Email</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.successCard, { backgroundColor: theme.primaryLight }]}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={[styles.successTitle, { color: theme.primary }]}>Email Sent!</Text>
                            <Text style={[styles.successText, { color: theme.text }]}>
                                Check your inbox for a temporary password. Use it to log in, then change your password in Profile settings.
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
                        <Text style={[styles.backLinkText, { color: theme.primary }]}>← Back to Sign In</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl },

    header: { alignItems: 'center', marginBottom: SPACING.xxxl },
    icon: { fontSize: 48, marginBottom: SPACING.md },
    title: { fontSize: FONT.xxl, fontWeight: FONT.black },
    subtitle: { fontSize: FONT.md, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.xl },

    card: {
        padding: SPACING.xxl, borderRadius: RADIUS.xl,
        borderWidth: 1, ...SHADOW.md,
    },
    inputLabel: { fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.sm },
    input: {
        padding: SPACING.lg,
        borderRadius: RADIUS.md, marginBottom: SPACING.lg, fontSize: FONT.md,
        borderWidth: 1,
    },
    btn: {
        padding: SPACING.lg, borderRadius: RADIUS.md,
        alignItems: 'center', ...SHADOW.sm,
    },
    btnText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },

    successCard: {
        padding: SPACING.xxl,
        borderRadius: RADIUS.xl, alignItems: 'center',
    },
    successIcon: { fontSize: 48, marginBottom: SPACING.md },
    successTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, marginBottom: SPACING.sm },
    successText: { textAlign: 'center', fontSize: FONT.md, lineHeight: 22 },

    backLink: { alignItems: 'center', marginTop: SPACING.xxxl },
    backLinkText: { fontSize: FONT.md, fontWeight: FONT.semibold },
});
