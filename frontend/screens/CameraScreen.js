import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function CameraScreen({ route, navigation }) {
    const { user } = route.params;
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

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.inner}>
                <Text style={styles.title}>AI Scanner</Text>
                
                <TouchableOpacity style={styles.scanBtn} onPress={pickImage}>
                    <Text style={styles.scanBtnText}>📸 Capture or Upload</Text>
                </TouchableOpacity>

                {image && <Image source={{ uri: image }} style={styles.image} />}

                {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />}

                {prediction && (
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>AI ANALYSIS RESULT</Text>
                        <Text style={styles.foodName}>{prediction.label}</Text>
                        <Text style={styles.calories}>{prediction.calories} kcal</Text>
                        <Text style={styles.confidence}>Confidence: {(prediction.confidence * 100).toFixed(0)}%</Text>
                        
                        <TouchableOpacity 
                            style={styles.logBtn} 
                            onPress={() => navigation.navigate('Log', { prefill: prediction.label })}
                        >
                            <Text style={styles.logBtnText}>Proceed to Log</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { padding: 25, paddingTop: 60, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '900', color: '#fff', alignSelf: 'flex-start', marginBottom: 30 },
    
    scanBtn: { backgroundColor: COLORS.card, padding: 20, borderRadius: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    scanBtnText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
    
    image: { width: '100%', height: 300, borderRadius: 24, marginTop: 25, borderWidth: 4, borderColor: COLORS.card },
    
    card: { backgroundColor: COLORS.card, width: '100%', padding: 25, borderRadius: 24, marginTop: 25, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    cardLabel: { color: COLORS.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
    foodName: { fontSize: 28, fontWeight: '900', color: '#fff' },
    calories: { fontSize: 22, color: COLORS.primary, fontWeight: 'bold', marginVertical: 5 },
    confidence: { color: COLORS.muted, fontSize: 14, marginBottom: 20 },
    
    logBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, width: '100%', alignItems: 'center' },
    logBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
