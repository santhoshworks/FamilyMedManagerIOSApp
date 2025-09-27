import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
  onPress,
  disabled = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[padding],
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  
  // Variants
  default: {
    ...theme.shadows.sm,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: theme.spacing.sm,
  },
  medium: {
    padding: theme.spacing.md,
  },
  large: {
    padding: theme.spacing.lg,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
});

export default Card;
