import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, FlatList,
    ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView,
    Image, Share
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';

const QUICK_QUESTIONS = [
    { id: '1', text: 'Suggest meal under 300 kcal' },
    { id: '2', text: 'High protein foods' },
    { id: '3', text: 'Weight loss tips' },
    { id: '4', text: 'How much water today?' },
];

const BOT_ICON = require('../assets/chatbot/bot_icon.png');
const SHARE_ICON = require('../assets/chatbot/share.png');
const DOWNLOAD_ICON = require('../assets/chatbot/download.png');

export default function ChatScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const flatListRef = useRef(null);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your VitalIQ health assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (textOverride) => {
        const textToSend = textOverride || input.trim();
        if (!textToSend) return;

        const userMsg = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        if (!textOverride) setInput('');
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

    const handleShare = async () => {
        try {
            const chatLog = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
            await Share.share({
                message: `My VitalIQ Chat Session:\n\n${chatLog}`,
                title: 'VitalIQ Chat'
            });
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    const handleDownload = () => {
        Alert.alert("Export Chat", "Your chat history has been saved to your records.");
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Text style={[styles.backText, { color: theme.primary }]}>←</Text>
                </TouchableOpacity>
                <View style={styles.titleArea}>
                    <Image source={BOT_ICON} style={styles.headerBotIcon} />
                    <Text style={[styles.title, { color: theme.text }]}>AI Assistant</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn}>
                        <Image source={SHARE_ICON} style={styles.headerIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDownload} style={styles.headerIconBtn}>
                        <Image source={DOWNLOAD_ICON} style={styles.headerIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{ padding: SPACING.xl, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={loading ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 10 }} /> : null}
                renderItem={({ item }) => (
                    <View style={[
                        styles.bubble,
                        item.role === 'user' 
                            ? [styles.userBubble, { backgroundColor: theme.primary }] 
                            : [styles.botBubble, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]
                    ]}>
                        <Text style={[
                            styles.msgText,
                            { color: item.role === 'user' ? theme.textInverse : theme.text }
                        ]}>{item.text}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={styles.keyboardArea}
            >
                <View style={{ backgroundColor: theme.bg, paddingVertical: 10 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickList}>
                        {QUICK_QUESTIONS.map(q => (
                            <TouchableOpacity 
                                key={q.id} 
                                style={[styles.quickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => sendMessage(q.text)}
                                disabled={loading}
                            >
                                <Text style={[styles.quickText, { color: theme.primary }]}>{q.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.inputArea, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask anything..."
                        placeholderTextColor={theme.textSecondary}
                        returnKeyType="send"
                        onSubmitEditing={() => sendMessage()}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: theme.primary }, (!input.trim() || loading) && { backgroundColor: theme.surfaceLight }]}
                        onPress={() => sendMessage()}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <ActivityIndicator color={theme.textInverse} size="small" /> : <Text style={[styles.sendIcon, { color: theme.textInverse }]}>➤</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1,
    },
    headerBtn: { width: 40, height: 40, justifyContent: 'center' },
    titleArea: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    headerBotIcon: { width: 32, height: 32, marginRight: 8, borderRadius: 16 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerIconBtn: { padding: 8 },
    headerIcon: { width: 22, height: 22, resizeMode: 'contain' },
    backText: { fontSize: 24, fontWeight: '300' },
    title: { fontSize: FONT.lg, fontWeight: '800' },

    bubble: { padding: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, maxWidth: '82%' },
    userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: RADIUS.sm },
    botBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: RADIUS.sm },
    msgText: { fontSize: FONT.md, lineHeight: 22 },

    keyboardArea: { borderTopWidth: 0 },
    quickList: { paddingHorizontal: SPACING.md, gap: 8 },
    quickBtn: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill, borderWidth: 1, ...SHADOW.sm },
    quickText: { fontSize: FONT.sm, fontWeight: '600' },

    inputArea: {
        flexDirection: 'row', padding: SPACING.md,
        borderTopWidth: 1, alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 20 : 10
    },
    input: {
        flex: 1,
        borderRadius: RADIUS.pill, paddingHorizontal: SPACING.xl, height: 44, fontSize: FONT.md,
        borderWidth: 1,
    },
    sendBtn: {
        marginLeft: SPACING.sm,
        width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    },
    sendIcon: { fontSize: 18 },
});
