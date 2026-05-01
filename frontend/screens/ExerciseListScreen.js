import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { EXERCISES } from '../data/exercises';

export default function ExerciseListScreen({ route, navigation }) {
    const { bodyPart, user } = route.params || {};
    const insets = useSafeAreaInsets();
    const exercises = EXERCISES[bodyPart?.key] || [];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{bodyPart?.emoji} {bodyPart?.label}</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
                <Text style={styles.subtitle}>{exercises.length} exercises • Tap to see details</Text>

                {exercises.map((ex, index) => (
                    <View key={ex.id} style={styles.card}>
                        <View style={styles.cardTop}>
                            <View style={[styles.numBadge, { backgroundColor: (bodyPart?.color || COLORS.primary) + '25' }]}>
                                <Text style={[styles.numText, { color: bodyPart?.color || COLORS.primary }]}>
                                    {index + 1}
                                </Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.exName}>{ex.emoji} {ex.name}</Text>
                                <Text style={styles.exMeta}>
                                    {ex.sets} sets × {ex.reps} {ex.unit || 'reps'} • {ex.restSec}s rest
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.exDesc}>{ex.description}</Text>
                    </View>
                ))}

                {/* Start Button */}
                <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: bodyPart?.color || COLORS.primary }]}
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
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface,
    },
    backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: FONT.bold },
    headerTitle: { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.text },
    inner: { padding: SPACING.xl },
    subtitle: { color: COLORS.textSecondary, fontSize: FONT.sm, marginBottom: SPACING.xl },

    card: {
        backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg,
        marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    numBadge: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    numText: { fontWeight: FONT.black, fontSize: FONT.md },
    cardInfo: { flex: 1 },
    exName: { color: COLORS.text, fontSize: FONT.md, fontWeight: FONT.semibold },
    exMeta: { color: COLORS.textSecondary, fontSize: FONT.xs, marginTop: SPACING.xs },
    exDesc: { color: COLORS.textSecondary, fontSize: FONT.sm, lineHeight: 20, paddingLeft: 52 },

    startBtn: {
        padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center',
        marginTop: SPACING.lg, ...SHADOW.md,
    },
    startBtnText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },
});
