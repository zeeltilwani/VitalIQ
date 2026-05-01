import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ActivityIndicator, Image, ScrollView, Platform, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import PressableButton from '../components/PressableButton';
import api from '../api';

// ── Auto Meal-Type from Time ──────────────────────────────────────────────────
function getMealTypeFromTime() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 20) return 'Snacks';
    return 'Dinner';
}

const MEAL_ICONS = {
    Breakfast: '🌅',
    Lunch:     '☀️',
    Snacks:    '🍎',
    Dinner:    '🌙',
};

const ALL_MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export default function CameraScreen({ route, navigation }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const [permission, requestPermission] = useCameraPermissions();
    const [cameraActive, setCameraActive] = useState(true);
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    // Meal override state — auto-detected but user can change
    const [detectedMeal, setDetectedMeal] = useState(getMealTypeFromTime());
    const [mealOverridden, setMealOverridden] = useState(false);
    const [showMealPicker, setShowMealPicker] = useState(false);

    const cameraRef = useRef(null);

    // ── Banner animation ──────────────────────────────────────────────────────
    const bannerOpacity = useRef(new Animated.Value(0)).current;
    const bannerSlide = useRef(new Animated.Value(-20)).current;

    const showBanner = () => {
        bannerOpacity.setValue(0);
        bannerSlide.setValue(-20);
        Animated.parallel([
            Animated.timing(bannerOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.spring(bannerSlide, { toValue: 0, speed: 20, bounciness: 8, useNativeDriver: true }),
        ]).start();
    };

    // ── Camera ────────────────────────────────────────────────────────────────
    const takePhoto = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
            setImage(photo.uri);
            setCameraActive(false);
            // Reset meal to auto-detected time each new scan
            const auto = getMealTypeFromTime();
            setDetectedMeal(auto);
            setMealOverridden(false);
            identifyFood(photo.uri);
        } catch (e) {
            Alert.alert('Camera Error', 'Failed to capture photo.');
        }
    };

    const identifyFood = async (uri) => {
        setLoading(true);
        setPrediction(null);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: 'scan.jpg',
                type: 'image/jpeg',
            });
            const response = await api.post('/ai/identify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success === false) {
                Alert.alert('Scan Result', response.data.error || 'Food not recognized');
            } else {
                setPrediction(response.data);
                showBanner();
            }
        } catch (error) {
            Alert.alert('Analysis Failed', 'Could not reach the AI service. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const resetCamera = () => {
        setImage(null);
        setPrediction(null);
        setCameraActive(true);
        setShowMealPicker(false);
    };

    // ── Navigate to AddFood with auto-detected meal + prefilled name ──────────
    const handleLog = () => {
        if (!prediction) return;
        navigation.navigate('Log Food', {
            prefill: prediction.label,
            mealType: detectedMeal,
            user,
        });
    };

    // ── Permission ────────────────────────────────────────────────────────────
    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                <Text style={{ fontSize: 48, marginBottom: 20 }}>📷</Text>
                <Text style={[styles.permTitle, { color: theme.text }]}>Camera Access Required</Text>
                <Text style={[styles.permSubtitle, { color: theme.textSecondary }]}>
                    VitalIQ needs camera access to scan and identify your food items.
                </Text>
                <PressableButton label="Grant Permission" onPress={requestPermission} style={{ marginTop: 24, width: '100%' }} />
            </View>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {cameraActive ? (
                /* ── Camera Viewfinder ──────────────────────────────────── */
                <View style={{ flex: 1 }}>
                    <CameraView style={{ flex: 1 }} ref={cameraRef}>
                        <View style={styles.overlay}>
                            {/* Close button */}
                            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                                    <Text style={styles.closeText}>✕</Text>
                                </TouchableOpacity>
                                <Text style={styles.scanTip}>Point camera at your food</Text>
                                <View style={{ width: 44 }} />
                            </View>

                            {/* Scan frame */}
                            <View style={styles.frameWrapper}>
                                <View style={styles.scanFrame}>
                                    <View style={[styles.corner, styles.cornerTL]} />
                                    <View style={[styles.corner, styles.cornerTR]} />
                                    <View style={[styles.corner, styles.cornerBL]} />
                                    <View style={[styles.corner, styles.cornerBR]} />
                                </View>
                                <Text style={styles.frameHint}>Align food within the frame</Text>
                            </View>

                            {/* Capture button */}
                            <View style={styles.bottomControls}>
                                <TouchableOpacity style={styles.captureRing} onPress={takePhoto} activeOpacity={0.8}>
                                    <View style={styles.captureInner} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                </View>
            ) : (
                /* ── Result Screen ───────────────────────────────────────── */
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <View style={styles.resultHeader}>
                        <TouchableOpacity onPress={resetCamera} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={[styles.backText, { color: theme.primary }]}>← Retake</Text>
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Scan Result</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                        {/* Preview image */}
                        <Image source={{ uri: image }} style={[styles.preview, { borderColor: theme.border }]} />

                        {/* Loading state */}
                        {loading && (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="large" color={theme.primary} />
                                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                    🧠 Analyzing your meal...
                                </Text>
                            </View>
                        )}

                        {/* Result card */}
                        {prediction && (
                            <>
                                {/* ── Auto-meal banner ─────────────────────── */}
                                <Animated.View
                                    style={[
                                        styles.mealBanner,
                                        {
                                            backgroundColor: theme.primaryLight,
                                            borderColor: theme.primary,
                                            opacity: bannerOpacity,
                                            transform: [{ translateY: bannerSlide }],
                                        },
                                    ]}
                                >
                                    <Text style={[styles.bannerText, { color: theme.primary }]}>
                                        {MEAL_ICONS[detectedMeal]} Auto-assigned to{' '}
                                        <Text style={{ fontWeight: '800' }}>{detectedMeal}</Text>
                                        {mealOverridden ? ' (changed)' : ' based on time'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowMealPicker(p => !p)}>
                                        <Text style={[styles.changeBtn, { color: theme.primaryDark }]}>
                                            {showMealPicker ? 'Done ✓' : 'Change'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* ── Meal override picker ─────────────────── */}
                                {showMealPicker && (
                                    <View style={[styles.mealPickerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        {ALL_MEALS.map(meal => (
                                            <TouchableOpacity
                                                key={meal}
                                                style={[
                                                    styles.mealChip,
                                                    {
                                                        backgroundColor: detectedMeal === meal ? theme.primary : theme.surfaceLight,
                                                        borderColor: detectedMeal === meal ? theme.primary : theme.border,
                                                    },
                                                ]}
                                                onPress={() => {
                                                    setDetectedMeal(meal);
                                                    setMealOverridden(true);
                                                    setShowMealPicker(false);
                                                }}
                                            >
                                                <Text style={{ fontSize: 16 }}>{MEAL_ICONS[meal]}</Text>
                                                <Text
                                                    style={[
                                                        styles.mealChipText,
                                                        { color: detectedMeal === meal ? '#FFFFFF' : theme.text },
                                                    ]}
                                                >
                                                    {meal}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* ── Result card ──────────────────────────── */}
                                <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Text style={[styles.resLabel, { color: theme.textSecondary }]}>Detected Item</Text>
                                    <Text style={[styles.resName, { color: theme.text }]}>{prediction.label}</Text>

                                    <View style={[styles.resCalsBox, { backgroundColor: theme.primaryLight }]}>
                                        <Text style={[styles.resCals, { color: theme.primary }]}>
                                            {prediction.calories} kcal
                                        </Text>
                                    </View>

                                    {prediction.macros && (
                                        <View style={styles.macroRow}>
                                            {[
                                                { val: prediction.macros.protein, label: 'Protein' },
                                                { val: prediction.macros.carbs, label: 'Carbs' },
                                                { val: prediction.macros.fat, label: 'Fat' },
                                            ].map(({ val, label }) => (
                                                <View key={label} style={styles.macroBox}>
                                                    <Text style={[styles.macroVal, { color: theme.text }]}>{val}g</Text>
                                                    <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>{label}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <PressableButton
                                        label={`Add to ${detectedMeal}`}
                                        icon={MEAL_ICONS[detectedMeal]}
                                        onPress={handleLog}
                                        style={{ width: '100%', marginTop: 8 }}
                                        size="lg"
                                    />
                                </View>
                            </>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // ── Camera ──
    overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
    closeText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    scanTip: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },

    frameWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: 260, height: 260, position: 'relative' },
    corner: { position: 'absolute', width: 28, height: 28, borderColor: '#22C55E', borderWidth: 3 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
    frameHint: { color: 'rgba(255,255,255,0.7)', marginTop: 14, fontSize: 13 },

    bottomControls: { marginBottom: 52, alignItems: 'center' },
    captureRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#fff' },

    // ── Result ──
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
    backText: { fontWeight: '700', fontSize: FONT.md },
    headerTitle: { fontWeight: '700', fontSize: FONT.lg },

    inner: { paddingHorizontal: SPACING.xl, paddingBottom: 20 },
    preview: { width: '100%', height: 240, borderRadius: RADIUS.xl, marginBottom: SPACING.lg, borderWidth: 1 },

    loadingBox: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 14, fontWeight: '600', fontSize: FONT.md },

    // ── Meal banner ──
    mealBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING.md, paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: SPACING.md,
    },
    bannerText: { fontSize: FONT.sm, flex: 1 },
    changeBtn: { fontWeight: '700', fontSize: FONT.sm, marginLeft: SPACING.sm },

    mealPickerRow: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1,
        marginBottom: SPACING.md,
    },
    mealChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 8, paddingHorizontal: 12,
        borderRadius: RADIUS.pill, borderWidth: 1,
    },
    mealChipText: { fontSize: FONT.sm, fontWeight: '600' },

    // ── Result card ──
    resultCard: { width: '100%', padding: SPACING.xl, borderRadius: RADIUS.xl, borderWidth: 1, alignItems: 'center' },
    resLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
    resName: { fontSize: 30, fontWeight: '900', marginBottom: 14, textAlign: 'center' },
    resCalsBox: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: RADIUS.pill, marginBottom: 20 },
    resCals: { fontSize: 20, fontWeight: '800' },
    macroRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
    macroBox: { alignItems: 'center' },
    macroVal: { fontSize: 18, fontWeight: '800' },
    macroLabel: { fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

    // ── Permission ──
    permTitle: { fontSize: FONT.xl, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
    permSubtitle: { fontSize: FONT.md, textAlign: 'center', lineHeight: 22 },
});
