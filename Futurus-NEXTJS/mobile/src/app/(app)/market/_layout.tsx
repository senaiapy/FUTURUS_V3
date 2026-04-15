import { Stack } from 'expo-router';
import * as React from 'react';
import colors from '@/components/ui/colors';

export default function MarketLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.dark[950],
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="[slug]"
        options={{
          headerTitle: 'Market Details',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
