import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function ChatScreen() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your VitalIQ health assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMsg.text });
            setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'System offline. Try again later.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
                <Text style={styles.title}>AI Chatbot</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
                        <Text style={styles.msgText}>{item.text}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask anything..."
                        placeholderTextColor={COLORS.muted}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendIcon}>🚀</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: 25, paddingTop: 60, backgroundColor: COLORS.bg },
    title: { fontSize: 32, fontWeight: '900', color: '#fff' },
    bubble: { padding: 15, borderRadius: 20, marginBottom: 12, maxWidth: '85%' },
    userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    msgText: { color: '#fff', fontSize: 16, lineHeight: 22 },
    inputArea: { flexDirection: 'row', padding: 15, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
    input: { flex: 1, backgroundColor: COLORS.bg, color: '#fff', borderRadius: 25, paddingHorizontal: 20, height: 50, fontSize: 16 },
    sendBtn: { marginLeft: 12, backgroundColor: COLORS.primary, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    sendIcon: { fontSize: 20 }
});
