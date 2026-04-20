import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

const SUGGESTIONS = {
    Breakfast: ['2 Roti + Sabzi', 'Oats with Milk', 'Idli chutney', 'Poha'],
    Lunch: ['Rice and Dal', 'Chicken Curry', 'Paneer Sabzi', 'Salad'],
    Dinner: ['Soup', 'Grilled Fish', 'Chapati', 'Salad'],
    Snacks: ['Apple', 'Banana', 'Tea with Biscuit', 'Samosa']
};

export default function AddFoodScreen({ route, navigation }) {
    const { user, prefill, mealType: initialMeal } = route.params || {};
    const insets = useSafeAreaInsets();
    
    const [foodName, setFoodName] = useState(prefill || '');
    const [mealType, setMealType] = useState(initialMeal || 'Snacks');
    const [isSaving, setIsSaving] = useState(false);

    // If param changes (e.g., accessed via Quick Action), update state
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
            const res = await api.post('/logs/food', {
                foodName: foodName.trim(),
                mealType: mealType 
            });
            
            Toast.show({
                type: 'success',
                text1: '✅ Logged Successfully',
                text2: `${res.data.food_name} — ${res.data.calories} kcal`
            });
            
            // Navigate back to Dashboard. Since Dashboard listens to isFocused, it will refetch logs.
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
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Track Nutrition</Text>
                
                <View style={styles.card}>
                    <Text style={styles.label}>Meal Type</Text>
                    <View style={styles.pickerWrap}>
                        <Picker
                            selectedValue={mealType}
                            onValueChange={(v) => setMealType(v)}
                            style={{ color: '#fff' }}
                            dropdownIconColor={COLORS.primary}
                        >
                            <Picker.Item label="🍳 Breakfast" value="Breakfast" />
                            <Picker.Item label="🍛 Lunch" value="Lunch" />
                            <Picker.Item label="🍽️ Dinner" value="Dinner" />
                            <Picker.Item label="🍪 Snacks" value="Snacks" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Food Name & Portion</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 2 Roti or 1 Bowl Rice"
                        placeholderTextColor={COLORS.muted}
                        value={foodName}
                        onChangeText={setFoodName}
                    />
                    
                    <View style={styles.autoBox}>
                        <Text style={styles.autoLabel}>⏱️ Auto-Calorie Estimation</Text>
                        <Text style={styles.autoText}>
                            Input is processed automatically by the VitalIQ engine. You don't need to look up calories manually.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.btn} onPress={handleLog} disabled={isSaving}>
                        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log {mealType}</Text>}
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Suggestions for {mealType}</Text>
                <View style={styles.suggestionRow}>
                    {SUGGESTIONS[mealType]?.map((s, i) => (
                        <TouchableOpacity key={i} style={styles.chip} onPress={() => setFoodName(s)}>
                            <Text style={styles.chipText}>{s}</Text>
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
    card: { backgroundColor: COLORS.card, padding: 25, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    label: { color: COLORS.muted, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, marginTop: 15 },
    pickerWrap: { backgroundColor: COLORS.bg, borderRadius: 16, borderWidth: 1, borderColor: '#334155', height: 60, justifyContent: 'center' },
    input: { backgroundColor: COLORS.bg, color: '#fff', padding: 18, borderRadius: 16, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
    
    autoBox: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 15, borderRadius: 16, marginTop: 25, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    autoLabel: { color: '#3b82f6', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    autoText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
    
    btn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 40, marginBottom: 15 },
    suggestionRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { backgroundColor: COLORS.card, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
    chipText: { color: COLORS.text, fontSize: 14 }
});
