import type { Referral } from '@/lib/api/game';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock, Copy, Gift, Share2, Users } from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import gameApi from '@/lib/api/game';
import { useThemeConfig } from '@/lib/use-theme-config';

export default function GameReferralsScreen() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useThemeConfig();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Generate referral code if not exists
      try {
        const codeResponse = await gameApi.generateReferralCode();
        setReferralCode(codeResponse.code);
      }
      catch (error) {
        // Code might already exist
      }

      // Get referrals
      const response = await gameApi.getReferrals();
      const referralsList = Array.isArray(response) ? response : (response as any).referrals || [];
      setReferrals(referralsList);
    }
    catch (error) {
      console.error('Failed to load referrals:', error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (referralCode) {
      await Clipboard.setStringAsync(referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (referralCode) {
      const message = `Join Futurus Prediction Markets and earn rewards! Use my referral code: ${referralCode}`;
      try {
        await Share.share({
          message,
        });
      }
      catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={20} color={theme.colors.success} />;
      case 'PENDING':
        return <Clock size={20} color={theme.colors.warning} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading referrals...
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Referrals</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Referral Code Card */}
        <View style={[styles.codeCard, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.codeHeader}>
            <Gift size={32} color={theme.colors.primary} />
            <Text style={[styles.codeTitle, { color: theme.colors.text }]}>
              Your Referral Code
            </Text>
          </View>

          {referralCode
            ? (
                <>
                  <View style={[styles.codeBox, { backgroundColor: `${theme.colors.primary}10` }]}>
                    <Text style={[styles.code, { color: theme.colors.primary }]}>
                      {referralCode}
                    </Text>
                    <TouchableOpacity
                      style={[styles.copyButton, { backgroundColor: theme.colors.primary }]}
                      onPress={handleCopyCode}
                    >
                      <Copy size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleShare}
                  >
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>Share with Friends</Text>
                  </TouchableOpacity>

                  <Text style={[styles.referralHint, { color: theme.colors.textSecondary }]}>
                    Earn 500 bonus coins for each friend who registers using your code!
                  </Text>
                </>
              )
            : (
                <TouchableOpacity
                  style={[styles.generateButton, { backgroundColor: theme.colors.primary }]}
                  onPress={loadData}
                >
                  <Text style={styles.generateButtonText}>Generate Referral Code</Text>
                </TouchableOpacity>
              )}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}>
            <Users size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {referrals.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Referrals
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}>
            <CheckCircle2 size={24} color={theme.colors.success} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {referrals.filter(r => r.status === 'COMPLETED').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Completed
            </Text>
          </View>
        </View>

        {/* Referrals List */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Referrals
        </Text>

        {referrals.length === 0
          ? (
              <View style={styles.emptyState}>
                <Users size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  No referrals yet
                </Text>
                <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                  Share your code to start earning!
                </Text>
              </View>
            )
          : (
              referrals.map(referral => (
                <View
                  key={referral.id}
                  style={[styles.referralCard, { backgroundColor: theme.colors.cardBackground }]}
                >
                  <View style={styles.referralHeader}>
                    <View style={styles.referralIcon}>
                      {getStatusIcon(referral.status)}
                    </View>
                    <View style={styles.referralContent}>
                      <Text style={[styles.referralName, { color: theme.colors.text }]}>
                        {referral.referred?.name || referral.referred?.email || 'Unknown'}
                      </Text>
                      <Text style={[styles.referralDate, { color: theme.colors.textSecondary }]}>
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                        referral.status === 'COMPLETED'
                          ? `${theme.colors.success}20`
                          : `${theme.colors.warning}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                          referral.status === 'COMPLETED'
                            ? theme.colors.success
                            : theme.colors.warning,
                          },
                        ]}
                      >
                        {referral.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {referral.status === 'COMPLETED' && referral.bonusAwarded && (
                    <View
                      style={[
                        styles.bonusBadge,
                        { backgroundColor: `${theme.colors.success}10`, borderColor: theme.colors.success },
                      ]}
                    >
                      <Gift size={16} color={theme.colors.success} />
                      <Text style={[styles.bonusText, { color: theme.colors.success }]}>
                        +500 Coins Awarded
                      </Text>
                    </View>
                  )}
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
  codeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  codeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  referralHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 8,
  },
  referralCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  referralContent: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  bonusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
