import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import { 
    Activity, 
    AlignCenter, 
    ArrowUp, 
    TrendingUp, 
    RotateCw, 
    RefreshCw, 
    Zap, 
    Star, 
    ChevronRight,
    MoveUp,
    Dumbbell,
    CircleDashed,
    Repeat
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { EXERCISES } from '../data/exercises';
import { getExerciseAsset } from '../assets/exercises';
import BackButton from '../components/BackButton';
import PressableButton from '../components/PressableButton';

export default function ExerciseListScreen({ route, navigation }) {
    const { bodyPart, user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const exercises = EXERCISES[bodyPart?.key] || [];

    const handleExerciseClick = (exercise, index) => {
        navigation.navigate('ExerciseIntro', { 
            exercise, 
            exercises, 
            currentIndex: index, 
            bodyPart, 
            user 
        });
    };

    const handleStartWorkout = () => {
        if (exercises.length > 0) {
            handleExerciseClick(exercises[0], 0);
        }
    };

    const getExerciseIcon = (name = '') => {
        const n = name.toLowerCase();
        if (n.includes('crunch')) return Activity;
        if (n.includes('plank')) return AlignCenter;
        if (n.includes('leg raise')) return ArrowUp;
        if (n.includes('mountain climber')) return TrendingUp;
        if (n.includes('bicycle')) return RotateCw;
        if (n.includes('twist')) return RefreshCw;
        if (n.includes('push-up') || n.includes('pushup')) return MoveUp;
        if (n.includes('squat')) return ArrowUp;
        if (n.includes('burpee')) return Zap;
        if (n.includes('jack')) return Star;
        if (n.includes('dip')) return ArrowUp;
        return Activity;
    };

    const AnimatedCard = ({ ex, index, onPress }) => {
        const scale = new Animated.Value(1);
        const Icon = getExerciseIcon(ex.name);
        const imageAsset = getExerciseAsset(ex.gifName);
        const placeholderAsset = getExerciseAsset('default');
        const hasCustomImage = imageAsset !== placeholderAsset;

        const onPressIn = () => {
            Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
        };
        const onPressOut = () => {
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        };

        return (
            <TouchableOpacity 
                activeOpacity={1}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={onPress}
            >
                <Animated.View style={[
                    styles.card, 
                    { 
                        backgroundColor: theme.surface, 
                        borderColor: theme.border,
                        transform: [{ scale }]
                    }
                ]}>
                    <View style={styles.cardTop}>
                        {/* Number Badge */}
                        <View style={[styles.numBadge, { borderColor: bodyPart?.color || theme.primary }]}>
                            <Text style={[styles.numText, { color: bodyPart?.color || theme.primary }]}>{index + 1}</Text>
                        </View>
                        
                        {/* Icon/Image Container */}
                        <View style={styles.iconContainer}>
                            {hasCustomImage ? (
                                <Image 
                                    source={imageAsset} 
                                    style={styles.exImage} 
                                    resizeMode="contain"
                                />
                            ) : (
                                <Icon size={20} color={theme.primary} strokeWidth={2.5} />
                            )}
                        </View>

                        {/* Text Content */}
                        <View style={styles.cardInfo}>
                            <Text style={[styles.exName, { color: theme.text }]}>{ex.name}</Text>
                            <Text style={[styles.exMeta, { color: theme.textSecondary }]}>
                                {ex.sets} sets × {ex.reps} {ex.unit || 'reps'}
                            </Text>
                        </View>

                        <ChevronRight size={18} color={theme.textSecondary} />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                <BackButton onPress={() => navigation.goBack()} />
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{bodyPart?.label}</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{exercises.length} Exercises</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
                {exercises.map((ex, index) => (
                    <AnimatedCard 
                        key={ex.id} 
                        ex={ex} 
                        index={index} 
                        onPress={() => handleExerciseClick(ex, index)} 
                    />
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Start Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.xl) }]}>
                <PressableButton 
                    label="Start Full Workout" 
                    onPress={handleStartWorkout}
                    variant="primary"
                    size="lg"
                    style={{ width: '100%' }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    headerInfo: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: FONT.lg, fontWeight: '900' },
    headerSubtitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    
    inner: { padding: SPACING.xl },
    
    card: {
        borderRadius: RADIUS.xl, 
        padding: 16,
        marginBottom: 12, 
        borderWidth: 1,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    numBadge: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', 
        marginRight: 12,
        borderWidth: 1.5,
    },
    numText: { fontWeight: '900', fontSize: 14 },
    iconContainer: {
        width: 40, height: 40, 
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    exImage: {
        width: '100%',
        height: '100%',
        borderRadius: RADIUS.sm,
    },
    cardInfo: { flex: 1 },
    exName: { fontSize: 16, fontWeight: '800' },
    exMeta: { fontSize: 13, marginTop: 2, fontWeight: '600' },
    arrow: { fontSize: 24, fontWeight: '300', marginLeft: SPACING.sm },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
    }
});
