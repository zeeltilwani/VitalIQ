import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import api from '../api';

const SLIDES = 12;
const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    error: '#ef4444'
};

export default function OnboardingScreen({ route, navigation }) {
    const { user } = route.params;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const triggerFade = () => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => { triggerFade(); }, [step]);

    // Form State
    const [dob, setDob] = useState(new Date(2000, 0, 1));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pincode, setPincode] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [locLoading, setLocLoading] = useState(false);

    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('Male');
    const [goal, setGoal] = useState('Maintain');
    const [targetWeight, setTargetWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('Moderate');
    const [medical, setMedical] = useState('None');

    const calculatedAge = Math.floor((new Date().getTime() - dob.getTime()) / 31557600000);

    // --- Pincode Lookup ---
    useEffect(() => {
        if (pincode.length === 6) {
            lookupPincode(pincode);
        } else {
            setCity('');
            setState('');
        }
    }, [pincode]);

    const lookupPincode = async (code) => {
        setLocLoading(true);
        try {
            const res = await axios.get(`https://api.postalpincode.in/pincode/${code}`);
            if (res.data[0].Status === 'Success') {
                const data = res.data[0].PostOffice[0];
                setCity(data.District);
                setState(data.State);
            } else {
                Toast.show({ type: 'error', text1: 'Invalid Pincode', text2: 'No details found for this code.' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLocLoading(false);
        }
    };

    // --- Validation Logic ---
    const isStepValid = () => {
        switch(step) {
            case 4: return calculatedAge >= 5 && calculatedAge <= 110;
            case 5: return pincode.length === 6 && city !== '';
            case 6: {
                const h = parseFloat(height);
                const w = parseFloat(weight);
                return h >= 50 && h <= 250 && w >= 20 && w <= 300;
            }
            case 9: {
                const tw = parseFloat(targetWeight);
                const cw = parseFloat(weight);
                if (!tw) return false;
                if (goal === 'Weight Loss') return tw < cw;
                if (goal === 'Weight Gain') return tw > cw;
                return true;
            }
            case 11: return medical.trim().length > 0;
            default: return true;
        }
    };

    const getError = () => {
        if (step === 4 && (calculatedAge < 5 || calculatedAge > 110)) return "Age must be between 5 and 110.";
        if (step === 6) {
            const h = parseFloat(height);
            const w = parseFloat(weight);
            if (height && (h < 50 || h > 250)) return "Height must be 50-250 cm.";
            if (weight && (w < 20 || w > 300)) return "Weight must be 20-300 kg.";
        }
        if (step === 9) {
            const tw = parseFloat(targetWeight);
            const cw = parseFloat(weight);
            if (tw) {
                if (goal === 'Weight Loss' && tw >= cw) return "Target should be LESS than current weight.";
                if (goal === 'Weight Gain' && tw <= cw) return "Target should be MORE than current weight.";
            }
        }
        return null;
    };

    const submitOnboarding = async () => {
        setLoading(true);
        try {
            await api.post('/user/onboarding', {
                age: calculatedAge,
                dob: dob.toISOString().split('T')[0],
                pincode,
                city,
                state,
                height: parseFloat(height),
                weight: parseFloat(weight),
                gender,
                goal,
                target_weight: parseFloat(targetWeight),
                activity_level: activityLevel,
                medical_conditions: medical
            });

            Toast.show({ type: 'success', text1: 'Profile Built!', text2: 'Launching your dashboard...' });
            navigation.replace('MainApp', { screen: 'Home', params: { user: { ...user, is_onboarded: true } } });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Onboarding Failed', text2: error.response?.data?.error || 'Server error' });
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (!isStepValid()) {
            Alert.alert('Validation', getError() || 'Please fill the required field correctly.');
            return;
        }
        if (step < SLIDES) setStep(step + 1);
        else submitOnboarding();
    };

    const SelectionBtn = ({ label, selectedVal, setVal }) => (
        <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setVal(label)}
            style={[styles.selBtn, selectedVal === label && styles.selBtnActive]}
        >
            <Text style={[styles.selBtnText, selectedVal === label && { color: COLORS.primary }]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderSlide = () => {
        switch(step) {
            case 1: return <View style={styles.slide}><Text style={styles.icon}>🥗</Text><Text style={styles.title}>Clean Fuel</Text><Text style={styles.desc}>Precision calorie tracking for your unique physiology.</Text></View>;
            case 2: return <View style={styles.slide}><Text style={styles.icon}>🔬</Text><Text style={styles.title}>Validated Stats</Text><Text style={styles.desc}>We use production-grade health metrics to calculate your blueprint.</Text></View>;
            case 3: return <View style={styles.slide}><Text style={styles.icon}>🚀</Text><Text style={styles.title}>Zero Friction</Text><Text style={styles.desc}>Automated logging. Intelligent scanning. Real results.</Text></View>;
            
            case 4: return (
                <View style={styles.slide}>
                    <Text style={styles.qIcon}>📅</Text>
                    <Text style={styles.qTitle}>Birth Date</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.inputText}>{dob.toDateString()}</Text>
                    </TouchableOpacity>
                    <Text style={styles.hint}>Calculated Age: {calculatedAge}</Text>
                    {showDatePicker && <DateTimePicker value={dob} mode="date" display="spinner" onChange={(_, d) => { setShowDatePicker(false); if(d) setDob(d); }} />}
                </View>
            );
            
            case 5: return (
                <View style={styles.slide}>
                    <Text style={styles.qIcon}>📍</Text>
                    <Text style={styles.qTitle}>Where do you live?</Text>
                    <TextInput 
                        style={styles.input} 
                        keyboardType="numeric" 
                        maxLength={6} 
                        placeholder="6-digit Pincode" 
                        placeholderTextColor={COLORS.muted}
                        value={pincode}
                        onChangeText={setPincode}
                    />
                    {locLoading ? <ActivityIndicator style={{marginTop: 15}} color={COLORS.primary} /> : (
                        city && <Text style={styles.locText}>{city}, {state}</Text>
                    )}
                </View>
            );

            case 6: return (
                <View style={styles.slide}>
                    <Text style={styles.qIcon}>⚖️</Text>
                    <Text style={styles.qTitle}>Physical Metrics</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholder="Height (cm)" placeholderTextColor={COLORS.muted} />
                    <TextInput style={[styles.input, {marginTop: 15}]} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="Weight (kg)" placeholderTextColor={COLORS.muted} />
                    {getError() && <Text style={styles.errorText}>{getError()}</Text>}
                </View>
            );

            case 7: return <View style={styles.slide}><Text style={styles.qIcon}>🚻</Text><Text style={styles.qTitle}>Gender</Text><SelectionBtn label="Male" selectedVal={gender} setVal={setGender} /><SelectionBtn label="Female" selectedVal={gender} setVal={setGender} /></View>;
            case 8: return <View style={styles.slide}><Text style={styles.qIcon}>🎯</Text><Text style={styles.qTitle}>Main Strategy</Text><SelectionBtn label="Weight Loss" selectedVal={goal} setVal={setGoal} /><SelectionBtn label="Muscle Gain" selectedVal={goal} setVal={setGoal} /><SelectionBtn label="Maintain" selectedVal={goal} setVal={setGoal} /></View>;
            
            case 9: return (
                <View style={styles.slide}>
                    <Text style={styles.qIcon}>🏅</Text>
                    <Text style={styles.qTitle}>Target Weight (kg)</Text>
                    <Text style={styles.hint}>Current: {weight} kg | Goal: {goal}</Text>
                    <TextInput 
                        style={[styles.input, {marginTop: 15}]} 
                        keyboardType="numeric" 
                        value={targetWeight} 
                        onChangeText={setTargetWeight} 
                        placeholder={goal === 'Weight Loss' ? `Suggested: <${weight}` : `Suggested: >${weight}`} 
                        placeholderTextColor={COLORS.muted} 
                    />
                    {getError() && <Text style={styles.errorText}>{getError()}</Text>}
                </View>
            );

            case 10: return (
                <View style={styles.slide}>
                    <Text style={styles.qIcon}>⚡</Text>
                    <Text style={styles.qTitle}>Daily Activity</Text>
                    <SelectionBtn label="Sedentary" selectedVal={activityLevel} setVal={setActivityLevel} />
                    <SelectionBtn label="Moderate" selectedVal={activityLevel} setVal={setActivityLevel} />
                    <SelectionBtn label="Active" selectedVal={activityLevel} setVal={setActivityLevel} />
                </View>
            );

            case 11: return <View style={styles.slide}><Text style={styles.qIcon}>🩺</Text><Text style={styles.qTitle}>Medical Status</Text><TextInput style={styles.input} value={medical} onChangeText={setMedical} placeholder="Any conditions? (e.g. None)" placeholderTextColor={COLORS.muted} /></View>;
            case 12: return <View style={styles.slide}><Text style={styles.qIcon}>✅</Text><Text style={styles.qTitle}>Validation Success</Text><Text style={styles.desc}>We've verified all metrics. Ready to generate your health blueprint.</Text></View>;
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => step > 1 && setStep(step - 1)} style={{ opacity: step > 1 ? 1 : 0 }}><Text style={styles.headerText}>← Back</Text></TouchableOpacity>
                    <Text style={styles.progress}>{step}/{SLIDES}</Text>
                    <View style={{width: 50}} />
                </View>

                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {renderSlide()}
                    </ScrollView>
                </Animated.View>

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.nextBtn, !isStepValid() && { opacity: 0.5 }]} 
                        onPress={nextStep}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>{step === SLIDES ? "Launch Profile" : "Continue"}</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 60, alignItems: 'center' },
    headerText: { color: COLORS.muted, fontSize: 16, fontWeight: 'bold' },
    progress: { color: COLORS.primary, fontWeight: '900', fontSize: 18 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 25 },
    slide: { alignItems: 'center', width: '100%' },
    icon: { fontSize: 80, marginBottom: 30 },
    title: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 15 },
    desc: { fontSize: 18, color: COLORS.muted, textAlign: 'center', lineHeight: 26 },
    qIcon: { fontSize: 50, marginBottom: 20 },
    qTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 15, textAlign: 'center' },
    hint: { color: COLORS.muted, fontSize: 14, marginBottom: 15 },
    input: { backgroundColor: COLORS.bg, width: '100%', borderRadius: 16, padding: 20, color: '#fff', fontSize: 18, textAlign: 'center', borderWidth: 1, borderColor: '#334155' },
    inputText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    locText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    errorText: { color: COLORS.error, fontSize: 14, marginTop: 15, fontWeight: 'bold' },
    selBtn: { width: '100%', backgroundColor: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    selBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    selBtnText: { color: COLORS.muted, fontSize: 18, fontWeight: 'bold' },
    footer: { padding: 25, paddingBottom: 50 },
    nextBtn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 16, alignItems: 'center' },
    nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
