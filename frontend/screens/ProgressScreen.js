import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import api from '../api';

const { width } = Dimensions.get('window');

export default function ProgressScreen({ route }) {
    const { user } = route.params || {};
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    
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
        backgroundGradientFrom: theme.surface,
        backgroundGradientTo: theme.surface,
        color: (opacity = 1) => theme.primary,
        labelColor: (opacity = 1) => theme.textSecondary,
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
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <LinearGradient colors={[theme.bg, theme.surface]} style={StyleSheet.absoluteFill} />
            
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Your Progress</Text>
                <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Track your consistency and metrics.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
                {/* Calories Chart */}
                <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.chartTitle, { color: theme.text }]}>7-Day Calorie Trend</Text>
                    {loading ? <ActivityIndicator color={theme.primary} style={{height: 180}} /> : trend.length > 0 ? (
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
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Not enough data to graph.</Text>
                    )}
                </View>

                {/* Weight Chart */}
                <View style={[styles.chartCard, { marginTop: 20, backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.chartTitle, { color: theme.text }]}>Weight Trend (30 Days)</Text>
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
                            color: (opacity = 1) => theme.info || '#3b82f6', // Info color or fallback
                        }}
                        bezier
                        style={{ marginVertical: 10, borderRadius: 16 }}
                    />
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.summaryTitle, { color: theme.primary }]}>Weekly Summary</Text>
                    <View style={[styles.row, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Goal Consistency</Text>
                        <Text style={[styles.rowValue, { color: theme.text }]}>85%</Text>
                    </View>
                    <View style={[styles.row, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Avg. Daily Calories</Text>
                        <Text style={[styles.rowValue, { color: theme.text }]}>
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
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
    headerTitle: { fontSize: 28, fontWeight: '900' },
    headerSub: { fontSize: 14, marginTop: 5 },
    inner: { padding: 20 },
    
    chartCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
    chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    emptyText: { textAlign: 'center', marginTop: 20, marginBottom: 20 },
    
    summaryCard: { padding: 25, borderRadius: 24, marginTop: 20, borderWidth: 1 },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
    rowLabel: { fontSize: 15 },
    rowValue: { fontSize: 15, fontWeight: 'bold' }
});
