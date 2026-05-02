import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Dimensions, Animated, Image
} from 'react-native';
import { 
    Flame, 
    Dumbbell, 
    Activity, 
    Target, 
    Trophy, 
    ChevronRight,
    CircleDashed,
    CheckCircle2
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { getExerciseAsset } from '../assets/exercises';

const { width } = Dimensions.get('window');

// ─── REAL EXERCISE DATABASE ───
const EXERCISE_DATA = {
    'Belly Fat': [
        { id: 'bf1', name: 'Mountain Climbers', sets: 3, reps: '30 sec', gifName: 'mountain_climbers', description: 'Start in plank position. Drive knees alternately toward chest as fast as possible. Keep core tight and hips level.' },
        { id: 'bf2', name: 'Bicycle Crunches', sets: 3, reps: '20 each side', gifName: 'bicycle_crunches', description: 'Lie on back, hands behind head. Bring opposite elbow to knee while extending the other leg. Alternate sides smoothly.' },
        { id: 'bf3', name: 'Plank Hold', sets: 3, reps: '45 sec', gifName: 'plank', description: 'Hold a forearm plank with body in a straight line. Engage your core and glutes. Don\'t let hips sag or pike up.' },
        { id: 'bf4', name: 'Russian Twists', sets: 3, reps: '20 total', gifName: 'russian_twists', description: 'Sit with knees bent, lean back slightly. Rotate torso side to side, tapping the floor. Hold a weight for extra challenge.' },
        { id: 'bf5', name: 'Burpees', sets: 3, reps: '10', gifName: 'burpees', description: 'From standing, drop to push-up position, do a push-up, jump feet to hands, and explosively jump up with arms overhead.' },
        { id: 'bf6', name: 'Flutter Kicks', sets: 3, reps: '30 sec', gifName: 'leg_raises', description: 'Lie on back, hands under glutes. Lift legs slightly off ground and alternate small kicks. Keep lower back pressed down.' },
    ],
    'Legs': [
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
    { key: 'Belly Fat', icon: Flame, color: '#ef4444', image: 'cat_belly' },
    { key: 'Chest', icon: Dumbbell, color: '#3b82f6', image: 'cat_chest' },
    { key: 'Arms', icon: Activity, color: '#8b5cf6', image: 'cat_arms' },
    { key: 'Legs', icon: Target, color: '#f59e0b', image: 'cat_legs' },
    { key: 'Full Body', icon: Trophy, color: 'primary', image: 'cat_fullbody' },
];

export default function ExerciseScreen() {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
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
        const itemColor = item.color === 'primary' ? theme.primary : item.color;
        const Icon = item.icon;
        const scale = new Animated.Value(1);

        const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
        const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

        return (
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => {
                    setSelectedCategory(item.key);
                    setWorkoutStarted(false);
                    setCompletedExercises({});
                }}
            >
                <Animated.View
                    style={[
                        styles.catCard,
                        { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ scale }] },
                        isSelected && { borderColor: itemColor, borderWidth: 2 },
                    ]}
                >
                    <View style={[styles.categoryIcon, { backgroundColor: isSelected ? '#fff' : theme.surfaceLight }]}>
                        {item.image ? (
                            <Image 
                                source={getExerciseAsset(item.image)} 
                                style={{ width: 24, height: 24 }} 
                                resizeMode="contain"
                            />
                        ) : (
                            <Icon size={24} color={isSelected ? itemColor : theme.textSecondary} />
                        )}
                    </View>
                    <Text style={[styles.catLabel, { color: theme.text }]}>{item.key}</Text>
                    <Text style={[styles.catCount, { color: theme.textSecondary }]}>{EXERCISE_DATA[item.key].length} exercises</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderExercise = ({ item, index }) => {
        const isDone = completedExercises[item.id];
        return (
            <TouchableOpacity
                style={[
                    styles.exerciseCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isDone && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }
                ]}
                onPress={() => workoutStarted && toggleComplete(item.id)}
                activeOpacity={workoutStarted ? 0.7 : 1}
            >
                <View style={styles.exerciseLeft}>
                    <View style={[
                        styles.exerciseNumber, 
                        { borderColor: theme.border, borderWidth: 1.5 }, 
                        isDone && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}>
                        {isDone ? (
                            <CheckCircle2 size={16} color="#fff" />
                        ) : (
                            item.gifName && getExerciseAsset(item.gifName) !== getExerciseAsset('default') ? (
                                <Image 
                                    source={getExerciseAsset(item.gifName)} 
                                    style={{ width: 24, height: 24, borderRadius: 12 }} 
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={[styles.exerciseNumberText, { color: theme.text }]}>{index + 1}</Text>
                            )
                        )}
                    </View>
                    <View style={styles.exerciseInfo}>
                        <Text style={[styles.exerciseName, { color: theme.text }, isDone && { textDecorationLine: 'line-through', color: theme.textSecondary }]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.exerciseMeta, { color: theme.primary }]}>
                            {item.sets} sets × {item.reps}
                        </Text>
                        <Text style={[styles.exerciseDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={theme.textSecondary} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Exercises</Text>
                    <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Select a target area to begin</Text>
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
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{selectedCategory}</Text>
                            {workoutStarted && (
                                <Text style={[styles.progressText, { color: theme.primary }]}>
                                    {completedCount}/{totalCount} done
                                </Text>
                            )}
                        </View>

                        {/* Progress Bar */}
                        {workoutStarted && (
                            <View style={[styles.progressBarContainer, { backgroundColor: theme.surface }]}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
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
                                style={[styles.startBtn, { backgroundColor: theme.primary }]}
                                onPress={() => setWorkoutStarted(true)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Trophy size={20} color={theme.textInverse} style={{ marginRight: 8 }} />
                                    <Text style={[styles.startBtnText, { color: theme.textInverse }]}>Start Workout</Text>
                                </View>
                            </TouchableOpacity>
                        ) : completedCount === totalCount && totalCount > 0 ? (
                            <View style={[styles.doneCard, { backgroundColor: theme.primary + '15' }]}>
                                <Trophy size={48} color={theme.primary} style={{ marginBottom: 16 }} />
                                <Text style={[styles.doneTitle, { color: theme.primary }]}>Workout Complete!</Text>
                                <Text style={[styles.doneText, { color: theme.textSecondary }]}>
                                    You finished all {totalCount} exercises. Great job!
                                </Text>
                                <TouchableOpacity
                                    style={[styles.resetBtn, { backgroundColor: theme.primary }]}
                                    onPress={() => {
                                        setWorkoutStarted(false);
                                        setCompletedExercises({});
                                    }}
                                >
                                    <Text style={[styles.resetBtnText, { color: theme.textInverse }]}>Start Over</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={[styles.tapHint, { color: theme.textSecondary }]}>Tap an exercise to mark it complete</Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Activity size={48} color={theme.textSecondary} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>Choose a Target Area</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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
    container: { flex: 1 },
    header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
    headerTitle: { fontSize: FONT.title, fontWeight: FONT.black },
    headerSub: { fontSize: FONT.sm, marginTop: SPACING.xs },

    catList: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
    catCard: {
        width: 110,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
    },
    catIconContainer: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: SPACING.md,
    },
    catEmoji: { fontSize: 28, marginBottom: SPACING.sm },
    catLabel: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
    catCount: { fontSize: 11, marginTop: 4, fontWeight: '600' },

    exerciseSection: { paddingHorizontal: SPACING.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    sectionTitle: { fontSize: FONT.xl, fontWeight: FONT.bold },
    progressText: { fontWeight: FONT.bold, fontSize: FONT.sm },

    progressBarContainer: {
        height: 6, borderRadius: 3,
        marginBottom: SPACING.lg, overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%', borderRadius: 3,
    },

    exerciseCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
    },
    exerciseLeft: { flexDirection: 'row', alignItems: 'flex-start' },
    exerciseNumber: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, marginTop: 2,
    },
    exerciseNumberText: { fontWeight: FONT.bold, fontSize: 14 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: FONT.md, fontWeight: FONT.semibold, marginBottom: SPACING.xs },
    exerciseMeta: { fontSize: FONT.sm, fontWeight: FONT.medium, marginBottom: SPACING.xs },
    exerciseDesc: { fontSize: FONT.sm, lineHeight: 18 },

    startBtn: {
        padding: SPACING.lg, borderRadius: RADIUS.lg,
        alignItems: 'center', marginTop: SPACING.md, ...SHADOW.md,
    },
    startBtnText: { fontSize: FONT.lg, fontWeight: FONT.bold },

    tapHint: { textAlign: 'center', marginTop: SPACING.lg, fontSize: FONT.sm, fontStyle: 'italic' },

    doneCard: {
        padding: SPACING.xxl, borderRadius: RADIUS.xl,
        alignItems: 'center', marginTop: SPACING.md,
    },
    doneEmoji: { fontSize: 48, marginBottom: SPACING.md },
    doneTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, marginBottom: SPACING.sm },
    doneText: { textAlign: 'center', fontSize: FONT.md, marginBottom: SPACING.lg },
    resetBtn: {
        paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    resetBtnText: { fontWeight: FONT.bold, fontSize: FONT.md },

    emptyState: {
        alignItems: 'center', paddingHorizontal: SPACING.xxxl,
        paddingVertical: 60,
    },
    emptyEmoji: { fontSize: 48, marginBottom: SPACING.lg },
    emptyTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, marginBottom: SPACING.sm },
    emptyText: { textAlign: 'center', fontSize: FONT.md, lineHeight: 22 },
});
