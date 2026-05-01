import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';

const { width } = Dimensions.get('window');

// ─── REAL EXERCISE DATABASE ───
const EXERCISE_DATA = {
    'Belly Fat': [
        { id: 'bf1', name: 'Mountain Climbers', sets: 3, reps: '30 sec', emoji: '🏔️', description: 'Start in plank position. Drive knees alternately toward chest as fast as possible. Keep core tight and hips level.' },
        { id: 'bf2', name: 'Bicycle Crunches', sets: 3, reps: '20 each side', emoji: '🚴', description: 'Lie on back, hands behind head. Bring opposite elbow to knee while extending the other leg. Alternate sides smoothly.' },
        { id: 'bf3', name: 'Plank Hold', sets: 3, reps: '45 sec', emoji: '🧘', description: 'Hold a forearm plank with body in a straight line. Engage your core and glutes. Don\'t let hips sag or pike up.' },
        { id: 'bf4', name: 'Russian Twists', sets: 3, reps: '20 total', emoji: '🔄', description: 'Sit with knees bent, lean back slightly. Rotate torso side to side, tapping the floor. Hold a weight for extra challenge.' },
        { id: 'bf5', name: 'Burpees', sets: 3, reps: '10', emoji: '💥', description: 'From standing, drop to push-up position, do a push-up, jump feet to hands, and explosively jump up with arms overhead.' },
        { id: 'bf6', name: 'Flutter Kicks', sets: 3, reps: '30 sec', emoji: '🦵', description: 'Lie on back, hands under glutes. Lift legs slightly off ground and alternate small kicks. Keep lower back pressed down.' },
    ],
    'Glutes': [
        { id: 'gl1', name: 'Hip Thrusts', sets: 4, reps: '12', emoji: '🍑', description: 'Sit with upper back against a bench. Drive hips upward squeezing glutes at top. Pause for 2 seconds, lower controlled.' },
        { id: 'gl2', name: 'Bulgarian Split Squats', sets: 3, reps: '10 each leg', emoji: '🦵', description: 'Place rear foot on bench. Lower until front thigh is parallel to ground. Push through front heel to stand back up.' },
        { id: 'gl3', name: 'Glute Bridges', sets: 3, reps: '15', emoji: '🌉', description: 'Lie on back, knees bent, feet flat. Drive hips up, squeezing glutes at top. Hold for 1 second then lower slowly.' },
        { id: 'gl4', name: 'Donkey Kicks', sets: 3, reps: '15 each leg', emoji: '🐴', description: 'On all fours, keep knee bent and lift one leg toward ceiling. Squeeze glute at top. Lower without touching knee down.' },
        { id: 'gl5', name: 'Sumo Squats', sets: 3, reps: '15', emoji: '🏋️', description: 'Stand with feet wider than shoulder-width, toes out. Squat deep keeping chest up and knees tracking over toes.' },
        { id: 'gl6', name: 'Fire Hydrants', sets: 3, reps: '12 each side', emoji: '🔥', description: 'On all fours, lift knee out to the side keeping it bent at 90°. Squeeze glute at top. Lower controlled.' },
    ],
    'Chest': [
        { id: 'ch1', name: 'Push-Ups', sets: 4, reps: '15', emoji: '💪', description: 'Hands shoulder-width apart, body straight. Lower chest to floor, push back up. Keep elbows at 45° angle.' },
        { id: 'ch2', name: 'Wide Push-Ups', sets: 3, reps: '12', emoji: '🤸', description: 'Hands placed wider than shoulders. Lower chest to floor focusing on chest stretch. Push up explosively.' },
        { id: 'ch3', name: 'Diamond Push-Ups', sets: 3, reps: '10', emoji: '💎', description: 'Form a diamond shape with hands under chest. Lower slowly, keep elbows close to body. Push up to starting position.' },
        { id: 'ch4', name: 'Decline Push-Ups', sets: 3, reps: '12', emoji: '📐', description: 'Feet elevated on bench or step. Perform push-ups targeting upper chest. Keep core tight throughout the movement.' },
        { id: 'ch5', name: 'Chest Dips', sets: 3, reps: '10', emoji: '⬇️', description: 'Using parallel bars or chair edges, lean forward slightly. Lower body by bending elbows, push back up. Focus on chest squeeze.' },
        { id: 'ch6', name: 'Incline Push-Ups', sets: 3, reps: '15', emoji: '📈', description: 'Hands on elevated surface like a bench. Perform push-ups with focus on lower chest. Great for beginners.' },
    ],
    'Arms': [
        { id: 'ar1', name: 'Tricep Dips', sets: 3, reps: '12', emoji: '💪', description: 'Using a chair or bench, lower body by bending elbows to 90°. Push back up focusing on triceps. Keep back close to edge.' },
        { id: 'ar2', name: 'Bicep Curl (Bodyweight)', sets: 3, reps: '15', emoji: '🦾', description: 'Use a towel looped under one foot. Curl the towel ends up like a bicep curl. Resist with your foot for tension.' },
        { id: 'ar3', name: 'Close-Grip Push-Ups', sets: 3, reps: '12', emoji: '🤏', description: 'Hands placed close together under chest. Lower body keeping elbows tight to ribs. Push up squeezing triceps.' },
        { id: 'ar4', name: 'Arm Circles', sets: 3, reps: '30 sec each direction', emoji: '🔄', description: 'Extend arms to sides at shoulder height. Make small circles forward, then reverse. Increase circle size gradually.' },
        { id: 'ar5', name: 'Plank Shoulder Taps', sets: 3, reps: '20 total', emoji: '👋', description: 'In high plank position, tap opposite shoulder with each hand alternately. Keep hips stable and core engaged throughout.' },
        { id: 'ar6', name: 'Inchworms', sets: 3, reps: '8', emoji: '🐛', description: 'From standing, walk hands out to plank position. Do a push-up if able. Walk hands back to feet and stand up.' },
    ],
    'Full Body': [
        { id: 'fb1', name: 'Burpees', sets: 4, reps: '10', emoji: '💥', description: 'From standing, drop to push-up position, do a push-up, jump feet to hands, and explosively jump up with arms overhead.' },
        { id: 'fb2', name: 'Jumping Jacks', sets: 3, reps: '30', emoji: '⭐', description: 'Start standing, jump while spreading legs and raising arms overhead. Jump back to starting position. Maintain steady pace.' },
        { id: 'fb3', name: 'Squat Jumps', sets: 3, reps: '12', emoji: '🦘', description: 'Perform a regular squat, then explosively jump up. Land softly and immediately go into next squat. Keep core engaged.' },
        { id: 'fb4', name: 'Bear Crawls', sets: 3, reps: '30 sec', emoji: '🐻', description: 'On all fours with knees hovering above ground. Crawl forward using opposite hand and foot. Keep back flat and hips low.' },
        { id: 'fb5', name: 'Thrusters', sets: 3, reps: '12', emoji: '🚀', description: 'Hold weight at shoulders, squat down. As you stand, press weight overhead in one fluid motion. Great compound movement.' },
        { id: 'fb6', name: 'High Knees', sets: 3, reps: '30 sec', emoji: '🏃', description: 'Run in place, driving knees as high as possible. Pump arms for momentum. Keep a fast pace for maximum calorie burn.' },
    ],
};

const CATEGORIES = [
    { key: 'Belly Fat', emoji: '🔥', color: '#ef4444' },
    { key: 'Glutes', emoji: '🍑', color: '#f59e0b' },
    { key: 'Chest', emoji: '💪', color: '#3b82f6' },
    { key: 'Arms', emoji: '🦾', color: '#8b5cf6' },
    { key: 'Full Body', emoji: '🏋️', color: COLORS.primary },
];

export default function ExerciseScreen() {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [completedExercises, setCompletedExercises] = useState({});
    const [workoutStarted, setWorkoutStarted] = useState(false);

    const toggleComplete = (id) => {
        setCompletedExercises(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const completedCount = selectedCategory
        ? EXERCISE_DATA[selectedCategory].filter(e => completedExercises[e.id]).length
        : 0;
    const totalCount = selectedCategory ? EXERCISE_DATA[selectedCategory].length : 0;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    const renderCategoryCard = ({ item }) => {
        const isSelected = selectedCategory === item.key;
        return (
            <TouchableOpacity
                style={[
                    styles.catCard,
                    isSelected && { borderColor: item.color, borderWidth: 2 },
                ]}
                onPress={() => {
                    setSelectedCategory(item.key);
                    setWorkoutStarted(false);
                    setCompletedExercises({});
                }}
                activeOpacity={0.7}
            >
                <Text style={styles.catEmoji}>{item.emoji}</Text>
                <Text style={styles.catLabel}>{item.key}</Text>
                <Text style={styles.catCount}>{EXERCISE_DATA[item.key].length} exercises</Text>
            </TouchableOpacity>
        );
    };

    const renderExercise = ({ item, index }) => {
        const isDone = completedExercises[item.id];
        return (
            <TouchableOpacity
                style={[styles.exerciseCard, isDone && styles.exerciseCardDone]}
                onPress={() => workoutStarted && toggleComplete(item.id)}
                activeOpacity={workoutStarted ? 0.7 : 1}
            >
                <View style={styles.exerciseLeft}>
                    <View style={[styles.exerciseNumber, isDone && { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.exerciseNumberText}>
                            {isDone ? '✓' : index + 1}
                        </Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, isDone && styles.exerciseNameDone]}>
                            {item.emoji} {item.name}
                        </Text>
                        <Text style={styles.exerciseMeta}>
                            {item.sets} sets × {item.reps}
                        </Text>
                        <Text style={styles.exerciseDesc} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Exercises</Text>
                    <Text style={styles.headerSub}>Select a target area to begin</Text>
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.catList}
                >
                    {CATEGORIES.map(item => (
                        <View key={item.key}>
                            {renderCategoryCard({ item })}
                        </View>
                    ))}
                </ScrollView>

                {/* Exercise List */}
                {selectedCategory ? (
                    <View style={styles.exerciseSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{selectedCategory}</Text>
                            {workoutStarted && (
                                <Text style={styles.progressText}>
                                    {completedCount}/{totalCount} done
                                </Text>
                            )}
                        </View>

                        {/* Progress Bar */}
                        {workoutStarted && (
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                            </View>
                        )}

                        {EXERCISE_DATA[selectedCategory].map((item, index) => (
                            <View key={item.id}>
                                {renderExercise({ item, index })}
                            </View>
                        ))}

                        {/* Action Button */}
                        {!workoutStarted ? (
                            <TouchableOpacity
                                style={styles.startBtn}
                                onPress={() => setWorkoutStarted(true)}
                            >
                                <Text style={styles.startBtnText}>🏁 Start Workout</Text>
                            </TouchableOpacity>
                        ) : completedCount === totalCount && totalCount > 0 ? (
                            <View style={styles.doneCard}>
                                <Text style={styles.doneEmoji}>🎉</Text>
                                <Text style={styles.doneTitle}>Workout Complete!</Text>
                                <Text style={styles.doneText}>
                                    You finished all {totalCount} exercises. Great job!
                                </Text>
                                <TouchableOpacity
                                    style={styles.resetBtn}
                                    onPress={() => {
                                        setWorkoutStarted(false);
                                        setCompletedExercises({});
                                    }}
                                >
                                    <Text style={styles.resetBtnText}>Start Over</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.tapHint}>Tap an exercise to mark it complete</Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>👆</Text>
                        <Text style={styles.emptyTitle}>Choose a Target Area</Text>
                        <Text style={styles.emptyText}>
                            Select a body part above to see exercises with sets, reps, and descriptions.
                        </Text>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
    headerTitle: { fontSize: FONT.title, fontWeight: FONT.black, color: COLORS.text },
    headerSub: { fontSize: FONT.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },

    catList: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
    catCard: {
        backgroundColor: COLORS.surface,
        width: 110,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    catEmoji: { fontSize: 28, marginBottom: SPACING.sm },
    catLabel: { color: COLORS.text, fontSize: FONT.sm, fontWeight: FONT.semibold, textAlign: 'center' },
    catCount: { color: COLORS.textSecondary, fontSize: FONT.xs, marginTop: SPACING.xs },

    exerciseSection: { paddingHorizontal: SPACING.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    sectionTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.text },
    progressText: { color: COLORS.primary, fontWeight: FONT.bold, fontSize: FONT.sm },

    progressBarContainer: {
        height: 6, backgroundColor: COLORS.surface, borderRadius: 3,
        marginBottom: SPACING.lg, overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%', backgroundColor: COLORS.primary, borderRadius: 3,
    },

    exerciseCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    exerciseCardDone: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    exerciseLeft: { flexDirection: 'row', alignItems: 'flex-start' },
    exerciseNumber: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, marginTop: 2,
    },
    exerciseNumberText: { color: COLORS.text, fontWeight: FONT.bold, fontSize: FONT.sm },
    exerciseInfo: { flex: 1 },
    exerciseName: { color: COLORS.text, fontSize: FONT.md, fontWeight: FONT.semibold, marginBottom: SPACING.xs },
    exerciseNameDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
    exerciseMeta: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.xs },
    exerciseDesc: { color: COLORS.textSecondary, fontSize: FONT.sm, lineHeight: 18 },

    startBtn: {
        backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.lg,
        alignItems: 'center', marginTop: SPACING.md, ...SHADOW.md,
    },
    startBtnText: { color: COLORS.textInverse, fontSize: FONT.lg, fontWeight: FONT.bold },

    tapHint: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.lg, fontSize: FONT.sm, fontStyle: 'italic' },

    doneCard: {
        backgroundColor: COLORS.primaryLight, padding: SPACING.xxl, borderRadius: RADIUS.xl,
        alignItems: 'center', marginTop: SPACING.md,
    },
    doneEmoji: { fontSize: 48, marginBottom: SPACING.md },
    doneTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.primary, marginBottom: SPACING.sm },
    doneText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: FONT.md, marginBottom: SPACING.lg },
    resetBtn: {
        backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    resetBtnText: { color: COLORS.textInverse, fontWeight: FONT.bold, fontSize: FONT.md },

    emptyState: {
        alignItems: 'center', paddingHorizontal: SPACING.xxxl,
        paddingVertical: 60,
    },
    emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
    emptyTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.text, marginBottom: SPACING.sm },
    emptyText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: FONT.md, lineHeight: 22 },
});
