import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme';
import { BODY_PARTS, EXERCISES } from '../data/exercises';

export default function WorkoutScreen({ route, navigation }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
                <Text style={[styles.title, { color: theme.text }]}>Workout</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Choose a target area to start training</Text>

                {BODY_PARTS.map((part) => {
                    const exerciseCount = EXERCISES[part.key]?.length || 0;
                    const totalSets = EXERCISES[part.key]?.reduce((a, e) => a + e.sets, 0) || 0;

                    return (
                        <TouchableOpacity
                            key={part.key}
                            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ExerciseList', { bodyPart: part, user })}
                        >
                            <View style={[styles.iconBox, { backgroundColor: part.color + '22' }]}>
                                <Text style={styles.cardEmoji}>{part.emoji}</Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>{part.label}</Text>
                                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{part.description}</Text>
                                <View style={styles.metaRow}>
                                    <View style={[styles.metaChip, { backgroundColor: theme.surfaceLight }]}>
                                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>{exerciseCount} exercises</Text>
                                    </View>
                                    <View style={[styles.metaChip, { backgroundColor: theme.surfaceLight }]}>
                                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>{totalSets} sets</Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { paddingHorizontal: SPACING.xl },
    title: { fontSize: FONT.title, fontWeight: FONT.black, marginTop: SPACING.md },
    subtitle: { fontSize: FONT.sm, marginTop: SPACING.xs, marginBottom: SPACING.xxl },

    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    iconBox: {
        width: 56, height: 56, borderRadius: RADIUS.lg,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.lg,
    },
    cardEmoji: { fontSize: 28 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: FONT.lg, fontWeight: FONT.bold },
    cardDesc: { fontSize: FONT.sm, marginTop: SPACING.xs },
    metaRow: { flexDirection: 'row', marginTop: SPACING.sm },
    metaChip: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, marginRight: SPACING.sm,
    },
    metaText: { fontSize: FONT.xs, fontWeight: FONT.medium },
    arrow: { fontSize: 28, fontWeight: '300' },
});
