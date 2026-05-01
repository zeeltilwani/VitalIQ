import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, RADIUS, FONT } from '../theme';
import { MEAL_SUGGESTIONS } from '../data/exercises';
import { useTheme } from '../context/ThemeContext';

export default function SuggestionCard({ consumed, goal }) {
    const { theme } = useTheme();
    const remaining = goal - consumed;

    // If already exceeded, no suggestion
    if (remaining <= 0) {
        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.text }]}>🍽️ Meal Suggestion</Text>
                <View style={[styles.doneBox, { backgroundColor: theme.isDarkMode ? 'rgba(239, 83, 80, 0.12)' : '#fee2e2' }]}>
                    <Text style={styles.doneIcon}>🛑</Text>
                    <Text style={[styles.doneText, { color: theme.danger }]}>
                        You've hit your calorie limit for today. Stay hydrated and opt for zero-calorie drinks if hungry.
                    </Text>
                </View>
            </View>
        );
    }

    // Determine category
    let category, label;
    if (remaining < 200) {
        category = 'light';
        label = 'Light Snack';
    } else if (remaining <= 400) {
        category = 'balanced';
        label = 'Balanced Meal';
    } else {
        category = 'full';
        label = 'Full Meal';
    }

    const suggestions = MEAL_SUGGESTIONS[category] || [];

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: theme.text }]}>🍽️ Meal Suggestion</Text>
                <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>{remaining} kcal left</Text>
                </View>
            </View>

            <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
                Recommended: <Text style={[styles.categoryValue, { color: theme.primary }]}>{label}</Text>
            </Text>

            {suggestions.map((item, i) => (
                <View key={i} style={[styles.suggestionRow, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.suggestionName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.suggestionCal, { color: theme.textSecondary }]}>~{item.calories} kcal</Text>
                </View>
            ))}
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT.lg,
        fontWeight: FONT.bold,
    },
    badge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.pill,
    },
    badgeText: {
        fontSize: FONT.xs,
        fontWeight: FONT.bold,
    },
    categoryLabel: {
        fontSize: FONT.sm,
        marginBottom: SPACING.lg,
    },
    categoryValue: {
        fontWeight: FONT.bold,
    },
    suggestionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    suggestionName: {
        fontSize: FONT.md,
        flex: 1,
    },
    suggestionCal: {
        fontSize: FONT.sm,
        fontWeight: FONT.semibold,
    },
    doneBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginTop: SPACING.md,
    },
    doneIcon: { fontSize: 18, marginRight: SPACING.sm },
    doneText: {
        fontSize: FONT.sm,
        flex: 1,
        lineHeight: 19,
    },
});
