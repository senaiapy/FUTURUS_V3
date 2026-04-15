import type { Group } from '@/api/groups';
import { router } from 'expo-router';
import {
  ChevronRight,
  Globe,
  LockKeyhole,
  Plus,
  Users,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGroups, useMyGroups } from '@/api/groups';
import { HeaderLinks } from '@/components/header-links';
import { Text } from '@/components/ui';
import { CDP, THEME } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'rgba(156, 163, 175, 0.2)', text: '#9CA3AF' },
  PENDING_APPROVAL: { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
  REJECTED: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' },
  OPEN: { bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981' },
  LOCKED: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3B82F6' },
  VOTING: { bg: 'rgba(168, 85, 247, 0.2)', text: '#A855F7' },
  EXECUTED: { bg: 'rgba(99, 102, 241, 0.2)', text: '#6366F1' },
  RESOLVED: { bg: 'rgba(168, 85, 247, 0.2)', text: '#A855F7' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' },
  REFUNDED: { bg: 'rgba(249, 115, 22, 0.2)', text: '#F97316' },
};

function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const { t } = useTranslation();
  const progress = (group.currentLiquidity / group.targetLiquidity) * 100;
  const statusStyle = statusColors[group.status] || statusColors.DRAFT;

  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.groupIcon}>
          <Users size={20} color={THEME.primary} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.privacyBadge}>
            {group.isPublic
              ? (
                  <>
                    <Globe size={10} color={THEME.textDim} />
                    <Text style={styles.privacyText}>{t('groups.public')}</Text>
                  </>
                )
              : (
                  <>
                    <LockKeyhole size={10} color={THEME.textDim} />
                    <Text style={styles.privacyText}>{t('groups.private')}</Text>
                  </>
                )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {group.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <Text style={styles.marketQuestion} numberOfLines={2}>
        {group.market.question}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{t('groups.liquidity')}</Text>
          <Text style={styles.progressValue}>
            $
            {group.currentLiquidity.toLocaleString()}
            {' '}
            / $
            {group.targetLiquidity.toLocaleString()}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.membersInfo}>
          <Users size={14} color={THEME.textDim} />
          <Text style={styles.membersText}>
            {group.memberCount}
            {' '}
            {t('groups.members')}
          </Text>
        </View>
        <ChevronRight size={20} color={THEME.textDim} />
      </View>
    </TouchableOpacity>
  );
}

export default function GroupsScreen() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'joined' | 'public'>('joined');
  const [refreshing, setRefreshing] = useState(false);

  const { data: myGroups, refetch: refetchMyGroups } = useMyGroups();
  const { data: publicGroups, refetch: refetchPublicGroups } = useGroups({
    variables: { isPublic: true, status: 'OPEN' },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMyGroups(), refetchPublicGroups()]);
    setRefreshing(false);
  };

  const groups = activeTab === 'joined' ? myGroups || [] : publicGroups || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderLinks />

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('groups.title')}</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(app)/groups/create')}
        >
          <Plus size={20} color={THEME.textMain} />
          <Text style={styles.createButtonText}>{t('groups.create')}</Text>
        </TouchableOpacity>
      </MotiView>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('joined')}
          style={[styles.tabButton, activeTab === 'joined' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.tabTextActive]}>
            {t('groups.my_groups')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('public')}
          style={[styles.tabButton, activeTab === 'public' && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === 'public' && styles.tabTextActive]}>
            {t('groups.public_groups')}
          </Text>
        </TouchableOpacity>
      </View>

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
        {groups.length === 0
          ? (
              <View style={styles.emptyState}>
                <Users size={48} color={THEME.textDim} opacity={0.5} />
                <Text style={styles.emptyText}>
                  {activeTab === 'joined' ? t('groups.no_groups') : t('groups.no_public_groups')}
                </Text>
                {activeTab === 'joined' && (
                  <TouchableOpacity
                    style={styles.exploreBtn}
                    onPress={() => setActiveTab('public')}
                  >
                    <Text style={styles.exploreBtnText}>{t('groups.explore')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          : (
              <View style={styles.groupsList}>
                {groups.map((group, index) => (
                  <MotiView
                    key={group.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: index * 100 }}
                  >
                    <GroupCard
                      group={group}
                      onPress={() => router.push(`/(app)/groups/${group.slug}`)}
                    />
                  </MotiView>
                ))}
              </View>
            )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.textMain,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    color: THEME.textMain,
    fontWeight: '700',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 16,
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
    fontWeight: '700',
    color: THEME.textDim,
  },
  tabTextActive: {
    color: THEME.textMain,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  groupsList: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${THEME.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textMain,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  privacyText: {
    fontSize: 11,
    color: THEME.textDim,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  marketQuestion: {
    fontSize: 14,
    color: THEME.textDim,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: THEME.textDim,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    color: THEME.textMain,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersText: {
    fontSize: 12,
    color: THEME.textDim,
    fontWeight: '600',
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
    color: THEME.textMain,
    fontWeight: '800',
    fontSize: 14,
  },
});
