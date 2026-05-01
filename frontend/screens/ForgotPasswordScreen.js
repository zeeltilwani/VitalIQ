import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';

export default function ForgotPasswordScreen({ navigation }) {
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
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Text style={styles.icon}>🔐</Text>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>
                            {sent
                                ? 'A temporary password has been sent to your email.'
                                : 'Enter your email and we\'ll send you a temporary password.'}
                        </Text>
                    </View>

                    {!sent ? (
                        <View style={styles.card}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={COLORS.textSecondary}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading} activeOpacity={0.8}>
                                {loading ? (
                                    <ActivityIndicator color={COLORS.textInverse} />
                                ) : (
                                    <Text style={styles.btnText}>Send Reset Email</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.successCard}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={styles.successTitle}>Email Sent!</Text>
                            <Text style={styles.successText}>
                                Check your inbox for a temporary password. Use it to log in, then change your password in Profile settings.
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
                        <Text style={styles.backLinkText}>← Back to Sign In</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl },

    header: { alignItems: 'center', marginBottom: SPACING.xxxl },
    icon: { fontSize: 48, marginBottom: SPACING.md },
    title: { fontSize: FONT.xxl, fontWeight: FONT.black, color: COLORS.text },
    subtitle: { fontSize: FONT.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, paddingHorizontal: SPACING.xl },

    card: {
        backgroundColor: COLORS.surface, padding: SPACING.xxl, borderRadius: RADIUS.xl,
        borderWidth: 1, borderColor: COLORS.border, ...SHADOW.md,
    },
    inputLabel: { color: COLORS.textSecondary, fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.sm },
    input: {
        backgroundColor: COLORS.bg, color: COLORS.text, padding: SPACING.lg,
        borderRadius: RADIUS.md, marginBottom: SPACING.lg, fontSize: FONT.md,
        borderWidth: 1, borderColor: COLORS.border,
    },
    btn: {
        backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.md,
        alignItems: 'center', ...SHADOW.sm,
    },
    btnText: { color: COLORS.textInverse, fontSize: FONT.lg, fontWeight: FONT.bold },

    successCard: {
        backgroundColor: COLORS.primaryLight, padding: SPACING.xxl,
        borderRadius: RADIUS.xl, alignItems: 'center',
    },
    successIcon: { fontSize: 48, marginBottom: SPACING.md },
    successTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.primary, marginBottom: SPACING.sm },
    successText: { color: COLORS.text, textAlign: 'center', fontSize: FONT.md, lineHeight: 22 },

    backLink: { alignItems: 'center', marginTop: SPACING.xxxl },
    backLinkText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: FONT.semibold },
});
