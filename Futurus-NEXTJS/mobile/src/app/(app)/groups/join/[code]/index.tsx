import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, ArrowLeft, CheckCircle, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAcceptInvitation, useGroupByInviteCode } from '@/api/groups';
import { Text } from '@/components/ui';
import { CDP, THEME } from '@/lib/theme';

export default function JoinByInviteCodeScreen() {
  const { t } = useTranslation();
  const { code } = useLocalSearchParams<{ code: string }>();
  const queryClient = useQueryClient();

  const { data: group, isLoading, error } = useGroupByInviteCode({
    variables: { code: code || '' },
    enabled: !!code,
  });

  const acceptInvitationMutation = useAcceptInvitation();
  const [contributionAmount, setContributionAmount] = useState('');
  const [memberChosenOutcome, setMemberChosenOutcome] = useState<'YES' | 'NO' | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJoin = async () => {
    if (!group || !contributionAmount || !code || !memberChosenOutcome)
      return;
    try {
      await acceptInvitationMutation.mutateAsync({
        code,
        contributionAmount: Number.parseFloat(contributionAmount),
        memberChosenOutcome,
      });
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      setTimeout(() => {
        router.replace(`/(app)/groups/${group.slug}`);
      }, 2000);
    }
    catch (err: any) {
      Alert.alert(t('common.error'), err.response?.data?.message || t('groups.join_error'));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.errorCard}
        >
          <AlertTriangle size={48} color={THEME.danger} />
          <Text style={styles.errorTitle}>{t('groups.invalid_invite')}</Text>
          <Text style={styles.errorText}>{t('groups.invite_expired')}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(app)/groups')}>
            <ArrowLeft size={18} color={THEME.textMain} />
            <Text style={styles.backBtnText}>{t('groups.back_to_groups')}</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.successCard}
        >
          <CheckCircle size={48} color={THEME.success} />
          <Text style={styles.successTitle}>{t('groups.join_success')}</Text>
          <Text style={styles.successText}>{t('groups.redirecting')}</Text>
        </MotiView>
      </View>
    );
  }

  const progress = (group.currentLiquidity / group.targetLiquidity) * 100;

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Users size={28} color={THEME.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.inviteLabel}>{t('groups.private_invite')}</Text>
          </View>
        </View>

        {/* Group Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('groups.market')}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {group.market.question}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('groups.manager')}</Text>
            <Text style={styles.infoValue}>
              @
              {group.creator.username}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('groups.liquidity')}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressValue}>
                  $
                  {group.currentLiquidity.toLocaleString()}
                </Text>
                <Text style={styles.progressTarget}>
                  $
                  {group.targetLiquidity.toLocaleString()}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('groups.members_count')}</Text>
            <Text style={styles.infoValue}>{group.memberCount}</Text>
          </View>
        </View>

        {/* Contribution Input */}
        <View style={styles.contributionSection}>
          <Text style={styles.contributionLabel}>
            {t('groups.your_contribution')}
            <Text style={styles.contributionHint}>
              {' '}
              (Min: $
              {group.minContribution}
              {group.maxContribution ? ` | Max: $${group.maxContribution}` : ''}
              )
            </Text>
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
        </View>

        {/* Outcome Selection */}
        <View style={styles.outcomeSection}>
          <Text style={styles.outcomeLabel}>{t('groups.your_prediction')}</Text>
          <View style={styles.outcomeButtons}>
            <TouchableOpacity
              style={[
                styles.outcomeBtn,
                memberChosenOutcome === 'YES' && styles.outcomeBtnYesSelected,
              ]}
              onPress={() => setMemberChosenOutcome('YES')}
            >
              <Text
                style={[
                  styles.outcomeBtnText,
                  memberChosenOutcome === 'YES' && styles.outcomeBtnTextSelected,
                ]}
              >
                {t('groups.yes')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outcomeBtn,
                memberChosenOutcome === 'NO' && styles.outcomeBtnNoSelected,
              ]}
              onPress={() => setMemberChosenOutcome('NO')}
            >
              <Text
                style={[
                  styles.outcomeBtnText,
                  memberChosenOutcome === 'NO' && styles.outcomeBtnTextSelected,
                ]}
              >
                {t('groups.no')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.outcomeHint}>{t('groups.choose_outcome_hint')}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace('/(app)/groups')}
          >
            <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.joinBtn,
              (!contributionAmount || !memberChosenOutcome || acceptInvitationMutation.isPending) && styles.disabledBtn,
            ]}
            onPress={handleJoin}
            disabled={!contributionAmount || !memberChosenOutcome || acceptInvitationMutation.isPending}
          >
            {acceptInvitationMutation.isPending
              ? (
                  <ActivityIndicator color={THEME.textMain} size="small" />
                )
              : (
                  <>
                    <Users size={18} color={THEME.textMain} />
                    <Text style={styles.joinBtnText}>{t('groups.join_group')}</Text>
                  </>
                )}
          </TouchableOpacity>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.background,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${THEME.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
  },
  inviteLabel: {
    fontSize: 13,
    color: THEME.textDim,
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.textDim,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    color: THEME.textMain,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressValue: {
    fontSize: 14,
    color: THEME.textMain,
    fontWeight: '700',
  },
  progressTarget: {
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
  contributionSection: {
    marginBottom: 24,
  },
  contributionLabel: {
    fontSize: 12,
    color: THEME.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  contributionHint: {
    fontSize: 11,
    color: THEME.textDim,
    textTransform: 'none',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingHorizontal: 16,
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
  outcomeSection: {
    marginBottom: 24,
  },
  outcomeLabel: {
    fontSize: 12,
    color: THEME.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  outcomeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  outcomeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: THEME.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  outcomeBtnYesSelected: {
    backgroundColor: THEME.success,
    borderColor: THEME.success,
  },
  outcomeBtnNoSelected: {
    backgroundColor: THEME.danger,
    borderColor: THEME.danger,
  },
  outcomeBtnText: {
    color: THEME.textDim,
    fontWeight: '700',
    fontSize: 15,
  },
  outcomeBtnTextSelected: {
    color: THEME.textMain,
  },
  outcomeHint: {
    fontSize: 11,
    color: THEME.textDim,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: THEME.background,
    borderRadius: 14,
  },
  cancelBtnText: {
    color: THEME.textDim,
    fontWeight: '700',
    fontSize: 15,
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: THEME.primary,
    borderRadius: 14,
  },
  joinBtnText: {
    color: THEME.textMain,
    fontWeight: '700',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  errorCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: `${THEME.danger}30`,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: THEME.textDim,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  backBtnText: {
    color: THEME.textMain,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: `${THEME.success}30`,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textMain,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: THEME.textDim,
    textAlign: 'center',
  },
});
