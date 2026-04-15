import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Svg, { G, Rect, Line as SvgLine } from 'react-native-svg';

import { usePlaceBet } from '@/api/bets';
import { useMarket } from '@/api/markets';
import { useBalance } from '@/api/wallet';
import { Button, Image, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { useAuth } from '@/lib';
import { getImageUrl } from '@/lib/image-utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock OHLC data for mobile
const mockMobileOHLC = [
  { open: 0.25, high: 0.3, low: 0.22, close: 0.28 },
  { open: 0.28, high: 0.35, low: 0.26, close: 0.31 },
  { open: 0.31, high: 0.38, low: 0.3, close: 0.33 },
  { open: 0.33, high: 0.35, low: 0.28, close: 0.3 },
  { open: 0.3, high: 0.42, low: 0.29, close: 0.35 },
  { open: 0.35, high: 0.45, low: 0.34, close: 0.42 },
  { open: 0.42, high: 0.48, low: 0.38, close: 0.45 },
];

function MobileCandlestickChart() {
  const { t } = useTranslation();
  const chartHeight = 180;
  const padding = 20;
  const candleAreaWidth = SCREEN_WIDTH - 40 - padding * 2;
  const candleWidth = (candleAreaWidth / mockMobileOHLC.length) * 0.7;
  const spacing = (candleAreaWidth / mockMobileOHLC.length) * 0.3;

  const minVal = Math.min(...mockMobileOHLC.map(d => d.low)) * 0.9;
  const maxVal = Math.max(...mockMobileOHLC.map(d => d.high)) * 1.1;
  const range = maxVal - minVal;

  const getY = (val: number) => {
    return chartHeight - ((val - minVal) / range) * chartHeight;
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{t('market.history_ohlc')}</Text>
      <Svg height={chartHeight} width={SCREEN_WIDTH - 40}>
        {mockMobileOHLC.map((d, i) => {
          const isUp = d.close >= d.open;
          const color = isUp ? '#22c55e' : '#ef4444';
          const x = i * (candleWidth + spacing) + padding;

          return (
            <G key={i}>
              <SvgLine
                x1={x + candleWidth / 2}
                y1={getY(d.high)}
                x2={x + candleWidth / 2}
                y2={getY(d.low)}
                stroke={color}
                strokeWidth={1}
              />
              <Rect
                x={x}
                y={getY(Math.max(d.open, d.close))}
                width={candleWidth}
                height={Math.max(Math.abs(getY(d.open) - getY(d.close)), 1)}
                fill={color}
                rx={1}
              />
            </G>
          );
        })}
      </Svg>
      <View style={styles.chartFooter}>
        <Text style={styles.chartFooterText}>{t('market.live_updates')}</Text>
        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>{t('market.bull')}</Text>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: '#ef4444' },
              { marginLeft: 10 },
            ]}
          />
          <Text style={styles.legendText}>{t('market.bear')}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MarketDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    data: market,
    isLoading,
    error,
  } = useMarket({
    variables: { slug: slug || '' },
    enabled: !!slug,
  });
  const { data: balance, refetch: refetchBalance } = useBalance();
  const user = useAuth.use.user();
  const queryClient = useQueryClient();
  const placeBetMutation = usePlaceBet();

  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [buyOption, setBuyOption] = useState<'yes' | 'no'>('yes');
  const [betAmount, setBetAmount] = useState('10');

  const handlePlaceBet = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const amount = Number.parseFloat(betAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert(t('common.error'), t('market.invalid_amount'));
      return;
    }

    if (!selectedOutcome) {
      Alert.alert(t('common.error'), t('market.select_outcome'));
      return;
    }

    // Calculate total available balance (balance + bonus)
    const totalBalance = (balance?.balance || 0) + (balance?.balanceBonus || 0);

    if (!balance || totalBalance < amount) {
      Alert.alert(
        t('market.insufficient_balance'),
        t('market.insufficient_balance_msg', {
          balance: totalBalance.toFixed(2),
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('market.deposit'),
            onPress: () => router.push('/(app)/(tabs)/wallet'),
          },
        ],
      );
      return;
    }

    // Place the bet via API
    try {
      if (!market)
        return;

      await placeBetMutation.mutateAsync({
        marketId: market.id,
        outcomeId: selectedOutcome,
        buyOption,
        amount,
      });

      // Invalidate relevant queries to refresh data
      await refetchBalance();
      queryClient.invalidateQueries({ queryKey: ['my-bets'] });
      queryClient.invalidateQueries({ queryKey: ['my-positions'] });

      Alert.alert(t('market.bet_success_title'), t('market.bet_success_msg'), [
        {
          text: t('market.view_portfolio'),
          onPress: () => router.push('/(app)/(tabs)/portfolio'),
        },
        { text: t('market.continue'), style: 'cancel' },
      ]);

      // Reset form
      setSelectedOutcome(null);
      setBetAmount('10');
    }
    catch (err: any) {
      Alert.alert(
        t('common.error'),
        err.response?.data?.message || t('market.error_placing_bet'),
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  if (error || !market) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('market.not_found')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.heroContainer}>
        <Image
          source={{
            uri: getImageUrl(market.imageUrl),
          }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {t(`market.categories.${market.category}`)}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    market.status === 'OPEN' ? '#22c55e' : '#ef4444',
                },
              ]}
            />
            <Text style={styles.statusText}>
              {t(`market.statuses.${market.status}`)}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{market.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <TrendingUp size={16} color={colors.primary[400]} />
            <Text style={styles.metaValue}>
              {`R$${Number.parseFloat(market.totalVolume || '0').toLocaleString()}`}
            </Text>
            <Text style={styles.metaLabel}>{t('market.volume')}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={16} color={colors.neutral[500]} />
            <Text style={styles.metaValue}>
              {new Date(market.endDate).toLocaleDateString()}
            </Text>
            <Text style={styles.metaLabel}>{t('market.ends')}</Text>
          </View>
        </View>

        <Text style={styles.description}>{market.description}</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('market.pick_outcome')}</Text>
          <View style={styles.infoIndicator}>
            <Info size={14} color={colors.neutral[500]} />
            <Text style={styles.infoText}>{t('market.odds_fluctuate')}</Text>
          </View>
        </View>

        <View style={styles.outcomesGrid}>
          {market.outcomes.map(outcome => (
            <View
              key={outcome.id}
              style={[
                styles.outcomeCard,
                selectedOutcome === outcome.id && styles.selectedOutcomeCard,
              ]}
            >
              <View style={styles.outcomeHeader}>
                <View style={styles.outcomeInfo}>
                  <Text style={styles.outcomeTitle}>{outcome.title}</Text>
                  <Text style={styles.outcomeProb}>
                    {`${Math.round((outcome.probability || 0) * 100)}%`}
                  </Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceLabel}>{t('market.price')}</Text>
                  <Text style={styles.priceValue}>
                    {`R$${Number.parseFloat(outcome.price).toFixed(2)}`}
                  </Text>
                </View>
              </View>

              <View style={styles.buyButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    styles.buyYesBtn,
                    selectedOutcome === outcome.id
                    && buyOption === 'yes'
                    && styles.activeBuyBtn,
                  ]}
                  onPress={() => {
                    setSelectedOutcome(outcome.id);
                    setBuyOption('yes');
                  }}
                >
                  <Text style={styles.buyBtnText}>{t('market.buy_yes')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.buyBtn,
                    styles.buyNoBtn,
                    selectedOutcome === outcome.id
                    && buyOption === 'no'
                    && styles.activeBuyBtn,
                  ]}
                  onPress={() => {
                    setSelectedOutcome(outcome.id);
                    setBuyOption('no');
                  }}
                >
                  <Text style={styles.buyBtnText}>{t('market.buy_no')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <AnimatePresence>
          {selectedOutcome && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 20 }}
              style={styles.bettingPanel}
            >
              <View style={styles.bettingHeader}>
                <Text style={styles.bettingPanelTitle}>
                  {t('market.place_bet')}
                </Text>
                <Text style={styles.bettingSubtitle}>
                  {t('market.buying_shares', {
                    outcome: market.outcomes.find(
                      o => o.id === selectedOutcome,
                    )?.title,
                  })}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  value={betAmount}
                  onChangeText={setBetAmount}
                  style={styles.betInput}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.neutral[600]}
                />
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {t('market.expected_shares')}
                </Text>
                <Text style={styles.summaryValue}>
                  {Number.parseFloat(betAmount || '0')
                    / Number.parseFloat(
                      market.outcomes.find(o => o.id === selectedOutcome)
                        ?.price || '1',
                    )}
                </Text>
              </View>

              <Button
                label={
                  placeBetMutation.isPending
                    ? t('common.processing')
                    : t('market.confirm_operation')
                }
                onPress={handlePlaceBet}
                style={styles.confirmBtn}
                disabled={placeBetMutation.isPending}
              />

              <View style={styles.securityNote}>
                <ShieldCheck size={14} color={colors.success[500]} />
                <Text style={styles.securityText}>
                  {t('market.secured_by')}
                </Text>
              </View>
            </MotiView>
          )}
        </AnimatePresence>

        <MobileCandlestickChart />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark[950],
  },
  heroContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 44, // Adjusted for status bar padding roughly
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: colors.dark[950],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: colors.primary[950],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    color: colors.primary[400],
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dark[800],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark[700],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: colors.neutral[300],
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 32,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: colors.dark[800],
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 32,
    borderWidth: 1,
    borderColor: colors.dark[700],
  },
  metaItem: {
    gap: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.neutral[400],
  },
  description: {
    fontSize: 15,
    color: colors.neutral[300],
    lineHeight: 22,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  infoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  outcomesGrid: {
    gap: 12,
    marginBottom: 24,
  },
  outcomeCard: {
    padding: 16,
    backgroundColor: colors.dark[800],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark[700],
    gap: 16,
  },
  outcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOutcomeCard: {
    borderColor: colors.primary[500],
    backgroundColor: `${colors.primary[950]}30`,
  },
  outcomeInfo: {
    flex: 1,
    gap: 4,
  },
  outcomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  selectedText: {
    color: colors.primary[400],
  },
  outcomeProb: {
    fontSize: 14,
    color: colors.primary[400],
    fontWeight: 'bold',
  },
  priceTag: {
    alignItems: 'flex-end',
    gap: 2,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.neutral[400],
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  buyButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buyYesBtn: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  buyNoBtn: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  activeBuyBtn: {
    borderWidth: 3,
    borderColor: colors.white,
  },
  buyBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bettingPanel: {
    backgroundColor: colors.dark[800],
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.dark[700],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  bettingHeader: {
    marginBottom: 20,
  },
  bettingPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  bettingSubtitle: {
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark[950],
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.dark[800],
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[400],
    marginRight: 8,
  },
  betInput: {
    flex: 1,
    height: 60,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryLabel: {
    color: colors.neutral[300],
    fontSize: 14,
  },
  summaryValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: colors.primary[600],
    height: 56,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  securityText: {
    fontSize: 11,
    color: colors.success[600],
    fontWeight: '500',
  },
  errorText: {
    color: colors.danger[500],
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: colors.dark[800],
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.dark[700],
  },
  chartTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.dark[700],
  },
  chartFooterText: {
    fontSize: 10,
    color: colors.neutral[400],
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: colors.neutral[300],
    fontWeight: '700',
  },
});
