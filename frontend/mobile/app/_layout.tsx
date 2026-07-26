import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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
        <Stack.Screen
          name="index"
          options={{ title: "AVTO — Haydovchilik Testi" }}
        />
        <Stack.Screen
          name="test/[sessionId]"
          options={{ title: "Test Simulyatsiyasi" }}
        />
      </Stack>
    </>
  );
}
