import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS, FONT } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import PressableButton from '../components/PressableButton';
import { Eye, EyeOff, LogIn, Leaf } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
    const { theme, loadTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Validation', 'Please enter both email and password.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/auth/login', {
                email: email.trim(),
                password: password.trim(),
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

    const inputStyle = (focused) => [
        styles.input,
        {
            backgroundColor: theme.surface,
            color: theme.text,
            borderColor: focused ? theme.primary : theme.border,
            shadowColor: focused ? theme.primary : 'transparent',
            shadowOpacity: focused ? 0.1 : 0,
            shadowRadius: focused ? 4 : 0,
            shadowOffset: { width: 0, height: 0 },
            elevation: 2,
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

                    {/* Branding */}
                    <View style={styles.header}>
                        <Leaf size={60} color={theme.primary} style={{ marginBottom: SPACING.sm }} />
                        <Text style={[styles.title, { color: theme.text }]}>VitalIQ</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your personal health companion</Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Sign In</Text>

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                        <TextInput
                            style={inputStyle(emailFocused)}
                            placeholder="you@example.com"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                        />

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
                        <View
                            style={[
                                styles.passwordWrapper,
                                {
                                    backgroundColor: theme.surface,
                                    borderColor: passwordFocused ? theme.primary : theme.border,
                                    shadowColor: passwordFocused ? theme.primary : 'transparent',
                                    shadowOpacity: passwordFocused ? 0.1 : 0,
                                    shadowRadius: passwordFocused ? 4 : 0,
                                    shadowOffset: { width: 0, height: 0 },
                                    elevation: 2,
                                },
                            ]}
                        >
                            <TextInput
                                style={[styles.passwordInput, { color: theme.text }]}
                                placeholder="Enter your password"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="password"
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <PressableButton
                                variant="ghost"
                                icon={showPassword ? <EyeOff size={20} color={theme.textSecondary} /> : <Eye size={20} color={theme.textSecondary} />}
                                onPress={() => setShowPassword(prev => !prev)}
                                style={{ paddingHorizontal: SPACING.md }}
                            />
                        </View>

                        {/* Sign In CTA */}
                        <PressableButton
                            label="Sign In"
                            icon={<LogIn size={20} color="#fff" />}
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            size="lg"
                            style={{ marginTop: SPACING.md, width: '100%' }}
                        />

                        {/* Forgot password */}
                        <PressableButton
                            variant="ghost"
                            label="Forgot Password?"
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={{ marginTop: SPACING.md, alignSelf: 'center' }}
                            textStyle={{ color: theme.textSecondary, fontWeight: '500' }}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account?</Text>
                        <PressableButton
                            variant="ghost"
                            label="Create Account"
                            onPress={() => navigation.navigate('Signup')}
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
    inner: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxxl },

    header: { alignItems: 'center', marginBottom: SPACING.xxxl },
    logo: { fontSize: 56, marginBottom: SPACING.sm },
    title: { fontSize: FONT.hero, fontWeight: FONT.black },
    subtitle: { fontSize: FONT.md, marginTop: SPACING.xs },

    card: {
        padding: SPACING.xxl, borderRadius: RADIUS.xl,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    cardTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, marginBottom: SPACING.xl },
    inputLabel: { fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.sm },
    input: {
        padding: SPACING.lg,
        borderRadius: RADIUS.md, marginBottom: SPACING.lg, fontSize: FONT.md,
        borderWidth: 1.5,
    },
    passwordWrapper: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1.5, marginBottom: SPACING.lg,
    },
    passwordInput: {
        flex: 1, padding: SPACING.lg, fontSize: FONT.md,
    },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.xxxl },
    footerText: { fontSize: FONT.md },
});
