import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS, FONT } from '../theme';
import api from '../api';

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

import { useTheme } from '../context/ThemeContext';

export default function AddFoodScreen({ route, navigation }) {
    const { user, prefill, mealType: initialMeal } = route.params || {};
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
            // Include portion multiplier in the food name so backend can compute correctly
            const portionLabel = PORTIONS.find(p => p.value === portion)?.label || '';
            const fullName = portion !== 1
                ? `${foodName.trim()} (${portionLabel})`
                : foodName.trim();

            const res = await api.post('/logs/food', {
                foodName: fullName,
                mealType: mealType,
                portionMultiplier: portion,
            });

            if (res.data.error) {
                Alert.alert('Not Recognized', `VitalIQ couldn't estimate calories for "${foodName}". Please try a more common name.`);
                return;
            }

            Toast.show({
                type: 'success',
                text1: '✅ Logged Successfully',
                text2: `${res.data.food_name} — ${res.data.calories} kcal`
            });

            navigation.navigate('MainApp', {
                screen: 'Home',
                params: { refresh: Date.now() }
            });
        } catch (err) {
            Alert.alert('Error', 'Failed to save food log');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: theme.text }]}>Track Nutrition</Text>

                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {/* Meal Type Picker */}
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Meal Type</Text>
                    <View style={[styles.pickerWrap, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                        <Picker
                            selectedValue={mealType}
                            onValueChange={(v) => setMealType(v)}
                            style={{ color: theme.text }}
                            dropdownIconColor={theme.primary}
                        >
                            <Picker.Item label="🍳 Breakfast" value="Breakfast" />
                            <Picker.Item label="🍛 Lunch" value="Lunch" />
                            <Picker.Item label="🍽️ Dinner" value="Dinner" />
                            <Picker.Item label="🍪 Snacks" value="Snacks" />
                        </Picker>
                    </View>

                    {/* Food Name */}
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Food Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
                        placeholder="e.g. Paneer Butter Masala"
                        placeholderTextColor={theme.textSecondary}
                        value={foodName}
                        onChangeText={setFoodName}
                    />

                    {/* Portion Selector */}
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Portion Size</Text>
                    <View style={styles.portionRow}>
                        {PORTIONS.map((p, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[
                                    styles.portionChip,
                                    { backgroundColor: theme.bg, borderColor: theme.border },
                                    portion === p.value && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                                ]}
                                onPress={() => setPortion(p.value)}
                            >
                                <Text style={[
                                    styles.portionText,
                                    { color: theme.textSecondary },
                                    portion === p.value && { color: theme.primary },
                                ]}>
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Auto-calorie notice */}
                    <View style={[styles.autoBox, { backgroundColor: theme.isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme.isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }]}>
                        <Text style={[styles.autoLabel, { color: theme.primary }]}>⏱️ Smart Calorie Engine</Text>
                        <Text style={[styles.autoText, { color: theme.textSecondary }]}>
                            VitalIQ auto-estimates calories from 120+ foods × your portion size. No manual lookup needed.
                        </Text>
                    </View>

                    <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleLog} disabled={isSaving}>
                        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log {mealType}</Text>}
                    </TouchableOpacity>
                </View>

                {/* Quick suggestions */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Add — {mealType}</Text>
                <View style={styles.suggestionRow}>
                    {SUGGESTIONS[mealType]?.map((s, i) => (
                        <TouchableOpacity key={i} style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setFoodName(s)}>
                            <Text style={[styles.chipText, { color: theme.text }]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { padding: 5 },
    backText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
    inner: { padding: 25 },
    title: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 25 },
    card: {
        backgroundColor: COLORS.surface, padding: 25, borderRadius: 24,
        borderWidth: 1, borderColor: COLORS.border,
    },
    label: {
        color: COLORS.textSecondary, fontSize: 13, fontWeight: 'bold',
        textTransform: 'uppercase', marginBottom: 8, marginTop: 15,
    },
    pickerWrap: {
        backgroundColor: COLORS.bg, borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.border, height: 60, justifyContent: 'center',
    },
    input: {
        backgroundColor: COLORS.bg, color: '#fff', padding: 18,
        borderRadius: 16, fontSize: 16, borderWidth: 1, borderColor: COLORS.border,
    },

    // Portion chips
    portionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
    portionChip: {
        backgroundColor: COLORS.bg, paddingVertical: 10, paddingHorizontal: 14,
        borderRadius: 12, marginRight: 8, marginBottom: 8,
        borderWidth: 1, borderColor: COLORS.border,
    },
    portionChipActive: {
        backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary,
    },
    portionText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
    portionTextActive: { color: COLORS.primary },

    autoBox: {
        backgroundColor: COLORS.infoLight, padding: 15, borderRadius: 16,
        marginTop: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    autoLabel: { color: COLORS.info, fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    autoText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },

    btn: {
        backgroundColor: COLORS.primary, padding: 18, borderRadius: 16,
        alignItems: 'center', marginTop: 25,
    },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 35, marginBottom: 15 },
    suggestionRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: {
        backgroundColor: COLORS.surface, paddingVertical: 10, paddingHorizontal: 15,
        borderRadius: 12, marginRight: 10, marginBottom: 10,
        borderWidth: 1, borderColor: COLORS.border,
    },
    chipText: { color: COLORS.text, fontSize: 14 },
});
