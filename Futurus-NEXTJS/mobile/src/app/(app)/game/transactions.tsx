import type { CoinTransaction } from '@/api/game';
import { useNavigation, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Pressable, RefreshControl, ScrollView } from 'react-native';
import {

  getCoinBalance,
  getCoinTransactions,
} from '@/api/game';
import { Text, View } from '@/components/ui';

export default function TransactionsScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = React.useState<CoinTransaction[]>([]);
  const [balance, setBalance] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, balanceData] = await Promise.all([
        getCoinTransactions(50),
        getCoinBalance(),
      ]);
      setTransactions(transactionsData);
      setBalance(balanceData);
    }
    catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load transactions',
      );
    }
    finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, string> = {
      TASK_REWARD: '✅',
      REFERRAL_BONUS: '👥',
      ADMIN_BONUS: '⭐',
      PURCHASE: '🛒',
      REFUND: '↩️',
      PENALTY: '⚠️',
      PROMOTION: '🎁',
    };
    return icons[type] || '💰';
  };

  if (isLoading && transactions.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#060714',
        }}
      >
        <Text style={{ color: '#a3a3a3' }}>{t('game.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-950"
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadTransactions();
          }}
          tintColor="#a855f7"
        />
      )}
    >
      <View className="p-4">
        {/* Header */}
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="text-primary-400">
            {'← '}
            {t('game.back_to_game')}
          </Text>
        </Pressable>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">
            {t('game.transaction_history')}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {t('game.view_all_coin_transactions')}
          </Text>
        </View>

        {/* Balance Card */}
        <View className="mb-6 overflow-hidden rounded-xl bg-linear-to-br from-green-500 to-green-600 p-8 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-green-100">
                {t('game.current_balance')}
              </Text>
              <Text className="mt-1 text-5xl font-bold text-white">
                {balance}
              </Text>
              <Text className="mt-1 text-sm text-green-100">
                {t('game.coins')}
              </Text>
            </View>
            <View className="size-16 items-center justify-center rounded-full bg-white/20">
              <Text className="text-4xl">💰</Text>
            </View>
          </View>
        </View>

        {/* Shop Button */}
        <Pressable
          onPress={() => navigation.navigate('index')}
          className="mb-6 rounded-xl bg-orange-600 p-4 shadow-md"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-semibold text-white">
                {t('game.shop_with_coins')}
              </Text>
              <Text className="text-xs text-orange-100">
                {t('game.coin_value')}
              </Text>
            </View>
            <Text className="text-2xl">🛍️</Text>
          </View>
        </Pressable>

        {/* Transactions List */}
        {transactions.length > 0
          ? (
              <View className="mb-6 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
                <Text className="mb-3 text-lg font-bold text-white">
                  {t('game.all_transactions')}
                </Text>
                <View className="gap-3">
                  {transactions.map(transaction => (
                    <View
                      key={transaction.id}
                      className="flex-row items-center justify-between rounded-lg bg-neutral-700 p-3"
                    >
                      <View className="mr-3 size-10 items-center justify-center rounded-full bg-neutral-600">
                        <Text className="text-xl">
                          {getTransactionIcon(transaction.type)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-medium text-white">
                          {transaction.description}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <Text className="text-xs text-neutral-500">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              i18n.language === 'pt' ? 'pt-BR' : 'es-ES',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </Text>
                          <View className="rounded-sm bg-neutral-200 px-2 py-0.5 dark:bg-neutral-600">
                            <Text className="text-xs text-neutral-600 dark:text-neutral-300">
                              {transaction.type.replace('_', ' ')}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text
                          className={`text-xl font-bold ${
                            transaction.amount > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                          {t('game.balance_after')}
                          {': '}
                          {transaction.balanceAfter}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )
          : (
              <View className="items-center rounded-xl border border-neutral-700 bg-neutral-800 p-12">
                <View className="mb-4 size-24 items-center justify-center rounded-full bg-neutral-700">
                  <Text className="text-4xl">💳</Text>
                </View>
                <Text className="mb-2 text-xl font-semibold text-white">
                  {t('game.no_transactions_yet')}
                </Text>
                <Text className="mb-6 text-center text-neutral-400">
                  {t('game.complete_tasks_to_earn_coins')}
                </Text>
                <Pressable
                  onPress={() => router.push('/game/tasks')}
                  className="rounded-lg bg-primary-600 px-6 py-3"
                >
                  <Text className="font-semibold text-white">
                    {t('game.view_tasks')}
                  </Text>
                </Pressable>
              </View>
            )}
      </View>
    </ScrollView>
  );
}
