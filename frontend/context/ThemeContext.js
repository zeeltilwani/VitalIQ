import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

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
        bg:           isDarkMode ? '#000000'  : '#F8F5F0',   // pitch black | soft beige
        surface:      isDarkMode ? '#111111'  : '#FFFFFF',   // near-black card | pure white
        surfaceLight: isDarkMode ? '#1A1A1A'  : '#F0EDE8',   // elevated surface | muted beige

        // ─── Text ───
        text:          isDarkMode ? '#F5F5F5' : '#1A1A1A',   // off-white | near-black
        textSecondary: isDarkMode ? '#888888' : '#6B7280',   // muted grey both modes
        textInverse:   '#FFFFFF',

        // ─── Borders ───
        border: isDarkMode ? '#222222' : '#E5E0D9',

        // ─── Brand Colors (Green per spec) ───
        primary:      '#22C55E',                              // VitalIQ Green
        primaryLight: isDarkMode ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.12)',
        primaryDark:  '#16A34A',
        // Gradient tokens (for use with LinearGradient if added)
        primaryGradient: ['#22C55E', '#16A34A'],

        // ─── Accent ───
        accent:       isDarkMode ? '#F59E0B' : '#D97706',    // amber
        accentLight:  isDarkMode ? 'rgba(245,158,11,0.15)' : 'rgba(217,119,6,0.15)',

        // ─── Semantic ───
        success:      '#22C55E',
        danger:       '#EF4444',
        dangerLight:  'rgba(239,68,68,0.15)',
        warning:      isDarkMode ? '#F59E0B' : '#D97706',
        info:         isDarkMode ? '#60A5FA' : '#2563EB',
        infoLight:    isDarkMode ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.1)',

        // ─── Aesthetics ───
        shadow: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.08)',

        // ─── Spacing / Radius (convenience) ───
        radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },

        isDarkMode,
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, loadTheme, clearThemeState }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
