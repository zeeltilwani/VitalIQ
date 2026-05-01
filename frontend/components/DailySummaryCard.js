import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme';

export default function DailySummaryCard({ consumed, goal }) {
    const { theme } = useTheme();
    const remaining = (goal || 0) - (consumed || 0);
    const exceeded = remaining < 0;
    const pct = Math.min(((consumed || 0) / (goal || 1)) * 100, 100);

    const insightBg = exceeded
        ? (theme.isDarkMode ? 'rgba(239,83,80,0.12)' : '#fee2e2')
        : (theme.isDarkMode ? 'rgba(76,175,80,0.12)' : '#dcfce7');

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>📊 Daily Summary</Text>

            <View style={styles.row}>
                <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: theme.text }]}>{consumed || 0}</Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Consumed</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: theme.text }]}>{goal || 0}</Text>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Goal</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: exceeded ? theme.danger : theme.text }]}>
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
            <View style={[styles.insightBox, { backgroundColor: insightBg }]}>
                <Text style={styles.insightIcon}>{exceeded ? '⚠️' : '✅'}</Text>
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
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
        borderWidth: 1,
    },
    title: { fontSize: FONT.lg, fontWeight: FONT.bold, marginBottom: SPACING.lg },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    metric: { alignItems: 'center', flex: 1 },
    metricValue: { fontSize: FONT.xl, fontWeight: FONT.black },
    metricLabel: { fontSize: FONT.xs, marginTop: SPACING.xs },
    divider: { height: 28, width: 1 },

    barBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: SPACING.lg },
    barFill: { height: '100%', borderRadius: 4 },

    insightBox: {
        flexDirection: 'row', alignItems: 'center',
        padding: SPACING.md, borderRadius: RADIUS.md,
    },
    insightIcon: { fontSize: 18, marginRight: SPACING.sm },
    insightText: { fontSize: FONT.sm, fontWeight: FONT.medium, flex: 1, lineHeight: 19 },
});
