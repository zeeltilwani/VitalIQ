import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { Image } from 'react-native';
import { DIET_IMAGES } from '../assets/diet';

const PLANS = [
    {
        id: 1,
        title: 'Weight Loss Plan',
        desc: 'Balanced caloric deficit for steady, sustainable fat loss.',
        image: DIET_IMAGES.weight_loss,
        category: 'Fat Loss',
        duration: '8 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['2 boiled eggs', '1 slice whole wheat toast', '1 cup green tea'], calories: 280 },
            { meal: 'Mid-Morning', items: ['1 apple', '10 almonds'], calories: 150 },
            { meal: 'Lunch', items: ['Grilled chicken breast (150g)', 'Brown rice (1/2 cup)', 'Mixed salad with olive oil'], calories: 450 },
            { meal: 'Snack', items: ['Greek yogurt (100g)', '1 tbsp honey'], calories: 130 },
            { meal: 'Dinner', items: ['Grilled fish (150g)', 'Steamed broccoli & carrots', '1 small sweet potato'], calories: 380 },
        ],
        totalCalories: 1390,
        tips: ['Drink 8+ glasses of water daily', 'Avoid sugar-sweetened beverages', 'Walk 10,000 steps daily', 'Sleep 7-8 hours for optimal recovery'],
    },
    {
        id: 2,
        title: 'Weight Gain Plan',
        desc: 'High-calorie, nutrient-dense meals for healthy mass gain.',
        image: DIET_IMAGES.weight_gain,
        category: 'Mass Gain',
        duration: '12 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['3 eggs scrambled with cheese', '2 slices whole wheat toast with peanut butter', 'Banana smoothie with milk'], calories: 650 },
            { meal: 'Mid-Morning', items: ['Protein shake with oats and banana', 'Handful of mixed nuts'], calories: 450 },
            { meal: 'Lunch', items: ['Chicken thigh (200g) with skin', 'White rice (1.5 cups)', 'Lentil dal', 'Ghee (1 tbsp)'], calories: 750 },
            { meal: 'Snack', items: ['Peanut butter sandwich', 'Glass of whole milk'], calories: 400 },
            { meal: 'Dinner', items: ['Paneer butter masala (200g)', 'Naan (2 pieces)', 'Mixed vegetable curry'], calories: 700 },
        ],
        totalCalories: 2950,
        tips: ['Eat every 2-3 hours', 'Focus on progressive overload in workouts', 'Get 1.6-2g protein per kg bodyweight', 'Don\'t skip post-workout meals'],
    },
    {
        id: 3,
        title: 'High Protein Diet',
        desc: 'Maximize daily protein to support muscle repair and growth.',
        image: DIET_IMAGES.high_protein,
        category: 'Performance',
        duration: '6 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['4 egg white omelette with spinach', 'Cottage cheese (100g)', 'Multigrain toast'], calories: 380 },
            { meal: 'Mid-Morning', items: ['Whey protein shake (30g protein)', '1 banana'], calories: 250 },
            { meal: 'Lunch', items: ['Grilled chicken breast (200g)', 'Quinoa (1 cup)', 'Green beans sautéed'], calories: 550 },
            { meal: 'Snack', items: ['Boiled eggs (2)', 'Roasted chickpeas (1/4 cup)'], calories: 250 },
            { meal: 'Dinner', items: ['Salmon fillet (180g)', 'Sweet potato mash', 'Asparagus'], calories: 480 },
        ],
        totalCalories: 1910,
        tips: ['Aim for 2g protein per kg bodyweight', 'Spread protein across all meals', 'Combine plant and animal proteins', 'Stay hydrated to support kidney function'],
    },
    {
        id: 4,
        title: 'Vegetarian Plan',
        desc: 'Complete nutrition through plant-based and dairy sources.',
        image: DIET_IMAGES.vegetarian,
        category: 'Vegetarian',
        duration: '4 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['Oats porridge with nuts and seeds', 'Banana', 'Glass of milk'], calories: 420 },
            { meal: 'Mid-Morning', items: ['Sprouts salad with lemon', 'Green tea'], calories: 150 },
            { meal: 'Lunch', items: ['Paneer tikka (150g)', 'Brown rice (1 cup)', 'Rajma curry', 'Cucumber raita'], calories: 580 },
            { meal: 'Snack', items: ['Mixed fruit bowl', 'Handful of walnuts'], calories: 200 },
            { meal: 'Dinner', items: ['Palak paneer (150g)', '2 whole wheat rotis', 'Dal tadka'], calories: 520 },
        ],
        totalCalories: 1870,
        tips: ['Include diverse protein sources (legumes, dairy, soy)', 'Supplement Vitamin B12 if needed', 'Use iron-rich foods like spinach and lentils', 'Combine grains with legumes for complete amino acids'],
    },
    {
        id: 5,
        title: 'Non-Veg Muscle Plan',
        desc: 'Lean animal protein focused plan for serious muscle building.',
        image: DIET_IMAGES.non_veg_muscle,
        category: 'Muscle Building',
        duration: '10 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['3 whole eggs + 2 whites scrambled', 'Turkey bacon (3 slices)', 'Whole wheat toast with avocado'], calories: 520 },
            { meal: 'Mid-Morning', items: ['Chicken breast strips (100g)', 'Mixed nuts (30g)'], calories: 300 },
            { meal: 'Lunch', items: ['Grilled fish/chicken (200g)', 'Basmati rice (1.5 cups)', 'Mixed vegetable stir-fry', 'Curd'], calories: 680 },
            { meal: 'Snack', items: ['Protein shake with milk', 'Peanut butter on rice cakes'], calories: 350 },
            { meal: 'Dinner', items: ['Tandoori chicken (200g)', 'Sweet potato (1 medium)', 'Broccoli and mushroom sauté'], calories: 550 },
        ],
        totalCalories: 2400,
        tips: ['Prioritize lean cuts of meat', 'Include fish 2-3 times per week for omega-3s', 'Time your largest meal post-workout', 'Cook with minimal oil – grill, bake, or steam'],
    },
];

const DietCard = ({ plan, index, navigation, theme }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: SPACING.lg }}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => navigation.navigate('DietPlanDetail', { plan })}
                style={[
                    styles.card,
                    { 
                        backgroundColor: '#111', 
                        borderColor: '#222',
                    }
                ]}
            >
                <View style={styles.planImageContainer}>
                    <Image source={plan.image} style={styles.planImage} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: '#fff' }]}>{plan.title}</Text>
                        <View style={[styles.catBadge, { backgroundColor: '#222' }]}>
                            <Text style={[styles.catText, { color: theme.primary }]}>{plan.category}</Text>
                        </View>
                    </View>
                    <Text style={[styles.cardDesc, { color: '#666' }]} numberOfLines={2}>
                        {plan.desc}
                    </Text>
                    <View style={styles.metaRow}>
                        <Image source={DIET_IMAGES.kcal_icon} style={styles.kcalMiniIcon} />
                        <Text style={[styles.metaText, { color: theme.primary }]}>{plan.totalCalories} kcal</Text>
                        <Text style={[styles.metaDivider, { color: '#333' }]}>|</Text>
                        <Text style={[styles.metaText, { color: '#666' }]}>🗓️ {plan.duration}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function DietPlansScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Diet Plans</Text>
                <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                    Scientifically curated nutrition for your goals
                </Text>

                {PLANS.map((plan, index) => (
                    <DietCard key={plan.id} plan={plan} index={index} navigation={navigation} theme={theme} />
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { padding: SPACING.xl },
    headerTitle: { fontSize: FONT.title, fontWeight: '900' },
    headerSub: { fontSize: FONT.sm, marginBottom: SPACING.xxl, marginTop: 4, fontWeight: '500' },

    card: {
        padding: 12, 
        borderRadius: RADIUS.xl,
        flexDirection: 'row', 
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: SPACING.md,
    },
    planImageContainer: {
        width: 70, height: 70,
        borderRadius: RADIUS.lg, 
        overflow: 'hidden',
        marginRight: SPACING.md,
        backgroundColor: '#1A1A1A'
    },
    planImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 16, fontWeight: '800' },
    catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    catText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
    cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    kcalMiniIcon: { width: 14, height: 14, marginRight: 4 },
    metaText: { fontSize: 12, fontWeight: 'bold' },
    metaDivider: { marginHorizontal: 8 },
});
