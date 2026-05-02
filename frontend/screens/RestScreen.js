import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { ChevronLast } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme';
import PressableButton from '../components/PressableButton';

export default function RestScreen({ route, navigation }) {
    const { exercises, currentIndex, currentSet, totalSets, bodyPart, user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const restTime = exercises[currentIndex]?.restSec || 15;
    const [timeLeft, setTimeLeft] = useState(restTime);
    
    const timerRef = useRef(null);
    const nextExercise = currentSet < totalSets 
        ? exercises[currentIndex] 
        : exercises[currentIndex + 1];

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            handleFinishRest();
        }
    }, [timeLeft]);

    const handleFinishRest = () => {
        clearInterval(timerRef.current);
        if (currentSet < totalSets) {
            // Next Set of same exercise
            navigation.replace('ExerciseTimer', {
                exercises,
                currentIndex,
                user,
                bodyPart,
                initialSet: currentSet + 1
            });
        } else {
            // Next Exercise
            navigation.replace('ExerciseIntro', {
                exercise: exercises[currentIndex + 1],
                exercises,
                currentIndex: currentIndex + 1,
                bodyPart,
                user
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.primary }]}>REST</Text>
                
                <View style={styles.timerWrapper}>
                    <Text style={[styles.timerValue, { color: theme.text }]}>{timeLeft}</Text>
                    <Text style={[styles.timerUnit, { color: theme.textSecondary }]}>SECONDS LEFT</Text>
                </View>

                <View style={[styles.nextBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.nextLabel, { color: theme.textSecondary }]}>UP NEXT</Text>
                    <Text style={[styles.nextName, { color: theme.text }]}>
                        {nextExercise?.emoji} {nextExercise?.name}
                    </Text>
                    <Text style={[styles.nextInfo, { color: theme.textSecondary }]}>
                        {currentSet < totalSets 
                            ? `Set ${currentSet + 1} of ${totalSets}` 
                            : `Exercise ${currentIndex + 2} of ${exercises.length}`}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.skipBtn, { borderColor: theme.primary }]} 
                        onPress={handleFinishRest}
                    >
                        <ChevronLast size={32} color={theme.primary} />
                        <Text style={[styles.skipBtnLabel, { color: '#fff' }]}>Skip Rest</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 40, fontWeight: '900', letterSpacing: 4, marginBottom: SPACING.xxxl },
    timerWrapper: { alignItems: 'center', marginBottom: 60 },
    timerValue: { fontSize: 120, fontWeight: '900', fontVariant: ['tabular-nums'] },
    timerUnit: { fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
    nextBox: {
        width: '100%',
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 60,
    },
    nextLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
    nextName: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
    nextInfo: { fontSize: 14, fontWeight: '600' },
    footer: { width: '100%', alignItems: 'center' },
    skipBtn: { 
        width: 100, height: 100, borderRadius: 50, 
        borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' 
    },
    skipBtnLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
});
