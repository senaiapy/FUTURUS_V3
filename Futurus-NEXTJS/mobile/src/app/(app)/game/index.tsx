import type { Dashboard } from '@/api/game';
import { router, useNavigation } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Pressable, RefreshControl, ScrollView } from 'react-native';
import { getDashboard } from '@/api/game';
import { Text, View } from '@/components/ui';

export default function GameDashboardScreen() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboard();
      setDashboard(data);
    }
    catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load dashboard',
      );
    }
    finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Text className="text-neutral-400">{t('game.loading')}</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 p-4">
        <Text className="text-center text-neutral-400">
          {t('game.failed_load')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-950"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDashboard();
          }}
        />
      )}
    >
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">
            {t('game.title')}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {t('game.subtitle')}
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="mb-6 gap-4">
          {/* Coin Balance Card */}
          <View className="overflow-hidden rounded-xl bg-linear-to-br from-green-500 to-green-600 p-6 shadow-lg">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium text-green-100">
                  {t('game.coin_balance')}
                </Text>
                <Text className="mt-1 text-4xl font-bold text-white">
                  {dashboard.coinBalance}
                </Text>
              </View>
              <View className="size-16 items-center justify-center rounded-full bg-white/20">
                <Text className="text-3xl">💰</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-4">
            <View className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
              <Text className="text-xs text-neutral-500">
                {t('game.total_earned')}
              </Text>
              <Text className="mt-1 text-2xl font-bold text-white">
                {dashboard.totalCoinsEarned}
              </Text>
            </View>
            <View className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
              <Text className="text-xs text-neutral-500">
                {t('game.tasks')}
              </Text>
              <Text className="mt-1 text-2xl font-bold text-white">
                {dashboard.completedTasks}
                /
                {dashboard.totalTasks}
              </Text>
            </View>
            <View className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
              <Text className="text-xs text-neutral-500">
                {t('game.referrals')}
              </Text>
              <Text className="mt-1 text-2xl font-bold text-white">
                {dashboard.referralCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Next Task Card */}
        {dashboard.nextTask && dashboard.nextTask.task && (
          <Pressable
            onPress={() => router.push('/game/tasks')}
            className="mb-6 overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 p-6 shadow-lg"
          >
            <Text className="mb-2 text-xl font-bold text-white">
              {t('game.next_task')}
            </Text>
            <View className="rounded-lg bg-white/20 p-4">
              <Text className="mb-2 text-lg font-semibold text-white">
                {dashboard.nextTask.task.name}
              </Text>
              <Text className="mb-3 text-sm text-indigo-100">
                {dashboard.nextTask.task.description}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="rounded-full bg-yellow-400 px-3 py-1">
                  <Text className="text-sm font-bold text-yellow-900">
                    +
                    {dashboard.nextTask.task.coinReward}
                    {' '}
                    {t('game.coins')}
                  </Text>
                </View>
                <Text className="text-sm text-indigo-100">
                  {t(`game.status.${dashboard.nextTask.status.toLowerCase()}`)}
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Shop with Coins Button */}
        <Pressable
          onPress={() => {
            // Navigate explicitly to the index screen within tabs
            (navigation as any).navigate('index');
          }}
          className="mb-6 overflow-hidden rounded-xl bg-linear-to-r from-orange-500 to-orange-600 p-6 shadow-lg"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                {t('game.shop_with_coins')}
              </Text>
              <Text className="mt-1 text-sm text-orange-100">
                {t('game.use_coins_discount', { count: dashboard.coinBalance })}
              </Text>
              <Text className="mt-2 text-xs text-orange-200">
                {t('game.coin_value')}
              </Text>
            </View>
            <View className="size-14 items-center justify-center rounded-full bg-white/20">
              <Text className="text-3xl">🛍️</Text>
            </View>
          </View>
        </Pressable>

        {/* Quick Links */}
        <View className="mb-6 gap-3">
          <Pressable
            onPress={() => router.push('/game/tasks')}
            className="flex-row items-center rounded-xl border border-neutral-700 bg-neutral-800 p-4"
          >
            <View className="mr-4 size-12 items-center justify-center rounded-full bg-green-500/20">
              <Text className="text-2xl">✅</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-white">
                {t('game.my_tasks')}
              </Text>
              <Text className="text-xs text-neutral-400">
                {t('game.view_complete_tasks')}
              </Text>
            </View>
            <Text className="text-neutral-500">›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/game/referrals')}
            className="flex-row items-center rounded-xl border border-neutral-700 bg-neutral-800 p-4"
          >
            <View className="mr-4 size-12 items-center justify-center rounded-full bg-orange-500/20">
              <Text className="text-2xl">👥</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-white">
                {t('game.referrals')}
              </Text>
              <Text className="text-xs text-neutral-400">
                {t('game.invite_friends')}
              </Text>
            </View>
            <Text className="text-neutral-500">›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/game/transactions')}
            className="flex-row items-center rounded-xl border border-neutral-700 bg-neutral-800 p-4"
          >
            <View className="mr-4 size-12 items-center justify-center rounded-full bg-blue-500/20">
              <Text className="text-2xl">💳</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-white">
                {t('game.transactions')}
              </Text>
              <Text className="text-xs text-neutral-400">
                {t('game.view_coin_history')}
              </Text>
            </View>
            <Text className="text-neutral-500">›</Text>
          </Pressable>
        </View>

        {/* Recent Transactions */}
        {dashboard.recentTransactions
          && dashboard.recentTransactions.length > 0 && (
          <View className="mb-6 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
            <Text className="mb-3 text-lg font-bold text-white">
              {t('game.recent_transactions')}
            </Text>
            <View className="gap-3">
              {dashboard.recentTransactions.map(transaction => (
                <View
                  key={transaction.id}
                  className="flex-row items-center justify-between rounded-lg bg-neutral-800 p-3"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-white">
                      {transaction.description}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    className={`text-lg font-bold ${
                      transaction.amount > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
