// VitalIQ Design System - Centralized Theme
// Green + Orange branding, Dark/Light adaptive

export const COLORS = {
    // Core brand palette
    primary: '#4CAF50',          // VitalIQ Green
    primaryDark: '#388E3C',      // Pressed/active green
    primaryLight: 'rgba(76, 175, 80, 0.15)', // Subtle green tint
    accent: '#FF9800',           // VitalIQ Orange
    accentLight: 'rgba(255, 152, 0, 0.15)',  // Subtle orange tint

    // Surfaces (Dark mode base)
    bg: '#121212',           // Deep dark background
    surface: '#1E1E1E',      // Card/surface background
    surfaceLight: '#2A2A2A', // Elevated surface
    border: '#333333',       // Subtle borders

    // Text
    text: '#F5F5F5',          // Primary text
    textSecondary: '#9E9E9E', // Muted text
    textInverse: '#ffffff',   // Text on colored backgrounds

    // Semantic
    success: '#4CAF50',
    danger: '#ef4444',
    dangerLight: 'rgba(239, 68, 68, 0.12)',
    warning: '#FF9800',
    info: '#42A5F5',
    infoLight: 'rgba(66, 165, 245, 0.12)',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
};

export const FONT = {
    // Sizes
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 28,
    hero: 32,

    // Weights
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
};

export const SHADOW = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
};
