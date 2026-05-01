import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

export default function AnalyticsScreen({ route, navigation }) {
    const { user } = route.params || {};
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [todaySummary, setTodaySummary] = useState({ calories: 0, water: 0 });
    const [weekTrend, setWeekTrend] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const [summaryRes, trendRes] = await Promise.all([
                api.get('/logs/summary'),
                api.get('/logs/trend'),
            ]);
            setTodaySummary(summaryRes.data);
            setWeekTrend(trendRes.data || []);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError(true);
            Alert.alert("Error", "Unable to load analytics data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Compute Insights ───
    const dailyGoal = user?.daily_calorie_goal || 2000;
    const remaining = dailyGoal - todaySummary.calories;
    const pct = Math.min(Math.round((todaySummary.calories / dailyGoal) * 100), 100);

    // Weekly stats
    const daysLogged = weekTrend.length;
    const avgCalories = daysLogged > 0
        ? Math.round(weekTrend.reduce((s, d) => s + parseInt(d.calories || 0), 0) / daysLogged)
        : 0;
    const consistency = Math.round((daysLogged / 7) * 100);

    // ─── Smart Suggestions ───
    const suggestions = [];
    if (todaySummary.calories > dailyGoal) {
        suggestions.push({ icon: '⚠️', text: 'You exceeded your goal. Try lighter meals tomorrow.', color: theme.danger });
    }
    if (todaySummary.calories < dailyGoal * 0.5 && todaySummary.calories > 0) {
        suggestions.push({ icon: '🍽️', text: 'You\'re under-eating. Make sure to fuel your body.', color: '#f59e0b' });
    }
    if (todaySummary.water < 1500) {
        suggestions.push({ icon: '💧', text: 'Drink more water — aim for 8 glasses daily.', color: '#3b82f6' });
    }
    if (avgCalories > dailyGoal * 1.1 && daysLogged >= 3) {
        suggestions.push({ icon: '📉', text: 'Weekly average is above goal. Reduce carbs or portion sizes.', color: '#f97316' });
    }
    if (avgCalories > 0 && avgCalories <= dailyGoal) {
        suggestions.push({ icon: '✅', text: 'Your weekly average is on target. Great consistency!', color: theme.primary });
    }
    suggestions.push({ icon: '💪', text: 'Increase protein intake to preserve muscle during weight management.', color: '#8b5cf6' });
    if (consistency < 70) {
        suggestions.push({ icon: '📅', text: `You logged ${daysLogged}/7 days this week. Log daily for better insights.`, color: '#f59e0b' });
    }

    const maxCal = Math.max(dailyGoal, ...weekTrend.map(d => parseInt(d.calories || 0)));

    if (loading) {
        return <View style={[styles.loadingBox, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>📊 Analytics</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>⚠️ Could not load data. Pull down to retry.</Text>
                    </View>
                )}

                {/* ─── Today's Summary ─── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Today's Overview</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>{todaySummary.calories}</Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Consumed</Text>
                        </View>
                        <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: theme.text }, remaining < 0 && { color: theme.danger }]}>
                                {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
                            </Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{remaining < 0 ? 'Over' : 'Left'}</Text>
                        </View>
                        <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>{pct}%</Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Of Goal</Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={[styles.progressBg, { backgroundColor: theme.surfaceLight }]}>
                        <View style={[
                            styles.progressFill,
                            { width: `${pct}%`, backgroundColor: theme.primary },
                            remaining < 0 && { backgroundColor: theme.danger },
                        ]} />
                    </View>
                </View>

                {/* ─── Weekly Consistency ─── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>Weekly Consistency</Text>
                    <View style={styles.weekStats}>
                        <View style={styles.weekStat}>
                            <Text style={[styles.weekStatVal, { color: theme.text }]}>{daysLogged}/7</Text>
                            <Text style={[styles.weekStatLabel, { color: theme.textSecondary }]}>Days Logged</Text>
                        </View>
                        <View style={styles.weekStat}>
                            <Text style={[styles.weekStatVal, { color: theme.text }]}>{avgCalories}</Text>
                            <Text style={[styles.weekStatLabel, { color: theme.textSecondary }]}>Avg kcal/day</Text>
                        </View>
                        <View style={styles.weekStat}>
                            <Text style={[styles.weekStatVal, { color: consistency >= 70 ? theme.primary : '#f59e0b' }]}>
                                {consistency}%
                            </Text>
                            <Text style={[styles.weekStatLabel, { color: theme.textSecondary }]}>Consistency</Text>
                        </View>
                    </View>

                    {/* Mini bar chart */}
                    <View style={styles.barChart}>
                        {weekTrend.map((day, i) => {
                            const cals = parseInt(day.calories || 0);
                            const barH = maxCal > 0 ? (cals / maxCal) * 100 : 0;
                            const overGoal = cals > dailyGoal;
                            const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                            return (
                                <View key={i} style={styles.barCol}>
                                    <Text style={[styles.barValue, { color: theme.textSecondary }]}>{cals}</Text>
                                    <View style={[styles.barTrack, { backgroundColor: theme.surfaceLight }]}>
                                        <View style={[
                                            styles.barFill,
                                            { height: `${barH}%`, backgroundColor: theme.primary },
                                            overGoal && { backgroundColor: theme.danger },
                                        ]} />
                                    </View>
                                    <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{dayName}</Text>
                                </View>
                            );
                        })}
                        {weekTrend.length === 0 && (
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No data this week. Start logging!</Text>
                        )}
                    </View>

                    {/* Goal line */}
                    {weekTrend.length > 0 && (
                        <Text style={[styles.goalLine, { color: theme.textSecondary }]}>── Goal: {dailyGoal} kcal/day ──</Text>
                    )}
                </View>

                {/* ─── Water Summary ─── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>💧 Hydration</Text>
                    <View style={styles.waterRow}>
                        <Text style={[styles.waterVal, { color: theme.text }]}>{todaySummary.water} ml</Text>
                        <Text style={[styles.waterLabel, { color: theme.textSecondary }]}> consumed today</Text>
                    </View>
                    <View style={[styles.progressBg, { backgroundColor: theme.surfaceLight }]}>
                        <View style={[
                            styles.progressFill,
                            { width: `${Math.min((todaySummary.water / 2000) * 100, 100)}%`, backgroundColor: '#3b82f6' },
                        ]} />
                    </View>
                    <Text style={[styles.waterGoalText, { color: theme.textSecondary }]}>{Math.max(2000 - todaySummary.water, 0)} ml remaining (target: 2L)</Text>
                </View>

                {/* ─── Smart Suggestions ─── */}
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.primary }]}>🧠 Smart Insights</Text>
                    {suggestions.map((s, i) => (
                        <View key={i} style={styles.suggRow}>
                            <Text style={styles.suggIcon}>{s.icon}</Text>
                            <Text style={[styles.suggText, { color: s.color }]}>{s.text}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    backText: { fontSize: FONT.md, fontWeight: FONT.bold },
    headerTitle: { fontSize: FONT.lg, fontWeight: FONT.bold },
    inner: { padding: SPACING.xl },

    errorBox: {
        backgroundColor: COLORS.dangerLight, padding: SPACING.md, borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
    },
    errorText: { color: COLORS.danger, fontSize: FONT.sm, textAlign: 'center' },

    card: {
        padding: SPACING.xl, borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg, borderWidth: 1,
    },
    cardTitle: {
        fontSize: FONT.sm, fontWeight: FONT.bold,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.lg,
    },

    // Summary
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryDivider: { height: 30, width: 1 },
    summaryValue: { fontSize: FONT.xxl, fontWeight: FONT.black },
    summaryLabel: { fontSize: FONT.xs, marginTop: SPACING.xs },

    progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },

    // Week
    weekStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.xl },
    weekStat: { alignItems: 'center' },
    weekStatVal: { fontSize: FONT.xl, fontWeight: FONT.black },
    weekStatLabel: { fontSize: FONT.xs, marginTop: SPACING.xs },

    // Bar chart
    barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, marginBottom: SPACING.md },
    barCol: { alignItems: 'center', flex: 1 },
    barValue: { fontSize: 9, marginBottom: 3 },
    barTrack: { width: 20, height: 80, borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end' },
    barFill: { width: '100%', borderRadius: 10 },
    barLabel: { fontSize: 10, marginTop: 4 },
    goalLine: { fontSize: FONT.xs, textAlign: 'center', marginTop: SPACING.sm },
    emptyText: { fontSize: FONT.sm, textAlign: 'center', paddingVertical: SPACING.xxl },

    // Water
    waterRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
    waterVal: { fontSize: FONT.xxl, fontWeight: FONT.black },
    waterLabel: { fontSize: FONT.sm },
    waterGoalText: { fontSize: FONT.xs, marginTop: SPACING.sm },

    // Suggestions
    suggRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
    suggIcon: { fontSize: 18, marginRight: SPACING.md, marginTop: 1 },
    suggText: { fontSize: FONT.sm, flex: 1, lineHeight: 20 },
});
