import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { getExerciseAsset } from '../assets/exercises';

export default function WorkoutModeScreen({ route, navigation }) {
    const { exercises = [], user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const timerRef = useRef(null);

    const currentExercise = exercises[currentIndex];
    
    // ✅ TASK 2: TIMER SYSTEM (Exercise: 30s, Rest: 15s)
    const EXERCISE_TIME = 30;
    const REST_TIME = 15;

    // Pulse animation for active state
    useEffect(() => {
        if (!isResting) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isResting]);

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && timerActive) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            if (isResting) {
                handleRestFinished();
            } else {
                handleCompleteSet();
            }
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, timerActive, isResting]);

    // Start workout
    useEffect(() => {
        if (exercises.length > 0) {
            startExercise();
        }
    }, []);

    const startExercise = () => {
        setIsResting(false);
        setTimeLeft(EXERCISE_TIME);
        setTimerActive(true);
    };

    const handleCompleteSet = () => {
        if (currentSet < currentExercise.sets) {
            setIsResting(true);
            setTimeLeft(REST_TIME);
            setTimerActive(true);
        } else {
            handleNextExercise();
        }
    };

    const handleRestFinished = () => {
        setIsResting(false);
        setCurrentSet(prev => prev + 1);
        setTimeLeft(EXERCISE_TIME);
        setTimerActive(true);
    };

    const handleNextExercise = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setCurrentSet(1);
            setIsResting(false);
            setTimeLeft(EXERCISE_TIME);
            setTimerActive(true);
        } else {
            Alert.alert("Workout Finished! 🎉", "Great job! You've completed all exercises.", [
                { text: "Finish", onPress: () => navigation.navigate('MainApp', { screen: 'Home', params: { user, refresh: true } }) }
            ]);
        }
    };

    const skipRest = () => {
        clearInterval(timerRef.current);
        handleRestFinished();
    };

    const skipExercise = () => {
        clearInterval(timerRef.current);
        handleNextExercise();
    };

    const togglePause = () => {
        setTimerActive(prev => !prev);
    };

    const nextExercisePreview = currentIndex < exercises.length - 1 ? exercises[currentIndex + 1].name : 'Finish Workout';
    
    // Fallback logic for GIFs
    const exerciseAsset = currentExercise?.gifName 
        ? { uri: `https://raw.githubusercontent.com/vitaliq-assets/gifs/main/${currentExercise.gifName}.gif` } 
        : getExerciseAsset(currentExercise?.gifName); // Safe fallback using registry

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Text style={[styles.backText, { color: theme.danger }]}>✕ Exit</Text>
                </TouchableOpacity>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                        {currentIndex + 1} / {exercises.length} EXERCISES
                    </Text>
                    <View style={[styles.progressTrack, { backgroundColor: theme.surfaceLight }]}>
                        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / exercises.length) * 100}%`, backgroundColor: theme.primary }]} />
                    </View>
                </View>
                <TouchableOpacity onPress={togglePause} style={styles.headerBtn}>
                    <Text style={[styles.skipText, { color: theme.textSecondary }]}>
                        {timerActive ? '⏸ Pause' : '▶️ Resume'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Visual Area (GIF Animation) */}
                <View style={styles.visualContainer}>
                    <Animated.View style={[
                        styles.pulseCircle, 
                        { 
                            transform: [{ scale: timerActive ? pulseAnim : 1 }], 
                            borderColor: isResting ? theme.accent : theme.primary,
                            backgroundColor: theme.surface
                        }
                    ]}>
                        <Image 
                            source={exerciseAsset} 
                            style={styles.exerciseImage} 
                            resizeMode="contain"
                        />
                    </Animated.View>
                    <View style={[styles.statusBadge, { backgroundColor: isResting ? theme.accent : theme.primary }]}>
                        <Text style={[styles.statusText, { color: theme.textInverse }]}>{isResting ? 'RESTING' : 'ACTIVE'}</Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={[styles.name, { color: theme.text }]}>{currentExercise?.name}</Text>
                    <Text style={[styles.setInfo, { color: theme.textSecondary }]}>
                        SET {currentSet} OF {currentExercise?.sets}
                    </Text>
                    
                    {/* Timer */}
                    <View style={styles.timerContainer}>
                        <Text style={[styles.timerValue, { color: isResting ? theme.accent : theme.text }]}>
                            {timeLeft}s
                        </Text>
                        <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
                            {isResting ? 'Remaining Rest' : 'Exercise Time'}
                        </Text>
                    </View>
                    
                    {isResting && (
                        <View style={styles.upNextBox}>
                            <Text style={[styles.upNextLabel, { color: theme.textSecondary }]}>UP NEXT</Text>
                            <Text style={[styles.upNextText, { color: theme.primary }]}>{nextExercisePreview}</Text>
                        </View>
                    )}
                </View>

                {/* Footer Controls */}
                <View style={styles.footer}>
                    {isResting ? (
                        <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.accent }]} onPress={skipRest}>
                            <Text style={[styles.mainBtnText, { color: theme.textInverse }]}>Skip Rest ⏭</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.mainBtn, { backgroundColor: theme.primary }]} 
                            onPress={handleCompleteSet}
                        >
                            <Text style={[styles.mainBtnText, { color: theme.textInverse }]}>Complete Set ✅</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
    headerBtn: { padding: 4 },
    backText: { fontWeight: 'bold' },
    skipText: { fontSize: 14, fontWeight: 'bold' },
    progressHeader: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl },
    progressText: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
    progressTrack: { height: 4, width: '100%', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%' },
    
    content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'space-around', paddingBottom: 40 },
    
    visualContainer: { alignItems: 'center', marginTop: SPACING.md },
    pulseCircle: {
        width: 240, height: 240, borderRadius: 120,
        borderWidth: 6, justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden', ...SHADOW.lg,
    },
    exerciseImage: { width: '80%', height: '80%' },
    statusBadge: { position: 'absolute', bottom: -10, paddingHorizontal: 20, paddingVertical: 4, borderRadius: 12, ...SHADOW.sm },
    statusText: { fontSize: 12, fontWeight: '900' },

    infoSection: { alignItems: 'center' },
    name: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
    setInfo: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    timerContainer: { alignItems: 'center', marginTop: 20 },
    timerValue: { fontSize: 70, fontWeight: '900' },
    timerLabel: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    upNextBox: { marginTop: 20, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.lg },
    upNextLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    upNextText: { fontSize: 18, fontWeight: 'bold' },

    footer: { width: '100%' },
    mainBtn: { paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: 'center', ...SHADOW.md },
    mainBtnText: { fontSize: 20, fontWeight: 'bold' },
});
