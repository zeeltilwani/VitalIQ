import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function CalorieCalculatorScreen({ route, navigation }) {
    const { user } = route.params;
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
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
                <Text style={styles.title}>Nutritional Blueprint</Text>
                <Text style={styles.subtitle}>Our engine recommends these daily targets based on your unique body metrics.</Text>
            </View>

            <View style={styles.planList}>
                {plans.map((p, i) => {
                    const isActive = selectedGoal === p.calories;
                    return (
                        <TouchableOpacity 
                            key={i} 
                            onPress={() => setSelectedGoal(p.calories)}
                            style={[styles.card, isActive && styles.cardActive]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardIcon}>{p.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardTitle, isActive && { color: COLORS.primary }]}>{p.title}</Text>
                                    <Text style={styles.cardDesc}>{p.desc}</Text>
                                </View>
                                <View style={[styles.badge, isActive && styles.badgeActive]}>
                                    <Text style={[styles.badgeText, isActive && { color: '#fff' }]}>{p.calories}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity style={styles.btn} onPress={saveGoal} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm Strategy</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, padding: 25, paddingTop: 60 },
    header: { marginBottom: 40 },
    title: { fontSize: 30, fontWeight: '900', color: '#fff', marginBottom: 10 },
    subtitle: { fontSize: 16, color: COLORS.muted, lineHeight: 24 },
    planList: { flex: 1 },
    card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    cardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(16, 185, 129, 0.05)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    cardIcon: { fontSize: 32, marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    cardDesc: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
    badge: { backgroundColor: COLORS.bg, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginLeft: 10 },
    badgeActive: { backgroundColor: COLORS.primary },
    badgeText: { color: COLORS.muted, fontWeight: '900', fontSize: 15 },
    btn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 18, alignItems: 'center', marginBottom: 40 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
