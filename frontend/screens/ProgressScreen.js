import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#10b981',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

export default function ProgressScreen({ route }) {
    const { user } = route.params || {};
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    
    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState([]);

    const fetchTrend = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/logs/trend');
            setTrend(res.data);
        } catch (err) {
            console.error('Fetch trend error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (isFocused) fetchTrend(); }, [isFocused, fetchTrend]);

    const chartConfig = {
        backgroundGradientFrom: COLORS.card,
        backgroundGradientTo: COLORS.card,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        labelColor: (opacity = 1) => COLORS.muted,
        barPercentage: 0.6,
        decimalPlaces: 0,
    };

    // Mock Weight Trend Data (since actual historical weight tracking isn't in schema yet)
    const mockWeightLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const currentWeight = user?.weight || 70;
    const mockWeightData = user?.goal === 'Weight Loss' 
        ? [currentWeight + 2, currentWeight + 1.2, currentWeight + 0.5, currentWeight]
        : [currentWeight - 2, currentWeight - 1.2, currentWeight - 0.5, currentWeight];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={[COLORS.bg, COLORS.card]} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Progress</Text>
                <Text style={styles.headerSub}>Track your consistency and metrics.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                {/* Calories Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>7-Day Calorie Trend</Text>
                    {loading ? <ActivityIndicator color={COLORS.primary} style={{height: 180}} /> : trend.length > 0 ? (
                        <BarChart
                            data={{
                                labels: trend.map(t => new Date(t.date).toLocaleDateString(undefined, { weekday: 'short' })),
                                datasets: [{ data: trend.map(t => t.calories) }]
                            }}
                            width={width - 50}
                            height={200}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={chartConfig}
                            style={{ marginVertical: 10, borderRadius: 16 }}
                            fromZero
                        />
                    ) : (
                        <Text style={styles.emptyText}>Not enough data to graph.</Text>
                    )}
                </View>

                {/* Weight Chart */}
                <View style={[styles.chartCard, { marginTop: 20 }]}>
                    <Text style={styles.chartTitle}>Weight Trend (30 Days)</Text>
                    <LineChart
                        data={{
                            labels: mockWeightLabels,
                            datasets: [{ data: mockWeightData }]
                        }}
                        width={width - 50}
                        height={200}
                        yAxisLabel=""
                        yAxisSuffix="kg"
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for weight
                        }}
                        bezier
                        style={{ marginVertical: 10, borderRadius: 16 }}
                    />
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Weekly Summary</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Goal Consistency</Text>
                        <Text style={styles.rowValue}>85%</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Avg. Daily Calories</Text>
                        <Text style={styles.rowValue}>
                            {trend.length ? Math.round(trend.reduce((a, b) => a + b.calories, 0) / trend.length) : 0} kcal
                        </Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
    headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
    headerSub: { fontSize: 14, color: COLORS.muted, marginTop: 5 },
    inner: { padding: 20 },
    
    chartCard: { backgroundColor: COLORS.card, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#334155' },
    chartTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: 20, marginBottom: 20 },
    
    summaryCard: { backgroundColor: COLORS.card, padding: 25, borderRadius: 24, marginTop: 20, borderWidth: 1, borderColor: '#334155' },
    summaryTitle: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
    rowLabel: { color: COLORS.muted, fontSize: 15 },
    rowValue: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
