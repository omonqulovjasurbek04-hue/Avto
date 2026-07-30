import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { user, isLoading, restore } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const onLoginScreen = segments[0] === 'login';
    if (!user && !onLoginScreen) {
      router.replace('/login');
    } else if (user && onLoginScreen) {
      router.replace('/');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4cd7f6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#081425',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#081425',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "AVTO — Haydovchilik Testi" }} />
        <Stack.Screen name="login" options={{ title: 'Kirish', headerShown: false }} />
        <Stack.Screen name="test/[sessionId]" options={{ title: 'Test Simulyatsiyasi' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#081425',
  },
});
