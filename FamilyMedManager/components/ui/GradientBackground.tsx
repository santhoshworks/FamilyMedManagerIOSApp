
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[theme.colors.primaryLight, theme.colors.primary, theme.colors.primaryDark]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
