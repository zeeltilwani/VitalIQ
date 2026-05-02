/**
 * PressableButton — VitalIQ Centralized Button System
 *
 * Variants:
 *   "primary"   — Green gradient, shadow, scale animation (main CTAs)
 *   "secondary" — Outlined, transparent background (cancel/skip)
 *   "ghost"     — Text only, green colored (forgot password, links)
 *   "icon"      — Circular, green gradient, glow (FAB, quick actions)
 *   "danger"    — Red fill (destructive actions)
 *
 * Props:
 *   label        string   — Button text (not used for icon variant)
 *   onPress      func     — Press handler
 *   variant      string   — One of the 5 above (default: "primary")
 *   disabled     bool     — Reduced opacity, no interaction
 *   loading      bool     — Shows ActivityIndicator
 *   icon         string   — Emoji/text icon to show left of label (or alone for icon variant)
 *   style        object   — Additional style overrides
 *   textStyle    object   — Additional text style overrides
 *   size         string   — "sm" | "md" (default) | "lg"
 */

import React, { useRef } from 'react';
import {
    Animated, TouchableWithoutFeedback, StyleSheet,
    Text, View, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PressableButton({
    label,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
    size = 'md',
}) {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (disabled || loading) return;
        Animated.spring(scaleAnim, {
            toValue: variant === 'icon' ? 0.88 : 0.96,
            useNativeDriver: true,
            speed: 40,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 6,
        }).start();
    };

    const handlePress = () => {
        if (disabled || loading) return;
        onPress?.();
    };

    // ── Size tokens ──
    const SIZE = {
        sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, borderRadius: 12 },
        md: { paddingVertical: 15, paddingHorizontal: 20, fontSize: 16, borderRadius: 14 },
        lg: { paddingVertical: 18, paddingHorizontal: 24, fontSize: 18, borderRadius: 16 },
    }[size];

    // ── Variant styles ──
    const getContainerStyle = () => {
        const base = {
            borderRadius: SIZE.borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            opacity: disabled ? 0.5 : 1,
        };

        switch (variant) {
            case 'primary':
                return {
                    ...base,
                    backgroundColor: theme.primary,
                    paddingVertical: SIZE.paddingVertical,
                    paddingHorizontal: SIZE.paddingHorizontal,
                    shadowColor: '#22C55E',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: disabled ? 0 : 0.35,
                    shadowRadius: 12,
                    elevation: disabled ? 0 : 8,
                };
            case 'secondary':
                return {
                    ...base,
                    backgroundColor: 'transparent',
                    paddingVertical: SIZE.paddingVertical,
                    paddingHorizontal: SIZE.paddingHorizontal,
                    borderWidth: 1.5,
                    borderColor: theme.border,
                };
            case 'ghost':
                return {
                    ...base,
                    backgroundColor: 'transparent',
                    paddingVertical: SIZE.paddingVertical / 2,
                    paddingHorizontal: SIZE.paddingHorizontal / 2,
                };
            case 'icon':
                return {
                    ...base,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.primary,
                    shadowColor: '#22C55E',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: disabled ? 0 : 0.4,
                    shadowRadius: 16,
                    elevation: disabled ? 0 : 10,
                };
            case 'danger':
                return {
                    ...base,
                    backgroundColor: theme.danger,
                    paddingVertical: SIZE.paddingVertical,
                    paddingHorizontal: SIZE.paddingHorizontal,
                    shadowColor: theme.danger,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: disabled ? 0 : 0.3,
                    shadowRadius: 8,
                    elevation: disabled ? 0 : 6,
                };
            default:
                return base;
        }
    };

    const getLabelColor = () => {
        switch (variant) {
            case 'ghost': return theme.primary;
            case 'secondary': return theme.text;
            default: return '#FFFFFF';
        }
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled || loading}
        >
            <Animated.View
                style={[
                    getContainerStyle(),
                    { transform: [{ scale: scaleAnim }] },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'ghost' || variant === 'secondary' ? theme.primary : '#FFFFFF'}
                        size="small"
                    />
                ) : (
                    <>
                        {icon && variant !== 'icon' && (
                            <View style={{ marginRight: label ? 8 : 0 }}>
                                {typeof icon === 'string' ? (
                                    <Text style={styles.icon}>{icon}</Text>
                                ) : (
                                    icon
                                )}
                            </View>
                        )}
                        {variant === 'icon' ? (
                            <View style={styles.iconLabel}>
                                {typeof icon === 'string' ? (
                                    <Text style={{ fontSize: 24 }}>{icon}</Text>
                                ) : (
                                    icon
                                )}
                            </View>
                        ) : (
                            label && (
                                <Text
                                    style={[
                                        styles.label,
                                        { fontSize: SIZE.fontSize, color: getLabelColor() },
                                        textStyle,
                                    ]}
                                >
                                    {label}
                                </Text>
                            )
                        )}
                    </>
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    label: {
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    icon: {
        fontSize: 18,
    },
    iconLabel: {
        fontSize: 24,
    },
});
