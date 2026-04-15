/* eslint-disable max-lines-per-function */
import { router } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Gamepad2,
  KeyRound,
  LogOut,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  User,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLogout } from '@/api/auth';
import { useBalance } from '@/api/wallet';
import { Text } from '@/components/ui';
import { useAuth } from '@/lib';
import { CDP } from '@/lib/theme';

// ─── Dashboard Item Component ───────────────────────────────────────────────
const DashboardItem = React.memo(
  ({
    icon: Icon,
    label,
    onPress,
    badge,
    variant = 'default',
  }: {
    icon: any;
    label: string;
    onPress: () => void;
    badge?: string;
    variant?: 'default' | 'danger';
  }) => (
    <TouchableOpacity
      style={[styles.item, variant === 'danger' && styles.itemDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconWrapper,
          variant === 'danger' && styles.iconWrapperDanger,
        ]}
      >
        <Icon
          color={variant === 'danger' ? CDP.danger : CDP.primary}
          size={20}
          strokeWidth={1.8}
        />
      </View>
      <Text
        style={[
          styles.itemLabel,
          variant === 'danger' && styles.itemLabelDanger,
        ]}
      >
        {label}
      </Text>
      <View style={styles.itemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <ChevronRight
          color={variant === 'danger' ? CDP.danger : CDP.textMuted}
          size={18}
        />
      </View>
    </TouchableOpacity>
  ),
);

export default function DashboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuth.use.user();
  const signOut = useAuth.use.signOut();
  const { data: balance, isLoading: isLoadingBalance } = useBalance();
  const { mutate: logout } = useLogout();

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
                router.replace('/login');
              },
            });
          },
        },
      ],
    );
  };

  const navTo = (path: any) => router.push(path);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileGlow} />
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              {user?.avatarUrl
                ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  )
                : (
                    <View style={styles.avatarPlaceholder}>
                      <User color={CDP.primary} size={32} />
                    </View>
                  )}
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <View style={styles.verifiedRow}>
                <ShieldCheck color={CDP.success} size={14} />
                <Text style={styles.verifiedText}>
                  {t('profile.verified_account')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navTo('/notifications')}
            >
              <Bell color={CDP.textPrimary} size={20} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Balance Grid */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>
              {t('profile.total_balance')}
            </Text>
            <Text style={styles.balanceValue}>
              {`R$ ${isLoadingBalance ? '...' : Number(balance?.balanceTotal || 0).toFixed(2)}`}
            </Text>

            <View style={styles.balanceGrid}>
              <View style={styles.balanceMini}>
                <Text style={styles.miniLabel}>{t('profile.available')}</Text>
                <Text style={styles.miniValue}>
                  {`R$ ${isLoadingBalance ? '...' : Number(balance?.balance || 0).toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.miniDivider} />
              <View style={styles.balanceMini}>
                <Text style={styles.miniLabel}>
                  🎁
                  {'\n'}
                  {t('profile.bonus')}
                </Text>
                <Text style={[styles.miniValue, { color: CDP.success }]}>
                  {`R$ ${isLoadingBalance ? '...' : Number(balance?.balanceBonus || 0).toFixed(2)}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: CDP.primary }]}
              onPress={() => navTo('/(app)/(tabs)/wallet')}
            >
              <PlusCircle color={CDP.bg} size={18} strokeWidth={2.5} />
              <Text style={styles.actionBtnText}>{t('wallet.deposit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => navTo('/(app)/(tabs)/wallet')}
            >
              <LogOut
                color={CDP.primary}
                size={18}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
              <Text style={styles.actionBtnTextSecondary}>
                {t('wallet.withdraw')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.quick_actions')}
          </Text>
          <View style={styles.menuCard}>
            <DashboardItem
              icon={TrendingUp}
              label="Minhas Operações"
              onPress={() => navTo('/(app)/(tabs)/portfolio')}
              badge="7"
            />
            <View style={styles.itemDivider} />
            <DashboardItem
              icon={Gamepad2}
              label="Game Center"
              onPress={() => navTo('/(app)/(tabs)/game')}
              badge="NEW"
            />
            <View style={styles.itemDivider} />
            <DashboardItem
              icon={PlusCircle}
              label="Indicações & Ganhos"
              onPress={() => navTo('/(app)/(tabs)/game')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.account_settings')}
          </Text>
          <View style={styles.menuCard}>
            <DashboardItem
              icon={User}
              label={t('profile.personal_info')}
              onPress={() => navTo('/(app)/(tabs)/profile')}
            />
            <View style={styles.itemDivider} />
            <DashboardItem
              icon={KeyRound}
              label="Segurança 2FA"
              onPress={() => navTo('/2fa')}
              badge="SAFE"
            />
            <View style={styles.itemDivider} />
            <DashboardItem
              icon={ShieldCheck}
              label="Verificação KYC"
              onPress={() => navTo('/kyc')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finanças & Rede</Text>
          <View style={styles.menuCard}>
            <DashboardItem
              icon={CreditCard}
              label="Minhas Transações"
              onPress={() => navTo('/(app)/(tabs)/wallet')}
            />
            <View style={styles.itemDivider} />
            <DashboardItem
              icon={ShieldCheck}
              label="Grupos / Comunidade"
              onPress={() => navTo('/(app)/(tabs)/game')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.support')}</Text>
          <View style={styles.menuCard}>
            <DashboardItem
              icon={MessageSquare}
              label="Tickets de Suporte"
              onPress={() => navTo('/contact')}
            />
            <View style={styles.itemDivider} />
            <DashboardItem
              icon={LogOut}
              label={t('profile.sign_out')}
              onPress={handleSignOut}
              variant="danger"
            />
          </View>
        </View>

        <View style={styles.footerBranding}>
          <Text style={styles.versionText}>PY Foundation 2026 v1.1.3</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Profile Card
  profileCard: {
    backgroundColor: CDP.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: CDP.border,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: CDP.primary,
    opacity: 0.05,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: CDP.primary,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CDP.glowMedium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CDP.border,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: CDP.success,
    borderWidth: 2,
    borderColor: CDP.surface,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: CDP.textPrimary,
    letterSpacing: 0.3,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: CDP.success,
    letterSpacing: 0.2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CDP.danger,
    borderWidth: 1.5,
    borderColor: CDP.surface,
  },
  // Balance
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 18,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CDP.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
    fontWeight: '900',
    color: CDP.textPrimary,
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  balanceMini: {
    flex: 1,
    alignItems: 'center',
  },
  miniDivider: {
    width: 1,
    height: 24,
    backgroundColor: CDP.borderSubtle,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: CDP.textSecondary,
    marginBottom: 2,
  },
  miniValue: {
    fontSize: 14,
    fontWeight: '800',
    color: CDP.textPrimary,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: CDP.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: CDP.bg,
    letterSpacing: 0.5,
  },
  actionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '800',
    color: CDP.primary,
    letterSpacing: 0.5,
  },
  // Menu Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: CDP.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: CDP.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CDP.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemDanger: {
    backgroundColor: 'rgba(255, 75, 106, 0.03)',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: CDP.glow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CDP.border,
  },
  iconWrapperDanger: {
    backgroundColor: 'rgba(255, 75, 106, 0.1)',
    borderColor: 'rgba(255, 75, 106, 0.2)',
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: CDP.textPrimary,
    marginLeft: 14,
  },
  itemLabelDanger: {
    color: CDP.danger,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: CDP.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: CDP.bg,
  },
  itemDivider: {
    height: 1,
    backgroundColor: CDP.borderSubtle,
    marginLeft: 66,
  },
  footerBranding: {
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.4,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: CDP.textMuted,
    letterSpacing: 1,
  },
});
