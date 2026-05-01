// VitalIQ Design System - Centralized Theme
// Professional dark UI with emerald accent

export const COLORS = {
    // Core palette
    primary: '#10b981',       // Emerald green - primary accent
    primaryDark: '#059669',   // Darker emerald for pressed states
    primaryLight: 'rgba(16, 185, 129, 0.12)', // Subtle green tint for backgrounds

    // Surfaces
    bg: '#0f172a',            // Deep navy background
    surface: '#1e293b',       // Card/surface background
    surfaceLight: '#273548',  // Elevated surface (modals, sheets)
    border: '#334155',        // Subtle borders

    // Text
    text: '#f1f5f9',          // Primary text (near white)
    textSecondary: '#94a3b8', // Secondary/muted text
    textInverse: '#ffffff',   // Text on colored backgrounds

    // Semantic
    danger: '#ef4444',
    dangerLight: 'rgba(239, 68, 68, 0.12)',
    warning: '#f59e0b',
    info: '#3b82f6',
    infoLight: 'rgba(59, 130, 246, 0.12)',
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
