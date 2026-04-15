import type { UserTask } from '@/lib/api/game';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock, Lock, Target } from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import gameApi from '@/lib/api/game';
import { useThemeConfig } from '@/lib/use-theme-config';

export default function GameTasksScreen() {
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useThemeConfig();

  useEffect(() => {
    loadUserTasks();
  }, []);

  const loadUserTasks = async () => {
    try {
      setLoading(true);
      const response = await gameApi.getUserTasks();
      const tasks = Array.isArray(response) ? response : (response as any).userTasks || [];
      setUserTasks(tasks);
    }
    catch (error) {
      console.error('Failed to load tasks:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await gameApi.startTask(taskId);
      loadUserTasks();
    }
    catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await gameApi.completeTask(taskId);
      loadUserTasks();
    }
    catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={20} color={theme.colors.success} />;
      case 'IN_PROGRESS':
        return <Clock size={20} color={theme.colors.info} />;
      case 'LOCKED':
        return <Lock size={20} color={theme.colors.textSecondary} />;
      default:
        return <Target size={20} color={theme.colors.primary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return theme.colors.success;
      case 'IN_PROGRESS':
        return theme.colors.info;
      case 'LOCKED':
        return theme.colors.textSecondary;
      default:
        return theme.colors.warning;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading tasks...
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
        <Text style={[styles.title, { color: theme.colors.text }]}>My Tasks</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {userTasks.length === 0
          ? (
              <View style={styles.emptyState}>
                <Target size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  No tasks available
                </Text>
              </View>
            )
          : (
              userTasks.map(userTask => (
                <View
                  key={userTask.id}
                  style={[styles.taskCard, { backgroundColor: theme.colors.cardBackground }]}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskIcon}>
                      {getStatusIcon(userTask.status)}
                    </View>
                    <View style={styles.taskHeaderContent}>
                      <Text style={[styles.taskName, { color: theme.colors.text }]}>
                        {userTask.task.name}
                      </Text>
                      <Text style={[styles.taskStatus, { color: getStatusColor(userTask.status) }]}>
                        {userTask.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                    {userTask.task.description}
                  </Text>

                  <View style={styles.taskFooter}>
                    <Text style={[styles.taskReward, { color: theme.colors.success }]}>
                      +
                      {userTask.task.coinReward}
                      {' '}
                      Coins
                    </Text>

                    {userTask.status === 'AVAILABLE' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => handleStartTask(userTask.taskId)}
                      >
                        <Text style={styles.actionButtonText}>Start</Text>
                      </TouchableOpacity>
                    )}

                    {userTask.status === 'IN_PROGRESS' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                        onPress={() => handleCompleteTask(userTask.taskId)}
                      >
                        <Text style={styles.actionButtonText}>Complete</Text>
                      </TouchableOpacity>
                    )}

                    {userTask.status === 'COMPLETED' && (
                      <View style={[styles.completedBadge, { backgroundColor: `${theme.colors.success}20` }]}>
                        <CheckCircle2 size={16} color={theme.colors.success} />
                        <Text style={[styles.completedText, { color: theme.colors.success }]}>
                          Completed
                        </Text>
                      </View>
                    )}

                    {userTask.status === 'LOCKED' && (
                      <View style={[styles.lockedBadge, { backgroundColor: `${theme.colors.textSecondary}20` }]}>
                        <Lock size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
                          Locked
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskHeaderContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskReward: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lockedText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
