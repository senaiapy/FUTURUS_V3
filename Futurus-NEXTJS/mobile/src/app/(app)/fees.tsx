import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Trophy,
} from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { settingsApi } from '@/api';
import { HeaderLinks } from '@/components/header-links';
import { ActivityIndicator, Text, View } from '@/components/ui';
import { CDP } from '@/lib/theme';

export default function FeesScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
  const [configData, setConfigData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getSettings();
      setConfigData(data);
    }
    catch (error) {
      console.error('Error loading settings:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CDP.primary} />
      </View>
    );
  }

  const platformFee = configData
    ? (configData.platformFeePercent * 100).toFixed(0)
    : '2';
  const withdrawalFee = configData
    ? (configData.withdrawalFeePercent * 100).toFixed(0)
    : '1';
  const minDeposit = configData ? configData.minDeposit : 10;
  const minWithdrawal = configData ? configData.minWithdrawal : 50;
  const currencySymbol = configData
    ? configData.currencySymbol
    : t('fees.currency_symbol');

  return (
    <View style={styles.container}>
      <HeaderLinks />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSettings}
            tintColor={CDP.primary}
          />
        )}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('fees.title')}</Text>
          <Text style={styles.subtitle}>{t('fees.subtitle')}</Text>
        </View>

        <View style={styles.grid}>
          {/* Deposits */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <ArrowDownCircle size={24} color={CDP.success} />
            </View>
            <Text style={styles.cardLabel}>{t('fees.deposits')}</Text>
            <Text style={styles.cardValue}>{t('fees.free')}</Text>
            <Text style={styles.cardInfo}>
              {t('fees.via_pix_crypto')}
              {' '}
              {t('fees.min_deposit', {
                amount: `${currencySymbol}${minDeposit}`,
              })}
            </Text>
          </View>

          {/* Withdrawals */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <ArrowUpCircle size={24} color={CDP.danger} />
            </View>
            <Text style={styles.cardLabel}>{t('fees.withdrawals')}</Text>
            <Text style={styles.cardValue}>
              {withdrawalFee}
              %
            </Text>
            <Text style={styles.cardInfo}>
              {t('fees.withdrawal_fee_desc')}
              {' '}
              {t('fees.min_withdrawal', {
                amount: `${currencySymbol}${minWithdrawal}`,
              })}
            </Text>
          </View>

          {/* Trading Fees */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <BarChart3 size={24} color={CDP.primary} />
            </View>
            <Text style={styles.cardLabel}>{t('fees.trading')}</Text>
            <Text style={styles.cardValue}>0%</Text>
            <Text style={styles.cardInfo}>{t('fees.trading_fee_desc')}</Text>
          </View>

          {/* Platform Fee */}
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Trophy size={24} color={CDP.warning} />
            </View>
            <Text style={styles.cardLabel}>{t('fees.platform')}</Text>
            <Text style={styles.cardValue}>
              {platformFee}
              %
            </Text>
            <Text style={styles.cardInfo}>{t('fees.platform_fee_desc')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('fees.example_title')}</Text>
          <View style={styles.exampleCard}>
            <View style={styles.step}>
              <Text style={styles.stepText}>
                {t('fees.example_step_1', {
                  price: `${currencySymbol}${(0.4).toLocaleString(locale)}`,
                  total: `${currencySymbol}${(40.0).toLocaleString(locale, {
                    minimumFractionDigits: 2,
                  })}`,
                })}
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepText}>
                {t('fees.example_step_2', {
                  price: `${currencySymbol}${(1.0).toLocaleString(locale)}`,
                  total: `${currencySymbol}${(100.0).toLocaleString(locale, {
                    minimumFractionDigits: 2,
                  })}`,
                })}
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={[styles.stepText, styles.resultText]}>
                {t('fees.example_step_3', {
                  fee: platformFee,
                  net: (
                    100
                    * (1 - (configData?.platformFeePercent || 0.02))
                  ).toLocaleString(locale, {
                    style: 'currency',
                    currency: currencySymbol === 'R$' ? 'BRL' : 'USD',
                  }),
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('fees.footer_warning')}</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CDP.background,
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CDP.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: CDP.textSecondary,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: CDP.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: CDP.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CDP.textSecondary,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginVertical: 4,
  },
  cardInfo: {
    fontSize: 11,
    color: CDP.textMuted,
    lineHeight: 16,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: CDP.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: `${CDP.primary}40`, // slightly more visible
  },
  step: {
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: CDP.textSecondary,
    lineHeight: 20,
  },
  highlight: {
    color: CDP.textPrimary,
    fontWeight: 'bold',
  },
  resultText: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CDP.card,
  },
  successHighlight: {
    color: CDP.success,
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: CDP.textPrimary,
    textAlign: 'center',
  },
});
