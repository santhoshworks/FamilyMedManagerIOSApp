import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
  };
  variant?: 'default' | 'primary' | 'transparent';
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  onMenuPress,
  rightAction,
  variant = 'default',
  style,
  titleStyle,
}) => {
  const headerStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  const textColor = variant === 'primary' ? '#FFFFFF' : theme.colors.textPrimary;
  const iconColor = variant === 'primary' ? '#FFFFFF' : theme.colors.textSecondary;

  return (
    <View style={headerStyle}>
      {/* Left Action */}
      <View style={styles.leftAction}>
        {onBackPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        )}
        {onMenuPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onMenuPress}
          >
            <Ionicons name="menu" size={24} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: textColor }, titleStyle]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: textColor }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Action */}
      <View style={styles.rightAction}>
        {rightAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
          >
            <Ionicons
              name={rightAction.icon}
              size={24}
              color={rightAction.color || iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
  },
  
  // Variants
  default: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  
  leftAction: {
    width: 40,
    alignItems: 'flex-start',
  },
  
  titleSection: {
    flex: 1,
    alignItems: 'center',
  },
  
  rightAction: {
    width: 40,
    alignItems: 'flex-end',
  },
  
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  
  title: {
    fontSize: theme.typography.lg,
    fontWeight: theme.typography.semibold,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: theme.typography.sm,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default Header;
