import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Alert, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Video, ResizeMode } from 'expo-av';
import { Info, Video as VideoIcon, Square, Pause, Play, ChevronLast } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW, COLORS } from '../theme';
import PressableButton from '../components/PressableButton';
import { getExerciseAsset } from '../assets/exercises';

const VIDEO_ASSETS = {
    crunches_female: require('../assets/videos/crunches_female.mp4'),
    bicycle_crunch_woman: require('../assets/videos/bicycle_crunch_woman.mp4'),
    Mountain_climb_man: require('../assets/videos/Mountain_climb_man.mp4'),
    leg_raises_woman: require('../assets/videos/leg_raises_woman.mp4'),
    plank_hold_woman: require('../assets/videos/plank_hold_woman.mp4'),
    russian_twist_woman: require('../assets/videos/russian_twist_woman.mp4'),
    pushups: require('../assets/videos/pushups.mp4'),
    wide_pushups: require('../assets/videos/wide_pushups.mp4'),
    diamond_pushup: require('../assets/videos/diamond_pushup.mp4'),
    decline_pushups: require('../assets/videos/decline_pushups.mp4'),
    chest_dips_man: require('../assets/videos/chest_dips_man.mp4'),
    incline_pushups_woman: require('../assets/videos/incline_pushups_woman.mp4'),
    tricep_dips: require('../assets/videos/tricep_dips.mp4'),
    close_grip_pushups: require('../assets/videos/close_grip_pushups.mp4'),
    squats: require('../assets/videos/squats.mp4'),
    pike_pushups: require('../assets/videos/pike_pushups.mp4'),
    arm_circles: require('../assets/videos/arm_circles.mp4'),
    shoulder_taps: require('../assets/videos/shoulder_taps.mp4'),
    inchworms: require('../assets/videos/inchworms.mp4'),
    calf_raises: require('../assets/videos/calf_raises.mp4'),
    glute_bridges: require('../assets/videos/glute_bridges.mp4'),
    high_knees: require('../assets/videos/high_knees.mp4'),
    jump_squats: require('../assets/videos/jump_squats.mp4'),
    jumping_jacks: require('../assets/videos/jumping_jacks.mp4'),
    lunges: require('../assets/videos/lunges.mp4'),
    plank_jacks: require('../assets/videos/plank_jacks.mp4'),
    squat_press: require('../assets/videos/squat_press.mp4'),
    bear_crawls: require('../assets/videos/bear_crawls.mp4'),
    burpees: require('../assets/videos/burpees.mp4'),
    wall_sit: require('../assets/videos/wall_sit.mp4'),
};

export default function ExerciseTimerScreen({ route, navigation }) {
    const { exercises = [], currentIndex = 0, user, bodyPart, initialSet = 1 } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const currentExercise = exercises[currentIndex];
    const initialTime = (currentExercise?.unit === 'sec' || currentExercise?.unit === 'seconds') 
        ? currentExercise.reps 
        : 30; // Default for rep-based exercises

    const [currentSet, setCurrentSet] = useState(initialSet);
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [timerActive, setTimerActive] = useState(true);
    const [isReady, setIsReady] = useState(true);
    const [readyCount, setReadyCount] = useState(3);
    const [showVideo, setShowVideo] = useState(false);
    
    const totalSets = currentExercise?.sets || 1;
    
    const timerRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // 1. Global Cleanup on Unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    // 2. Main Timer Logic
    useEffect(() => {
        if (!timerActive) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        if (isReady) {
            if (readyCount > 0) {
                const id = setInterval(() => {
                    setReadyCount(prev => prev - 1);
                }, 1000);
                return () => clearInterval(id);
            } else {
                setIsReady(false);
            }
        } else {
            if (timeLeft > 0) {
                // Clear any existing interval before starting a new one
                if (timerRef.current) clearInterval(timerRef.current);
                
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => prev - 1);
                }, 1000);
                return () => {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                };
            } else if (timeLeft === 0) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                handleSetComplete();
            }
        }
    }, [timerActive, isReady, readyCount, timeLeft]);

    useEffect(() => {
        if (timerActive) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [timerActive]);

    const handleSetComplete = () => {
        setTimerActive(false);
        if (currentSet < totalSets) {
            navigation.navigate('RestScreen', {
                exercises,
                currentIndex,
                currentSet,
                totalSets,
                bodyPart,
                user
            });
        } else {
            handleExerciseComplete();
        }
    };

    const handleExerciseComplete = () => {
        if (currentIndex < exercises.length - 1) {
            // Next Exercise Intro
            navigation.navigate('ExerciseIntro', {
                exercise: exercises[currentIndex + 1],
                exercises,
                currentIndex: currentIndex + 1,
                bodyPart,
                user
            });
        } else {
            // All exercises complete
            Alert.alert("Workout Finished! 🎉", "Great job! You've completed your training session.", [
                { text: "Finish", onPress: () => navigation.navigate('MainApp', { screen: 'Home', params: { user } }) }
            ]);
        }
    };

    const togglePause = () => {
        if (timerActive && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimerActive(!timerActive);
    };

    // Prioritize local registry image (PNG/JPG) over remote GIFs
    const localAsset = getExerciseAsset(currentExercise?.gifName);
    const exerciseAsset = localAsset 
        ? localAsset 
        : { uri: `https://raw.githubusercontent.com/vitaliq-assets/gifs/main/${currentExercise?.gifName}.gif` };

    const circumference = 2 * Math.PI * 90;
    const progress = timeLeft / initialTime;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={[styles.container, { backgroundColor: '#000', paddingTop: insets.top }]}>
            {/* Header / Progress */}
            <View style={styles.header}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: '#fff' }]}>
                        EXERCISE {currentIndex + 1} OF {exercises.length}
                    </Text>
                    <View style={[styles.progressTrack, { backgroundColor: '#222' }]}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: `${((currentIndex + 1) / exercises.length) * 100}%`, 
                                    backgroundColor: theme.primary 
                                }
                            ]} 
                        />
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {/* Visual Area */}
                <View style={styles.visualSection}>
                    {showVideo && currentExercise?.videoSource ? (
                        <View style={styles.videoContainer}>
                            <Video
                                source={VIDEO_ASSETS[currentExercise.videoSource]}
                                style={styles.video}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay
                                isMuted={true}
                            />
                            <TouchableOpacity 
                                style={styles.closeVideoBtn} 
                                onPress={() => setShowVideo(false)}
                            >
                                <Text style={styles.closeVideoText}>Close Video</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.timerCircleContainer}>
                            <Svg width="200" height="200" style={styles.svg}>
                                <Circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke="#222"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <Circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    stroke={theme.primary}
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                />
                            </Svg>
                            <View style={styles.innerCircle}>
                                <Image source={exerciseAsset} style={styles.exerciseImage} resizeMode="contain" />
                            </View>
                        </View>
                    )}

                    <View style={styles.infoRow}>
                        <View style={{ width: 60 }} />

                        <View style={styles.exerciseTitleArea}>
                            <Text style={[styles.exerciseName, { color: '#fff' }]}>{currentExercise?.name}</Text>
                            <Text style={[styles.setInfo, { color: theme.textSecondary }]}>
                                SET {currentSet} OF {totalSets}
                            </Text>
                        </View>

                        <TouchableOpacity 
                            style={[styles.secondaryCircleBtn, showVideo && { backgroundColor: theme.primary + '33' }]}
                            onPress={() => setShowVideo(!showVideo)}
                        >
                            <VideoIcon size={20} color={theme.primary} />
                            <Text style={styles.btnSubText}>{showVideo ? 'Hide' : 'Video'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Timer */}
                <View style={styles.timerWrapper}>
                    <Animated.Text 
                        style={[
                            styles.timerValue, 
                            { color: '#fff', transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        {timeLeft}
                    </Animated.Text>
                    <Text style={[styles.timerUnit, { color: theme.textSecondary }]}>SECONDS</Text>
                </View>

                {/* Controls */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity 
                        style={[styles.controlCircleBtn, { borderColor: theme.danger }]} 
                        onPress={() => {
                            // Stop timer immediately
                            if (timerRef.current) {
                                clearInterval(timerRef.current);
                                timerRef.current = null;
                            }
                            setTimerActive(false);
                            
                            navigation.replace('ExerciseIntro', { 
                                exercise: currentExercise, 
                                exercises, 
                                currentIndex, 
                                bodyPart, 
                                user 
                            });
                        }}
                    >
                        <Square size={24} color={theme.danger} fill={theme.danger} />
                        <Text style={[styles.controlLabel, { color: '#fff' }]}>End</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.pauseBtn, { backgroundColor: theme.primary }]} 
                        onPress={togglePause}
                    >
                        {timerActive ? <Pause size={32} color="#fff" fill="#fff" /> : <Play size={32} color="#fff" fill="#fff" />}
                        <Text style={styles.pauseBtnText}>{timerActive ? "Pause" : "Resume"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.controlCircleBtn, { borderColor: theme.primary }]} 
                        onPress={handleSetComplete}
                    >
                        <ChevronLast size={32} color={theme.primary} />
                        <Text style={[styles.controlLabel, { color: '#fff' }]}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {isReady && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }]}>
                    <Text style={{ color: theme.primary, fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 20 }}>GET READY</Text>
                    <Text style={{ color: '#fff', fontSize: 150, fontWeight: '900' }}>{readyCount}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 18, marginTop: 20, fontWeight: 'bold' }}>{currentExercise?.name}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
    progressHeader: { width: '100%' },
    progressLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
    progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%' },

    content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'space-between', paddingBottom: 60, paddingTop: 20 },
    
    visualSection: { alignItems: 'center' },
    timerCircleContainer: {
        width: 200, height: 200,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 40
    },
    svg: { position: 'absolute' },
    innerCircle: {
        width: 170, height: 170, borderRadius: 85,
        backgroundColor: '#111',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    exerciseImage: { width: '80%', height: '80%' },
    
    videoContainer: {
        width: '100%',
        height: 220,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#222'
    },
    video: { width: '100%', height: '100%' },
    closeVideoBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    closeVideoText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    infoRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' },
    exerciseTitleArea: { alignItems: 'center', flex: 1 },
    exerciseName: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
    setInfo: { fontSize: 16, fontWeight: 'bold', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' },
    
    secondaryCircleBtn: { alignItems: 'center', width: 60 },
    btnSubText: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4, fontWeight: 'bold' },

    timerWrapper: { alignItems: 'center', marginVertical: 40 },
    timerValue: { fontSize: 140, fontWeight: '900', fontVariant: ['tabular-nums'] },
    timerUnit: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 4 },

    controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    controlCircleBtn: { 
        width: 80, height: 80, borderRadius: 40, 
        borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' 
    },
    controlLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    pauseBtn: { 
        flex: 1, height: 100, borderRadius: 25, 
        marginHorizontal: 20, justifyContent: 'center', alignItems: 'center',
        shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10
    },
    pauseBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 4 },
});
