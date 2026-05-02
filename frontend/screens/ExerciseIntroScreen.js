import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme';
import PressableButton from '../components/PressableButton';
import BackButton from '../components/BackButton';
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
};

export default function ExerciseIntroScreen({ route, navigation }) {
    const { exercise, exercises, currentIndex, bodyPart, user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const startExercise = () => {
        navigation.navigate('ExerciseTimer', {
            exercises,
            currentIndex: currentIndex || 0,
            bodyPart,
            user
        });
    };

    const skipExercise = () => {
        if (currentIndex < exercises.length - 1) {
            navigation.replace('ExerciseIntro', {
                exercise: exercises[currentIndex + 1],
                exercises,
                currentIndex: currentIndex + 1,
                bodyPart,
                user
            });
        } else {
            navigation.goBack();
        }
    };

    const exerciseAsset = exercise?.gifName 
        ? { uri: `https://raw.githubusercontent.com/vitaliq-assets/gifs/main/${exercise.gifName}.gif` } 
        : getExerciseAsset(exercise?.gifName);

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header / Back */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <BackButton onPress={() => navigation.goBack()} />
                <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>Exercise Guide</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Video / Animation Section */}
                <View style={[styles.videoContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {exercise?.videoSource && VIDEO_ASSETS[exercise.videoSource] ? (
                        <Video
                            source={VIDEO_ASSETS[exercise.videoSource]}
                            style={styles.video}
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            shouldPlay
                            isMuted
                            useNativeControls={false}
                        />
                    ) : (
                        <Image 
                            source={exerciseAsset} 
                            style={styles.video}
                            resizeMode="contain"
                        />
                    )}
                    
                    {!exercise?.videoSource && (
                        <View style={styles.videoOverlay}>
                            <View style={[styles.playIcon, { backgroundColor: 'rgba(34,197,94,0.8)' }]}>
                                <Text style={styles.playText}>▶</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={[styles.name, { color: theme.text }]}>{exercise?.emoji} {exercise?.name}</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statChip, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.statText, { color: theme.primary }]}>{exercise?.sets} Sets</Text>
                        </View>
                        <View style={[styles.statChip, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>{exercise?.reps} {exercise?.unit || 'Reps'}</Text>
                        </View>
                        <View style={[styles.statChip, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>{exercise?.restSec}s Rest</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>How to perform</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {exercise?.description}
                    </Text>
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.xl) }]}>
                <PressableButton 
                    variant="secondary" 
                    label="Skip Video" 
                    onPress={startExercise}
                    style={{ flex: 1, marginRight: SPACING.md }}
                />
                <PressableButton 
                    variant="primary" 
                    label="Start" 
                    icon="▶"
                    onPress={startExercise}
                    style={{ flex: 1.5 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    headerTitle: {
        fontSize: FONT.sm,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.xl,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16/9,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playText: {
        color: '#fff',
        fontSize: 24,
        marginLeft: 4,
    },
    infoBox: {
        marginTop: SPACING.xxl,
    },
    name: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: SPACING.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    statChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.md,
    },
    statText: {
        fontSize: FONT.xs,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: FONT.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONT.md,
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
    },
});
