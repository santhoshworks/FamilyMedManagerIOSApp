import GradientBackground from '@/components/ui/GradientBackground';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GradientBackground>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="splash" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="medication-details" />
          <Stack.Screen name="add-family-member" />
          <Stack.Screen name="manage-family-members" />
          <Stack.Screen name="edit-family-member" />
          <Stack.Screen name="manage-medications" />
          <Stack.Screen name="add-medication" />
          <Stack.Screen name="add-medication/basic-info" />
          <Stack.Screen name="add-medication/assignment" />
          <Stack.Screen name="add-medication/inventory" />
          <Stack.Screen name="add-medication/confirmation" />
          <Stack.Screen name="add-medication/schedule" />
          <Stack.Screen name="edit-medication/[id]" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </GradientBackground>
    </ThemeProvider>
  );
}
