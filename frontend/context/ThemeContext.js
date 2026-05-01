import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const getStorageKey = (userId) => `theme_user_${userId || 'guest'}`;

    const loadTheme = async (userId) => {
        try {
            const key = getStorageKey(userId);
            const savedTheme = await AsyncStorage.getItem(key);
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                setIsDarkMode(true); // Default to DARK
            }
            setCurrentUserId(userId);
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        try {
            const newValue = !isDarkMode;
            setIsDarkMode(newValue);
            const key = getStorageKey(currentUserId);
            await AsyncStorage.setItem(key, newValue ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const clearThemeState = () => {
        setIsDarkMode(true);
        setCurrentUserId(null);
    };

    const theme = {
        bg: isDarkMode ? COLORS.bg : '#FFFFFF',
        surface: isDarkMode ? COLORS.surface : '#F8FAFC',
        surfaceLight: isDarkMode ? COLORS.surfaceLight : '#F1F5F9',
        text: isDarkMode ? COLORS.text : '#0F172A',
        textSecondary: isDarkMode ? COLORS.textSecondary : '#64748B',
        border: isDarkMode ? COLORS.border : '#E2E8F0',
        primary: COLORS.primary,
        primaryLight: COLORS.primaryLight,
        accent: COLORS.accent,
        danger: COLORS.danger,
        success: COLORS.success,
        warning: COLORS.warning,
        info: COLORS.info,
        isDarkMode
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, loadTheme, clearThemeState }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
