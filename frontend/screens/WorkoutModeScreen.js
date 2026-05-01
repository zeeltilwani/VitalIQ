import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';

export default function WorkoutModeScreen({ route, navigation }) {
    const { bodyPart, exercises, user } = route.params || {};
    const insets = useSafeAreaInsets();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef(null);

    const exercise = exercises?.[currentIndex];
    const totalExercises = exercises?.length || 0;
    const progress = totalExercises > 0 ? ((currentIndex) / totalExercises) * 100 : 0;

    // Gender-based GIF Logic
    const gender = user?.gender?.toLowerCase() === 'female' ? 'female' : 'male';
    // Mapping for gender-based exercise GIFs
    const getExerciseGif = (ex) => {
        if (!ex?.gifName) return null;
        // In a real app, these would be local assets or correctly structured CDN URLs
        return `https://vitaliq.app/assets/exercises/${gender}/${ex.gifName}_${gender}.gif`;
    };

    const gifUrl = getExerciseGif(exercise);

    // Timer logic
    useEffect(() => {
        if (isRunning && timer > 0) {
            intervalRef.current = setTimeout(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (isRunning && timer === 0) {
            Vibration.vibrate(200);
            setIsRunning(false);
            if (isResting) {
                setIsResting(false);
                handleNextSet();
            }
        }
        return () => clearTimeout(intervalRef.current);
    }, [isRunning, timer]);

    const startExerciseTimer = () => {
        if (exercise?.unit === 'sec') {
            setTimer(exercise.reps);
        } else {
            setTimer(45); // Default work timer for rep-based
        }
        setIsRunning(true);
    };

    const startRest = () => {
        setIsResting(true);
        setTimer(exercise?.restSec || 30);
        setIsRunning(true);
    };

    const handleNextSet = () => {
        setIsRunning(false);
        setIsResting(false);
        setTimer(0);
        
        if (currentSet < exercise.sets) {
            setCurrentSet(prev => prev + 1);
        } else {
            if (currentIndex + 1 < totalExercises) {
                animateTransition(() => {
                    setCurrentIndex(prev => prev + 1);
                    setCurrentSet(1);
                });
            } else {
                setIsComplete(true);
            }
        }
    };

    const handleDoneSet = () => {
        setIsRunning(false);
        if (currentSet < exercise.sets) {
            startRest();
        } else {
            handleNextSet();
        }
    };

    const handleSkip = () => {
        setIsRunning(false);
        setIsResting(false);
        if (currentIndex + 1 < totalExercises) {
            animateTransition(() => {
                setCurrentIndex(prev => prev + 1);
                setCurrentSet(1);
            });
        } else {
            setIsComplete(true);
        }
    };

    const animateTransition = (callback) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            callback();
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        });
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isComplete) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <Text style={styles.doneEmoji}>🎉</Text>
                <Text style={styles.doneTitle}>Workout Complete!</Text>
                <Text style={styles.doneSubtitle}>
                    {bodyPart?.emoji} {bodyPart?.label} — {totalExercises} exercises finished
                </Text>
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: bodyPart?.color || COLORS.primary }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.primaryBtnText}>Back to Exercises</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('MainApp', { screen: 'Workout' })}
                >
                    <Text style={styles.secondaryBtnText}>Choose Another Workout</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!exercise) return null;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>✕ Quit</Text>
                </TouchableOpacity>
                <Text style={styles.headerProgress}>
                    {currentIndex + 1}/{totalExercises}
                </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: bodyPart?.color || COLORS.primary }]} />
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Exercise Animation */}
                <View style={styles.gifContainer}>
                    {gifUrl ? (
                        <Image source={{ uri: gifUrl }} style={styles.exerciseGif} resizeMode="contain" />
                    ) : (
                        <Text style={styles.exerciseEmoji}>{exercise.emoji}</Text>
                    )}
                </View>

                {/* Exercise info */}
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDesc}>{exercise.description}</Text>
                </View>

                {/* Set indicator */}
                <View style={styles.setRow}>
                    {Array.from({ length: exercise.sets }, (_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.setDot,
                                i < currentSet - 1 && styles.setDotDone,
                                i === currentSet - 1 && styles.setDotActive,
                                { borderColor: bodyPart?.color || COLORS.primary },
                                i === currentSet - 1 && { backgroundColor: bodyPart?.color || COLORS.primary },
                            ]}
                        />
                    ))}
                </View>
                <Text style={styles.setLabel}>
                    Set {currentSet} of {exercise.sets} • {exercise.reps} {exercise.unit || 'reps'}
                </Text>

                {/* Timer / Status */}
                <View style={styles.timerBox}>
                    {isRunning ? (
                        <>
                            <Text style={styles.timerLabel}>{isResting ? '😮‍💨 Rest' : '🔥 Working'}</Text>
                            <Text style={[styles.timerValue, { color: bodyPart?.color || COLORS.primary }]}>
                                {formatTime(timer)}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.readyText}>
                            {isResting ? '😮‍💨 Resting...' : '👊 Ready?'}
                        </Text>
                    )}
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    {!isRunning && !isResting ? (
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: bodyPart?.color || COLORS.primary }]}
                            onPress={startExerciseTimer}
                        >
                            <Text style={styles.primaryBtnText}>▶ Start Set</Text>
                        </TouchableOpacity>
                    ) : isRunning && !isResting ? (
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: COLORS.warning }]}
                            onPress={handleDoneSet}
                        >
                            <Text style={styles.primaryBtnText}>✓ Complete Set {currentSet}</Text>
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                        <Text style={styles.skipBtnText}>Skip Exercise →</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    centerContent: { justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    },
    backText: { color: COLORS.danger, fontSize: FONT.md, fontWeight: FONT.bold },
    headerProgress: { color: COLORS.textSecondary, fontSize: FONT.md, fontWeight: FONT.semibold },

    progressBg: { height: 4, backgroundColor: COLORS.surfaceLight, marginHorizontal: SPACING.xl },
    progressFill: { height: '100%', borderRadius: 2 },

    content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },

    gifContainer: { height: 200, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
    exerciseGif: { width: '100%', height: '100%' },
    exerciseEmoji: { fontSize: 80 },

    exerciseHeader: { alignItems: 'center', marginBottom: SPACING.lg },
    exerciseName: { fontSize: FONT.title, fontWeight: FONT.black, color: COLORS.text, textAlign: 'center' },
    exerciseDesc: { color: COLORS.textSecondary, fontSize: FONT.sm, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20, paddingHorizontal: SPACING.xl },

    setRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.sm },
    setDot: {
        width: 14, height: 14, borderRadius: 7, marginHorizontal: 4,
        borderWidth: 2, borderColor: COLORS.border, backgroundColor: 'transparent',
    },
    setDotDone: { backgroundColor: COLORS.textSecondary, borderColor: COLORS.textSecondary },
    setDotActive: {},
    setLabel: { color: COLORS.textSecondary, fontSize: FONT.xs, textAlign: 'center', marginBottom: SPACING.xl },

    timerBox: { alignItems: 'center', marginBottom: SPACING.xl },
    timerLabel: { fontSize: FONT.lg, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    timerValue: { fontSize: 64, fontWeight: FONT.black },
    readyText: { fontSize: FONT.xxl, color: COLORS.text, fontWeight: FONT.bold },

    controls: { paddingBottom: SPACING.lg },
    primaryBtn: {
        padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center',
        marginBottom: SPACING.md, ...SHADOW.md,
    },
    primaryBtnText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },
    skipBtn: { alignItems: 'center', padding: SPACING.md },
    skipBtnText: { color: COLORS.textSecondary, fontSize: FONT.md, fontWeight: FONT.semibold },
    secondaryBtn: {
        padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center',
        marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.border, width: '100%',
    },
    secondaryBtnText: { color: COLORS.textSecondary, fontSize: FONT.md, fontWeight: FONT.semibold },

    doneEmoji: { fontSize: 80, marginBottom: SPACING.xl },
    doneTitle: { fontSize: FONT.title, fontWeight: FONT.black, color: COLORS.text, marginBottom: SPACING.sm },
    doneSubtitle: { color: COLORS.textSecondary, fontSize: FONT.md, marginBottom: SPACING.xxxl },
});
