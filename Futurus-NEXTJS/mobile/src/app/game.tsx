import type { Dashboard } from '@/lib/api/game';
import { router } from 'expo-router';
import { Clock, Coins, Share2, Target, TrendingUp, Trophy, Users } from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import gameApi from '@/lib/api/game';
import { useThemeConfig } from '@/lib/use-theme-config';

export default function GameScreen() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useThemeConfig();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await gameApi.getDashboard();
      setDashboard(data);
    }
    catch (error) {
      console.error('Failed to load dashboard:', error);
    }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleNavigate = (screen: string) => {
    router.push(`/${screen}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading game data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        )}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Trophy size={40} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Game Center
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Complete tasks, earn coins, and unlock rewards
            </Text>
          </View>
        </View>

        {/* Coin Balance Card */}
        <TouchableOpacity
          onPress={() => handleNavigate('markets')}
          style={[styles.card, styles.balanceCard, { backgroundColor: theme.colors.cardBackground }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.balanceInfo}>
              <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
                Your Balance
              </Text>
              <View style={styles.coinBalance}>
                <Coins size={24} color={theme.colors.primary} />
                <Text style={[styles.coinAmount, { color: theme.colors.text }]}>
                  {dashboard?.coinBalance || 0}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardFooterText, { color: theme.colors.textSecondary }]}>
              Use coins in markets
            </Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.statIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <TrendingUp size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboard?.totalCoinsEarned || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Earned
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.statIcon, { backgroundColor: `${theme.colors.success}20` }]}>
              <Target size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboard?.completedTasks || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Tasks Done
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.statIcon, { backgroundColor: `${theme.colors.warning}20` }]}>
              <Clock size={24} color={theme.colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboard?.totalTasks || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.statIcon, { backgroundColor: `${theme.colors.info}20` }]}>
              <Users size={24} color={theme.colors.info} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {dashboard?.referralCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Referrals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Task */}
        {dashboard?.nextTask && (
          <TouchableOpacity
            onPress={() => handleNavigate('game-tasks')}
            style={[styles.card, styles.taskCard, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                Next Task
              </Text>
              <View
                style={[
                  styles.taskStatus,
                  {
                    backgroundColor:
                      dashboard.nextTask.status === 'COMPLETED'
                        ? theme.colors.success
                        : dashboard.nextTask.status === 'IN_PROGRESS'
                          ? theme.colors.info
                          : theme.colors.warning,
                  },
                ]}
              >
                <Text style={styles.taskStatusText}>
                  {dashboard.nextTask.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={[styles.taskName, { color: theme.colors.textPrimary }]}>
              {dashboard.nextTask.task.name}
            </Text>
            <Text style={[styles.taskReward, { color: theme.colors.success }]}>
              +
              {dashboard.nextTask.task.coinReward}
              {' '}
              Coins
            </Text>
            <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
              {dashboard.nextTask.task.description}
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => handleNavigate('game-tasks')}
            style={[styles.actionItem, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Target size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                My Tasks
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                View and complete tasks
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate('game-referrals')}
            style={[styles.actionItem, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.info}20` }]}>
              <Users size={20} color={theme.colors.info} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Referrals
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                Invite friends and earn bonuses
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate('game-transactions')}
            style={[styles.actionItem, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${theme.colors.success}20` }]}>
              <Coins size={20} color={theme.colors.success} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Coin History
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                View your coin transactions
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Code */}
        {dashboard?.referralCode && (
          <TouchableOpacity
            onPress={() => {
              // Copy referral code
            }}
            style={[styles.card, styles.referralCard, { backgroundColor: theme.colors.cardBackground }]}
          >
            <View style={styles.referralHeader}>
              <Share2 size={24} color={theme.colors.primary} />
              <Text style={[styles.referralTitle, { color: theme.colors.text }]}>
                Your Referral Code
              </Text>
            </View>
            <View style={styles.referralCodeBox}>
              <Text style={[styles.referralCode, { color: theme.colors.primary }]}>
                {dashboard.referralCode}
              </Text>
            </View>
            <Text style={[styles.referralHint, { color: theme.colors.textSecondary }]}>
              Share with friends to earn 500 bonus coins each!
            </Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  balanceCard: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  taskCard: {
    padding: 20,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  taskStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskReward: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  actionArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  referralCard: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  referralCodeBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  referralHint: {
    fontSize: 14,
    textAlign: 'center',
  },
});
