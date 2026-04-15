/* eslint-disable max-lines-per-function */
import * as Clipboard from 'expo-clipboard';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  TrendingUp,
  Wallet,
  XCircle,
} from 'lucide-react-native';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useBlockchainPositions,
  useBlockchainTransactions,
  useBlockchainWallet,
  useCreateWallet,
  useSyncBalances,
} from '@/api/blockchain';
import { CDP } from '@/lib/theme';

type TabType = 'overview' | 'transactions' | 'positions';

export default function BlockchainScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // API Hooks
  const { data: wallet, isLoading: loadingWallet, refetch: refetchWallet } = useBlockchainWallet();
  const { data: transactions, isLoading: loadingTx, refetch: refetchTx } = useBlockchainTransactions({
    variables: { limit: 10 },
  });
  const { data: positions, isLoading: loadingPos, refetch: refetchPos } = useBlockchainPositions({
    variables: { limit: 10 },
  });

  const createWalletMutation = useCreateWallet();
  const syncBalancesMutation = useSyncBalances();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchWallet(), refetchTx(), refetchPos()]);
    setRefreshing(false);
  }, [refetchWallet, refetchTx, refetchPos]);

  const handleCreateWallet = () => {
    createWalletMutation.mutate(undefined, {
      onSuccess: () => {
        Alert.alert(t('blockchain.success'), t('blockchain.wallet_created'));
        refetchWallet();
      },
      onError: (err: any) => {
        // If wallet already exists, just refetch
        if (err.response?.data?.message?.includes('already')) {
          refetchWallet();
        }
        else {
          Alert.alert(t('common.error'), err.response?.data?.message || t('blockchain.wallet_error'));
        }
      },
    });
  };

  const handleSyncBalance = () => {
    syncBalancesMutation.refetch().then(() => {
      refetchWallet();
    });
  };

  const copyAddress = async () => {
    if (wallet?.publicKey) {
      await Clipboard.setStringAsync(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert(t('blockchain.copied'), t('blockchain.address_copied'));
    }
  };

  const formatAddress = (address: string) => {
    if (!address)
      return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTxTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BET: t('blockchain.bet'),
      CLAIM: t('blockchain.claim'),
      DEPOSIT: t('blockchain.deposit'),
      WITHDRAW: t('blockchain.withdraw'),
    };
    return labels[type] || type;
  };

  const getTxTypeIcon = (type: string) => {
    switch (type) {
      case 'BET':
        return <ArrowUpRight color={CDP.warning} size={16} />;
      case 'CLAIM':
        return <ArrowDownLeft color={CDP.success} size={16} />;
      case 'DEPOSIT':
        return <ArrowDownLeft color={CDP.secondary} size={16} />;
      case 'WITHDRAW':
        return <ArrowUpRight color={CDP.danger} size={16} />;
      default:
        return <RefreshCw color={CDP.textMuted} size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle2 color={CDP.success} size={16} />;
      case 'PENDING':
        return <Clock color={CDP.warning} size={16} />;
      case 'FAILED':
        return <XCircle color={CDP.danger} size={16} />;
      default:
        return <Clock color={CDP.textMuted} size={16} />;
    }
  };

  const isLoading = loadingWallet || loadingTx || loadingPos;

  if (isLoading && !wallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CDP.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={CDP.primary}
          colors={[CDP.primary]}
        />
      )}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Blockchain</Text>
          <Text style={styles.headerSubtitle}>
            {t('blockchain.manage_solana')}
          </Text>
        </View>
        {wallet?.hasWallet && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSyncBalance}
            disabled={syncBalancesMutation.isFetching}
          >
            <RefreshCw
              color={CDP.primary}
              size={18}
              style={syncBalancesMutation.isFetching ? { opacity: 0.5 } : undefined}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* No Wallet State */}
      {!wallet?.hasWallet ? (
        <View style={styles.noWalletCard}>
          <View style={styles.noWalletIcon}>
            <Wallet color={CDP.primary} size={32} />
          </View>
          <Text style={styles.noWalletTitle}>
            {t('blockchain.create_wallet_title')}
          </Text>
          <Text style={styles.noWalletDesc}>
            {t('blockchain.create_wallet_desc')}
          </Text>
          <TouchableOpacity
            style={styles.createWalletBtn}
            onPress={handleCreateWallet}
            disabled={createWalletMutation.isPending}
          >
            {createWalletMutation.isPending
              ? (
                  <ActivityIndicator color={CDP.bg} size="small" />
                )
              : (
                  <>
                    <Plus color={CDP.bg} size={20} />
                    <Text style={styles.createWalletBtnText}>
                      {t('blockchain.create_wallet')}
                    </Text>
                  </>
                )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Wallet Card */}
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIconContainer}>
                <Wallet color={CDP.textPrimary} size={24} />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>{t('blockchain.solana_wallet')}</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.walletAddress}>
                    {formatAddress(wallet.publicKey || '')}
                  </Text>
                  <TouchableOpacity onPress={copyAddress} style={styles.copyBtn}>
                    {copied
                      ? (
                          <Check color={CDP.success} size={16} />
                        )
                      : (
                          <Copy color={CDP.textSecondary} size={16} />
                        )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.externalBtn}
                    onPress={() => {
                      const cluster = process.env.EXPO_PUBLIC_SOLANA_CLUSTER || 'devnet';
                      const url = `https://explorer.solana.com/address/${wallet.publicKey}?cluster=${cluster}`;
                      Linking.openURL(url);
                    }}
                  >
                    <ExternalLink color={CDP.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
              {wallet.isCustodial && (
                <TouchableOpacity
                  style={styles.custodialBadge}
                  onPress={() => {
                    const cluster = process.env.EXPO_PUBLIC_SOLANA_CLUSTER || 'devnet';
                    const url = `https://explorer.solana.com/address/${wallet.publicKey}?cluster=${cluster}`;
                    Linking.openURL(url);
                  }}
                >
                  <Text style={styles.custodialText}>{t('blockchain.custodial')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.balanceGrid}>
              <View style={styles.balanceItem}>
                <View style={styles.balanceIconRow}>
                  <Coins color={CDP.warning} size={16} />
                  <Text style={styles.balanceLabel}>FUT</Text>
                </View>
                <Text style={styles.balanceValue}>
                  {(wallet.futBalance || 0).toFixed(4)}
                </Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <View style={styles.balanceIconRow}>
                  <View style={styles.solIcon} />
                  <Text style={styles.balanceLabel}>SOL</Text>
                </View>
                <Text style={styles.balanceValue}>
                  {(wallet.solBalance || 0).toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {(['overview', 'transactions', 'positions'] as TabType[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {t(`blockchain.tab_${tab}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View style={styles.overviewGrid}>
              {/* Recent Transactions */}
              <View style={styles.overviewCard}>
                <View style={styles.cardHeader}>
                  <RefreshCw color={CDP.secondary} size={18} />
                  <Text style={styles.cardTitle}>{t('blockchain.recent_tx')}</Text>
                </View>
                {!transactions?.data?.length
                  ? (
                      <Text style={styles.emptyText}>{t('blockchain.no_transactions')}</Text>
                    )
                  : (
                      transactions.data.slice(0, 5).map(tx => (
                        <View key={tx.id} style={styles.txItem}>
                          <View style={styles.txIconContainer}>
                            {getTxTypeIcon(tx.txType)}
                          </View>
                          <View style={styles.txInfo}>
                            <Text style={styles.txType}>{getTxTypeLabel(tx.txType)}</Text>
                            <Text style={styles.txDate}>
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.txRight}>
                            <Text style={styles.txAmount}>
                              {tx.amount.toFixed(4)}
                              {' '}
                              {tx.token}
                            </Text>
                            {getStatusIcon(tx.status)}
                          </View>
                        </View>
                      ))
                    )}
              </View>

              {/* Active Positions */}
              <View style={styles.overviewCard}>
                <View style={styles.cardHeader}>
                  <TrendingUp color={CDP.success} size={18} />
                  <Text style={styles.cardTitle}>{t('blockchain.active_positions')}</Text>
                </View>
                {!positions?.data?.length
                  ? (
                      <Text style={styles.emptyText}>{t('blockchain.no_positions')}</Text>
                    )
                  : (
                      positions.data.slice(0, 5).map(pos => (
                        <View key={pos.id} style={styles.posItem}>
                          <Text style={styles.posQuestion} numberOfLines={1}>
                            {pos.question}
                          </Text>
                          <View style={styles.posDetails}>
                            <View style={styles.posAmounts}>
                              {pos.yesAmount > 0 && (
                                <Text style={styles.posYes}>
                                  YES:
                                  {' '}
                                  {pos.yesAmount.toFixed(2)}
                                </Text>
                              )}
                              {pos.noAmount > 0 && (
                                <Text style={styles.posNo}>
                                  NO:
                                  {' '}
                                  {pos.noAmount.toFixed(2)}
                                </Text>
                              )}
                            </View>
                            <View style={[
                              styles.statusBadge,
                              pos.marketStatus === 'ACTIVE' && styles.statusActive,
                              pos.marketStatus === 'RESOLVED' && styles.statusResolved,
                              pos.marketStatus === 'PENDING' && styles.statusPending,
                            ]}
                            >
                              <Text style={styles.statusText}>{pos.marketStatus}</Text>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
              </View>
            </View>
          )}

          {activeTab === 'transactions' && (
            <View style={styles.listCard}>
              {loadingTx
                ? (
                    <ActivityIndicator color={CDP.primary} />
                  )
                : !transactions?.data?.length
                    ? (
                        <Text style={styles.emptyText}>{t('blockchain.no_transactions')}</Text>
                      )
                    : (
                        transactions.data.map(tx => (
                          <View key={tx.id} style={styles.txFullItem}>
                            <View style={styles.txIconContainer}>
                              {getTxTypeIcon(tx.txType)}
                            </View>
                            <View style={styles.txFullInfo}>
                              <Text style={styles.txType}>{getTxTypeLabel(tx.txType)}</Text>
                              <Text style={styles.txHash} numberOfLines={1}>
                                {formatAddress(tx.txHash)}
                              </Text>
                              <Text style={styles.txDate}>
                                {new Date(tx.createdAt).toLocaleString()}
                              </Text>
                            </View>
                            <View style={styles.txRight}>
                              <Text style={styles.txAmount}>
                                {tx.amount.toFixed(4)}
                                {' '}
                                {tx.token}
                              </Text>
                              <View style={styles.statusRow}>
                                {getStatusIcon(tx.status)}
                                <Text style={styles.txStatusText}>{tx.status}</Text>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
            </View>
          )}

          {activeTab === 'positions' && (
            <View style={styles.listCard}>
              {loadingPos
                ? (
                    <ActivityIndicator color={CDP.primary} />
                  )
                : !positions?.data?.length
                    ? (
                        <Text style={styles.emptyText}>{t('blockchain.no_positions')}</Text>
                      )
                    : (
                        positions.data.map(pos => (
                          <View key={pos.id} style={styles.posFullItem}>
                            <Text style={styles.posFullQuestion} numberOfLines={2}>
                              {pos.question}
                            </Text>
                            <View style={styles.posFullDetails}>
                              <View style={styles.posFullRow}>
                                <Text style={styles.posFullLabel}>YES:</Text>
                                <Text style={styles.posFullYes}>{pos.yesAmount.toFixed(2)}</Text>
                              </View>
                              <View style={styles.posFullRow}>
                                <Text style={styles.posFullLabel}>NO:</Text>
                                <Text style={styles.posFullNo}>{pos.noAmount.toFixed(2)}</Text>
                              </View>
                              <View style={styles.posFullRow}>
                                <Text style={styles.posFullLabel}>
                                  {t('blockchain.invested')}
                                  :
                                </Text>
                                <Text style={styles.posFullInvested}>
                                  {pos.totalInvested.toFixed(2)}
                                  {' '}
                                  FUT
                                </Text>
                              </View>
                            </View>
                            <View style={styles.posFullFooter}>
                              <View style={[
                                styles.statusBadge,
                                pos.marketStatus === 'ACTIVE' && styles.statusActive,
                                pos.marketStatus === 'RESOLVED' && styles.statusResolved,
                                pos.marketStatus === 'PENDING' && styles.statusPending,
                              ]}
                              >
                                <Text style={styles.statusText}>
                                  {pos.marketStatus}
                                  {pos.claimed && ` (${t('blockchain.claimed')})`}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.bg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: CDP.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: CDP.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: CDP.textPrimary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: CDP.textSecondary,
    marginTop: 4,
  },
  syncButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: CDP.glow,
    borderWidth: 1,
    borderColor: CDP.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // No Wallet Card
  noWalletCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: CDP.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CDP.border,
    padding: 32,
    alignItems: 'center',
  },
  noWalletIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: CDP.glow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noWalletTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CDP.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  noWalletDesc: {
    fontSize: 14,
    color: CDP.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CDP.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  createWalletBtnText: {
    color: CDP.bg,
    fontSize: 16,
    fontWeight: '700',
  },

  // Wallet Card
  walletCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CDP.border,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 13,
    color: CDP.textSecondary,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: CDP.textPrimary,
    fontFamily: 'monospace',
  },
  copyBtn: {
    padding: 4,
  },
  externalBtn: {
    padding: 4,
  },
  custodialBadge: {
    backgroundColor: `${CDP.purple}33`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  custodialText: {
    color: CDP.purple,
    fontSize: 11,
    fontWeight: '700',
  },
  balanceGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: CDP.border,
    marginHorizontal: 16,
  },
  balanceIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: CDP.textSecondary,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: CDP.textPrimary,
  },
  solIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: CDP.purple,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: CDP.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: CDP.glow,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: CDP.textMuted,
  },
  tabTextActive: {
    color: CDP.primary,
  },

  // Overview Grid
  overviewGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  overviewCard: {
    backgroundColor: CDP.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CDP.textPrimary,
  },
  emptyText: {
    color: CDP.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Transaction Item
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  txIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: CDP.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    fontSize: 14,
    fontWeight: '600',
    color: CDP.textPrimary,
  },
  txDate: {
    fontSize: 11,
    color: CDP.textMuted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: CDP.textPrimary,
    fontFamily: 'monospace',
  },

  // Position Item
  posItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  posQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: CDP.textPrimary,
    marginBottom: 8,
  },
  posDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posAmounts: {
    flexDirection: 'row',
    gap: 12,
  },
  posYes: {
    fontSize: 12,
    color: CDP.success,
    fontWeight: '600',
  },
  posNo: {
    fontSize: 12,
    color: CDP.danger,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: `${CDP.warning}33`,
  },
  statusActive: {
    backgroundColor: `${CDP.success}33`,
  },
  statusResolved: {
    backgroundColor: `${CDP.secondary}33`,
  },
  statusPending: {
    backgroundColor: `${CDP.warning}33`,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: CDP.textPrimary,
  },

  // List Card (Transactions/Positions full view)
  listCard: {
    marginHorizontal: 20,
    backgroundColor: CDP.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
    padding: 16,
  },
  txFullItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CDP.borderSubtle,
  },
  txFullInfo: {
    flex: 1,
    marginLeft: 12,
  },
  txHash: {
    fontSize: 11,
    color: CDP.secondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  txStatusText: {
    fontSize: 10,
    color: CDP.textMuted,
  },

  // Position Full Item
  posFullItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CDP.borderSubtle,
  },
  posFullQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: CDP.textPrimary,
    marginBottom: 12,
  },
  posFullDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  posFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  posFullLabel: {
    fontSize: 12,
    color: CDP.textMuted,
  },
  posFullYes: {
    fontSize: 14,
    fontWeight: '700',
    color: CDP.success,
  },
  posFullNo: {
    fontSize: 14,
    fontWeight: '700',
    color: CDP.danger,
  },
  posFullInvested: {
    fontSize: 14,
    fontWeight: '700',
    color: CDP.textPrimary,
  },
  posFullFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
