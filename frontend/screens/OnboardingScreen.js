import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Animated, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { SPACING, RADIUS, FONT, COLORS, SHADOW } from '../theme';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import PressableButton from '../components/PressableButton';
import { 
    Salad, Microscope, Rocket, Calendar, MapPin, Scale, 
    Users, Target, Trophy, Zap, Stethoscope, CheckCircle,
    ChevronLeft, ChevronRight
} from 'lucide-react-native';

const SLIDES = 12;

export default function OnboardingScreen({ route, navigation }) {
    const { user } = route.params || {};
    const { theme } = useTheme();
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
                if (goal === 'Weight Loss' && tw >= cw) return "Target weight must be less than current.";
                if (goal === 'Weight Gain' && tw <= cw) return "Target weight must be more than current.";
            }
        }
        return null;
    };

    const submitOnboarding = async () => {
        setLoading(true);
        try {
            const response = await api.post('/user/onboarding', {
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

            if (response.data.success) {
                Toast.show({ type: 'success', text1: 'Profile Built!', text2: 'Launching your dashboard...' });
                navigation.replace('MainApp', { screen: 'Home', params: { user: { ...user, is_onboarded: true } } });
            }
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
            style={[
                styles.selBtn, 
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedVal === label && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
            ]}
        >
            <Text style={[styles.selBtnText, { color: theme.textSecondary }, selectedVal === label && { color: theme.primary }]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderSlide = () => {
        switch(step) {
            case 1: return <View style={styles.slide}><Salad size={80} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.title, { color: theme.text }]}>Clean Fuel</Text><Text style={[styles.desc, { color: theme.textSecondary }]}>Precision calorie tracking for your unique physiology.</Text></View>;
            case 2: return <View style={styles.slide}><Microscope size={80} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.title, { color: theme.text }]}>Validated Stats</Text><Text style={[styles.desc, { color: theme.textSecondary }]}>We use production-grade health metrics to calculate your blueprint.</Text></View>;
            case 3: return <View style={styles.slide}><Rocket size={80} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.title, { color: theme.text }]}>Zero Friction</Text><Text style={[styles.desc, { color: theme.textSecondary }]}>Automated logging. Intelligent scanning. Real results.</Text></View>;
            
            case 4: return (
                <View style={styles.slide}>
                    <Calendar size={60} color={theme.primary} style={{marginBottom: 20}} />
                    <Text style={[styles.qTitle, { color: theme.text }]}>Birth Date</Text>
                    <TouchableOpacity style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.inputText, { color: theme.text }]}>{dob.toDateString()}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.hint, { color: theme.textSecondary }]}>Calculated Age: {calculatedAge}</Text>
                    {showDatePicker && <DateTimePicker value={dob} mode="date" display="spinner" onChange={(_, d) => { setShowDatePicker(false); if(d) setDob(d); }} />}
                </View>
            );
            
            case 5: return (
                <View style={styles.slide}>
                    <MapPin size={60} color={theme.primary} style={{marginBottom: 20}} />
                    <Text style={[styles.qTitle, { color: theme.text }]}>Where do you live?</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} 
                        keyboardType="numeric" 
                        maxLength={6} 
                        placeholder="6-digit Pincode" 
                        placeholderTextColor={theme.textSecondary}
                        value={pincode}
                        onChangeText={setPincode}
                    />
                    {locLoading ? <ActivityIndicator style={{marginTop: 15}} color={theme.primary} /> : (
                        city && <Text style={[styles.locText, { color: theme.primary }]}>{city}, {state}</Text>
                    )}
                </View>
            );

            case 6: return (
                <View style={styles.slide}>
                    <Scale size={60} color={theme.primary} style={{marginBottom: 20}} />
                    <Text style={[styles.qTitle, { color: theme.text }]}>Physical Metrics</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} 
                        keyboardType="decimal-pad" 
                        value={height} 
                        onChangeText={setHeight} 
                        placeholder="Height (cm)" 
                        placeholderTextColor={theme.textSecondary} 
                        returnKeyType="next"
                        autoCorrect={false}
                    />
                    <TextInput 
                        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text, marginTop: 15 }]} 
                        keyboardType="decimal-pad" 
                        value={weight} 
                        onChangeText={setWeight} 
                        placeholder="Weight (kg)" 
                        placeholderTextColor={theme.textSecondary} 
                        returnKeyType="done"
                        autoCorrect={false}
                    />
                    {getError() && <Text style={[styles.errorText, { color: theme.danger }]}>{getError()}</Text>}
                </View>
            );

            case 7: return <View style={styles.slide}><Users size={60} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.qTitle, { color: theme.text }]}>Gender</Text><SelectionBtn label="Male" selectedVal={gender} setVal={setGender} /><SelectionBtn label="Female" selectedVal={gender} setVal={setGender} /></View>;
            case 8: return <View style={styles.slide}><Target size={60} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.qTitle, { color: theme.text }]}>Main Strategy</Text><SelectionBtn label="Weight Loss" selectedVal={goal} setVal={setGoal} /><SelectionBtn label="Muscle Gain" selectedVal={goal} setVal={setGoal} /><SelectionBtn label="Maintain" selectedVal={goal} setVal={setGoal} /></View>;
            
            case 9: return (
                <View style={styles.slide}>
                    <Trophy size={60} color={theme.primary} style={{marginBottom: 20}} />
                    <Text style={[styles.qTitle, { color: theme.text }]}>Target Weight (kg)</Text>
                    <Text style={[styles.hint, { color: theme.textSecondary }]}>Current: {weight} kg | Goal: {goal}</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text, marginTop: 15 }]} 
                        keyboardType="decimal-pad" 
                        value={targetWeight} 
                        onChangeText={setTargetWeight} 
                        placeholder={goal === 'Weight Loss' ? `Suggested: <${weight}` : `Suggested: >${weight}`} 
                        placeholderTextColor={theme.textSecondary} 
                        returnKeyType="done"
                        autoCorrect={false}
                    />
                    {getError() && <Text style={[styles.errorText, { color: theme.danger }]}>{getError()}</Text>}
                </View>
            );

            case 10: return (
                <View style={styles.slide}>
                    <Zap size={60} color={theme.primary} style={{marginBottom: 20}} />
                    <Text style={[styles.qTitle, { color: theme.text }]}>Daily Activity</Text>
                    <SelectionBtn label="Sedentary" selectedVal={activityLevel} setVal={setActivityLevel} />
                    <SelectionBtn label="Moderate" selectedVal={activityLevel} setVal={setActivityLevel} />
                    <SelectionBtn label="Active" selectedVal={activityLevel} setVal={setActivityLevel} />
                </View>
            );

            case 11: return <View style={styles.slide}><Stethoscope size={60} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.qTitle, { color: theme.text }]}>Medical Status</Text><TextInput style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]} value={medical} onChangeText={setMedical} placeholder="Any conditions? (e.g. None)" placeholderTextColor={theme.textSecondary} /></View>;
            case 12: return <View style={styles.slide}><CheckCircle size={60} color={theme.primary} style={{marginBottom: 20}} /><Text style={[styles.qTitle, { color: theme.text }]}>Validation Success</Text><Text style={[styles.desc, { color: theme.textSecondary }]}>We've verified all metrics. Ready to generate your health blueprint.</Text></View>;
            default: return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View style={styles.header}>
                    <PressableButton
                        variant="ghost"
                        icon={<ChevronLeft size={24} color={theme.textSecondary} />}
                        onPress={() => step > 1 && setStep(step - 1)}
                        style={{ opacity: step > 1 ? 1 : 0 }}
                    />
                    <Text style={[styles.progress, { color: theme.primary }]}>{step}/{SLIDES}</Text>
                    <View style={{width: 44}} />
                </View>

                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {renderSlide()}
                    </ScrollView>
                </Animated.View>

                <View style={styles.footer}>
                    <PressableButton
                        label={step === SLIDES ? "Launch Profile" : "Continue"}
                        icon={step === SLIDES ? <CheckCircle size={20} color="#fff" /> : <ChevronRight size={20} color="#fff" />}
                        onPress={nextStep}
                        loading={loading}
                        disabled={!isStepValid()}
                        size="lg"
                        style={{ width: '100%' }}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, paddingTop: 60, alignItems: 'center' },
    headerText: { fontSize: 16, fontWeight: 'bold' },
    progress: { fontWeight: '900', fontSize: 18 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 25 },
    slide: { alignItems: 'center', width: '100%' },
    icon: { fontSize: 80, marginBottom: 30 },
    title: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 15 },
    desc: { fontSize: 18, textAlign: 'center', lineHeight: 26 },
    qIcon: { fontSize: 50, marginBottom: 20 },
    qTitle: { fontSize: 26, fontWeight: '900', marginBottom: 15, textAlign: 'center' },
    hint: { fontSize: 14, marginBottom: 15 },
    input: { width: '100%', borderRadius: 16, padding: 20, fontSize: 18, textAlign: 'center', borderWidth: 1 },
    inputText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    locText: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    errorText: { fontSize: 14, marginTop: 15, fontWeight: 'bold' },
    selBtn: { width: '100%', borderRadius: 16, padding: 18, marginBottom: 15, alignItems: 'center', borderWidth: 1 },
    selBtnText: { fontSize: 18, fontWeight: 'bold' },
    footer: { padding: 25, paddingBottom: 50 },
    nextBtn: { padding: 20, borderRadius: 16, alignItems: 'center' },
    nextText: { fontSize: 18, fontWeight: 'bold' }
});
