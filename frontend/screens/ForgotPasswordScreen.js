import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert('Validation', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email: email.trim() });
            Alert.alert(
                'Email Sent',
                'A temporary password has been sent to your email. Use it to log in and change your password in your profile.',
                [{ text: 'OK', onPress: () => navigation.replace('Login') }]
            );
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
                <Text style={styles.logo}>🔑</Text>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>Enter your email to receive a temporary password.</Text>
                
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor={COLORS.muted}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    
                    <TouchableOpacity style={styles.btn} onPress={handleReset} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Request Reset</Text>}
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                        <Text style={styles.link}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { flex: 1, justifyContent: 'center', padding: 30, alignItems: 'center' },
    logo: { fontSize: 50, marginBottom: 10 },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 16, color: COLORS.muted, textAlign: 'center', marginBottom: 30 },
    card: { backgroundColor: COLORS.card, padding: 25, borderRadius: 24, width: '100%', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
    input: { backgroundColor: COLORS.bg, color: '#fff', padding: 18, borderRadius: 16, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
    btn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { color: COLORS.muted, textAlign: 'center' }
});
