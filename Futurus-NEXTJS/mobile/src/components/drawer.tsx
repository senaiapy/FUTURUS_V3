import Env from '@env';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  FileText,
  Gamepad2,
  Home,
  LayoutDashboard,
  LogIn,
  Settings,
  User,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity } from 'react-native';

import { Text, View } from './ui';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const menuItems = [
    { icon: Home, label: t('drawer.home'), route: '/' },
    { icon: User, label: t('drawer.profile'), route: '/profile' },
    {
      icon: LayoutDashboard,
      label: t('drawer.dashboard'),
      route: '/dashboard',
    },
    { icon: UsersRound, label: t('drawer.groups'), route: '/(app)/groups' },
    { icon: Gamepad2, label: t('drawer.game'), route: '/game' },
    { icon: LogIn, label: t('drawer.login'), route: '/login' },
    { icon: UserPlus, label: t('drawer.register'), route: '/register' },
    { icon: FileText, label: t('drawer.terms_policy'), route: '/terms' },
    { icon: Settings, label: t('drawer.settings'), route: '/settings' },
  ];

  const handleNavigate = (route: string) => {
    router.push(route as any);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onClose}
        className="absolute inset-0 z-40 bg-black/50"
      />

      {/* Drawer */}
      <View
        className="absolute inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-neutral-900"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 16,
        }}
      >
        {/* Header */}
        <View className="border-b border-gray-200 bg-emerald-600 p-6 dark:border-neutral-700">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">
              {t('drawer.menu')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-white/20"
            >
              <X size={20} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView className="flex-1 px-2 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                onPress={() => handleNavigate(item.route)}
                className="mb-1 flex-row items-center rounded-lg px-4 py-3.5 active:bg-gray-100 dark:active:bg-neutral-800"
              >
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <Icon size={22} color="#059669" strokeWidth={2} />
                </View>
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer with Logo */}
        <View className="border-t border-gray-200 px-6 py-4 dark:border-neutral-700">
          <View className="mb-3 items-center">
            <Image
              source={{
                uri: `${Env.SIMPLE_API_URL}/images/futurus.png`,
              }}
              style={{ width: 240, height: 80 }}
              contentFit="contain"
            />
          </View>
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
            {`Futurus v${process.env.EXPO_PUBLIC_APP_VERSION || '1.1.3'}`}
          </Text>
        </View>
      </View>
    </>
  );
};
