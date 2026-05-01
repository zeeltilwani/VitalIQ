import React from 'react';
import { View, Text, StatusBar } from 'react-native';
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
                <View style={{ flex: 1, backgroundColor: '#0D1B2A', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                    <Text style={{ color: '#EF5350', fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>⚠️ App Error</Text>
                    <Text style={{ color: '#E8EDF2', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
                        Something went wrong. Please restart the app.
                    </Text>
                    <Text style={{ color: '#8899AA', fontSize: 12, textAlign: 'center' }}>
                        {this.state.error?.toString()}
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}

function TabIcon({ name, focused, theme }) {
    let icon = '';
    if (name === 'Home') icon = '🏠';
    else if (name === 'Diet Plans') icon = '🥗';
    else if (name === 'Workout') icon = '🏋️';
    else if (name === 'Profile') icon = '👤';
    return (
        <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.7, color: focused ? theme.primary : theme.textSecondary }}>
            {icon}
        </Text>
    );
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
                    <Stack.Screen name="WorkoutMode" component={WorkoutModeScreen} />
                </Stack.Navigator>
            </NavigationContainer>
            <Toast />
        </View>
    );
}

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
