import React, { useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, FlatList,
    Modal, StyleSheet, Animated, Dimensions, ScrollView
} from 'react-native';
import { COLORS, RADIUS, FONT, SHADOW, SPACING } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Predefined Q&A Database ───
const QUICK_QUESTIONS = [
    {
        id: '1',
        question: '🥗 Suggest meal under 300 kcal',
        answer: `Here are some great meals under 300 kcal:\n\n🥚 2 Boiled Eggs + Toast — 250 kcal\n🥗 Greek Salad with Feta — 220 kcal\n🍌 Banana + Peanut Butter — 280 kcal\n🥣 Oatmeal with Berries — 260 kcal\n🍳 Egg White Omelette + Veggies — 200 kcal\n\n💡 Tip: Pair with water or green tea to stay hydrated!`,
    },
    {
        id: '2',
        question: '🍽️ What should I eat today?',
        answer: `Here's a balanced day plan (~1800 kcal):\n\n🌅 Breakfast: Oats + banana + nuts (350 kcal)\n☀️ Mid-Morning: Apple + 5 almonds (130 kcal)\n🍛 Lunch: Rice + dal + salad (500 kcal)\n🍵 Evening: Green tea + 2 biscuits (100 kcal)\n🍽️ Dinner: Grilled chicken + veggies (450 kcal)\n🥛 Before Bed: Warm milk (120 kcal)\n\n💡 Adjust portions based on your calorie goal!`,
    },
    {
        id: '3',
        question: '⚖️ How to lose weight?',
        answer: `Science-backed weight loss tips:\n\n1️⃣ Calorie Deficit — Eat 300-500 kcal less than your TDEE\n2️⃣ Protein First — 1.6g/kg body weight to preserve muscle\n3️⃣ Strength Training — 3x/week to boost metabolism\n4️⃣ Sleep 7-8 hours — Poor sleep increases hunger hormones\n5️⃣ Walk 8000+ steps daily — Burns 300-400 extra kcal\n6️⃣ Stay Hydrated — Drink 2-3L water daily\n7️⃣ Avoid Liquid Calories — Skip soda, juice, sweetened coffee\n\n⏳ Aim for 0.5-1 kg/week for sustainable results.`,
    },
    {
        id: '4',
        question: '💪 High protein foods',
        answer: `Top protein sources per 100g:\n\n🍗 Chicken Breast — 31g protein (165 kcal)\n🥚 Eggs (2 large) — 13g protein (155 kcal)\n🐟 Tuna — 30g protein (130 kcal)\n🧀 Paneer — 18g protein (265 kcal)\n🫘 Lentils (Dal) — 9g protein (116 kcal)\n🥜 Peanuts — 26g protein (567 kcal)\n🥛 Greek Yogurt — 10g protein (59 kcal)\n🫛 Chickpeas — 19g protein (364 kcal)\n\n🎯 Aim for 1.6-2.2g protein per kg of body weight.`,
    },
    {
        id: '5',
        question: '💧 How much water should I drink?',
        answer: `Water intake guide:\n\n📐 General Formula: Your weight (kg) × 0.033 = liters/day\n\n📊 Examples:\n• 50 kg → 1.65 L/day (~7 glasses)\n• 70 kg → 2.31 L/day (~9 glasses)\n• 90 kg → 2.97 L/day (~12 glasses)\n\n⬆️ Increase if:\n• You exercise (add 500ml per hour)\n• Hot weather\n• You drink coffee/tea\n\n💡 Signs of dehydration: dark urine, headache, fatigue.`,
    },
    {
        id: '6',
        question: '🏃 Best exercises for beginners',
        answer: `Beginner-friendly workout plan:\n\n🔥 Warm Up (5 min):\n• Jumping jacks × 30\n• Arm circles × 20\n\n💪 Workout (20 min):\n• Bodyweight Squats — 3 × 12\n• Push-Ups (knee) — 3 × 8\n• Lunges — 3 × 10 each leg\n• Plank Hold — 3 × 20 sec\n• Glute Bridges — 3 × 15\n\n🧘 Cool Down (5 min):\n• Stretching all major muscles\n\n📅 Do 3-4 times per week. Rest between days!`,
    },
    {
        id: '7',
        question: '🌙 Foods to eat before bed',
        answer: `Best bedtime snacks (won't hurt your progress):\n\n🥛 Warm Milk — 120 kcal (tryptophan aids sleep)\n🍌 Banana — 105 kcal (magnesium relaxes muscles)\n🥜 Small handful of almonds — 100 kcal\n🧀 Cottage Cheese — 98 kcal (casein protein)\n🍯 Chamomile Tea + Honey — 30 kcal\n\n🚫 Avoid before bed:\n• Heavy/spicy meals\n• Caffeine (coffee, dark chocolate)\n• Sugary snacks\n• Large portions`,
    },
    {
        id: '8',
        question: '📊 Explain BMI & BMR',
        answer: `📊 BMI (Body Mass Index):\nFormula: weight(kg) / height(m)²\n\n• Under 18.5 → Underweight\n• 18.5-24.9 → Normal ✅\n• 25-29.9 → Overweight\n• 30+ → Obese\n\n🔥 BMR (Basal Metabolic Rate):\nCalories your body burns at rest.\n\nMen: 10×weight + 6.25×height - 5×age + 5\nWomen: 10×weight + 6.25×height - 5×age - 161\n\n💡 TDEE = BMR × Activity Factor\n• Sedentary: ×1.2\n• Light exercise: ×1.375\n• Moderate: ×1.55\n• Very active: ×1.725`,
    },
];

export default function FloatingAI() {
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! 👋 I\'m your VitalIQ health assistant.\nTap a question below to get started!' }
    ]);
    const [showQuestions, setShowQuestions] = useState(true);
    const flatListRef = useRef(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const pulseButton = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const toggleChat = () => {
        pulseButton();
        setVisible(prev => !prev);
    };

    const handleQuestionTap = (item) => {
        // Add user question
        setMessages(prev => [...prev, { role: 'user', text: item.question }]);
        // Add bot answer
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'bot', text: item.answer }]);
            setShowQuestions(true); // Keep showing questions for next tap
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        }, 300);
    };

    const handleReset = () => {
        setMessages([
            { role: 'bot', text: 'Hi! 👋 I\'m your VitalIQ health assistant.\nTap a question below to get started!' }
        ]);
        setShowQuestions(true);
    };

    const renderMessage = ({ item }) => (
        <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' && { color: COLORS.textInverse }]}>
                {item.text}
            </Text>
        </View>
    );

    return (
        <>
            {/* Floating Action Button */}
            <Animated.View style={[styles.fabContainer, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity style={styles.fab} onPress={toggleChat} activeOpacity={0.8}>
                    <Text style={styles.fabIcon}>{visible ? '✕' : '🤖'}</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Chat Modal */}
            <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>VitalIQ Assistant</Text>
                                <Text style={styles.modalSubtitle}>Tap a question to get instant answers</Text>
                            </View>
                            <View style={styles.headerActions}>
                                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                                    <Text style={styles.resetText}>🔄</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                                    <Text style={styles.closeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Messages */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={renderMessage}
                            contentContainerStyle={styles.messageList}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            ListFooterComponent={
                                showQuestions ? (
                                    <View style={styles.questionsContainer}>
                                        <Text style={styles.questionsLabel}>Quick Questions</Text>
                                        {QUICK_QUESTIONS.map(q => (
                                            <TouchableOpacity
                                                key={q.id}
                                                style={styles.questionBtn}
                                                onPress={() => handleQuestionTap(q)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.questionText}>{q.question}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : null
                            }
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute', bottom: 100, right: 20, zIndex: 9999,
    },
    fab: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
        ...SHADOW.lg,
    },
    fabIcon: { fontSize: 24, color: COLORS.textInverse },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    modalContent: {
        height: SCREEN_HEIGHT * 0.8, backgroundColor: COLORS.bg,
        borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING.xl, paddingBottom: SPACING.lg,
        borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface,
    },
    modalTitle: { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.text },
    modalSubtitle: { fontSize: FONT.xs, color: COLORS.textSecondary, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    resetBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center',
        marginRight: SPACING.sm,
    },
    resetText: { fontSize: 16 },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center',
    },
    closeBtnText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: FONT.bold },

    messageList: { padding: SPACING.lg, paddingBottom: SPACING.xl },
    bubble: {
        maxWidth: '85%', padding: SPACING.md, paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
    },
    userBubble: {
        backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: RADIUS.sm,
    },
    botBubble: {
        backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: RADIUS.sm,
    },
    bubbleText: { fontSize: FONT.md, lineHeight: 22, color: COLORS.text },

    // Quick Questions
    questionsContainer: {
        marginTop: SPACING.lg, paddingTop: SPACING.md,
        borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    questionsLabel: {
        color: COLORS.textSecondary, fontSize: FONT.xs, fontWeight: FONT.bold,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.md,
    },
    questionBtn: {
        backgroundColor: COLORS.surface, padding: SPACING.md, paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg, marginBottom: SPACING.sm,
        borderWidth: 1, borderColor: COLORS.border,
    },
    questionText: { color: COLORS.text, fontSize: FONT.sm, fontWeight: FONT.medium },
});
