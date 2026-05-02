import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW, COLORS } from '../theme';
import api from '../api';
import PressableButton from '../components/PressableButton';
import { Eye, EyeOff, UserPlus, Sprout } from 'lucide-react-native';

export default function SignupScreen({ navigation }) {
    const { theme } = useTheme();
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
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

                    {/* Branding */}
                    <View style={styles.header}>
                        <Sprout size={60} color={theme.primary} style={{ marginBottom: SPACING.sm }} />
                        <Text style={[styles.title, { color: theme.text }]}>Join VitalIQ</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Start your personalized health journey</Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Create Account</Text>

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                            placeholder="John Doe"
                            placeholderTextColor={theme.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />

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

                        <View style={[styles.passwordWrapper, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.passwordInput, { color: theme.text }]}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="oneTimeCode"
                                value={password}
                                onChangeText={setPassword}
                            />
                            <PressableButton
                                variant="ghost"
                                icon={showPassword ? <EyeOff size={20} color={theme.textSecondary} /> : <Eye size={20} color={theme.textSecondary} />}
                                onPress={() => setShowPassword(prev => !prev)}
                                style={{ paddingHorizontal: SPACING.md }}
                            />
                        </View>

                        <PressableButton
                            label="Create Account"
                            icon={<UserPlus size={20} color="#fff" />}
                            onPress={handleSignup}
                            loading={loading}
                            disabled={loading}
                            size="lg"
                            style={{ marginTop: SPACING.md, width: '100%' }}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account?</Text>
                        <PressableButton
                            variant="ghost"
                            label="Sign In"
                            onPress={() => navigation.navigate('Login')}
                            style={{ marginLeft: 4 }}
                        />
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
    logo: { fontSize: 50, marginBottom: SPACING.sm },
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
    passwordInput: { flex: 1, padding: SPACING.lg, fontSize: FONT.md },
    eyeBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.lg },
    eyeIcon: { fontSize: 20 },

    btn: {
        padding: SPACING.lg, borderRadius: RADIUS.md,
        alignItems: 'center', marginTop: SPACING.sm, ...SHADOW.sm,
    },
    btnText: { fontSize: FONT.lg, fontWeight: FONT.bold },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xxxl },
    footerText: { fontSize: FONT.md },
    footerLink: { fontWeight: FONT.bold, fontSize: FONT.md },
});
