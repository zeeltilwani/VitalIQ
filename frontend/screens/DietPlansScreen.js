import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT } from '../theme';

const PLANS = [
    {
        id: 1,
        title: 'Weight Loss Plan',
        desc: 'Balanced caloric deficit for steady, sustainable fat loss.',
        icon: '🔥',
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
        icon: '💪',
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
        icon: '🥩',
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
        icon: '🥗',
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
        icon: '🍗',
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
    {
        id: 6,
        title: 'Keto Diet',
        desc: 'High fat, very low carb plan for ketosis and fat adaptation.',
        icon: '🥑',
        category: 'Low Carb',
        duration: '6 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['3 eggs cooked in butter', 'Avocado (half)', 'Cheese slices (30g)'], calories: 480 },
            { meal: 'Mid-Morning', items: ['Bulletproof coffee (coffee + MCT oil + butter)', 'Macadamia nuts (20g)'], calories: 300 },
            { meal: 'Lunch', items: ['Grilled salmon (180g)', 'Caesar salad with olive oil dressing', 'No croutons'], calories: 520 },
            { meal: 'Snack', items: ['Celery sticks with cream cheese', 'Pork rinds'], calories: 200 },
            { meal: 'Dinner', items: ['Butter chicken (no sugar, 200g)', 'Cauliflower rice', 'Sautéed spinach in ghee'], calories: 550 },
        ],
        totalCalories: 2050,
        tips: ['Keep net carbs under 25g/day', 'Supplement electrolytes (sodium, potassium, magnesium)', 'Expect "keto flu" in first week – it passes', 'Track macros carefully for best results'],
    },
    {
        id: 7,
        title: 'Diabetic Friendly',
        desc: 'Low glycemic index foods to manage blood sugar levels.',
        icon: '🩸',
        category: 'Medical',
        duration: 'Ongoing',
        meals: [
            { meal: 'Breakfast', items: ['Steel-cut oats with cinnamon', 'Boiled egg (1)', 'Herbal tea'], calories: 320 },
            { meal: 'Mid-Morning', items: ['Cucumber and carrot sticks', 'Hummus (2 tbsp)'], calories: 120 },
            { meal: 'Lunch', items: ['Grilled chicken (120g)', 'Quinoa (1/2 cup)', 'Spinach and tomato salad'], calories: 400 },
            { meal: 'Snack', items: ['Small handful of almonds', 'Green apple slices'], calories: 150 },
            { meal: 'Dinner', items: ['Baked fish (150g)', 'Steamed vegetables', 'Small portion brown rice'], calories: 380 },
        ],
        totalCalories: 1370,
        tips: ['Monitor blood sugar before and after meals', 'Choose whole grains over refined carbs', 'Eat at consistent times each day', 'Include fiber with every meal to slow glucose absorption'],
    },
    {
        id: 8,
        title: 'Student Budget Diet',
        desc: 'Affordable, nutritious meal prep for students on a budget.',
        icon: '🎒',
        category: 'Budget',
        duration: '4 Weeks',
        meals: [
            { meal: 'Breakfast', items: ['Overnight oats with banana and peanut butter', 'Tea/coffee'], calories: 350 },
            { meal: 'Mid-Morning', items: ['Boiled egg (1)', 'Toast with jam'], calories: 180 },
            { meal: 'Lunch', items: ['Dal rice (moong dal + basmati rice)', 'Seasonal vegetable sabzi', 'Curd'], calories: 480 },
            { meal: 'Snack', items: ['Roasted chana (chickpeas)', 'Seasonal fruit'], calories: 150 },
            { meal: 'Dinner', items: ['Egg bhurji (2 eggs)', '2 rotis', 'Onion-tomato salad'], calories: 420 },
        ],
        totalCalories: 1580,
        tips: ['Buy seasonal fruits and vegetables', 'Meal prep on weekends to save time', 'Use eggs and lentils as primary protein sources', 'Avoid packaged/processed snacks'],
    },
];

export default function DietPlansScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Diet Plans</Text>
                <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Curated nutrition plans for every goal</Text>

                {PLANS.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => navigation.navigate('DietPlanDetail', { plan })}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
                            <Text style={styles.icon}>{plan.icon}</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{plan.title}</Text>
                            <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{plan.desc}</Text>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, { backgroundColor: theme.surfaceLight }]}>
                                    <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{plan.category}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: theme.surfaceLight }]}>
                                    <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{plan.duration}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: theme.surfaceLight }]}>
                                    <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{plan.totalCalories} kcal/day</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { padding: SPACING.xl },
    headerTitle: { fontSize: FONT.title, fontWeight: FONT.black },
    headerSub: { fontSize: FONT.sm, marginBottom: SPACING.xl, marginTop: SPACING.xs },

    card: {
        padding: SPACING.lg, borderRadius: RADIUS.xl,
        marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center',
        borderWidth: 1,
    },
    iconBox: {
        width: 52, height: 52,
        borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.lg,
    },
    icon: { fontSize: 26 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: FONT.md, fontWeight: FONT.bold, marginBottom: SPACING.xs },
    cardDesc: { fontSize: FONT.sm, lineHeight: 18, marginBottom: SPACING.sm },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3, borderRadius: RADIUS.sm, marginRight: SPACING.xs, marginBottom: SPACING.xs,
    },
    badgeText: { fontSize: FONT.xs, fontWeight: FONT.medium },
    arrow: { fontSize: 24, paddingLeft: SPACING.sm },
});
