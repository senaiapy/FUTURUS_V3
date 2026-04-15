import Env from '@env';
import { useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Globe,
  Lock,
  LockKeyhole,
  LogOut,
  Share2,
  Users,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useExecuteBet,
  useGroup,
  useGroupMembers,
  useJoinGroup,
  useLeaveGroup,
  useLockGroup,
  useSetOutcome,
  useSubmitForApproval,
} from '@/api/groups';
import { Modal, Text, useModal } from '@/components/ui';
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
  AWAITING_RESULT_APPROVAL: { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
};

export default function GroupDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const { data: group, isLoading, refetch } = useGroup({ variables: { slug: slug || '' }, enabled: !!slug });
  const { data: members = [] } = useGroupMembers({
    variables: { groupId: group?.id || 0 },
    enabled: !!group?.id,
  });

  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const lockGroupMutation = useLockGroup();
  const setOutcomeMutation = useSetOutcome();
  const executeBetMutation = useExecuteBet();
  const submitApprovalMutation = useSubmitForApproval();

  const joinModal = useModal();
  const [contributionAmount, setContributionAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const handleJoinGroup = async () => {
    if (!group || !contributionAmount)
      return;
    try {
      await joinGroupMutation.mutateAsync({
        groupId: group.id,
        contributionAmount: Number.parseFloat(contributionAmount),
      });
      joinModal.dismiss();
      setContributionAmount('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      Alert.alert(t('common.success'), t('groups.join_success'));
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.join_error'));
    }
  };

  const handleLeaveGroup = () => {
    if (!group)
      return;
    Alert.alert(t('groups.leave_confirm_title'), t('groups.leave_confirm_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('groups.leave'),
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroupMutation.mutateAsync({ groupId: group.id });
            refetch();
            queryClient.invalidateQueries({ queryKey: ['my-groups'] });
            Alert.alert(t('common.success'), t('groups.leave_success'));
          }
          catch (err: any) {
            Alert.alert(t('common.error'), err.response?.data?.message || t('groups.leave_error'));
          }
        },
      },
    ]);
  };

  const handleLockGroup = async () => {
    if (!group)
      return;
    try {
      await lockGroupMutation.mutateAsync({ groupId: group.id });
      refetch();
      Alert.alert(t('common.success'), t('groups.lock_success'));
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.lock_error'));
    }
  };

  const handleSetOutcome = async (outcome: 'YES' | 'NO') => {
    if (!group)
      return;
    try {
      await setOutcomeMutation.mutateAsync({ groupId: group.id, outcome });
      refetch();
      Alert.alert(t('common.success'), t('groups.outcome_set'));
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.outcome_error'));
    }
  };

  const handleExecuteBet = async () => {
    if (!group)
      return;
    try {
      await executeBetMutation.mutateAsync({ groupId: group.id });
      refetch();
      Alert.alert(t('common.success'), t('groups.bet_executed'));
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.execute_error'));
    }
  };

  const handleSubmitApproval = async () => {
    if (!group)
      return;
    try {
      await submitApprovalMutation.mutateAsync({ groupId: group.id });
      refetch();
      Alert.alert(t('common.success'), t('groups.submitted_approval'));
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.submit_error'));
    }
  };

  const handleCopyInvite = async () => {
    if (!group?.inviteCode)
      return;
    const baseUrl = Env.API_URL?.replace('/api', '') || 'https://futurus.com.br';
    // Include locale prefix (default to Portuguese)
    const link = `${baseUrl}/pt/dashboard/groups/join/${group.inviteCode}`;
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareGroup = async () => {
    if (!group)
      return;
    try {
      const baseUrl = Env.API_URL?.replace('/api', '') || 'https://futurus.com.br';
      // Include locale prefix (default to Portuguese)
      const link = group.inviteCode
        ? `${baseUrl}/pt/dashboard/groups/join/${group.inviteCode}`
        : `${baseUrl}/pt/dashboard/groups/${group.slug}`;

      await Share.share({
        title: group.name,
        message: `${t('groups.join_invite_message')}: ${group.name}\n\n${link}`,
        url: link,
      });
    }
    catch (err) {
      console.error('Share error:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('groups.not_found')}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t('common.go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = (group.currentLiquidity / group.targetLiquidity) * 100;
  const statusStyle = statusColors[group.status] || statusColors.DRAFT;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={THEME.textMain} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.groupName}>{group.name}</Text>
            <View style={styles.headerBadges}>
              <View style={styles.privacyBadge}>
                {group.isPublic
                  ? (
                      <Globe size={12} color={THEME.textDim} />
                    )
                  : (
                      <LockKeyhole size={12} color={THEME.textDim} />
                    )}
                <Text style={styles.privacyText}>
                  {group.isPublic ? t('groups.public') : t('groups.private')}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {group.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manager Actions */}
        {group.isManager && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.managerCard}
          >
            <Text style={styles.managerTitle}>{t('groups.manager_actions')}</Text>
            <View style={styles.actionButtons}>
              {group.status === 'DRAFT' && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleSubmitApproval}>
                  <Text style={styles.actionBtnText}>{t('groups.submit_approval')}</Text>
                </TouchableOpacity>
              )}
              {group.status === 'OPEN' && (
                <TouchableOpacity style={[styles.actionBtn, styles.warningBtn]} onPress={handleLockGroup}>
                  <Lock size={16} color={THEME.textMain} />
                  <Text style={styles.actionBtnText}>{t('groups.lock_group')}</Text>
                </TouchableOpacity>
              )}
              {group.status === 'LOCKED' && group.decisionMethod === 'MANAGER' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.successBtn]}
                    onPress={() => handleSetOutcome('YES')}
                  >
                    <Text style={styles.actionBtnText}>{t('groups.select_yes')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.dangerBtn]}
                    onPress={() => handleSetOutcome('NO')}
                  >
                    <Text style={styles.actionBtnText}>{t('groups.select_no')}</Text>
                  </TouchableOpacity>
                </>
              )}
              {group.status === 'AWAITING_RESULT_APPROVAL' && (
                <View style={styles.awaitingApprovalBadge}>
                  <Text style={styles.awaitingApprovalText}>
                    {t('groups.result')}
                    {' '}
                    (
                    {group.outcomeSelected}
                    ) -
                    {t('groups.awaiting_admin_approval')}
                  </Text>
                </View>
              )}
              {!group.isPublic && group.inviteCode && (
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyInvite}>
                  {copied ? <CheckCircle size={16} color={THEME.success} /> : <Copy size={16} color={THEME.textDim} />}
                  <Text style={styles.copyBtnText}>
                    {copied ? t('common.copied') : t('groups.copy_invite')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareGroup}>
                <Share2 size={16} color={THEME.primary} />
                <Text style={styles.shareBtnText}>{t('groups.share')}</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          {/* Market */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('groups.market')}</Text>
            <Text style={styles.infoValue}>{group.market.question}</Text>
            <TouchableOpacity onPress={() => router.push(`/(app)/market/${group.market.slug}`)}>
              <Text style={styles.infoLink}>{t('groups.view_market')}</Text>
            </TouchableOpacity>
          </View>

          {/* Manager */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('groups.manager')}</Text>
            <Text style={styles.infoValue}>
              @
              {group.creator.username}
            </Text>
          </View>

          {/* Decision Method */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('groups.decision_method')}</Text>
            <Text style={styles.infoValue}>{group.decisionMethod}</Text>
            {group.outcomeSelected && (
              <Text style={styles.outcomeText}>
                {t('groups.outcome')}
                :
                {' '}
                {group.outcomeSelected}
              </Text>
            )}
          </View>

          {/* Liquidity */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('groups.liquidity')}</Text>
            <View style={styles.liquidityHeader}>
              <Text style={styles.liquidityValue}>
                $
                {group.currentLiquidity.toLocaleString()}
              </Text>
              <Text style={styles.liquidityTarget}>
                $
                {group.targetLiquidity.toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>

          {/* Your Position */}
          {group.userMembership && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('groups.your_position')}</Text>
              <Text style={styles.infoValue}>
                $
                {group.userMembership.contributionAmount.toLocaleString()}
              </Text>
              <Text style={styles.ownershipText}>
                {(group.userMembership.ownershipPercentage * 100).toFixed(2)}
                %
                {t('groups.ownership')}
              </Text>
            </View>
          )}

          {/* Members */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('groups.members_count')}</Text>
            <Text style={styles.infoValue}>{group.memberCount}</Text>
            {group.maxParticipants && (
              <Text style={styles.maxText}>
                Max:
                {group.maxParticipants}
              </Text>
            )}
          </View>
        </View>

        {/* Share button for non-managers */}
        {!group.isManager && (group.isPublic || group.isMember) && (
          <View style={styles.shareContainer}>
            <TouchableOpacity style={styles.shareGroupBtn} onPress={handleShareGroup}>
              <Share2 size={20} color={THEME.primary} />
              <Text style={styles.shareGroupBtnText}>{t('groups.share_group')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Join/Leave Actions */}
        {!group.isManager && group.status === 'OPEN' && group.adminApproved && (
          <View style={styles.joinLeaveContainer}>
            {!group.isMember
              ? (
                  <TouchableOpacity style={styles.joinBtn} onPress={() => joinModal.present()}>
                    <Users size={20} color={THEME.textMain} />
                    <Text style={styles.joinBtnText}>{t('groups.join_group')}</Text>
                  </TouchableOpacity>
                )
              : (
                  <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveGroup}>
                    <LogOut size={20} color={THEME.danger} />
                    <Text style={styles.leaveBtnText}>{t('groups.leave_group')}</Text>
                  </TouchableOpacity>
                )}
          </View>
        )}

        {/* Members List */}
        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Users size={20} color={THEME.textMain} />
            <Text style={styles.membersSectionTitle}>
              {t('groups.members')}
              {' '}
              (
              {members.length}
              )
            </Text>
          </View>
          {members.length === 0
            ? (
                <Text style={styles.noMembersText}>{t('groups.no_members')}</Text>
              )
            : (
                <View style={styles.membersList}>
                  {members.map(member => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {member.user.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberUsername}>
                          @
                          {member.user.username}
                        </Text>
                        <Text style={styles.memberJoined}>
                          {t('groups.joined')}
                          {' '}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {member.memberChosenOutcome && (
                        <View style={[
                          styles.outcomeBadge,
                          member.memberChosenOutcome === 'YES' ? styles.outcomeBadgeYes : styles.outcomeBadgeNo,
                        ]}
                        >
                          <Text style={styles.outcomeBadgeText}>
                            {member.memberChosenOutcome === 'YES' ? t('groups.yes') : t('groups.no')}
                          </Text>
                        </View>
                      )}
                      <View style={styles.memberContribution}>
                        <Text style={styles.contributionAmount}>
                          $
                          {member.contributionAmount.toLocaleString()}
                        </Text>
                        <Text style={styles.ownershipPercent}>
                          {(member.ownershipPercentage * 100).toFixed(2)}
                          %
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
        </View>
      </ScrollView>

      {/* Join Modal */}
      <Modal ref={joinModal.ref} snapPoints={['50%']} title={`${t('groups.join')} ${group.name}`}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {t('groups.join')}
            {' '}
            {group.name}
          </Text>
          <Text style={styles.modalSubtitle}>
            {t('groups.min')}
            : $
            {group.minContribution}
            {' '}
            |
            {t('groups.max')}
            :
            {' '}
            {group.maxContribution ? `$${group.maxContribution}` : t('groups.no_limit')}
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              value={contributionAmount}
              onChangeText={setContributionAmount}
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={THEME.textDim}
            />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => joinModal.dismiss()}>
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!contributionAmount || joinGroupMutation.isPending) && styles.disabledBtn]}
              onPress={handleJoinGroup}
              disabled={!contributionAmount || joinGroupMutation.isPending}
            >
              <Text style={styles.confirmBtnText}>
                {joinGroupMutation.isPending ? t('common.processing') : t('groups.join_group')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.background,
  },
  errorText: {
    color: THEME.danger,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: THEME.textMain,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.textMain,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privacyText: {
    fontSize: 12,
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
  managerCard: {
    marginHorizontal: 20,
    backgroundColor: `${THEME.primary}15`,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${THEME.primary}30`,
    marginBottom: 20,
  },
  managerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    color: THEME.textMain,
    fontWeight: '700',
    fontSize: 13,
  },
  warningBtn: {
    backgroundColor: THEME.warning,
  },
  successBtn: {
    backgroundColor: THEME.success,
  },
  dangerBtn: {
    backgroundColor: THEME.danger,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  copyBtnText: {
    color: THEME.textDim,
    fontWeight: '600',
    fontSize: 13,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${THEME.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${THEME.primary}30`,
  },
  shareBtnText: {
    color: THEME.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  infoGrid: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.textDim,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: THEME.textMain,
    fontWeight: '700',
  },
  infoLink: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  outcomeText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  liquidityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liquidityValue: {
    fontSize: 16,
    color: THEME.textMain,
    fontWeight: '700',
  },
  liquidityTarget: {
    fontSize: 14,
    color: THEME.textDim,
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
  ownershipText: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  maxText: {
    fontSize: 12,
    color: THEME.textDim,
    marginTop: 4,
  },
  joinLeaveContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  joinBtnText: {
    color: THEME.textMain,
    fontWeight: '800',
    fontSize: 16,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${THEME.danger}20`,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${THEME.danger}30`,
  },
  leaveBtnText: {
    color: THEME.danger,
    fontWeight: '800',
    fontSize: 16,
  },
  membersSection: {
    marginHorizontal: 20,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    overflow: 'hidden',
  },
  membersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
  },
  membersSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textMain,
  },
  noMembersText: {
    padding: 24,
    textAlign: 'center',
    color: THEME.textDim,
  },
  membersList: {},
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: THEME.textMain,
    fontWeight: '800',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberUsername: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textMain,
  },
  memberJoined: {
    fontSize: 12,
    color: THEME.textDim,
    marginTop: 2,
  },
  memberContribution: {
    alignItems: 'flex-end',
  },
  contributionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textMain,
  },
  ownershipPercent: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  outcomeBadgeYes: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  outcomeBadgeNo: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  outcomeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMain,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: THEME.textDim,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontSize: 24,
    fontWeight: '700',
    color: THEME.textMain,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: THEME.card,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: THEME.textDim,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: THEME.primary,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: THEME.textMain,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  awaitingApprovalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    width: '100%',
  },
  awaitingApprovalText: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  shareContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  shareGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${THEME.primary}15`,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${THEME.primary}30`,
  },
  shareGroupBtnText: {
    color: THEME.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
