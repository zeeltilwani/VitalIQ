import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONT, SHADOW } from '../theme';
import api from '../api';

export default function CameraScreen({ route, navigation }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraActive, setCameraActive] = useState(true);
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef(null);

    // ✅ TASK 6: Capture Photo Logic
    const takePhoto = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: false,
            });
            setImage(photo.uri);
            setCameraActive(false);
            identifyFood(photo.uri);
        } catch (e) {
            console.error(e);
            Alert.alert("Camera Error", "Failed to capture photo.");
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
                type: 'image/jpeg'
            });

            const response = await api.post('/ai/identify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // ✅ TASK 3 Frontend Fix: Show errors correctly
            if (response.data.success === false) {
                Alert.alert("Scan Result", response.data.error || "Food not recognized");
            } else {
                setPrediction(response.data);
            }
        } catch (error) {
            console.error('[AI Error]', error);
            Alert.alert('Analysis Failed', 'Could not reach the AI service. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const resetCamera = () => {
        setImage(null);
        setPrediction(null);
        setCameraActive(true);
    };

    const handleLog = () => {
        if (!prediction) return;
        navigation.navigate('Log Food', { prefill: prediction.label, user });
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text, textAlign: 'center', padding: 20 }}>Camera access is required for scanning food.</Text>
                <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary, width: '60%' }]} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {cameraActive ? (
                <View style={{ flex: 1 }}>
                    <CameraView style={{ flex: 1 }} ref={cameraRef}>
                        <View style={styles.overlay}>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                            <View style={styles.bottomControls}>
                                <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                                    <View style={styles.captureInner} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                </View>
            ) : (
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={resetCamera}>
                            <Text style={[styles.backText, { color: theme.primary }]}>← Retake</Text>
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: theme.text }]}>Scan Result</Text>
                        <View style={{ width: 50 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.inner}>
                        <Image source={{ uri: image }} style={styles.preview} />

                        {loading && (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="large" color={theme.primary} />
                                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Analyzing your meal...</Text>
                            </View>
                        )}

                        {prediction && (
                            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Text style={[styles.resLabel, { color: theme.textSecondary }]}>Detected Item</Text>
                                <Text style={[styles.resName, { color: theme.text }]}>{prediction.label}</Text>
                                <View style={[styles.resCalsBox, { backgroundColor: theme.primaryLight }]}>
                                    <Text style={[styles.resCals, { color: theme.primary }]}>{prediction.calories} kcal</Text>
                                </View>
                                
                                <TouchableOpacity style={[styles.mainBtn, { backgroundColor: theme.primary }]} onPress={handleLog}>
                                    <Text style={styles.btnText}>Log to Dairy</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between' },
    closeBtn: { marginTop: 50, marginLeft: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    closeText: { color: '#fff', fontSize: 20 },
    bottomControls: { marginBottom: 50, alignItems: 'center' },
    captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    backText: { fontWeight: 'bold', fontSize: FONT.md },
    title: { fontWeight: 'bold', fontSize: FONT.lg },
    inner: { padding: SPACING.xl, alignItems: 'center' },
    preview: { width: '100%', height: 300, borderRadius: RADIUS.xl, marginBottom: SPACING.xl },
    loadingBox: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 15, fontWeight: 'bold' },
    resultCard: { width: '100%', padding: SPACING.xl, borderRadius: RADIUS.xl, borderWidth: 1, alignItems: 'center' },
    resLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
    resName: { fontSize: 28, fontWeight: '900', marginBottom: 15 },
    resCalsBox: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: RADIUS.pill, marginBottom: 25 },
    resCals: { fontSize: 20, fontWeight: 'bold' },
    mainBtn: { width: '100%', padding: 18, borderRadius: RADIUS.lg, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
