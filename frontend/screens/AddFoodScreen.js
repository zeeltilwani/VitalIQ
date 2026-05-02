import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import PressableButton from '../components/PressableButton';

const SUGGESTIONS = {
    Breakfast: ['2 Roti + Sabzi', 'Oats with Milk', 'Idli chutney', 'Poha', 'Paratha', 'Dosa'],
    Lunch: ['Rice and Dal', 'Chicken Curry', 'Paneer Sabzi', 'Salad', 'Biryani', 'Rajma Rice'],
    Dinner: ['Soup', 'Grilled Fish', 'Chapati', 'Salad', 'Khichdi', 'Dal Roti'],
    Snacks: ['Apple', 'Banana', 'Tea with Biscuit', 'Samosa', 'Sprouts', 'Almonds']
};

const PORTIONS = [
    { label: '1 Serving', value: 1 },
    { label: '½ Serving', value: 0.5 },
    { label: '1 Bowl', value: 1 },
    { label: '2 Bowls', value: 2 },
    { label: '1 Plate', value: 1.5 },
    { label: 'Half Plate', value: 0.75 },
    { label: '2 Plates', value: 3 },
];

export default function AddFoodScreen({ route, navigation }) {
    const { user, prefill, mealType: initialMeal, calories: prefilledCalories, macros: prefilledMacros } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const [foodName, setFoodName] = useState(prefill || '');
    const [mealType, setMealType] = useState(initialMeal || 'Snacks');
    const [portion, setPortion] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialMeal) setMealType(initialMeal);
    }, [initialMeal]);

    const handleLog = async () => {
        if (!foodName.trim()) {
            Alert.alert('Missing Input', 'What did you eat? Please enter the food item.');
            return;
        }

        setIsSaving(true);
        try {
            const portionLabel = PORTIONS.find(p => p.value === portion)?.label || '';
            const fullName = portion !== 1
                ? `${foodName.trim()} (${portionLabel})`
                : foodName.trim();

            const res = await api.post('/logs/food', {
                foodName: fullName,
                mealType: mealType,
                portionMultiplier: portion,
                calories: prefilledCalories,
                macros: prefilledMacros,
            });

            if (!res || !res.data) {
                Alert.alert('Error', 'No response from server. Please try again.');
                return;
            }

            Toast.show({
                type: 'success',
                text1: '✅ Logged Successfully',
                text2: `${fullName} has been added to your ${mealType.toLowerCase()}.`,
            });

            navigation.navigate('MainApp', {
                screen: 'Home',
                params: { refresh: Date.now() }
            });
        } catch (err) {
            const serverMsg = err?.response?.data?.error;
            Alert.alert('Not Recognized', serverMsg || 'Failed to save food log.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
                    <BackButton onPress={() => navigation.goBack()} />
                    <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>Add Nutrition</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, { color: theme.text }]}>What's on your plate?</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Log your meal to track calories & macros</Text>

                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Meal Type</Text>
                        <View style={[styles.pickerWrap, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                            <Picker
                                selectedValue={mealType}
                                onValueChange={(v) => setMealType(v)}
                                style={{ color: theme.text }}
                                dropdownIconColor={theme.primary}
                            >
                                <Picker.Item label="🍳 Breakfast" value="Breakfast" color={theme.text} />
                                <Picker.Item label="🍛 Lunch" value="Lunch" color={theme.text} />
                                <Picker.Item label="🍽️ Dinner" value="Dinner" color={theme.text} />
                                <Picker.Item label="🍪 Snacks" value="Snacks" color={theme.text} />
                            </Picker>
                        </View>

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Food Item</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surfaceLight, color: theme.text, borderColor: theme.border }]}
                            placeholder="e.g. Chicken Biryani"
                            placeholderTextColor={theme.textSecondary}
                            value={foodName}
                            onChangeText={setFoodName}
                        />

                        <Text style={[styles.label, { color: theme.textSecondary }]}>Portion Selection</Text>
                        <View style={styles.portionRow}>
                            {PORTIONS.map((p, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.portionChip,
                                        { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                                        portion === p.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                    onPress={() => setPortion(p.value)}
                                >
                                    <Text style={[
                                        styles.portionText,
                                        { color: theme.textSecondary },
                                        portion === p.value && { color: '#FFFFFF' },
                                    ]}>
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <PressableButton 
                            label={isSaving ? "Saving..." : `Log ${mealType}`}
                            variant="primary"
                            onPress={handleLog}
                            disabled={isSaving}
                            loading={isSaving}
                            style={{ marginTop: SPACING.xl }}
                            size="lg"
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular for {mealType}</Text>
                    <View style={styles.suggestionRow}>
                        {SUGGESTIONS[mealType]?.map((s, i) => (
                            <TouchableOpacity 
                                key={i} 
                                style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                                onPress={() => setFoodName(s)}
                            >
                                <Text style={[styles.chipText, { color: theme.text }]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    headerLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
    inner: { padding: SPACING.xl },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
    subtitle: { fontSize: 14, fontWeight: '500', marginBottom: SPACING.xxl },
    
    card: {
        padding: SPACING.xl, 
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        ...SHADOW.md,
    },
    label: {
        fontSize: 11, fontWeight: '900',
        textTransform: 'uppercase', marginBottom: 8, marginTop: SPACING.lg,
        letterSpacing: 1,
    },
    pickerWrap: {
        borderRadius: RADIUS.lg,
        borderWidth: 1, height: 56, justifyContent: 'center',
    },
    input: {
        padding: 16,
        borderRadius: RADIUS.lg, fontSize: 16, borderWidth: 1,
        fontWeight: '500',
    },
    portionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    portionChip: {
        paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: RADIUS.pill, borderWidth: 1,
    },
    portionText: { fontSize: 12, fontWeight: 'bold' },

    sectionTitle: { fontSize: 18, fontWeight: '900', marginTop: SPACING.xxl, marginBottom: SPACING.lg },
    suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: RADIUS.lg, borderWidth: 1,
        ...SHADOW.xs,
    },
    chipText: { fontSize: 14, fontWeight: '600' },
});
