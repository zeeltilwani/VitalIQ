import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

const PLANS = [
    { id: 1, title: 'Pure Veg Diet', desc: '7 Days of high-nutrition vegetarian meals.', icon: '🥗' },
    { id: 2, title: 'High Protein Diet', desc: 'Maximize your daily protein intake effectively.', icon: '🥩' },
    { id: 3, title: 'Non-Veg Muscle Gain', desc: 'Caloric surplus with lean animal protein.', icon: '🍗' },
    { id: 4, title: 'Weight Loss Diet', desc: 'Healthy caloric deficit for steady fat loss.', icon: '🔥' },
    { id: 5, title: 'Keto Diet', desc: 'High fat, low carb state of ketosis.', icon: '🥑' },
    { id: 6, title: 'Balanced Diet Plan', desc: 'A perfect mix of all macros for maintenance.', icon: '⚖️' },
    { id: 7, title: 'Diabetic Friendly', desc: 'Low GI foods to manage blood sugar.', icon: '🩸' },
    { id: 8, title: 'Student Budget Diet', desc: 'Affordable, easy-to-prep healthy meals.', icon: '🎒' }
];

export default function DietPlansScreen({ navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerTitle}>Curated Diet Plans</Text>
                <Text style={styles.headerSub}>Select a plan that fits your goals.</Text>

                {PLANS.map((plan) => (
                    <TouchableOpacity 
                        key={plan.id} 
                        style={styles.card}
                        onPress={() => navigation.navigate('DietPlanDetail', { plan })}
                    >
                        <View style={styles.iconBox}>
                            <Text style={styles.icon}>{plan.icon}</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{plan.title}</Text>
                            <Text style={styles.cardDesc}>{plan.desc}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                ))}
                
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { padding: 20 },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
    headerSub: { fontSize: 14, color: COLORS.muted, marginBottom: 20, marginTop: 5 },
    card: { backgroundColor: COLORS.card, padding: 20, borderRadius: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    iconBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    icon: { fontSize: 30 },
    cardContent: { flex: 1 },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
    arrow: { color: COLORS.muted, fontSize: 24, paddingLeft: 10 }
});
