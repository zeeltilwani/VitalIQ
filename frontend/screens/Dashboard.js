import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONT, SHADOW, COLORS } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import PressableButton from '../components/PressableButton';

import Svg, { Circle } from 'react-native-svg';
import { Flame, Target, ChevronRight, Scan, Plus, Minus, Hand, Heart, Trash2 } from 'lucide-react-native';
import { NUTRITION_ICONS } from '../assets/nutrition';
import { HYDRATION_ASSETS } from '../assets/hydration';
import { DIET_IMAGES } from '../assets/diet';

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

    const deleteFood = (logId) => {
        Alert.alert(
            "Delete Log",
            "Are you sure you want to delete this food log?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/logs/food/${logId}`);
                            fetchProfileAndData(); // Refresh summary and meals
                        } catch (err) {
                            console.error('Delete error:', err);
                            Alert.alert("Error", "Unable to delete food log.");
                        }
                    }
                }
            ]
        );
    };

    const ProgressBar = ({ current, total, color }) => (
        <View style={[styles.progressBarBg, { backgroundColor: '#222' }]}>
            <View 
                style={[
                    styles.progressBarFill, 
                    { width: `${Math.min((current / total) * 100, 100)}%`, backgroundColor: color }
                ]} 
            />
        </View>
    );

    const MealCard = ({ title, data, type }) => (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.mealCard, { backgroundColor: '#111', borderColor: '#222' }]}
            onPress={() => navigation.navigate('Log Food', { mealType: title })}
        >
            <View style={[styles.mealHeader, { borderBottomColor: '#222' }]}>
                <View style={styles.mealTitleRow}>
                    <Image source={NUTRITION_ICONS[type]} style={styles.mealIconImg} />
                    <Text style={[styles.mealTitle, { color: '#fff' }]}>{title}</Text>
                </View>
                <Text style={[styles.mealKcal, { color: theme.primary }]}>
                    {data.reduce((a, c) => a + c.calories, 0)} kcal
                </Text>
            </View>
            {data.length === 0 ? (
                <Text style={[styles.emptyText, { color: '#666' }]}>Log your {title.toLowerCase()}...</Text>
            ) : (
                data.map((item, i) => (
                    <View key={i} style={styles.foodRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.foodName, { color: '#fff' }]}>{item.food_name}</Text>
                            <Text style={[styles.foodCal, { color: '#666' }]}>{item.calories} kcal</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteFood(item.id)} style={styles.deleteIcon}>
                            <Trash2 size={16} color="#ef4444" opacity={0.6} />
                        </TouchableOpacity>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.greeting, { color: theme.text }]}>Hi, {user?.name?.split(' ')[0]}</Text>
                            <Hand size={24} color="#FFD700" style={{ marginLeft: 8 }} />
                        </View>
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
                <View style={[styles.summaryCard, { backgroundColor: '#0A0A0A', borderColor: '#1A1A1A' }]}>
                    <View style={styles.calorieStats}>
                        <View style={styles.statBox}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#1A1A1A' }]}>
                                <Image source={DIET_IMAGES.kcal_icon} style={styles.kcalStatIcon} />
                            </View>
                            <Text style={[styles.statVal, { color: '#fff' }]}>{summary.calories}</Text>
                            <Text style={[styles.statLab, { color: '#666' }]}>EATEN</Text>
                        </View>

                        <View style={styles.ringContainer}>
                            <Svg width="160" height="160">
                                <Circle 
                                    cx="80" cy="80" r="70" 
                                    stroke="#1A1A1A" strokeWidth="12" fill="none" 
                                />
                                <Circle 
                                    cx="80" cy="80" r="70" 
                                    stroke={theme.primary} strokeWidth="12" fill="none" 
                                    strokeDasharray={2 * Math.PI * 70}
                                    strokeDashoffset={(2 * Math.PI * 70) * (1 - Math.min(summary.calories / dailyGoal, 1))}
                                    strokeLinecap="round"
                                    transform="rotate(-90 80 80)"
                                />
                            </Svg>
                            <View style={styles.ringCenterText}>
                                <Text style={[styles.ringLabel, { color: '#666' }]}>CALORIES</Text>
                                <Text style={[styles.remainingVal, { color: '#fff' }]}>{Math.max(dailyGoal - summary.calories, 0)}</Text>
                                <Text style={[styles.remainingLab, { color: theme.primary }]}>Left</Text>
                                <Text style={[styles.goalSubText, { color: '#666' }]}>of {dailyGoal} kcal</Text>
                            </View>
                        </View>

                        <View style={styles.statBox}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#1A1A1A' }]}>
                                <Target size={24} color={theme.primary} />
                            </View>
                            <Text style={[styles.statVal, { color: '#fff' }]}>{dailyGoal}</Text>
                            <Text style={[styles.statLab, { color: '#666' }]}>GOAL</Text>
                        </View>
                    </View>
                    
                    <ProgressBar current={summary.calories} total={dailyGoal} color={theme.primary} />
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                        <Text style={[styles.motivationalText, { color: '#666' }]}>
                            You're doing great! Keep it up.
                        </Text>
                        <Heart size={14} color="#ef4444" fill="#ef4444" style={{ marginLeft: 4 }} />
                    </View>
                </View>

                {/* Quick Action Grid */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity 
                        style={[styles.actionBtnFull, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('Log Food')}
                    >
                        <Image source={require('../assets/nutrition/breakfast.png')} style={styles.actionIconImg} />
                        <Text style={styles.actionBtnLabel}>Log Food</Text>
                        <ChevronRight size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionBtnFull, { backgroundColor: '#111', borderColor: '#222', borderWidth: 1 }]}
                        onPress={() => navigation.navigate('Scan Food')}
                    >
                        <View style={styles.scanIconBox}>
                            <Scan size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.actionBtnLabel, { color: '#fff' }]}>Scan Meal</Text>
                        <ChevronRight size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Water Tracker */}
                <View style={[styles.waterCard, { backgroundColor: '#111', borderColor: '#222', borderWidth: 1 }]}>
                    <View style={styles.waterInfo}>
                        <View style={styles.waterTitleRow}>
                            <Image source={HYDRATION_ASSETS.main} style={styles.waterIconImg} />
                            <View>
                                <Text style={[styles.waterTitle, { color: '#fff' }]}>Hydration</Text>
                                <Text style={[styles.waterSub, { color: '#666' }]}>Stay refreshed</Text>
                            </View>
                        </View>
                        <Text style={[styles.waterValue, { color: theme.primary }]}>{glassCount}/{GLASS_GOAL}</Text>
                    </View>
                    <View style={styles.waterControls}>
                        <TouchableOpacity style={[styles.waterBtnNew, { backgroundColor: '#1A1A1A' }]} onPress={() => updateWater(-1)}>
                            <Minus size={20} color="#666" />
                        </TouchableOpacity>
                        
                        <View style={styles.glassRow}>
                            {[...Array(GLASS_GOAL)].map((_, i) => (
                                <View 
                                    key={i} 
                                    style={[
                                        styles.glassIndicator, 
                                        { backgroundColor: i < glassCount ? theme.primary : '#222' }
                                    ]} 
                                />
                            ))}
                        </View>

                        <TouchableOpacity style={[styles.waterBtnNew, { backgroundColor: theme.primary }]} onPress={() => updateWater(1)}>
                            <Plus size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Meals */}
                <Text style={[styles.sectionTitle, { color: '#fff' }]}>Today's Nutrition</Text>
                <MealCard title="Breakfast" data={meals.Breakfast} type="breakfast" />
                <MealCard title="Lunch" data={meals.Lunch} type="lunch" />
                <MealCard title="Snacks" data={meals.Snacks} type="snacks" />
                <MealCard title="Dinner" data={meals.Dinner} type="dinner" />

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

    summaryCard: { padding: SPACING.xl, borderRadius: RADIUS.xxl, borderWidth: 1, marginBottom: SPACING.xl },
    calorieStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
    statBox: { alignItems: 'center', flex: 1 },
    statIconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statVal: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
    statLab: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    kcalStatIcon: { width: 30, height: 30 },
    
    ringContainer: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center' },
    ringCenterText: { position: 'absolute', alignItems: 'center' },
    ringLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
    remainingVal: { fontSize: 32, fontWeight: '900' },
    remainingLab: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
    goalSubText: { fontSize: 10, fontWeight: '600' },

    progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
    progressBarFill: { height: '100%', borderRadius: 3 },
    motivationalText: { fontSize: 13, color: '#666', textAlign: 'center', fontWeight: '600' },

    actionGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    actionBtnFull: { 
        flex: 1, height: 70, borderRadius: RADIUS.xl, 
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 
    },
    actionIconImg: { width: 36, height: 36, marginRight: 10 },
    scanIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    actionBtnLabel: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },

    waterCard: { padding: SPACING.xl, borderRadius: RADIUS.xxl, marginBottom: SPACING.xl },
    waterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    waterTitleRow: { flexDirection: 'row', alignItems: 'center' },
    waterIconImg: { width: 60, height: 60, marginRight: 15 },
    waterTitle: { fontSize: 18, fontWeight: '800' },
    waterSub: { fontSize: 12, fontWeight: '500' },
    waterValue: { fontSize: 24, fontWeight: '900' },
    waterControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    waterBtnNew: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    glassRow: { flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'center' },
    glassIndicator: { width: 8, height: 8, borderRadius: 4 },

    sectionTitle: { fontSize: 22, fontWeight: '900', marginBottom: SPACING.lg },
    mealCard: { padding: SPACING.lg, borderRadius: RADIUS.xl, borderWidth: 1, marginBottom: SPACING.md },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: SPACING.sm, borderBottomWidth: 1, marginBottom: SPACING.md },
    mealTitleRow: { flexDirection: 'row', alignItems: 'center' },
    mealIconImg: { width: 24, height: 24, marginRight: 12 },
    mealTitle: { fontSize: 17, fontWeight: '800' },
    mealKcal: { fontSize: 14, fontWeight: 'bold' },
    foodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    foodName: { fontSize: 15, fontWeight: '500' },
    foodCal: { fontSize: 13 },
    deleteIcon: { padding: 8, marginRight: -8 },
    emptyText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 4 },
});
