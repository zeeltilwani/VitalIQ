import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';
import DailySummaryCard from '../components/DailySummaryCard';
import SuggestionCard from '../components/SuggestionCard';

const GLASS_ML = 250;
const GLASS_GOAL = 8;

import { useTheme } from '../context/ThemeContext';

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
    const calorieProgress = Math.min((summary.calories / dailyGoal) * 100, 100);

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

    // ─── Progress Ring (simplified bar) ───
    const ProgressBar = ({ current, total, color }) => (
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((current / total) * 100, 100)}%`, backgroundColor: color }]} />
        </View>
    );

    // ─── Meal Card ───
    const MealCard = ({ title, data, icon }) => (
        <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.mealIcon}>{icon}</Text>
                    <Text style={styles.mealTitle}>{title}</Text>
                    <Text style={styles.mealKcal}>{data.reduce((a, c) => a + c.calories, 0)} kcal</Text>
                </View>
                <TouchableOpacity
                    style={styles.mealAddBtn}
                    onPress={() => navigation.navigate('Log Food', { mealType: title })}
                >
                    <Text style={styles.mealAddText}>+</Text>
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

                {/* ─── Water Tracker (Glasses) ─── */}
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
                            style={[styles.waterCtrlBtn, styles.waterMinusBtn, { backgroundColor: theme.surfaceLight }]}
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
                            <Text style={styles.waterCtrlText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    {glassCount >= GLASS_GOAL && (
                        <Text style={[styles.waterDoneText, { color: theme.primary }]}>🎉 Daily goal reached!</Text>
                    )}
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

                {/* ─── Daily Summary ─── */}
                <DailySummaryCard consumed={summary.calories} goal={dailyGoal} />

                {/* ─── Meal Suggestion ─── */}
                <SuggestionCard consumed={summary.calories} goal={dailyGoal} />

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
    container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.xl },
    loader: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center' },

    // Top row
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.xl },
    greeting: { fontSize: FONT.xxl, fontWeight: FONT.black, color: COLORS.text },
    dateText: { color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: SPACING.xs },
    avatarBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: COLORS.textInverse, fontSize: FONT.lg, fontWeight: FONT.bold },

    // Quick actions
    quickRow: { flexDirection: 'row', marginBottom: SPACING.xl },
    quickBtn: {
        backgroundColor: COLORS.surface, flex: 1, marginRight: SPACING.md,
        paddingVertical: SPACING.lg, borderRadius: RADIUS.lg,
        alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    },
    quickIcon: { fontSize: 22, marginBottom: SPACING.xs },
    quickLabel: { color: COLORS.text, fontSize: FONT.sm, fontWeight: FONT.semibold },

    // Calorie card
    calorieCard: {
        backgroundColor: COLORS.surface, padding: SPACING.xl, borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
    },
    calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    calorieCol: { alignItems: 'center', flex: 1 },
    calorieLabel: { color: COLORS.textSecondary, fontSize: FONT.xs, fontWeight: FONT.medium, marginBottom: SPACING.xs },
    calorieVal: { color: COLORS.text, fontSize: FONT.xxl, fontWeight: FONT.black },
    calorieUnit: { color: COLORS.textSecondary, fontSize: FONT.xs },
    calorieDivider: { height: 30, width: 1, backgroundColor: COLORS.border },
    progressBarBg: { height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    // Water tracker
    waterCard: {
        backgroundColor: COLORS.surface, padding: SPACING.xl, borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
    },
    waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    waterTitle: { color: COLORS.text, fontSize: FONT.lg, fontWeight: FONT.bold },
    waterGoalText: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: FONT.semibold },
    glassRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: SPACING.md },
    glassIcon: { fontSize: 28, marginHorizontal: SPACING.xs, marginVertical: SPACING.xs, opacity: 0.25 },
    glassIconActive: { opacity: 1 },
    waterControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    waterCtrlBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
        ...SHADOW.sm,
    },
    waterMinusBtn: { backgroundColor: COLORS.surfaceLight },
    waterCtrlText: { color: COLORS.textInverse, fontSize: 22, fontWeight: FONT.bold, lineHeight: 24 },
    waterCountText: { color: COLORS.text, fontSize: FONT.lg, fontWeight: FONT.semibold, marginHorizontal: SPACING.xl },
    waterDoneText: { color: COLORS.primary, textAlign: 'center', marginTop: SPACING.md, fontWeight: FONT.semibold, fontSize: FONT.sm },

    // Stats row
    statsRow: { flexDirection: 'row', marginBottom: SPACING.lg },
    statBox: {
        backgroundColor: COLORS.surface, flex: 1, marginRight: SPACING.md,
        padding: SPACING.lg, borderRadius: RADIUS.xl, alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.border,
    },
    statIcon: { fontSize: 24, marginBottom: SPACING.sm },
    statValue: { color: COLORS.text, fontSize: FONT.lg, fontWeight: FONT.bold },
    statLabel: { color: COLORS.textSecondary, fontSize: FONT.xs, marginTop: SPACING.xs },

    // Tip
    tipCard: {
        backgroundColor: COLORS.infoLight, padding: SPACING.lg, borderRadius: RADIUS.xl,
        marginBottom: SPACING.xl, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.15)',
    },
    tipTitle: { color: COLORS.info, fontWeight: FONT.bold, fontSize: FONT.sm, marginBottom: SPACING.sm },
    tipText: { color: COLORS.text, fontSize: FONT.sm, lineHeight: 20 },

    // Meals
    sectionTitle: { color: COLORS.text, fontSize: FONT.xl, fontWeight: FONT.bold, marginBottom: SPACING.lg },
    mealCard: {
        backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.xl,
        marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    },
    mealHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.md,
    },
    mealIcon: { fontSize: 18, marginRight: SPACING.sm },
    mealTitle: { fontSize: FONT.md, fontWeight: FONT.semibold, color: COLORS.text },
    mealKcal: { color: COLORS.textSecondary, fontSize: FONT.sm, marginLeft: SPACING.sm },
    mealAddBtn: {
        backgroundColor: COLORS.primaryLight, width: 30, height: 30,
        borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center',
    },
    mealAddText: { color: COLORS.primary, fontSize: 20, fontWeight: FONT.bold, lineHeight: 22 },
    emptyText: { color: COLORS.textSecondary, textAlign: 'center', fontStyle: 'italic', fontSize: FONT.sm, paddingVertical: SPACING.sm },
    foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.sm },
    foodName: { color: COLORS.text, fontSize: FONT.md },
    foodCal: { color: COLORS.textSecondary, fontSize: FONT.sm },
});
