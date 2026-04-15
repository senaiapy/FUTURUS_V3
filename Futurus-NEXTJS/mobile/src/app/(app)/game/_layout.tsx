import { Stack } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { View } from 'react-native';

import { Drawer } from '@/components/drawer';
import { GameHeader } from '@/components/game-header';

export default function GameLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <View className="flex-1">
      <GameHeader onMenuPress={() => setIsDrawerOpen(true)} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="referrals" />
        <Stack.Screen name="transactions" />
      </Stack>
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </View>
  );
}
