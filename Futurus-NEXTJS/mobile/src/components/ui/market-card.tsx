import type { Market } from '@/api/markets/types';
import { Clock, TrendingUp } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '@/lib/image-utils';

import { Image } from './image';
import { Text } from './text';

/**
 * Premium Market Card Component
 * Based on Figma design with glass morphism
 *
 * Design principles:
 * - Glass card effect with subtle border
 * - Purple/Indigo color scheme
 * - Smooth rounded corners (24px)
 * - Dark blue background from Figma (#060714)
 */
const THEME = {
  // Backgrounds (Figma dark blue theme)
  background: '#1A1C29',
  card: '#262940',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(255, 255, 255, 0.12)',

  // Primary colors
  primary: '#138EFF', // Bright Blue
  secondary: '#A45BFF', // Purple

  // Status colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber

  // Text colors (OLED optimized - not pure white)
  textPrimary: '#FFFFFF',
  textSecondary: '#A8B0C1',
  textMuted: '#717A8C',

  // Outcome slot colors
  outcomePrimaryBg: 'rgba(19, 142, 255, 0.15)',
  outcomePrimaryBorder: 'rgba(19, 142, 255, 0.3)',
  outcomeSecondaryBg: 'rgba(164, 91, 255, 0.15)',
  outcomeSecondaryBorder: 'rgba(164, 91, 255, 0.3)',
};

type MarketCardProps = {
  market: Market;
  onPress?: () => void;
  compact?: boolean;
};

export function MarketCard({
  market,
  onPress,
  compact = false,
}: MarketCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, compact && styles.compactContainer]}
      activeOpacity={0.85}
    >
      {/* Image Section */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: getImageUrl(market.imageUrl),
          }}
          style={[styles.image, compact && styles.compactImage]}
          contentFit="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Category Badge */}
        {!compact && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {market.category || t('market.fallback_category')}
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={[styles.content, compact && styles.compactContent]}>
        {/* Title */}
        <Text
          style={[styles.title, compact && styles.compactTitle]}
          numberOfLines={compact ? 3 : 2}
        >
          {market.title}
        </Text>

        {/* Stats Row (Full card only) */}
        {!compact && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <TrendingUp size={14} color={THEME.primary} strokeWidth={2.5} />
              <Text style={styles.statText}>
                {t('market.volume_label')}
                {' '}
                R$
                {Number.parseFloat(market.totalVolume).toLocaleString(locale)}
              </Text>
            </View>
            <View style={styles.stat}>
              <Clock size={14} color={THEME.textSecondary} strokeWidth={2} />
              <Text style={styles.statText}>
                {new Date(market.endDate).toLocaleDateString(locale)}
              </Text>
            </View>
          </View>
        )}

        {/* Outcomes Row */}
        <View
          style={[styles.outcomesRow, compact && styles.compactOutcomesRow]}
        >
          {market.outcomes.slice(0, 2).map((outcome, index) => (
            <View
              key={outcome.id}
              style={[
                styles.outcomeSlot,
                compact && styles.compactOutcomeSlot,
                index === 0 ? styles.outcomePrimary : styles.outcomeSecondary,
              ]}
            >
              <Text
                style={[
                  styles.outcomeTitle,
                  compact && styles.compactOutcomeTitle,
                ]}
                numberOfLines={1}
              >
                {outcome.title}
              </Text>
              <Text
                style={[
                  styles.outcomeProb,
                  compact && styles.compactOutcomeProb,
                ]}
              >
                {Math.round(outcome.probability * 100)}
                %
              </Text>
            </View>
          ))}
        </View>

        {/* Compact Bottom Stats */}
        {compact && (
          <View style={styles.compactBottom}>
            <View style={styles.compactStat}>
              <TrendingUp size={10} color={THEME.primary} strokeWidth={2.5} />
              <Text style={styles.compactStatText}>
                R$
                {Number.parseFloat(market.totalVolume).toLocaleString(locale, {
                  notation: 'compact',
                })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginBottom: 16,
  },
  compactContainer: {
    borderRadius: 20,
    marginBottom: 0,
    flex: 1,
  },

  // Image
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  compactImage: {
    height: 110,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },

  // Category Badge
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    color: THEME.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Content
  content: {
    padding: 16,
  },
  compactContent: {
    padding: 12,
  },

  // Title
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textPrimary,
    lineHeight: 23,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  compactTitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    height: 54,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Compact stats
  compactBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatText: {
    color: THEME.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },

  // Outcomes
  outcomesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compactOutcomesRow: {
    gap: 8,
  },
  outcomeSlot: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  compactOutcomeSlot: {
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  outcomePrimary: {
    backgroundColor: THEME.outcomePrimaryBg,
    borderColor: THEME.outcomePrimaryBorder,
  },
  outcomeSecondary: {
    backgroundColor: THEME.outcomeSecondaryBg,
    borderColor: THEME.outcomeSecondaryBorder,
  },
  outcomeTitle: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactOutcomeTitle: {
    fontSize: 9,
  },
  outcomeProb: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
    letterSpacing: -0.5,
  },
  compactOutcomeProb: {
    fontSize: 15,
  },
});
