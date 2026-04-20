import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function DietPlanDetailScreen({ route, navigation }) {
    const { plan } = route.params;
    const insets = useSafeAreaInsets();

    const handleDownload = async () => {
        // In a real app, this would be a URL to a real PDF or a local asset 
        // e.g. Linking.openURL('https://vitaliq.app/pdfs/diets/' + plan.id + '.pdf')
        const dummyPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        
        try {
            const supported = await Linking.canOpenURL(dummyPdfUrl);
            if (supported) {
                await Linking.openURL(dummyPdfUrl);
            } else {
                Alert.alert('Error', `Don't know how to open this URL: ${dummyPdfUrl}`);
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while trying to open the PDF.');
            console.error(error);
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
                <View style={styles.iconBox}>
                    <Text style={styles.icon}>{plan.icon}</Text>
                </View>
                
                <Text style={styles.title}>{plan.title}</Text>
                <Text style={styles.desc}>{plan.desc}</Text>

                <View style={styles.contentCard}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Text style={styles.bodyText}>
                        This plan is specifically designed to meet the nutritional requirements for {plan.title.toLowerCase()}. 
                        Follow the daily breakdown meticulously to see optimal results. It balances macronutrients tailored to this specific goal.
                    </Text>

                    <Text style={styles.sectionTitle}>What's Included</Text>
                    <Text style={styles.bullet}>• Complete 7-Day Grocery List</Text>
                    <Text style={styles.bullet}>• Meal Prep Instructions</Text>
                    <Text style={styles.bullet}>• Macronutrient Breakdown per Meal</Text>
                    <Text style={styles.bullet}>• Cheat Meal Guidelines</Text>
                </View>

                <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
                    <Text style={styles.downloadIcon}>📄</Text>
                    <Text style={styles.downloadText}>Download Full PDF Guide</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { padding: 5 },
    backText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
    inner: { padding: 20, alignItems: 'center' },
    
    iconBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 100, height: 100, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    icon: { fontSize: 50 },
    title: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 10 },
    desc: { fontSize: 16, color: COLORS.muted, textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
    
    contentCard: { backgroundColor: COLORS.card, width: '100%', padding: 25, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: '#334155' },
    sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
    bodyText: { color: '#fff', fontSize: 15, lineHeight: 24, marginBottom: 15 },
    bullet: { color: COLORS.muted, fontSize: 15, marginBottom: 8 },

    downloadBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', width: '100%', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    downloadIcon: { fontSize: 20, marginRight: 10 },
    downloadText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
