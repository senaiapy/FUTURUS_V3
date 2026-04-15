/* eslint-disable max-lines-per-function */
import type { Dashboard } from '@/api/game';
import { router, useNavigation } from 'expo-router';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coins,
  History,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getDashboard } from '@/api/game';
import { HeaderLinks } from '@/components/header-links';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { CDP } from '@/lib/theme';

export default function GameScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [dashboard, setDashboard] = React.useState<Dashboard | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getDashboard()
      .then(data => setDashboard(data))
      .catch(err => console.error('Failed to fetch dashboard', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />
      <HeaderLinks />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Trophy size={64} color={CDP.primary} />
            <Text style={styles.appTitle}>{t('game.title')}</Text>
            <Text style={styles.subtitle}>{t('game.subtitle')}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${CDP.textPrimary}40` },
                ]}
              >
                <Coins size={20} color={CDP.primary} />
              </View>
              <Text style={styles.statValue}>
                {loading ? '...' : (dashboard?.coinBalance ?? 0)}
              </Text>
              <Text style={styles.statLabel}>{t('game.coin_balance')}</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${CDP.textPrimary}40` },
                ]}
              >
                <TrendingUp size={20} color={CDP.purple} />
              </View>
              <Text style={styles.statValue}>
                {loading ? '...' : (dashboard?.totalCoinsEarned ?? 0)}
              </Text>
              <Text style={styles.statLabel}>{t('game.total_earned')}</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${CDP.success}40` },
                ]}
              >
                <CheckCircle2 size={20} color={CDP.success} />
              </View>
              <Text style={styles.statValue}>
                {loading ? '...' : (dashboard?.completedTasks ?? 0)}
              </Text>
              <Text style={styles.statLabel}>{t('game.tasks_completed')}</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${CDP.textPrimary}40` },
                ]}
              >
                <Users size={20} color={CDP.warning} />
              </View>
              <Text style={styles.statValue}>
                {loading ? '...' : (dashboard?.referralCount ?? 0)}
              </Text>
              <Text style={styles.statLabel}>{t('game.referrals')}</Text>
            </View>
          </View>

          {/* Incentive Card - Redirects to Markets */}
          <TouchableOpacity
            style={styles.incentiveCard}
            onPress={() => {
              // Navigate explicitly to the index screen within tabs
              (navigation as any).navigate('index');
            }}
          >
            <View style={styles.incentiveContent}>
              <View style={styles.incentiveIcon}>
                <Rocket size={32} color={CDP.primary} />
              </View>
              <View style={styles.incentiveInfo}>
                <Text style={styles.incentiveTitle}>
                  {t('game.shop_with_coins')}
                </Text>
                <Text style={styles.incentiveValue}>
                  {t('game.coin_value')}
                </Text>
                <Text style={styles.incentiveAction}>
                  {t('game.use_coins_discount')}
                </Text>
              </View>
              <ChevronRight size={24} color={CDP.primary} />
            </View>
          </TouchableOpacity>

          {/* Coming Soon / Feature Preview */}
          <View style={styles.featureCard}>
            <View style={styles.iconRow}>
              <Star size={24} color={CDP.warning} />
              <Award size={24} color={CDP.success} />
              <Target size={24} color={CDP.primary} />
            </View>
            <Text style={styles.featureCardTitle}>{t('game.coming_soon')}</Text>
            <Text style={styles.featureCardText}>
              {t('game.feature_preview')}
            </Text>
          </View>

          {/* Action Cards (Synced with Frontend) */}
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/game/tasks')}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: `${CDP.success}40` },
                ]}
              >
                <ClipboardList size={24} color={CDP.success} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{t('game.my_tasks')}</Text>
                <Text style={styles.actionSubtitle}>
                  {t('game.view_complete_task')}
                </Text>
              </View>
              <ChevronRight size={20} color={CDP.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/game/referrals')}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: `${CDP.textPrimary}40` },
                ]}
              >
                <Users size={24} color={CDP.warning} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{t('game.referrals')}</Text>
                <Text style={styles.actionSubtitle}>
                  {t('game.invite_friends_earn')}
                </Text>
              </View>
              <ChevronRight size={20} color={CDP.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/game/transactions')}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: `${CDP.textPrimary}40` },
                ]}
              >
                <History size={24} color={CDP.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{t('game.transactions')}</Text>
                <Text style={styles.actionSubtitle}>
                  {t('game.view_coin_history')}
                </Text>
              </View>
              <ChevronRight size={20} color={CDP.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  gamifyBadgeHeader: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: 16,
  },
  gamifyBadgeHeaderText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: CDP.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: CDP.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: CDP.card,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: CDP.textMuted,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: CDP.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: CDP.card,
    marginBottom: 24,
    alignItems: 'center',
  },
  incentiveCard: {
    backgroundColor: CDP.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    marginBottom: 24,
  },
  incentiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incentiveIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  incentiveInfo: {
    flex: 1,
  },
  incentiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginBottom: 2,
  },
  incentiveValue: {
    fontSize: 14,
    color: CDP.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  incentiveAction: {
    fontSize: 14,
    color: CDP.textSecondary,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  featureCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginBottom: 8,
  },
  featureCardText: {
    fontSize: 14,
    color: CDP.textSecondary,
    textAlign: 'center',
  },
  actionCardsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CDP.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CDP.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: CDP.textSecondary,
  },
});
