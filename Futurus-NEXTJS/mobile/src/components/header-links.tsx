import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Banknote,
  Bitcoin,
  Cpu,
  Film,
  Landmark,
  Layers,
  MoreHorizontal,
  Trophy,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';

const THEME = {
  background: '#1A1C29',
  card: '#262940',
  border: 'rgba(255, 255, 255, 0.08)',
  primary: '#138EFF', // Bright Blue
  textDim: '#A8B0C1',
  white: '#FFFFFF',
};

const categories = [
  { id: 'all', icon: Layers },
  { id: 'POLITICS', icon: Landmark },
  { id: 'SPORTS', icon: Trophy },
  { id: 'CRYPTO', icon: Bitcoin },
  { id: 'ECONOMY', icon: Banknote },
  { id: 'TECHNOLOGY', icon: Cpu },
  { id: 'ENTERTAINMENT', icon: Film },
  { id: 'OTHER', icon: MoreHorizontal },
];

export function HeaderLinks() {
  const router = useRouter();
  const { t } = useTranslation();
  const { category: activeCategory } = useLocalSearchParams<{
    category: string;
  }>();

  const handlePress = (categoryId: string) => {
    // Navigate to Markets screen with the selected category
    router.push({
      pathname: '/',
      params: { category: categoryId === 'all' ? undefined : categoryId },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isActive
            = (category.id === 'all' && !activeCategory)
              || activeCategory === category.id;
          const translationKey
            = category.id === 'all'
              ? 'market.categories.ALL'
              : `market.categories.${category.id}`;

          return (
            <MotiView
              key={category.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 400, delay: index * 50 }}
            >
              <TouchableOpacity
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => handlePress(category.id)}
                activeOpacity={0.7}
              >
                <Icon
                  size={14}
                  color={isActive ? THEME.white : THEME.textDim}
                  style={styles.icon}
                />
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {t(translationKey)}
                </Text>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  activeTab: {
    borderColor: `${THEME.primary}50`,
    backgroundColor: `${THEME.primary}20`,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: THEME.white,
  },
});
