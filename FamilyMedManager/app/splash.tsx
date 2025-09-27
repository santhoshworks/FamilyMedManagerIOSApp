import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Try multiple image sources in order of preference
  const imageSources = [
    require('@/assets/images/splash-icon.png'),
    require('@/assets/images/icon.png'),
    require('@/assets/images/illustration.png'),
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundOverlay} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {!imageError && currentImageIndex < imageSources.length ? (
          <Image
            source={imageSources[currentImageIndex]}
            style={styles.illustration}
            onError={() => {
              if (currentImageIndex < imageSources.length - 1) {
                setCurrentImageIndex(currentImageIndex + 1);
              } else {
                setImageError(true);
              }
            }}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.fallbackIcon}>
            <Ionicons name="medical-outline" size={100} color="rgba(255, 255, 255, 0.9)" />
          </View>
        )}
        <Text style={styles.title}>FamilyMedManager</Text>
        <Text style={styles.subtitle}>Managing your family's health, one dose at a time</Text>
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    flex: 1,
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: theme.spacing.xl,
  },
  fallbackIcon: {
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: width * 0.25,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: theme.typography.xxxl,
    fontWeight: theme.typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.base,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  loadingIndicator: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
