import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Part 1: Persist per-user theme using AsyncStorage (key: userId_theme)
    const getStorageKey = (userId) => `${userId || 'guest'}_theme`;

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
        // ─── Backgrounds ───
        bg:           isDarkMode ? '#0D1B2A'  : '#E3F2FD',  // dark: navy blue  | light: sky blue
        surface:      isDarkMode ? '#1B263B'  : '#FCE4EC',  // dark: dark card  | light: baby pink
        surfaceLight: isDarkMode ? '#243447'  : '#F3E5F5',  // dark: elevated   | light: soft lavender
        
        // ─── Text ───
        text:          isDarkMode ? '#E8EDF2' : '#1A237E',  // dark: off-white  | light: deep indigo
        textSecondary: isDarkMode ? '#8899AA' : '#546E7A',  // dark: muted blue-grey | light: blue-grey
        textInverse:   '#FFFFFF',
        
        // ─── Borders ───
        border: isDarkMode ? '#2C3E50' : '#B0BEC5',
        
        // ─── Brand colors ───
        primary:      isDarkMode ? '#4CAF50' : '#64B5F6',   // dark: green | light: sky blue
        primaryLight: isDarkMode ? 'rgba(76,175,80,0.15)'  : 'rgba(100,181,246,0.2)',
        primaryDark:  isDarkMode ? '#388E3C' : '#1E88E5',
        accent:       isDarkMode ? '#FF9800' : '#F57C00',   // orange (both modes)
        accentLight:  isDarkMode ? 'rgba(255,152,0,0.15)'  : 'rgba(245,124,0,0.15)',
        
        // ─── Semantic ───
        success: isDarkMode ? '#4CAF50' : '#388E3C',
        danger:  '#EF5350',
        dangerLight: 'rgba(239,83,80,0.15)',
        warning: isDarkMode ? '#FF9800' : '#EF6C00',
        info:    isDarkMode ? '#42A5F5' : '#1565C0',
        infoLight: isDarkMode ? 'rgba(66,165,245,0.15)' : 'rgba(21,101,192,0.12)',
        
        // ─── Aesthetics (Part 9) ───
        shadow: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
        radius: {
            sm: 8,
            md: 12,
            lg: 16,
            xl: 24,
            pill: 999
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            xxl: 48
        },
        isDarkMode,
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, loadTheme, clearThemeState }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
