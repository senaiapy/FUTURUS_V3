import { useRouter } from 'expo-router';
import { Home, Menu, Trophy } from 'lucide-react-native';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView, Text, View } from '@/components/ui';

type GameHeaderProps = {
  onMenuPress: () => void;
};

export const GameHeader: React.FC<GameHeaderProps> = ({ onMenuPress }) => {
  const router = useRouter();

  return (
    <SafeAreaView className="border-b border-neutral-800 bg-neutral-900">
      <View className="px-4 pt-2 pb-4">
        <View className="relative flex-row items-center justify-between">
          {/* Menu Button - Left Aligned */}
          <TouchableOpacity
            onPress={onMenuPress}
            className="h-10 w-10 items-center justify-center rounded-lg bg-white/10"
          >
            <Menu size={24} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Center Section with Home Icon and Text - Absolutely positioned */}
          <View
            className="absolute right-0 left-0 flex-row items-center justify-center gap-2"
            style={{ pointerEvents: 'box-none' }}
          >
            <TouchableOpacity
              onPress={() => router.push('/game')}
              className="h-10 w-10 items-center justify-center rounded-lg bg-white/10"
              style={{ pointerEvents: 'auto' }}
            >
              <Home size={22} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">FUTURUS</Text>
          </View>

          {/* Trophy Button - Right Aligned (Gamification placeholder) */}
          <TouchableOpacity
            onPress={() => router.push('/game/tasks')}
            className="relative h-10 w-10 items-center justify-center rounded-lg bg-white/20"
          >
            <Trophy size={22} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
