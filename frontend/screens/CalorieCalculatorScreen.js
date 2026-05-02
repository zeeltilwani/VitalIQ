import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../theme';
import api from '../api';

export default function CalorieCalculatorScreen({ route, navigation }) {
    const { user } = route.params;
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const tdee = user.tdee ? Math.round(user.tdee) : 2400;
    
    const plans = [
        { title: 'Weight Loss', calories: tdee - 400, icon: '🔥', desc: 'Deficit for steady fat loss' },
        { title: 'Maintenance', calories: tdee, icon: '⚖️', desc: 'Keep your composition stable' },
        { title: 'Muscle Gain', calories: tdee + 400, icon: '💪', desc: 'Surplus to fuel growth' }
    ];

    const saveGoal = async () => {
        if (!selectedGoal) {
            return Toast.show({ type: 'error', text1: 'Selection Required', text2: 'Pick a strategy to continue.' });
        }

        setLoading(true);
        try {
            await api.post('/user/goal', { 
                daily_calorie_goal: selectedGoal 
            });
            Toast.show({ type: 'success', text1: 'Goal Saved!', text2: 'Dashboard is ready.' });
            navigation.replace('MainApp', { screen: 'Home', params: { user: { ...user, daily_calorie_goal: selectedGoal } } });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to sync goal.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <LinearGradient colors={[theme.bg, theme.surface]} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Nutritional Blueprint</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Our engine recommends these daily targets based on your unique body metrics.</Text>
            </View>

            <View style={styles.planList}>
                {plans.map((p, i) => {
                    const isActive = selectedGoal === p.calories;
                    return (
                        <TouchableOpacity 
                            key={i} 
                            onPress={() => setSelectedGoal(p.calories)}
                            style={[
                                styles.card, 
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                isActive && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardIcon}>{p.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardTitle, { color: theme.text }, isActive && { color: theme.primary }]}>{p.title}</Text>
                                    <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{p.desc}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: theme.bg }, isActive && { backgroundColor: theme.primary }]}>
                                    <Text style={[styles.badgeText, { color: theme.textSecondary }, isActive && { color: theme.textInverse }]}>{p.calories}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={saveGoal} disabled={loading}>
                {loading ? <ActivityIndicator color={theme.textInverse} /> : <Text style={[styles.btnText, { color: theme.textInverse }]}>Confirm Strategy</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, paddingTop: 60 },
    header: { marginBottom: 40 },
    title: { fontSize: 30, fontWeight: '900', marginBottom: 10 },
    subtitle: { fontSize: 16, lineHeight: 24 },
    planList: { flex: 1 },
    card: { padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { fontSize: 32, marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    cardDesc: { fontSize: 13, marginTop: 2 },
    badge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginLeft: 10 },
    badgeText: { fontWeight: '900', fontSize: 15 },
    btn: { padding: 20, borderRadius: 18, alignItems: 'center', marginBottom: 40 },
    btnText: { fontSize: 18, fontWeight: 'bold' }
});
