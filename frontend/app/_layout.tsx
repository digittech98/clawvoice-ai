import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AppProvider } from '../src/context/AppContext';
import { COLORS } from '../src/constants/colors';
import { VoiceAssistant } from '../src/components/VoiceAssistant';

export default function RootLayout() {
  const router = useRouter();

  const handleNavigate = (screen: string, params?: Record<string, any>) => {
    const screenMap: Record<string, string> = {
      home: '/(tabs)',
      markets: '/(tabs)/markets',
      trade: '/(tabs)/trade',
      wallet: '/(tabs)/wallet',
      settings: '/settings',
      square: '/square',
      support: '/support',
      staking: '/staking',
      earn: '/earn',
      pay: '/pay',
      futures: '/futures',
      withdraw: '/withdraw',
    };
    
    const route = screenMap[screen.toLowerCase()] || '/(tabs)';
    
    if (params && Object.keys(params).length > 0) {
      router.push({ pathname: route as any, params });
    } else {
      router.push(route as any);
    }
  };

  return (
    <AppProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="square" options={{ presentation: 'modal' }} />
          <Stack.Screen name="support" options={{ presentation: 'modal' }} />
          <Stack.Screen name="staking" options={{ presentation: 'card' }} />
          <Stack.Screen name="earn" options={{ presentation: 'card' }} />
          <Stack.Screen name="pay" options={{ presentation: 'card' }} />
          <Stack.Screen name="futures" options={{ presentation: 'card' }} />
          <Stack.Screen name="withdraw" options={{ presentation: 'card' }} />
        </Stack>
        <VoiceAssistant onNavigate={handleNavigate} />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
