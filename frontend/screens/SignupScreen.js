import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Validation', 'Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Validation', 'Password must be at least 6 characters.');
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
            Alert.alert('Registration Error', error.response?.data?.error || 'Server unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>🌱</Text>
                        <Text style={styles.title}>Join VitalIQ</Text>
                        <Text style={styles.subtitle}>Start your personalized health journey.</Text>
                    </View>

                    <View style={styles.card}>
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={COLORS.muted}
                            value={name}
                            onChangeText={setName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={COLORS.muted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={COLORS.muted}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Existing member?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.signupLink}> Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { flexGrow: 1, justifyContent: 'center', padding: 30 },
    header: { alignItems: 'center', marginBottom: 30 },
    logo: { fontSize: 50, marginBottom: 10 },
    title: { fontSize: 32, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 16, color: COLORS.muted, textAlign: 'center' },
    card: { backgroundColor: COLORS.card, padding: 25, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    input: { backgroundColor: COLORS.bg, color: '#fff', padding: 18, borderRadius: 16, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
    btn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: COLORS.muted, fontSize: 15 },
    signupLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 }
});
