import type { Market } from '@/api/markets/types';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Clock, TrendingUp, Users } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/ui';

import colors from '@/components/ui/colors';
import { getImageUrl } from '@/lib/image-utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = 180;

type Props = {
  market: Market;
};

export function MarketCardCarousel({ market }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';

  const handlePress = () => {
    router.push(`/(app)/market/${market.slug}`);
  };

  const volume = Number.parseFloat(market.totalVolume);

  const daysLeft = React.useMemo(() => {
    return Math.max(
      0,
      Math.ceil(
        (new Date(market.endDate).getTime() - Date.now())
        / (1000 * 60 * 60 * 24),
      ),
    );
  }, [market.endDate]);

  const mockUsers = React.useMemo(() => {
    return Math.floor(Math.random() * 500 + 50);
  }, []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: getImageUrl(market.imageUrl) }}
        style={styles.image}
        contentFit="cover"
        transition={500}
      />

      <View style={styles.overlay} />

      {/* Top Badges */}
      <View style={styles.topBadges}>
        <View style={styles.badge}>
          <TrendingUp size={12} color={colors.primary[400]} />
          <Text style={styles.badgeText}>
            R$
            {volume.toLocaleString(locale)}
          </Text>
        </View>
        <View style={styles.badge}>
          <Clock size={12} color="#fbbf24" />
          <Text style={styles.badgeText}>
            {daysLeft}
            {t('common.days_short')}
          </Text>
        </View>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        <View style={styles.glassContainer}>
          <View style={styles.contentInner}>
            <Text style={styles.title} numberOfLines={2}>
              {market.title}
            </Text>

            <View style={styles.footer}>
              <View style={styles.probBadge}>
                <Text style={styles.probText}>
                  {`${Math.round((market.outcomes[0]?.probability || 0) * 100)}% `}
                  {t('home.yes_label')}
                </Text>
              </View>

              <View style={styles.userBadge}>
                <Users size={12} color={colors.neutral[400]} />
                <Text style={styles.userText}>{mockUsers}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    marginRight: 20,
    backgroundColor: colors.dark[900],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  glassContainer: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentInner: {
    gap: 8,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  probBadge: {
    backgroundColor: `${colors.primary[500]}40`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.primary[500]}60`,
  },
  probText: {
    color: colors.primary[400],
    fontSize: 11,
    fontWeight: 'bold',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
  },
  userText: {
    color: colors.neutral[300],
    fontSize: 11,
    fontWeight: '600',
  },
});
