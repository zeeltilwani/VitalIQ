import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { EXERCISES } from '../data/exercises';

export default function ExerciseListScreen({ route, navigation }) {
    const { bodyPart, user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const exercises = EXERCISES[bodyPart?.key] || [];

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{bodyPart?.emoji} {bodyPart?.label}</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{exercises.length} exercises • Tap to see details</Text>

                {exercises.map((ex, index) => (
                    <View key={ex.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.cardTop}>
                            <View style={[styles.numBadge, { backgroundColor: (bodyPart?.color || theme.primary) + '25' }]}>
                                <Text style={[styles.numText, { color: bodyPart?.color || theme.primary }]}>
                                    {index + 1}
                                </Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.exName, { color: theme.text }]}>{ex.emoji} {ex.name}</Text>
                                <Text style={[styles.exMeta, { color: theme.textSecondary }]}>
                                    {ex.sets} sets × {ex.reps} {ex.unit || 'reps'} • {ex.restSec}s rest
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.exDesc, { color: theme.textSecondary }]}>{ex.description}</Text>
                    </View>
                ))}

                {/* Start Button */}
                <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: bodyPart?.color || theme.primary }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('WorkoutMode', { bodyPart, exercises, user })}
                >
                    <Text style={styles.startBtnText}>🏁 Start Workout</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    backText: { fontSize: FONT.md, fontWeight: FONT.bold },
    headerTitle: { fontSize: FONT.lg, fontWeight: FONT.bold },
    inner: { padding: SPACING.xl },
    subtitle: { fontSize: FONT.sm, marginBottom: SPACING.xl },

    card: {
        borderRadius: RADIUS.xl, padding: SPACING.lg,
        marginBottom: SPACING.md, borderWidth: 1,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    numBadge: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    numText: { fontWeight: FONT.black, fontSize: FONT.md },
    cardInfo: { flex: 1 },
    exName: { fontSize: FONT.md, fontWeight: FONT.semibold },
    exMeta: { fontSize: FONT.xs, marginTop: SPACING.xs },
    exDesc: { fontSize: FONT.sm, lineHeight: 20, paddingLeft: 52 },

    startBtn: {
        padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center',
        marginTop: SPACING.lg, ...SHADOW.md,
    },
    startBtnText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },
});
