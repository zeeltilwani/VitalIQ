import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, FlatList,
    ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT } from '../theme';
import api from '../api';

export default function ChatScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const flatListRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your VitalIQ health assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMsg.text });
            setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
        } catch (err) {
            console.error('Chat error:', err);
            Alert.alert("Assistant Error", "Unable to reach the AI assistant. Please try again.");
            setMessages(prev => [...prev, { role: 'bot', text: 'I\'m having trouble connecting. Please try again.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>AI Assistant</Text>
                <View style={{ width: 50 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ padding: SPACING.xl }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
                        <Text style={[styles.msgText, item.role === 'user' && { color: COLORS.textInverse }]}>{item.text}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask anything..."
                        placeholderTextColor={COLORS.textSecondary}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                        onPress={sendMessage}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <ActivityIndicator color={COLORS.textInverse} size="small" /> : <Text style={styles.sendIcon}>➤</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: FONT.bold },
    title: { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.text },

    bubble: { padding: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, maxWidth: '82%' },
    userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: RADIUS.sm },
    botBubble: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: RADIUS.sm },
    msgText: { color: COLORS.text, fontSize: FONT.md, lineHeight: 22 },

    inputArea: {
        flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.surface,
        borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center',
    },
    input: {
        flex: 1, backgroundColor: COLORS.bg, color: COLORS.text,
        borderRadius: RADIUS.pill, paddingHorizontal: SPACING.xl, height: 44, fontSize: FONT.md,
        borderWidth: 1, borderColor: COLORS.border,
    },
    sendBtn: {
        marginLeft: SPACING.sm, backgroundColor: COLORS.primary,
        width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: COLORS.surfaceLight },
    sendIcon: { fontSize: 18, color: COLORS.textInverse },
});
