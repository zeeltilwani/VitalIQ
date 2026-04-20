import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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
import ProgressScreen from './screens/ProgressScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Theme Constants
const COLORS = {
    primary: '#10b981',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8'
};

const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: COLORS.primary,
        background: COLORS.background,
        card: COLORS.card,
        text: COLORS.text,
        border: '#334155'
    }
};

function MainAppTabs({ route }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.muted,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: insets.bottom > 0 ? insets.bottom : 15,
                    left: 20,
                    right: 20,
                    borderRadius: 25,
                    height: 70,
                    backgroundColor: COLORS.card,
                    borderTopWidth: 0,
                    paddingBottom: 10,
                    paddingTop: 10,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 5 }
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '700', paddingBottom: 5 },
                tabBarIcon: ({ color, focused }) => {
                    let icon = '';
                    if (route.name === 'Home') icon = focused ? '🏠' : '🏚️';
                    else if (route.name === 'Diet Plans') icon = focused ? '🥗' : '🍲';
                    else if (route.name === 'Progress') icon = focused ? '📈' : '📊';
                    else if (route.name === 'Profile') icon = focused ? '👤' : '👥';
                    return <Text style={{ color, fontSize: 24 }}>{icon}</Text>;
                }
            })}
        >
            <Tab.Screen name="Home" component={Dashboard} initialParams={{ user }} />
            <Tab.Screen name="Diet Plans" component={DietPlansScreen} initialParams={{ user }} />
            <Tab.Screen name="Progress" component={ProgressScreen} initialParams={{ user }} />
            <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ user }} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <NavigationContainer theme={CustomDarkTheme}>
                    <Stack.Navigator 
                        initialRouteName="Login" 
                        screenOptions={{ 
                            headerShown: false,
                            cardStyle: { backgroundColor: COLORS.background }
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
                    </Stack.Navigator>
                </NavigationContainer>
                <Toast />
            </View>
        </SafeAreaProvider>
    );
}
