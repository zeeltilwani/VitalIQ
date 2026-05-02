import React from 'react';
import { View, Text, StatusBar, StyleSheet } from 'react-native';
import { Home, Salad, Dumbbell, User, ClipboardList } from 'lucide-react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import Dashboard from './screens/Dashboard';
import CameraScreen from './screens/CameraScreen';
import ChatScreen from './screens/ChatScreen';
import AddFoodScreen from './screens/AddFoodScreen';
import ProfileScreen from './screens/ProfileScreen';
import DietPlansScreen from './screens/DietPlansScreen';
import DietPlanDetailScreen from './screens/DietPlanDetailScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';

// Workout module (merged — single tab)
import WorkoutScreen from './screens/WorkoutScreen';
import ExerciseListScreen from './screens/ExerciseListScreen';
import ExerciseIntroScreen from './screens/ExerciseIntroScreen';
import ExerciseTimerScreen from './screens/ExerciseTimerScreen';
import RestScreen from './screens/RestScreen';
import WorkoutModeScreen from './screens/WorkoutModeScreen';

// Global Components
import FloatingAI from './components/FloatingAI';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Error Boundary ───
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('App Error Boundary caught:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Text style={{ color: '#EF4444', fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>⚠️ App Error</Text>
                    <Text style={{ color: '#F5F5F5', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
                        Something went wrong. Please restart the app.
                    </Text>
                    <Text style={{ color: '#888888', fontSize: 12, textAlign: 'center' }}>
                        {this.state.error?.toString()}
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}

function TabIcon({ name, focused, theme }) {
    const size = 24;
    const color = focused ? theme.primary : theme.textSecondary;
    const strokeWidth = focused ? 2.5 : 2;

    if (name === 'Home') {
        return (
            <View style={styles.iconWrapper}>
                <Home size={size} color={color} strokeWidth={strokeWidth} />
                {focused && <View style={[styles.homeIndicator, { backgroundColor: theme.primary }]} />}
            </View>
        );
    }
    if (name === 'Diet Plans') {
        return (
            <View style={styles.iconWrapper}>
                <ClipboardList size={size} color={color} strokeWidth={strokeWidth} />
            </View>
        );
    }
    if (name === 'Workout') {
        return (
            <View style={styles.iconWrapper}>
                <Dumbbell size={size} color={color} strokeWidth={strokeWidth} />
            </View>
        );
    }
    if (name === 'Profile') {
        return (
            <View style={styles.iconWrapper}>
                <User size={size} color={color} strokeWidth={strokeWidth} />
                {focused && <View style={[styles.profileIndicator, { borderColor: theme.primary }]} />}
            </View>
        );
    }
    return null;
}

function MainAppTabs({ route }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <Tab.Navigator
                screenOptions={({ route: tabRoute }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: theme.primary,
                    tabBarInactiveTintColor: theme.textSecondary,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: insets.bottom > 0 ? insets.bottom : 12,
                        left: 12,
                        right: 12,
                        borderRadius: 20,
                        height: 64,
                        backgroundColor: theme.surface,
                        borderTopWidth: 0,
                        paddingBottom: 8,
                        paddingTop: 8,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                        borderWidth: 1,
                        borderColor: theme.border,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        paddingBottom: 4,
                    },
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={tabRoute.name} focused={focused} theme={theme} />
                    ),
                })}
            >
                <Tab.Screen name="Home" component={Dashboard} initialParams={{ user }} />
                <Tab.Screen name="Diet Plans" component={DietPlansScreen} initialParams={{ user }} />
                <Tab.Screen name="Workout" component={WorkoutScreen} initialParams={{ user }} />
                <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ user }} />
            </Tab.Navigator>

            {/* Global Floating AI Chatbot */}
            <FloatingAI />
        </View>
    );
}

function AppContent() {
    const { isDarkMode, theme } = useTheme();

    const NavigationTheme = isDarkMode ? DarkTheme : DefaultTheme;
    const CustomTheme = {
        ...NavigationTheme,
        colors: {
            ...NavigationTheme.colors,
            primary: theme.primary,
            background: theme.bg,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
        },
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.bg} />
            <NavigationContainer theme={CustomTheme}>
                <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: theme.bg },
                    }}
                >
                    {/* Auth Stack */}
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />

                    {/* Main Tabs */}
                    <Stack.Screen name="MainApp" component={MainAppTabs} />

                    {/* Modals / Subscreens */}
                    <Stack.Screen name="Log Food" component={AddFoodScreen} />
                    <Stack.Screen name="Scan Food" component={CameraScreen} />
                    <Stack.Screen name="Ask AI" component={ChatScreen} />
                    <Stack.Screen name="DietPlanDetail" component={DietPlanDetailScreen} />
                    <Stack.Screen name="Analytics" component={AnalyticsScreen} />

                    {/* Workout Flow */}
                    <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
                    <Stack.Screen name="ExerciseIntro" component={ExerciseIntroScreen} />
                    <Stack.Screen name="ExerciseTimer" component={ExerciseTimerScreen} />
                    <Stack.Screen name="RestScreen" component={RestScreen} />
                    <Stack.Screen name="WorkoutMode" component={WorkoutModeScreen} />
                </Stack.Navigator>
            </NavigationContainer>
            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
    },
    homeIndicator: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 2,
        borderRadius: 1,
    },
    profileIndicator: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: '45deg' }],
    },
});

export default function App() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
