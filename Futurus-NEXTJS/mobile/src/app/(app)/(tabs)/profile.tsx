import { Redirect, router } from 'expo-router';
import {
  Bell,
  CheckCircle,
  ChevronRight,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
  Wallet,
} from 'lucide-react-native';
import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLogout, useProfile } from '@/api/auth';
import { useBalance } from '@/api/wallet';
import { Image, Text, View } from '@/components/ui';
import { useAuth } from '@/lib';
import { CDP } from '@/lib/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuth.use.user();
  const status = useAuth.use.status();
  const setUser = useAuth.use.setUser();
  const signOut = useAuth.use.signOut();
  const { data: balance, isLoading: isLoadingBalance } = useBalance();
  const { mutate: logout } = useLogout();

  // Fetch profile data to ensure user info is up to date
  const { data: profileData, isError: isProfileError } = useProfile({
    enabled: status === 'signIn',
  });

  // Update auth user when profile data is fetched
  React.useEffect(() => {
    if (profileData) {
      setUser({
        id: String(profileData.id),
        email: profileData.email,
        name:
          `${profileData.firstname || ''} ${profileData.lastname || ''}`.trim()
          || profileData.username,
        role: 'user',
        balance: Number(profileData.balance) || 0,
        avatarUrl: profileData.image,
        phone: profileData.mobile,
      });
    }
  }, [profileData, setUser]);

  // Redirect to login if not authenticated or profile fetch failed with auth error
  if (status === 'signOut' || status === 'idle') {
    return <Redirect href="/login" />;
  }

  // If profile fetch failed (likely 401), redirect to login
  if (isProfileError) {
    return <Redirect href="/login" />;
  }

  const handleSignOut = () => {
    Alert.alert(
      t('auth.logout_confirm_title'),
      t('auth.logout_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout_yes'),
          style: 'destructive',
          onPress: () => {
            logout(undefined, {
              onSettled: () => {
                signOut();
              },
            });
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatarUrl
            ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              )
            : (
                <View style={styles.placeholderAvatar}>
                  <UserIcon color={CDP.primary} size={48} />
                </View>
              )}
          <TouchableOpacity style={styles.editBadge}>
            <Settings color={CDP.textPrimary} size={14} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>
          {user?.email || 'user@example.com'}
        </Text>

        <View style={styles.verifiedBadge}>
          <CheckCircle color={CDP.success} size={14} />
          <Text style={styles.verifiedText}>
            {t('profile.verified_account')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.depositBtn}
          onPress={() => router.push('/(app)/(tabs)/wallet')}
        >
          <Text style={styles.depositBtnText}>
            💰
            {' '}
            {t('profile.deposit_now')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {isLoadingBalance
              ? '...'
              : `R$ ${Number(balance?.balanceTotal || 0).toFixed(2)}`}
          </Text>
          <Text style={styles.statLabel}>{t('profile.total_balance')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {isLoadingBalance
              ? '...'
              : `R$ ${Number(balance?.balance || 0).toFixed(2)}`}
          </Text>
          <Text style={styles.statLabel}>{t('profile.available')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: CDP.success }]}>
            {isLoadingBalance
              ? '...'
              : `R$ ${Number(balance?.balanceBonus || 0).toFixed(2)}`}
          </Text>
          <Text style={styles.statLabel}>
            🎁
            {t('profile.bonus')}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.account_settings')}</Text>

        <MenuItem
          icon={<UserIcon color={CDP.primary} size={20} />}
          label={t('profile.personal_info')}
          onPress={() => {}}
        />
        <MenuItem
          icon={<Wallet color={CDP.success} size={20} />}
          label={t('profile.payment_methods')}
          onPress={() => {}}
        />
        <MenuItem
          icon={<Shield color={CDP.warning} size={20} />}
          label={t('profile.security_2fa')}
          onPress={() => {}}
        />
        <MenuItem
          icon={<Bell color={CDP.purple} size={20} />}
          label={t('profile.notifications')}
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.support')}</Text>
        <MenuItem
          icon={<HelpCircle color={CDP.textSecondary} size={20} />}
          label={t('profile.help_center')}
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <LogOut color={CDP.danger} size={20} />
        <Text style={styles.logoutText}>{t('profile.sign_out')}</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>
        {`FUTURUS v${process.env.EXPO_PUBLIC_APP_VERSION || '1.1.3'}`}
      </Text>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <ChevronRight color={CDP.textDisabled} size={20} />
    </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: CDP.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -24,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: CDP.primary,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CDP.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: CDP.border,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: CDP.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CDP.surface,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CDP.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: CDP.textSecondary,
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: `${CDP.success}30`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    color: CDP.success,
    fontWeight: 'bold',
  },
  depositBtn: {
    marginTop: 20,
    backgroundColor: CDP.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CDP.primary,
    shadowColor: CDP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  depositBtnText: {
    color: CDP.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: CDP.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: CDP.border,
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CDP.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: CDP.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: CDP.card,
    alignSelf: 'center',
  },
  section: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CDP.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CDP.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CDP.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: CDP.textPrimary,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: `${CDP.danger}30`,
    borderWidth: 1,
    borderColor: `${CDP.danger}40`,
  },
  logoutText: {
    color: CDP.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    fontSize: 12,
    color: CDP.textMuted,
  },
});
