import { Redirect, router } from 'expo-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  Filter,
  Search,
  Settings as SettingsIcon,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useMyBets, useMyPositions } from '@/api/bets';
import { useTransactions } from '@/api/wallet';
import { HeaderLinks } from '@/components/header-links';
import { Text } from '@/components/ui';
import { useAuth } from '@/lib';
import { CDP, THEME } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function MobileProfitLossChart({ data }: { data: number[] }) {
  const chartHeight = 140;
  const chartWidth = SCREEN_WIDTH - 48;
  const padding = 20;

  const pointsData = useMemo(
    () => (data.length > 0 ? data : [0, 5, 2, 8, 10, 7, 12, 11]),
    [data],
  );
  const maxVal = Math.max(...pointsData);
  const minVal = Math.min(...pointsData);
  const range = maxVal - minVal || 1;

  const points = pointsData
    .map((val, i) => {
      const x
        = (i / (pointsData.length - 1)) * (chartWidth - padding * 2) + padding;
      const y
        = chartHeight
          - ((val - minVal) / range) * (chartHeight - padding * 4)
          - padding * 2;
      return `${x},${y}`;
    })
    .join(' ');

  const pathData = `M ${points}`;
  const areaData = `${pathData} L ${chartWidth - padding},${chartHeight} L ${padding},${chartHeight} Z`;

  return (
    <MotiView
      from={{ opacity: 0, scaleY: 0.5 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ type: 'timing', duration: 1000 }}
      style={styles.chartWrapper}
    >
      <Svg height={chartHeight} width={chartWidth}>
        <Defs>
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={THEME.primary} stopOpacity="0.3" />
            <Stop offset="0.8" stopColor={THEME.primary} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={THEME.primary} />
            <Stop offset="1" stopColor={THEME.secondary} />
          </LinearGradient>
        </Defs>
        <Path d={areaData} fill="url(#chartGrad)" />
        <Path
          d={pathData}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </MotiView>
  );
}

type BetStatus = 'PENDING' | 'CONFIRMED' | 'WON' | 'LOST' | 'CANCELLED';

type StatusMapEntry = {
  label: string;
  color: string;
  icon: React.ComponentType<any>;
};

type StatusMap = {
  [key in BetStatus]: StatusMapEntry;
};

export default function PortfolioScreen() {
  const { t, i18n } = useTranslation();
  const user = useAuth.use.user();
  const status = useAuth.use.status();
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';

  const { data: betsData, refetch: refetchBets } = useMyBets({
    variables: { limit: 50 },
    enabled: status === 'signIn',
  });

  const { data: positionsData, refetch: refetchPositions } = useMyPositions({
    variables: { limit: 50 },
    enabled: status === 'signIn',
  });

  const { data: transactionsData, refetch: refetchTransactions } = useTransactions({
    variables: { limit: 20, page: 1 },
    enabled: status === 'signIn',
  });

  const bets = useMemo(() => {
    if (betsData && Array.isArray(betsData)) {
      return betsData;
    }
    if (betsData?.data && Array.isArray(betsData.data)) {
      return betsData.data;
    }
    return [];
  }, [betsData]);

  const positions = useMemo(() => {
    if (positionsData && Array.isArray(positionsData)) {
      return positionsData;
    }
    if (positionsData?.data && Array.isArray(positionsData.data)) {
      return positionsData.data;
    }
    return [];
  }, [positionsData]);

  const transactions = useMemo(() => {
    if (transactionsData && Array.isArray(transactionsData)) {
      return transactionsData;
    }
    if (transactionsData?.data && Array.isArray(transactionsData.data)) {
      return transactionsData.data;
    }
    return [];
  }, [transactionsData]);

  const [activeTab, setActiveTab] = useState<'posicoes' | 'depositos'>(
    'posicoes',
  );
  const [activeFilter, setActiveFilter] = useState<'aberto' | 'fechado'>(
    'aberto',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      const matchesSearch
        = searchQuery === ''
          || bet.outcome?.market?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
            || bet.outcome?.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter
        = activeFilter === 'aberto'
          ? ['PENDING', 'CONFIRMED'].includes(bet.status)
          : ['WON', 'LOST', 'CANCELLED'].includes(bet.status);

      return matchesSearch && matchesFilter;
    });
  }, [bets, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const invested = bets.reduce((sum, bet) => sum + Number(bet.amount), 0);
    const value = positions.reduce(
      (sum, pos) => sum + Number(pos.shares) * Number(pos.outcome?.price || 0),
      0,
    );
    return {
      invested,
      value,
      count: bets.length,
      profit: value - invested,
    };
  }, [bets, positions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBets(), refetchPositions(), refetchTransactions()]);
    setRefreshing(false);
  };

  const statusMap: StatusMap = {
    CONFIRMED: {
      label: t('portfolio.confirmed'),
      color: THEME.success,
      icon: CheckCircle2,
    },
    WON: {
      label: t('portfolio.won'),
      color: THEME.success,
      icon: CheckCircle2,
    },
    PENDING: {
      label: t('portfolio.pending'),
      color: THEME.accent,
      icon: Clock,
    },
    LOST: { label: t('portfolio.lost'), color: THEME.danger, icon: Ban },
    CANCELLED: {
      label: t('portfolio.cancelled'),
      color: THEME.textDim,
      icon: CircleAlert,
    },
  };

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Redirect to login if not authenticated (must be after all hooks)
  if (status === 'signOut' || status === 'idle') {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderLinks />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME.primary}
            colors={[THEME.primary]}
          />
        )}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.topSection}
        >
          {/* Main Dashboard Card */}
          <View style={styles.dashboardCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.greetingText}>
                  {t('portfolio.your_portfolio')}
                </Text>
                <Text style={styles.balanceMain}>
                  {formatCurrency(stats.value)}
                </Text>
                <View style={styles.profitBadge}>
                  {stats.profit >= 0
                    ? (
                        <ArrowUpRight size={14} color={THEME.success} />
                      )
                    : (
                        <ArrowDownRight size={14} color={THEME.danger} />
                      )}
                  <Text
                    style={[
                      styles.profitText,
                      {
                        color: stats.profit >= 0 ? THEME.success : THEME.danger,
                      },
                    ]}
                  >
                    {formatCurrency(Math.abs(stats.profit))}
                    {` (${((stats.profit / (stats.invested || 1)) * 100).toFixed(1)}%)`}
                  </Text>
                </View>
              </View>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarGradient}>
                  <Text style={styles.avatarLabel}>
                    {user?.name?.[0] || 'U'}
                  </Text>
                </View>
              </View>
            </View>

            <MobileProfitLossChart data={[]} />

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('portfolio.invested')}</Text>
                <Text style={styles.statVal}>
                  {formatCurrency(stats.invested)}
                </Text>
              </View>
              <View style={[styles.statBox, styles.statDivider]}>
                <Text style={styles.statLabel}>
                  {t('portfolio.operations')}
                </Text>
                <Text style={styles.statVal}>{stats.count}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{t('portfolio.wins')}</Text>
                <Text style={[styles.statVal, { color: THEME.success }]}>
                  {bets.filter(b => b.status === 'WON').length}
                </Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('posicoes')}
            style={[
              styles.tabButton,
              activeTab === 'posicoes' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'posicoes' && styles.tabTextActive,
              ]}
            >
              {t('portfolio.positions')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('depositos')}
            style={[
              styles.tabButton,
              activeTab === 'depositos' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'depositos' && styles.tabTextActive,
              ]}
            >
              {t('portfolio.deposits')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentBody}>
          {/* Controls Bar */}
          <View style={styles.controlsBar}>
            <View style={styles.searchBar}>
              <Search size={18} color={THEME.textDim} />
              <TextInput
                placeholder={t('portfolio.search_placeholder')}
                placeholderTextColor={THEME.textDim}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.filterGroup}>
              <TouchableOpacity
                onPress={() =>
                  setActiveFilter(
                    activeFilter === 'aberto' ? 'fechado' : 'aberto',
                  )}
                style={styles.filterBtn}
              >
                <Filter
                  size={18}
                  color={
                    activeFilter === 'aberto' ? THEME.primary : THEME.textDim
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn}>
                <SettingsIcon size={18} color={THEME.textDim} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List Content */}
          <AnimatePresence exitBeforeEnter>
            {activeTab === 'posicoes'
              ? (
                  <MotiView
                    key="positions"
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: 20 }}
                    style={styles.listContainer}
                  >
                    {filteredBets.length > 0
                      ? (
                          filteredBets.map((bet) => {
                            const status
                              = statusMap[bet.status as BetStatus] || statusMap.PENDING;
                            const StatusIcon = status.icon;
                            return (
                              <TouchableOpacity
                                key={bet.id}
                                style={styles.betItem}
                                onPress={() =>
                                  router.push(
                                    `/(app)/market/${bet.outcome?.market?.slug}`,
                                  )}
                              >
                                <View style={styles.betItemHeader}>
                                  <View style={styles.betMarketInfo}>
                                    <Text style={styles.marketTitle} numberOfLines={1}>
                                      {bet.outcome?.market?.title}
                                    </Text>
                                    <View style={styles.outcomeRow}>
                                      <View
                                        style={[
                                          styles.typePill,
                                          {
                                            backgroundColor:
                                      bet.type === 'BUY'
                                        ? `${THEME.success}20`
                                        : `${THEME.danger}20`,
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.typeText,
                                            {
                                              color:
                                        bet.type === 'BUY'
                                          ? THEME.success
                                          : THEME.danger,
                                            },
                                          ]}
                                        >
                                          {bet.type === 'BUY'
                                            ? t('market.buy_yes')
                                            : t('market.buy_no')}
                                        </Text>
                                      </View>
                                      <Text style={styles.outcomeTitle}>
                                        {bet.outcome?.title}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[
                                      styles.statusTag,
                                      { backgroundColor: `${status.color}15` },
                                    ]}
                                  >
                                    <StatusIcon size={12} color={status.color} />
                                    <Text
                                      style={[
                                        styles.statusTagText,
                                        { color: status.color },
                                      ]}
                                    >
                                      {status.label}
                                    </Text>
                                  </View>
                                </View>

                                <View style={styles.betItemFooter}>
                                  <View>
                                    <Text style={styles.betMetaLabel}>
                                      {t('portfolio.invested')}
                                    </Text>
                                    <Text style={styles.betMetaValue}>
                                      {formatCurrency(Number(bet.amount))}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text style={styles.betMetaLabel}>
                                      {t('portfolio.potential')}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.betMetaValue,
                                        { color: THEME.primary },
                                      ]}
                                    >
                                      {formatCurrency(Number(bet.shares))}
                                    </Text>
                                  </View>
                                  <ChevronRight size={20} color={THEME.textDim} />
                                </View>
                              </TouchableOpacity>
                            );
                          })
                        )
                      : (
                          <View style={styles.emptyState}>
                            <TrendingUp size={48} color={THEME.textDim} opacity={0.5} />
                            <Text style={styles.emptyText}>
                              {t('portfolio.no_active_bets')}
                            </Text>
                            <TouchableOpacity
                              style={styles.exploreBtn}
                              onPress={() => router.push('/')}
                            >
                              <Text style={styles.exploreBtnText}>
                                {t('portfolio.explore')}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                  </MotiView>
                )
              : (
                  <MotiView
                    key="deposits"
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -20 }}
                    style={styles.listContainer}
                  >
                    {transactions.length > 0
                      ? (
                          transactions.map((tx) => {
                            const isDeposit = tx.type === 'DEPOSIT' || tx.trxType === '+';
                            const txColor = isDeposit ? THEME.success : THEME.danger;
                            const TxIcon = isDeposit ? ArrowDownRight : ArrowUpRight;

                            return (
                              <View key={tx.id} style={styles.betItem}>
                                <View style={styles.betItemHeader}>
                                  <View style={styles.betMarketInfo}>
                                    <View style={styles.outcomeRow}>
                                      <View
                                        style={[
                                          styles.typePill,
                                          { backgroundColor: `${txColor}20` },
                                        ]}
                                      >
                                        <TxIcon size={12} color={txColor} />
                                      </View>
                                      <Text style={styles.marketTitle}>
                                        {tx.type || tx.remark}
                                      </Text>
                                    </View>
                                    <Text style={styles.outcomeTitle} numberOfLines={2}>
                                      {tx.description || tx.details || 'Transaction'}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text
                                      style={[
                                        styles.balanceMain,
                                        {
                                          color: txColor,
                                          fontSize: 18,
                                          textAlign: 'right',
                                        },
                                      ]}
                                    >
                                      {isDeposit ? '+' : '-'}
                                      {formatCurrency(Number(tx.amount))}
                                    </Text>
                                  </View>
                                </View>

                                <View style={styles.betItemFooter}>
                                  <View>
                                    <Text style={styles.betMetaLabel}>
                                      {t('portfolio.trx_id')}
                                    </Text>
                                    <Text style={styles.betMetaValue}>{tx.trx}</Text>
                                  </View>
                                  <View>
                                    <Text style={styles.betMetaLabel}>
                                      {t('portfolio.date')}
                                    </Text>
                                    <Text style={styles.betMetaValue}>
                                      {new Date(tx.createdAt).toLocaleDateString(locale, {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            );
                          })
                        )
                      : (
                          <View style={styles.emptyState}>
                            <WalletIcon size={48} color={THEME.textDim} opacity={0.5} />
                            <Text style={styles.emptyText}>
                              {t('portfolio.history_empty')}
                            </Text>
                          </View>
                        )}
                  </MotiView>
                )}
          </AnimatePresence>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topSection: {
    padding: 20,
    marginTop: 10,
  },
  dashboardCard: {
    backgroundColor: THEME.card,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 24,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  greetingText: {
    color: THEME.textDim,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceMain: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  profitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profitText: {
    fontSize: 14,
    fontWeight: '700',
  },
  avatarContainer: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${THEME.primary}30`,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  chartWrapper: {
    marginVertical: 10,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: THEME.textDim,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 24,
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: THEME.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDim,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  contentBody: {
    paddingHorizontal: 20,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  listContainer: {
    gap: 12,
  },
  betItem: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  betItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  betMarketInfo: {
    flex: 1,
    paddingRight: 10,
  },
  marketTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  outcomeTitle: {
    color: THEME.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  betItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
  },
  betMetaLabel: {
    color: THEME.textDim,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  betMetaValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: THEME.textDim,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  exploreBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
