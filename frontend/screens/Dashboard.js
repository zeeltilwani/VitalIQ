import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';
import DailySummaryCard from '../components/DailySummaryCard';
import SuggestionCard from '../components/SuggestionCard';
import { useTheme } from '../context/ThemeContext';

const GLASS_ML = 250;
const GLASS_GOAL = 8;

export default function Dashboard({ route, navigation }) {
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

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
            Alert.alert("Connection Error", "Could not refresh your health data. Please check your internet.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused || route.params?.refresh) fetchProfileAndData();
    }, [isFocused, fetchProfileAndData, route.params?.refresh]);

    const dailyGoal = user?.daily_calorie_goal || 2000;
    const glassCount = Math.floor(summary.water / GLASS_ML);

    const updateWater = async (glasses) => {
        const ml = glasses * GLASS_ML;
        if (summary.water + ml < 0) return;
        setSummary(prev => ({ ...prev, water: prev.water + ml }));
        try {
            await api.post('/logs/water', { amountMl: ml });
        } catch {
            setSummary(prev => ({ ...prev, water: prev.water - ml }));
        }
    };

    // ─── Glass Icons ───
    const GlassRow = () => {
        const glasses = [];
        for (let i = 0; i < GLASS_GOAL; i++) {
            glasses.push(
                <Text key={i} style={[styles.glassIcon, i < glassCount && styles.glassIconActive]}>
                    🥛
                </Text>
            );
        }
        return <View style={styles.glassRow}>{glasses}</View>;
    };

    // ─── Progress Bar ───
    const ProgressBar = ({ current, total, color }) => (
        <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceLight }]}>
            <View style={[styles.progressBarFill, { width: `${Math.min((current / total) * 100, 100)}%`, backgroundColor: color }]} />
        </View>
    );

    // ─── Meal Card ───
    const MealCard = ({ title, data, icon }) => (
        <View style={[styles.mealCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.mealHeader, { borderBottomColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.mealIcon}>{icon}</Text>
                    <Text style={[styles.mealTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.mealKcal, { color: theme.textSecondary }]}>{data.reduce((a, c) => a + c.calories, 0)} kcal</Text>
                </View>
                <TouchableOpacity
                    style={[styles.mealAddBtn, { backgroundColor: theme.primaryLight }]}
                    onPress={() => navigation.navigate('Log Food', { mealType: title })}
                >
                    <Text style={[styles.mealAddText, { color: theme.primary }]}>+</Text>
                </TouchableOpacity>
            </View>
            {data.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nothing logged yet</Text>
            ) : (
                data.map((item, i) => (
                    <View key={i} style={styles.foodRow}>
                        <Text style={[styles.foodName, { color: theme.text }]}>{item.food_name}</Text>
                        <Text style={[styles.foodCal, { color: theme.textSecondary }]}>{item.calories} kcal</Text>
                    </View>
                ))
            )}
        </View>
    );

    if (loading && !user) {
        return <View style={[styles.loader, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ─── Greeting ─── */}
                <View style={styles.topRow}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user?.name?.split(' ')[0]}</Text>
                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[styles.avatarBtn, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Quick Actions ─── */}
                <View style={styles.quickRow}>
                    <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('Log Food')}>
                        <Text style={styles.quickIcon}>🍽️</Text>
                        <Text style={[styles.quickLabel, { color: theme.text }]}>Log Food</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.navigate('Scan Food')}>
                        <Text style={styles.quickIcon}>📷</Text>
                        <Text style={[styles.quickLabel, { color: theme.text }]}>Scan</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Calorie Summary ─── */}
                <View style={[styles.calorieCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.calorieRow}>
                        <View style={styles.calorieCol}>
                            <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>Consumed</Text>
                            <Text style={[styles.calorieVal, { color: theme.text }]}>{summary.calories}</Text>
                            <Text style={[styles.calorieUnit, { color: theme.textSecondary }]}>kcal</Text>
                        </View>
                        <View style={[styles.calorieDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.calorieCol}>
                            <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>Remaining</Text>
                            <Text style={[styles.calorieVal, { color: theme.text }]}>{Math.max(dailyGoal - summary.calories, 0)}</Text>
                            <Text style={[styles.calorieUnit, { color: theme.textSecondary }]}>kcal</Text>
                        </View>
                        <View style={[styles.calorieDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.calorieCol}>
                            <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>Goal</Text>
                            <Text style={[styles.calorieVal, { color: theme.text }]}>{dailyGoal}</Text>
                            <Text style={[styles.calorieUnit, { color: theme.textSecondary }]}>kcal</Text>
                        </View>
                    </View>
                    <ProgressBar current={summary.calories} total={dailyGoal} color={theme.primary} />
                </View>

                {/* ─── Water Tracker ─── */}
                <View style={[styles.waterCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.waterHeader}>
                        <Text style={[styles.waterTitle, { color: theme.text }]}>💧 Water Intake</Text>
                        <Text style={[styles.waterGoalText, { color: theme.primary }]}>
                            {glassCount}/{GLASS_GOAL} glasses
                        </Text>
                    </View>
                    <GlassRow />
                    <View style={styles.waterControls}>
                        <TouchableOpacity
                            style={[styles.waterCtrlBtn, { backgroundColor: theme.surfaceLight }]}
                            onPress={() => updateWater(-1)}
                        >
                            <Text style={[styles.waterCtrlText, { color: theme.text }]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[styles.waterCountText, { color: theme.text }]}>
                            {glassCount} {glassCount === 1 ? 'glass' : 'glasses'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.waterCtrlBtn, { backgroundColor: theme.primary }]}
                            onPress={() => updateWater(1)}
                        >
                            <Text style={[styles.waterCtrlText, { color: '#fff' }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ─── Stats Row ─── */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={styles.statIcon}>🔥</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{user?.current_streak || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{user?.goal || '—'}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Goal</Text>
                    </View>
                </View>

                {/* ─── Health Tip ─── */}
                <View style={[styles.tipCard, { backgroundColor: theme.isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme.isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }]}>
                    <Text style={[styles.tipTitle, { color: theme.primary }]}>💡 Health Insight</Text>
                    <Text style={[styles.tipText, { color: theme.text }]}>
                        {user?.goal === 'Weight Loss'
                            ? 'Focus on high-protein snacks to maintain muscle mass while in a deficit.'
                            : user?.goal === 'Muscle Gain'
                            ? "Ensure you're hitting your surplus target to fuel recovery and growth."
                            : 'Keep hitting your hydration targets to maintain metabolic efficiency.'}
                    </Text>
                </View>

                {/* ─── Meal Breakdown ─── */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Meal Breakdown</Text>
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
    container: { flex: 1, paddingHorizontal: SPACING.xl },
    loader: { flex: 1, justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.xl },
    greeting: { fontSize: FONT.xxl, fontWeight: FONT.black },
    dateText: { fontSize: FONT.sm, marginTop: SPACING.xs },
    avatarBtn: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },
    quickRow: { flexDirection: 'row', marginBottom: SPACING.xl },
    quickBtn: {
        flex: 1, marginRight: SPACING.md,
        paddingVertical: SPACING.lg, borderRadius: RADIUS.lg,
        alignItems: 'center', borderWidth: 1,
    },
    quickIcon: { fontSize: 22, marginBottom: SPACING.xs },
    quickLabel: { fontSize: FONT.sm, fontWeight: '600' },
    calorieCard: {
        padding: SPACING.xl, borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg, borderWidth: 1,
    },
    calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    calorieCol: { alignItems: 'center', flex: 1 },
    calorieLabel: { fontSize: FONT.xs, fontWeight: '500', marginBottom: SPACING.xs },
    calorieVal: { fontSize: FONT.xxl, fontWeight: '900' },
    calorieUnit: { fontSize: FONT.xs },
    calorieDivider: { height: 30, width: 1 },
    progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    waterCard: {
        padding: SPACING.xl, borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg, borderWidth: 1,
    },
    waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    waterTitle: { fontSize: FONT.lg, fontWeight: 'bold' },
    waterGoalText: { fontSize: FONT.sm, fontWeight: '600' },
    glassRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: SPACING.md },
    glassIcon: { fontSize: 28, marginHorizontal: SPACING.xs, marginVertical: SPACING.xs, opacity: 0.25 },
    glassIconActive: { opacity: 1 },
    waterControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    waterCtrlBtn: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        ...SHADOW.sm,
    },
    waterCtrlText: { fontSize: 22, fontWeight: 'bold', lineHeight: 24 },
    waterCountText: { fontSize: FONT.lg, fontWeight: '600', marginHorizontal: SPACING.xl },
    statsRow: { flexDirection: 'row', marginBottom: SPACING.lg },
    statBox: {
        flex: 1, marginRight: SPACING.md,
        padding: SPACING.lg, borderRadius: RADIUS.xl, alignItems: 'center',
        borderWidth: 1,
    },
    statIcon: { fontSize: 24, marginBottom: SPACING.sm },
    statValue: { fontSize: FONT.lg, fontWeight: 'bold' },
    statLabel: { fontSize: FONT.xs, marginTop: SPACING.xs },
    tipCard: {
        padding: SPACING.lg, borderRadius: RADIUS.xl,
        marginBottom: SPACING.xl, borderWidth: 1,
    },
    tipTitle: { fontWeight: 'bold', fontSize: FONT.sm, marginBottom: SPACING.sm },
    tipText: { fontSize: FONT.sm, lineHeight: 20 },
    sectionTitle: { fontSize: FONT.xl, fontWeight: 'bold', marginBottom: SPACING.lg },
    mealCard: {
        padding: SPACING.lg, borderRadius: RADIUS.xl,
        marginBottom: SPACING.md, borderWidth: 1,
    },
    mealHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: SPACING.md, borderBottomWidth: 1, marginBottom: SPACING.md,
    },
    mealIcon: { fontSize: 18, marginRight: SPACING.sm },
    mealTitle: { fontSize: FONT.md, fontWeight: '600' },
    mealKcal: { fontSize: FONT.sm, marginLeft: SPACING.sm },
    mealAddBtn: {
        width: 30, height: 30,
        borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center',
    },
    mealAddText: { fontSize: 20, fontWeight: 'bold', lineHeight: 22 },
    emptyText: { textAlign: 'center', fontStyle: 'italic', fontSize: FONT.sm, paddingVertical: SPACING.sm },
    foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.sm },
    foodName: { fontSize: FONT.md },
    foodCal: { fontSize: FONT.sm },
});
