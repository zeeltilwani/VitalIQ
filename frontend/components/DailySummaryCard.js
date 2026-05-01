import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function DailySummaryCard({ consumed, goal }) {
    const { theme } = useTheme();
    const remaining = goal - consumed;
    const exceeded = remaining < 0;
    const pct = Math.min((consumed / goal) * 100, 100);

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>📊 Daily Summary</Text>

            <View style={styles.row}>
                <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: theme.text }]}>{consumed}</Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Consumed</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: theme.text }]}>{goal}</Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Goal</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.metric}>
                    <Text style={[styles.metricValue, exceeded ? { color: theme.danger } : { color: theme.text }]}>
                        {exceeded ? `+${Math.abs(remaining)}` : remaining}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{exceeded ? 'Over' : 'Left'}</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.barBg, { backgroundColor: theme.surfaceLight }]}>
                <View style={[
                    styles.barFill,
                    { width: `${pct}%`, backgroundColor: exceeded ? theme.danger : theme.primary }
                ]} />
            </View>

            {/* Smart Insight */}
            <View style={[
                styles.insightBox, 
                { backgroundColor: exceeded ? (theme.isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2') : (theme.isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#dcfce7') }
            ]}>
                <Text style={[styles.insightIcon]}>
                    {exceeded ? '⚠️' : '✅'}
                </Text>
                <Text style={[styles.insightText, { color: exceeded ? theme.danger : theme.success }]}>
                    {exceeded
                        ? `You exceeded your goal by ${Math.abs(remaining)} kcal. Try lighter meals tomorrow.`
                        : remaining < 200
                            ? `Almost there! Only ${remaining} kcal left for today.`
                            : `You're on track! ${remaining} kcal remaining. Keep it up!`
                    }
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        color: COLORS.text,
        fontSize: FONT.lg,
        fontWeight: FONT.bold,
        marginBottom: SPACING.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    metric: { alignItems: 'center', flex: 1 },
    metricValue: {
        color: COLORS.text,
        fontSize: FONT.xl,
        fontWeight: FONT.black,
    },
    metricLabel: {
        color: COLORS.textSecondary,
        fontSize: FONT.xs,
        marginTop: SPACING.xs,
    },
    exceeded: { color: COLORS.danger },
    divider: { height: 28, width: 1, backgroundColor: COLORS.border },

    barBg: {
        height: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    barFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    barExceeded: { backgroundColor: COLORS.danger },

    insightBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
    },
    insightGood: { backgroundColor: COLORS.primaryLight },
    insightWarn: { backgroundColor: COLORS.dangerLight },
    insightIcon: { fontSize: 18, marginRight: SPACING.sm },
    insightText: {
        color: COLORS.primary,
        fontSize: FONT.sm,
        fontWeight: FONT.medium,
        flex: 1,
        lineHeight: 19,
    },
});
