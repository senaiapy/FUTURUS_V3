import type { Referral } from '@/api/game';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
} from 'react-native';
import {
  generateReferralCode,
  getDashboard,
  getReferrals,

} from '@/api/game';
import { Button, Text, View } from '@/components/ui';

export default function ReferralsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      setIsLoading(true);
      const [referralsData, dashboard] = await Promise.all([
        getReferrals(),
        getDashboard(),
      ]);
      setReferrals(Array.isArray(referralsData) ? referralsData : []);
      if (dashboard.referralCode) {
        setReferralCode(dashboard.referralCode);
      }
    }
    catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('game.load_referrals_failed'),
      );
    }
    finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      const code = await generateReferralCode();
      setReferralCode(code);
      Alert.alert(t('common.success'), t('game.referral_code_generated'));
    }
    catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('game.generate_referral_failed'),
      );
    }
    finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    const referralLink = `https://experience-club.online/auth/register?ref=${referralCode}`;
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert(t('common.copied'), t('game.referral_link_copied'));
  };

  const handleShare = async () => {
    try {
      const referralLink = `https://experience-club.online/auth/register?ref=${referralCode}`;
      await Share.share({
        message: t('game.share_message', {
          code: referralCode,
          link: referralLink,
        }),
        title: t('game.share_title'),
      });
    }
    catch (error: any) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading && !referralCode) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Text className="text-neutral-400">{t('common.loading')}</Text>
      </View>
    );
  }

  const safeReferrals = Array.isArray(referrals) ? referrals : [];
  const pendingCount = safeReferrals.filter(
    r => r.status === 'PENDING',
  ).length;
  const completedCount = safeReferrals.filter(
    r => r.status === 'COMPLETED',
  ).length;

  return (
    <ScrollView
      className="flex-1 bg-neutral-950"
      refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadReferrals();
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
            {t('game.referrals_title')}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {t('game.referrals_subtitle')}
          </Text>
        </View>

        {/* Stats */}
        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
            <Text className="text-xs text-neutral-400">{t('game.total')}</Text>
            <Text className="mt-1 text-2xl font-bold text-white">
              {safeReferrals.length}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
            <Text className="text-xs text-neutral-400">
              {t('game.pending')}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-yellow-400">
              {pendingCount}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
            <Text className="text-xs text-neutral-400">
              {t('game.completed')}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-primary-400">
              {completedCount}
            </Text>
          </View>
        </View>

        {/* Referral Code Card */}
        <View className="mb-6 overflow-hidden rounded-xl bg-linear-to-br from-green-500 to-green-600 p-6 shadow-lg">
          <Text className="mb-4 text-2xl font-bold text-white">
            {t('game.your_referral_code')}
          </Text>

          {referralCode
            ? (
                <View>
                  <View className="mb-4 rounded-lg bg-white/20 p-4">
                    <Text className="mb-1 text-xs text-green-100">
                      {t('game.share_link_label')}
                      :
                    </Text>
                    <Text className="mb-3 font-mono text-sm break-all text-white">
                      experience-club.online/register?ref=
                      {referralCode}
                    </Text>
                    <Text className="text-xs text-green-100">
                      {t('game.code')}
                      :
                      {' '}
                      <Text className="text-lg font-bold text-white">
                        {referralCode}
                      </Text>
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Button
                      label={copied ? t('common.copied') : t('game.copy_link')}
                      onPress={handleCopyCode}
                      variant="outline"
                      className="flex-1"
                    />
                    <Button
                      label={t('common.share')}
                      onPress={handleShare}
                      variant="outline"
                      className="flex-1"
                    />
                  </View>

                  <View className="mt-4 rounded-lg bg-white/10 p-3">
                    <Text className="mb-2 font-semibold text-white">
                      {t('game.how_it_works')}
                      :
                    </Text>
                    <View className="gap-2">
                      <Text className="text-sm text-green-100">
                        1.
                        {' '}
                        {t('game.how_it_works_step_1')}
                      </Text>
                      <Text className="text-sm text-green-100">
                        2.
                        {' '}
                        {t('game.how_it_works_step_2')}
                      </Text>
                      <Text className="text-sm text-green-100">
                        3.
                        {' '}
                        {t('game.how_it_works_step_3')}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            : (
                <View>
                  <Text className="mb-4 text-white">
                    {t('game.no_referral_code')}
                  </Text>
                  <Button
                    label={
                      generating
                        ? t('common.generating')
                        : t('game.generate_referral_code')
                    }
                    onPress={handleGenerateCode}
                    disabled={generating}
                    variant="outline"
                  />
                </View>
              )}
        </View>

        {/* Referrals List */}
        {safeReferrals.length > 0 && (
          <View className="mb-6 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
            <Text className="mb-3 text-lg font-bold text-white">
              {t('game.your_referrals_list')}
            </Text>
            <View className="gap-3">
              {safeReferrals.map(referral => (
                <View
                  key={referral.id}
                  className="flex-row items-center justify-between rounded-lg bg-neutral-700 p-3"
                >
                  <View>
                    <Text className="font-medium text-white">
                      {t('game.referral_label')}
                      {' '}
                      #
                      {referral.id.slice(0, 8)}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {new Date(referral.createdAt).toLocaleDateString(
                        i18n.language === 'pt'
                          ? 'pt-BR'
                          : i18n.language === 'es'
                            ? 'es-ES'
                            : 'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </Text>
                  </View>
                  <View className="items-end gap-1">
                    <View
                      className={`rounded-full px-3 py-1 ${
                        referral.status === 'COMPLETED'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-yellow-100 dark:bg-yellow-900'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          referral.status === 'COMPLETED'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}
                      >
                        {t(`game.status_${referral.status.toLowerCase()}`)}
                      </Text>
                    </View>
                    {referral.bonusAwarded && (
                      <Text className="text-xs font-bold text-green-600">
                        +20
                        {' '}
                        {t('game.coins')}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
