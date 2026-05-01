import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONT, SHADOW, COLORS } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import PressableButton from '../components/PressableButton';

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) fetchProfileAndData();
    }, [isFocused, fetchProfileAndData]);

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

    const ProgressBar = ({ current, total, color }) => (
        <View style={[styles.progressBarBg, { backgroundColor: theme.surfaceLight }]}>
            <View 
                style={[
                    styles.progressBarFill, 
                    { width: `${Math.min((current / total) * 100, 100)}%`, backgroundColor: color }
                ]} 
            />
        </View>
    );

    const MealCard = ({ title, data, icon }) => (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.mealCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Log Food', { mealType: title })}
        >
            <View style={[styles.mealHeader, { borderBottomColor: theme.border }]}>
                <View style={styles.mealTitleRow}>
                    <Text style={styles.mealIcon}>{icon}</Text>
                    <Text style={[styles.mealTitle, { color: theme.text }]}>{title}</Text>
                </View>
                <Text style={[styles.mealKcal, { color: theme.primary }]}>
                    {data.reduce((a, c) => a + c.calories, 0)} kcal
                </Text>
            </View>
            {data.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Log your {title.toLowerCase()}...</Text>
            ) : (
                data.map((item, i) => (
                    <View key={i} style={styles.foodRow}>
                        <Text style={[styles.foodName, { color: theme.text }]}>{item.food_name}</Text>
                        <Text style={[styles.foodCal, { color: theme.textSecondary }]}>{item.calories} kcal</Text>
                    </View>
                ))
            )}
        </TouchableOpacity>
    );

    if (loading && !user) {
        return (
            <View style={[styles.loader, { backgroundColor: theme.bg }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const avatarSource = user?.profile_picture_url 
        ? { uri: user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `${api.defaults.baseURL.split('/api')[0]}${user.profile_picture_url}` }
        : null;

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.text }]}>Hi, {user?.name?.split(' ')[0]} 👋</Text>
                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Profile')}
                        style={[styles.avatarContainer, { borderColor: theme.primary }]}
                    >
                        {avatarSource ? (
                            <Image source={avatarSource} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.avatarInitial, { color: theme.primary }]}>{user?.name?.charAt(0)}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Main Calorie Ring / Summary Card */}
                <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.calorieStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.text }]}>{summary.calories}</Text>
                            <Text style={[styles.statLab, { color: theme.textSecondary }]}>Eaten</Text>
                        </View>
                        <View style={[styles.mainCircle, { borderColor: theme.primary }]}>
                            <Text style={[styles.remainingVal, { color: theme.text }]}>{Math.max(dailyGoal - summary.calories, 0)}</Text>
                            <Text style={[styles.remainingLab, { color: theme.textSecondary }]}>Left</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.text }]}>{dailyGoal}</Text>
                            <Text style={[styles.statLab, { color: theme.textSecondary }]}>Goal</Text>
                        </View>
                    </View>
                    <ProgressBar current={summary.calories} total={dailyGoal} color={theme.primary} />
                </View>

                {/* Quick Action Grid */}
                <View style={styles.actionGrid}>
                    <PressableButton 
                        variant="primary" 
                        label="Log Food" 
                        icon="🥗" 
                        onPress={() => navigation.navigate('Log Food')}
                        style={styles.actionBtn}
                    />
                    <PressableButton 
                        variant="secondary" 
                        label="Scan Meal" 
                        icon="📸" 
                        onPress={() => navigation.navigate('Scan Food')}
                        style={styles.actionBtn}
                    />
                </View>

                {/* Water Tracker */}
                <View style={[styles.waterCard, { backgroundColor: theme.primaryLight, borderColor: 'transparent' }]}>
                    <View style={styles.waterInfo}>
                        <View>
                            <Text style={[styles.waterTitle, { color: theme.text }]}>Hydration 💧</Text>
                            <Text style={[styles.waterSub, { color: theme.textSecondary }]}>Keep your energy levels high</Text>
                        </View>
                        <Text style={[styles.waterValue, { color: theme.primary }]}>{glassCount}/{GLASS_GOAL}</Text>
                    </View>
                    <View style={styles.waterControls}>
                        <TouchableOpacity style={styles.waterBtn} onPress={() => updateWater(-1)}>
                            <Text style={[styles.waterBtnText, { color: theme.textSecondary }]}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.glassRow}>
                            {[...Array(GLASS_GOAL)].map((_, i) => (
                                <Text key={i} style={[styles.glass, { opacity: i < glassCount ? 1 : 0.2 }]}>🥛</Text>
                            ))}
                        </View>
                        <TouchableOpacity style={[styles.waterBtn, { backgroundColor: theme.primary }]} onPress={() => updateWater(1)}>
                            <Text style={[styles.waterBtnText, { color: theme.textInverse }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Meals */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Nutrition</Text>
                <MealCard title="Breakfast" data={meals.Breakfast} icon="🌅" />
                <MealCard title="Lunch" data={meals.Lunch} icon="☀️" />
                <MealCard title="Dinner" data={meals.Dinner} icon="🌙" />
                <MealCard title="Snacks" data={meals.Snacks} icon="🍎" />

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.lg },
    greeting: { fontSize: 28, fontWeight: '900' },
    dateText: { fontSize: 14, fontWeight: '600' },
    avatarContainer: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, overflow: 'hidden' },
    avatar: { width: '100%', height: '100%' },
    avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: 20, fontWeight: 'bold' },

    summaryCard: { padding: SPACING.xl, borderRadius: RADIUS.xxl, borderWidth: 1, ...SHADOW.md, marginBottom: SPACING.xl },
    calorieStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
    statItem: { alignItems: 'center' },
    statVal: { fontSize: 18, fontWeight: '800' },
    statLab: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    mainCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
    remainingVal: { fontSize: 36, fontWeight: '900' },
    remainingLab: { fontSize: 12, fontWeight: 'bold' },
    progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    actionGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    actionBtn: { flex: 1 },

    waterCard: { padding: SPACING.xl, borderRadius: RADIUS.xxl, marginBottom: SPACING.xl },
    waterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    waterTitle: { fontSize: 18, fontWeight: '800' },
    waterSub: { fontSize: 12, fontWeight: '500' },
    waterValue: { fontSize: 24, fontWeight: '900' },
    waterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    waterBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
    waterBtnText: { fontSize: 24, fontWeight: 'bold' },
    glassRow: { flexDirection: 'row', gap: 4 },
    glass: { fontSize: 18 },

    sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: SPACING.lg },
    mealCard: { padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, marginBottom: SPACING.md, ...SHADOW.sm },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: SPACING.sm, borderBottomWidth: 1, marginBottom: SPACING.md },
    mealTitleRow: { flexDirection: 'row', alignItems: 'center' },
    mealIcon: { fontSize: 20, marginRight: 8 },
    mealTitle: { fontSize: 16, fontWeight: '800' },
    mealKcal: { fontSize: 14, fontWeight: 'bold' },
    foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    foodName: { fontSize: 14, fontWeight: '500' },
    foodCal: { fontSize: 12 },
    emptyText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 4 },
});
