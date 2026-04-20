import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    secondary: '#3b82f6',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    action: '#6366f1' // For quick actions
};

export default function Dashboard({ route, navigation }) {
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    
    const [user, setUser] = useState(route.params?.user || null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ calories: 0, water: 0 });
    const [meals, setMeals] = useState({ Breakfast: [], Lunch: [], Dinner: [], Snacks: [] });

    const fetchProfileAndData = useCallback(async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [profileRes, sumRes, mealsRes] = await Promise.all([
                api.get('/user/profile'),
                api.get('/logs/summary', { params: { date: today } }),
                api.get('/logs/food', { params: { date: today } })
            ]);
            setUser(profileRes.data);
            setSummary(sumRes.data);
            setMeals(mealsRes.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Also listen to navigation refresh params
    useEffect(() => { 
        if (isFocused || route.params?.refresh) fetchProfileAndData(); 
    }, [isFocused, fetchProfileAndData, route.params?.refresh]);

    const waterTargetMl = user?.weight ? Math.round(user.weight * 33) : 2500;
    const dailyGoal = user?.daily_calorie_goal || 2000;

    const updateWater = async (ml) => {
        if (summary.water + ml < 0) return;
        setSummary(prev => ({ ...prev, water: prev.water + ml }));
        try {
            await api.post('/logs/water', { amountMl: ml });
        } catch (err) {
            setSummary(prev => ({ ...prev, water: prev.water - ml }));
        }
    };

    const ProgressBar = ({ current, total, color }) => (
        <View style={styles.barContainer}>
            <View style={[styles.barBg, { width: '100%' }]} />
            <View style={[styles.barFill, { width: `${Math.min((current/total)*100, 100)}%`, backgroundColor: color }]} />
        </View>
    );

    const MealCard = ({ title, data, icon }) => (
        <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.mealTitle}>{icon} {title}</Text>
                    <Text style={styles.mealSum}>  •  {data.reduce((acc, c) => acc + c.calories, 0)} kcal</Text>
                </View>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('Log Food', { mealType: title })}
                >
                    <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
            </View>
            {data.length === 0 ? (
                <Text style={styles.emptyText}>Nothing logged yet</Text>
            ) : (
                data.map((item, i) => (
                    <View key={i} style={styles.foodRow}>
                        <Text style={styles.foodName}>{item.food_name}</Text>
                        <Text style={styles.foodCal}>{item.calories} kcal</Text>
                    </View>
                ))
            )}
        </View>
    );

    if (loading && !user) return <View style={styles.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
                        <Text style={styles.location}>📍 {user?.city || 'VitalIQ User'} • {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                        <Text style={{ fontSize: 24 }}>👤</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Log Food')}>
                        <Text style={styles.actionIcon}>🍽️</Text>
                        <Text style={styles.actionText}>Log Food</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Scan Food')}>
                        <Text style={styles.actionIcon}>📷</Text>
                        <Text style={styles.actionText}>Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Ask AI')}>
                        <Text style={styles.actionIcon}>🤖</Text>
                        <Text style={styles.actionText}>Ask AI</Text>
                    </TouchableOpacity>
                </View>

                <LinearGradient colors={[COLORS.primary, '#059669']} style={styles.summaryCard}>
                    <View style={styles.sumRow}>
                        <View>
                            <Text style={styles.sumLabel}>Consumed</Text>
                            <Text style={styles.sumVal}>{summary.calories} <Text style={styles.unit}>kcal</Text></Text>
                        </View>
                        <View style={styles.divider} />
                        <View>
                            <Text style={styles.sumLabel}>Remaining</Text>
                            <Text style={styles.sumVal}>{Math.max(dailyGoal - summary.calories, 0)} <Text style={styles.unit}>kcal</Text></Text>
                        </View>
                    </View>
                    <ProgressBar current={summary.calories} total={dailyGoal} color="#fff" />
                </LinearGradient>

                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { borderColor: (summary.water >= waterTargetMl) ? COLORS.primary : 'transparent', borderWidth: 1 }]}>
                        <Text style={styles.statIcon}>💧</Text>
                        <Text style={styles.statLabel}>Water Goal</Text>
                        <Text style={styles.statVal}>{(summary.water/1000).toFixed(1)} <Text style={{fontSize: 12}}>/ {(waterTargetMl/1000).toFixed(1)}L</Text></Text>
                        <View style={styles.waterCtrls}>
                            <TouchableOpacity onPress={() => updateWater(-250)} style={styles.waterBtn}><Text style={styles.waterBtnText}>-</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => updateWater(250)} style={styles.waterBtn}><Text style={styles.waterBtnText}>+</Text></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statIcon}>🔥</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                        <Text style={styles.statVal}>{user?.current_streak || 1} Days</Text>
                        <Text style={styles.statHint}>{user?.goal || 'Healthy Living'}</Text>
                    </View>
                </View>

                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>💡 Health Insight</Text>
                    <Text style={styles.tipText}>
                        {user?.goal === 'Weight Loss' ? "Focus on high-protein snacks to maintain muscle mass while in a deficit." :
                         user?.goal === 'Muscle Gain' ? "Ensure you're hitting your surplus target to fuel recovery and growth." :
                         "Keep hitting your hydration targets to maintain metabolic efficiency."}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Meal Breakdown</Text>
                <MealCard title="Breakfast" data={meals.Breakfast} icon="🍳" />
                <MealCard title="Lunch" data={meals.Lunch} icon="🍛" />
                <MealCard title="Dinner" data={meals.Dinner} icon="🍽️" />
                <MealCard title="Snacks" data={meals.Snacks} icon="🍪" />

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20 },
    loader: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    greeting: { fontSize: 26, fontWeight: '900', color: '#fff' },
    location: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
    
    quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    actionBtn: { backgroundColor: COLORS.card, width: '31%', paddingVertical: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    actionIcon: { fontSize: 24, marginBottom: 5 },
    actionText: { color: COLORS.text, fontSize: 12, fontWeight: 'bold' },

    summaryCard: { padding: 25, borderRadius: 24, marginBottom: 20 },
    sumRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
    sumLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
    sumVal: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 5 },
    unit: { fontSize: 14, fontWeight: 'normal' },
    divider: { height: 30, width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    barContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
    barBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.2)' },
    barFill: { height: '100%', borderRadius: 4 },
    
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    statBox: { backgroundColor: COLORS.card, width: '48%', padding: 18, borderRadius: 24, alignItems: 'center', borderColor: '#334155', borderWidth: 1 },
    statIcon: { fontSize: 28, marginBottom: 8 },
    statLabel: { color: COLORS.muted, fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
    statVal: { color: '#fff', fontSize: 18, fontWeight: '900' },
    statHint: { color: COLORS.primary, fontSize: 11, marginTop: 4, fontWeight: 'bold', textTransform: 'uppercase' },
    
    tipCard: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 15, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    tipTitle: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    tipText: { color: COLORS.text, fontSize: 13, lineHeight: 18 },
    
    waterCtrls: { flexDirection: 'row', marginTop: 10 },
    waterBtn: { backgroundColor: COLORS.bg, width: 35, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
    waterBtnText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
    
    sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 15, marginTop: 5 },
    mealCard: { backgroundColor: COLORS.card, padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 8 },
    mealTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text },
    mealSum: { color: COLORS.muted, fontWeight: 'bold', fontSize: 13 },
    addBtn: { backgroundColor: 'rgba(16, 185, 129, 0.2)', width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    addBtnText: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold', lineHeight: 22 },
    
    emptyText: { color: COLORS.muted, textAlign: 'center', fontStyle: 'italic', fontSize: 13, marginVertical: 5 },
    foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
    foodName: { color: '#fff', fontSize: 15 },
    foodCal: { color: COLORS.muted, fontSize: 13 }
});
