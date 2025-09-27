import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="medication-details" options={{ headerShown: false }} />
        <Stack.Screen name="add-family-member" options={{ headerShown: false }} />
        <Stack.Screen name="manage-family-members" options={{ headerShown: false }} />
        <Stack.Screen name="manage-medications" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication/basic-info" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication/assignment" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication/inventory" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication/confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication/schedule" options={{ headerShown: false }} />
        <Stack.Screen name="edit-medication/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
