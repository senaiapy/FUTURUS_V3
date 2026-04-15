import type { CoinTransaction } from '@/lib/api/game';
import { router } from 'expo-router';
import { ArrowLeft, Coins, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import gameApi from '@/lib/api/game';
import { useThemeConfig } from '@/lib/use-theme-config';

export default function GameTransactionsScreen() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useThemeConfig();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get balance
      const balanceResponse = await gameApi.getCoinBalance();
      setBalance(balanceResponse.balance);

      // Get transactions
      const transactionsResponse = await gameApi.getCoinTransactions(1, 50);
      const txList
        = (transactionsResponse as any).transactions
          || (Array.isArray(transactionsResponse) ? transactionsResponse : []);
      setTransactions(txList);
    }
    catch (error) {
      console.error('Failed to load transactions:', error);
    }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1)
      return 'Just now';
    if (minutes < 60)
      return `${minutes}m ago`;
    if (hours < 24)
      return `${hours}h ago`;
    if (days < 7)
      return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const isEarned = (transaction: CoinTransaction) => {
    return transaction.amount > 0 || transaction.type === 'EARNED';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading transactions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Coin History</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        )}
      >
        {/* Balance Card */}
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.primary },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Coins size={32} color={theme.colors.primary} />
            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Your Balance
            </Text>
          </View>
          <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
            {balance.toLocaleString()}
            {' '}
            Coins
          </Text>
        </View>

        {/* Transactions List */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Transaction History
        </Text>

        {transactions.length === 0
          ? (
              <View style={styles.emptyState}>
                <Coins size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  No transactions yet
                </Text>
                <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                  Complete tasks to start earning coins!
                </Text>
              </View>
            )
          : (
              transactions.map((transaction) => {
                const earned = isEarned(transaction);
                const amount = Math.abs(transaction.amount);

                return (
                  <View
                    key={transaction.id}
                    style={[styles.transactionCard, { backgroundColor: theme.colors.cardBackground }]}
                  >
                    <View style={styles.transactionIconContainer}>
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor: earned
                              ? `${theme.colors.success}20`
                              : `${theme.colors.danger}20`,
                          },
                        ]}
                      >
                        {earned
                          ? (
                              <TrendingUp size={20} color={theme.colors.success} />
                            )
                          : (
                              <TrendingDown size={20} color={theme.colors.danger} />
                            )}
                      </View>
                    </View>

                    <View style={styles.transactionContent}>
                      <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
                        {transaction.description}
                      </Text>
                      <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                        {formatTransactionDate(transaction.createdAt)}
                      </Text>
                      {transaction.referenceId && (
                        <Text style={[styles.transactionReference, { color: theme.colors.textSecondary }]}>
                          {transaction.referenceId}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.amountContainer,
                        {
                          backgroundColor: earned
                            ? `${theme.colors.success}10`
                            : `${theme.colors.danger}10`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.amount,
                          {
                            color: earned ? theme.colors.success : theme.colors.danger,
                          },
                        ]}
                      >
                        {earned ? '+' : '-'}
                        {amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionIconContainer: {
    marginRight: 16,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionReference: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  amountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
