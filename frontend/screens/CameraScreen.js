import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';

export default function CameraScreen({ route, navigation }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            identifyFood(result.assets[0].uri);
        }
    };

    const identifyFood = async (uri) => {
        setLoading(true);
        setPrediction(null);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri,
                name: 'food.jpg',
                type: 'image/jpeg',
            });

            const response = await api.post('/ai/identify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPrediction(response.data);
        } catch (error) {
            Alert.alert('AI Error', 'Identification service is unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogAll = () => {
        if (!prediction?.items?.length) return;
        // Log each item by navigating to food log with combined prefill
        const combined = prediction.items.map(i => i.label).join(', ');
        navigation.navigate('Log Food', { prefill: combined });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Scanner</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.scanBtn} onPress={pickImage} activeOpacity={0.8}>
                    <Text style={styles.scanEmoji}>📸</Text>
                    <Text style={styles.scanBtnText}>Capture or Upload Photo</Text>
                    <Text style={styles.scanHint}>Take a photo of your plate for AI analysis</Text>
                </TouchableOpacity>

                {image && <Image source={{ uri: image }} style={styles.image} />}

                {loading && (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Analyzing your food...</Text>
                    </View>
                )}

                {/* ─── Multi-Food Results ─── */}
                {prediction && prediction.items && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultTitle}>🔍 AI Analysis</Text>
                            <View style={styles.confBadge}>
                                <Text style={styles.confText}>
                                    {(prediction.confidence * 100).toFixed(0)}% avg
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.resultMsg}>{prediction.message}</Text>

                        {/* Individual food items */}
                        {prediction.items.map((item, i) => (
                            <View key={i} style={styles.foodItemRow}>
                                <View style={styles.foodItemLeft}>
                                    <View style={styles.foodDot} />
                                    <Text style={styles.foodItemName}>{item.label}</Text>
                                </View>
                                <View style={styles.foodItemRight}>
                                    <Text style={styles.foodItemCal}>{item.calories}</Text>
                                    <Text style={styles.foodItemUnit}>kcal</Text>
                                </View>
                            </View>
                        ))}

                        {/* Total */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Calories</Text>
                            <Text style={styles.totalValue}>{prediction.totalCalories} kcal</Text>
                        </View>

                        {/* Log All Button */}
                        <TouchableOpacity style={styles.logBtn} onPress={handleLogAll} activeOpacity={0.8}>
                            <Text style={styles.logBtnText}>✅ Log All Items</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Fallback for legacy single-item format */}
                {prediction && !prediction.items && prediction.label && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>🔍 AI Analysis</Text>
                        <Text style={styles.singleName}>{prediction.label}</Text>
                        <Text style={styles.singleCal}>{prediction.calories} kcal</Text>
                        <TouchableOpacity
                            style={styles.logBtn}
                            onPress={() => navigation.navigate('Log Food', { prefill: prediction.label })}
                        >
                            <Text style={styles.logBtnText}>Proceed to Log</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface,
    },
    backText: { color: COLORS.primary, fontSize: FONT.md, fontWeight: FONT.bold },
    headerTitle: { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.text },
    inner: { padding: SPACING.xl, alignItems: 'center' },

    scanBtn: {
        backgroundColor: COLORS.surface, padding: SPACING.xxl, borderRadius: RADIUS.xl,
        width: '100%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    scanEmoji: { fontSize: 40, marginBottom: SPACING.md },
    scanBtnText: { color: COLORS.primary, fontSize: FONT.lg, fontWeight: FONT.bold },
    scanHint: { color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: SPACING.xs },

    image: {
        width: '100%', height: 280, borderRadius: RADIUS.xl, marginTop: SPACING.xl,
        borderWidth: 3, borderColor: COLORS.surface,
    },

    loadingBox: { alignItems: 'center', marginTop: SPACING.xxl },
    loadingText: { color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: SPACING.md },

    // Result card
    resultCard: {
        backgroundColor: COLORS.surface, width: '100%', padding: SPACING.xl,
        borderRadius: RADIUS.xl, marginTop: SPACING.xl,
        borderWidth: 1, borderColor: COLORS.border,
    },
    resultHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    resultTitle: { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.text },
    confBadge: {
        backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs, borderRadius: RADIUS.pill,
    },
    confText: { color: COLORS.primary, fontSize: FONT.xs, fontWeight: FONT.bold },
    resultMsg: { color: COLORS.textSecondary, fontSize: FONT.sm, marginBottom: SPACING.lg },

    // Food items
    foodItemRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    foodItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    foodDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary,
        marginRight: SPACING.md,
    },
    foodItemName: { color: COLORS.text, fontSize: FONT.md, fontWeight: FONT.medium },
    foodItemRight: { flexDirection: 'row', alignItems: 'baseline' },
    foodItemCal: { color: COLORS.text, fontSize: FONT.lg, fontWeight: FONT.bold, marginRight: SPACING.xs },
    foodItemUnit: { color: COLORS.textSecondary, fontSize: FONT.xs },

    // Total
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: SPACING.lg, marginTop: SPACING.sm,
    },
    totalLabel: { color: COLORS.textSecondary, fontSize: FONT.md, fontWeight: FONT.semibold },
    totalValue: { color: COLORS.primary, fontSize: FONT.xl, fontWeight: FONT.black },

    // Log button
    logBtn: {
        backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.lg,
        width: '100%', alignItems: 'center', marginTop: SPACING.xl, ...SHADOW.sm,
    },
    logBtnText: { color: '#fff', fontSize: FONT.lg, fontWeight: FONT.bold },

    // Single-item fallback
    singleName: { fontSize: FONT.xxl, fontWeight: FONT.black, color: COLORS.text, marginTop: SPACING.md },
    singleCal: { fontSize: FONT.xl, color: COLORS.primary, fontWeight: FONT.bold, marginVertical: SPACING.sm },
});
