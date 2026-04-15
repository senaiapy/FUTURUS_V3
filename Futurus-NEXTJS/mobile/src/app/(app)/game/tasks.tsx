import type { UserTask } from '@/api/game';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Pressable, RefreshControl, ScrollView } from 'react-native';
import { completeTask, getUserTasks } from '@/api/game';
import { Button, Text, View } from '@/components/ui';

export default function TasksScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await getUserTasks();
      setTasks(Array.isArray(data) ? data : []);
    }
    catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load tasks',
      );
    }
    finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setProcessingTaskId(taskId);
      await completeTask(taskId);
      await loadTasks();
      Alert.alert(t('common.success'), t('game.task_completed_alert'));
    }
    catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to complete task',
      );
    }
    finally {
      setProcessingTaskId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      LOCKED: 'bg-neutral-200 dark:bg-neutral-700',
      AVAILABLE: 'bg-green-100 dark:bg-green-900',
      IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900',
      PENDING_VERIFY: 'bg-yellow-100 dark:bg-yellow-900',
      COMPLETED: 'bg-purple-100 dark:bg-purple-900',
    };
    return colors[status as keyof typeof colors] || colors.LOCKED;
  };

  const getStatusTextColor = (status: string) => {
    const colors = {
      LOCKED: 'text-neutral-700 dark:text-neutral-300',
      AVAILABLE: 'text-green-700 dark:text-green-300',
      IN_PROGRESS: 'text-blue-700 dark:text-blue-300',
      PENDING_VERIFY: 'text-yellow-700 dark:text-yellow-300',
      COMPLETED: 'text-purple-700 dark:text-purple-300',
    };
    return colors[status as keyof typeof colors] || colors.LOCKED;
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (isLoading && safeTasks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Text className="text-neutral-400">{t('game.loading_tasks')}</Text>
      </View>
    );
  }

  const completedCount = safeTasks.filter(
    t => t.status === 'COMPLETED',
  ).length;
  const progressPercentage
    = safeTasks.length > 0 ? (completedCount / safeTasks.length) * 100 : 0;

  return (
    <ScrollView
      className="flex-1 bg-neutral-950"
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadTasks();
          }}
          tintColor="#a855f7"
        />
      )}
    >
      <View className="p-4">
        {/* Header */}
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="text-primary-400">
            ←
            {t('game.back_to_game')}
          </Text>
        </Pressable>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">
            {t('game.my_tasks')}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {t('game.tasks_subtitle')}
          </Text>
        </View>

        {/* Progress Card */}
        <View className="mb-6 rounded-xl border border-neutral-700 bg-neutral-800 p-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-semibold text-white">
              {t('game.overall_progress')}
            </Text>
            <Text className="text-2xl font-bold text-primary-400">
              {completedCount}
              /
              {safeTasks.length}
            </Text>
          </View>
          <View className="h-4 overflow-hidden rounded-full bg-neutral-700">
            <View
              className="h-full bg-linear-to-r from-primary-500 to-primary-600"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="mt-2 text-xs text-neutral-400">
            {progressPercentage.toFixed(0)}
            %
            {t('game.completed_label')}
          </Text>
        </View>

        {/* Tasks List */}
        <View className="gap-4">
          {safeTasks.map((userTask, index) => {
            const task = userTask.task;
            const isDisabled
              = userTask.status === 'LOCKED' || userTask.status === 'COMPLETED';
            const canComplete
              = userTask.status === 'AVAILABLE' && !task.verificationRequired;

            return (
              <View
                key={userTask.id}
                className={`rounded-xl border border-neutral-700 bg-neutral-800 p-4 ${
                  isDisabled ? 'opacity-60' : ''
                }`}
              >
                <View className="mb-3 flex-row items-start">
                  {/* Task Number/Status Icon */}
                  <View
                    className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${
                      userTask.status === 'COMPLETED'
                        ? 'bg-primary-900'
                        : userTask.status === 'AVAILABLE'
                          ? 'bg-primary-900/50'
                          : 'bg-neutral-700'
                    }`}
                  >
                    {userTask.status === 'COMPLETED'
                      ? (
                          <Text className="text-2xl">✅</Text>
                        )
                      : userTask.status === 'LOCKED'
                        ? (
                            <Text className="text-2xl">🔒</Text>
                          )
                        : (
                            <Text className="text-xl font-bold text-neutral-900 dark:text-white">
                              {index + 1}
                            </Text>
                          )}
                  </View>

                  {/* Task Content */}
                  <View className="flex-1">
                    <View className="mb-2 flex-row flex-wrap items-center gap-2">
                      <Text className="font-bold text-neutral-900 dark:text-white">
                        {task.name}
                      </Text>
                      <View
                        className={`rounded-full px-2 py-1 ${getStatusColor(userTask.status)}`}
                      >
                        <Text
                          className={`text-xs font-semibold ${getStatusTextColor(userTask.status)}`}
                        >
                          {t(`game.status_${userTask.status.toLowerCase()}`)}
                        </Text>
                      </View>
                      {task.verificationRequired && (
                        <View className="rounded-full bg-orange-100 px-2 py-1 dark:bg-orange-900">
                          <Text className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                            {t('game.verify')}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {task.description}
                    </Text>

                    {task.instructions && (
                      <View className="mb-3 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                        <Text className="text-xs text-blue-800 dark:text-blue-200">
                          <Text className="font-semibold">
                            {t('game.instructions')}
                            :
                            {' '}
                          </Text>
                          {task.instructions}
                        </Text>
                      </View>
                    )}

                    <View className="mb-3 flex-row flex-wrap items-center gap-3">
                      <View className="flex-row items-center">
                        <Text className="mr-1 text-xl">💰</Text>
                        <Text className="font-bold text-green-600">
                          +
                          {task.coinReward}
                          {' '}
                          {t('game.coins')}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="mr-1 text-lg">⏱️</Text>
                        <Text className="text-xs text-neutral-500">
                          {task.delayHours === 0
                            ? t('game.available_now')
                            : t('game.unlocks_after', {
                                hours: task.delayHours,
                              })}
                        </Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    {canComplete && (
                      <Button
                        label={
                          processingTaskId === task.id
                            ? t('game.processing')
                            : t('game.complete_task')
                        }
                        onPress={() => handleCompleteTask(task.id)}
                        disabled={processingTaskId === task.id}
                        variant="default"
                        className="mt-2"
                      />
                    )}
                    {userTask.status === 'PENDING_VERIFY' && (
                      <View className="mt-2 rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                        <Text className="text-center text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                          {t('game.pending_verify')}
                        </Text>
                        <Text className="mt-1 text-center text-xs text-yellow-700 dark:text-yellow-300">
                          {t('game.admin_review')}
                        </Text>
                      </View>
                    )}
                    {userTask.status === 'COMPLETED'
                      && userTask.completedAt && (
                      <Text className="mt-2 text-center text-xs text-neutral-500">
                        {t('game.completed_at')}
                        {' '}
                        {new Date(userTask.completedAt).toLocaleDateString(
                          i18n.language === 'pt'
                            ? 'pt-BR'
                            : i18n.language === 'es'
                              ? 'es-ES'
                              : 'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
