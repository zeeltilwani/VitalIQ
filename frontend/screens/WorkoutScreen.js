import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { BODY_PARTS, EXERCISES } from '../data/exercises';
import { getExerciseAsset } from '../assets/exercises';

export default function WorkoutScreen({ route, navigation }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    // One Animated.Value per card for individual press animations
    const scaleAnims = useRef(BODY_PARTS.map(() => new Animated.Value(1))).current;

    const handlePressIn = (index) => {
        Animated.spring(scaleAnims[index], {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 40,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = (index) => {
        Animated.spring(scaleAnims[index], {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 8,
        }).start();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
                <Text style={[styles.title, { color: theme.text }]}>Workout</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Choose a target area to start training
                </Text>

                {BODY_PARTS.map((part, index) => {
                    const exerciseCount = EXERCISES[part.key]?.length || 0;
                    const totalSets = EXERCISES[part.key]?.reduce((a, e) => a + e.sets, 0) || 0;

                    return (
                        <Animated.View
                            key={part.key}
                            style={{ transform: [{ scale: scaleAnims[index] }], marginBottom: SPACING.md }}
                        >
                            <Pressable
                                onPressIn={() => handlePressIn(index)}
                                onPressOut={() => handlePressOut(index)}
                                onPress={() => navigation.navigate('ExerciseList', { bodyPart: part, user })}
                                style={({ pressed }) => [
                                    styles.card,
                                    {
                                        backgroundColor: theme.surface,
                                        borderColor: pressed ? part.color : theme.border,
                                        // Tinted shadow on press
                                        shadowColor: part.color,
                                        shadowOpacity: pressed ? 0.25 : 0.1,
                                        shadowRadius: pressed ? 12 : 6,
                                        elevation: pressed ? 8 : 4,
                                    },
                                ]}
                            >
                                {/* Color accent bar */}
                                <View style={[styles.accentBar, { backgroundColor: part.color }]} />

                                <View style={[styles.iconBox, { backgroundColor: part.color + '22' }]}>
                                    <Image 
                                        source={getExerciseAsset('cat_' + part.key)} 
                                        style={styles.cardImage} 
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={[styles.cardTitle, { color: theme.text }]}>{part.label}</Text>
                                    <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                                        {part.description}
                                    </Text>
                                    <View style={styles.metaRow}>
                                        <View style={[styles.metaChip, { backgroundColor: part.color + '18' }]}>
                                            <Text style={[styles.metaText, { color: part.color }]}>
                                                {exerciseCount} exercises
                                            </Text>
                                        </View>
                                        <View style={[styles.metaChip, { backgroundColor: theme.surfaceLight }]}>
                                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                                {totalSets} sets
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={[styles.arrow, { color: part.color }]}>›</Text>
                            </Pressable>
                        </Animated.View>
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
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        position: 'relative',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: RADIUS.xl,
        borderBottomLeftRadius: RADIUS.xl,
    },
    iconBox: {
        width: 56, height: 56, borderRadius: RADIUS.lg,
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.lg, marginLeft: SPACING.xs,
    },
    cardImage: { width: 32, height: 32 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: FONT.lg, fontWeight: FONT.bold },
    cardDesc: { fontSize: FONT.sm, marginTop: SPACING.xs },
    metaRow: { flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.sm },
    metaChip: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs, borderRadius: RADIUS.sm,
    },
    metaText: { fontSize: FONT.xs, fontWeight: FONT.medium },
    arrow: { fontSize: 28, fontWeight: '300' },
});
