/* eslint-disable max-lines-per-function */
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Redirect, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import {
  Bell,
  Coins,
  CreditCard,
  FileText,
  Gamepad2,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLogout } from '@/api/auth';
import { useAuth } from '@/lib';
import { CDP, THEME } from '@/lib/theme';

// ─── Section Divider ────────────────────────────────────────────────────────
const SectionDivider = React.memo(({ label }: { label: string }) => (
  <View style={drawerStyles.sectionDivider}>
    <View style={drawerStyles.sectionLine} />
    <Text style={drawerStyles.sectionLabel}>{label}</Text>
    <View style={drawerStyles.sectionLine} />
  </View>
));

// ─── Drawer Content ─────────────────────────────────────────────────────────
function CustomDrawerContent(props: any) {
  const { t } = useTranslation();
  const router = useRouter();
  const signOut = useAuth.use.signOut();
  const status = useAuth.use.status();
  const insets = useSafeAreaInsets();
  const { mutate: logout } = useLogout();
  const isLoggedIn = status === 'signIn';

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

  const navigate = (screen: string, tabScreen?: string) => {
    if (tabScreen) {
      props.navigation.navigate(screen, { screen: tabScreen });
    }
    else {
      props.navigation.navigate(screen);
    }
  };

  return (
    <View style={drawerStyles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={drawerStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand Header ── */}
        <View style={[drawerStyles.header, { paddingTop: insets.top + 16 }]}>
          {/* Glow line accent */}
          <View style={drawerStyles.headerGlow} />

          <View style={drawerStyles.logoRow}>
            <View style={drawerStyles.logoContainer}>
              <Image
                source={require('../../assets/futurus-icon.png')}
                style={drawerStyles.logoImage}
                resizeMode="contain"
              />
              <View style={drawerStyles.logoPulse} />
            </View>
            <View>
              <Text style={drawerStyles.brandName}>FUTURUS</Text>
              <View style={drawerStyles.brandBadge}>
                <View style={drawerStyles.liveDot} />
                <Text style={drawerStyles.brandBadgeText}>MERCADO AO VIVO</Text>
              </View>
            </View>
          </View>

          {/* StatsRow removed per user request to stop stranger letters */}
        </View>

        {/* ── Main Navigation ── */}
        <View style={drawerStyles.section}>
          <DrawerItem
            label={t('drawer.home')}
            icon={({ size }) => (
              <Home color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('(tabs)', 'index')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />

          {isLoggedIn && (
            <>
              <DrawerItem
                label={t('drawer.profile')}
                icon={({ size }) => (
                  <User color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
                )}
                onPress={() => navigate('(tabs)', 'profile')}
                labelStyle={drawerStyles.drawerLabel}
                style={drawerStyles.drawerItem}
                inactiveTintColor={CDP.textSecondary}
                activeTintColor={CDP.primary}
              />
              <DrawerItem
                label={t('drawer.notifications')}
                icon={({ size }) => (
                  <Bell color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
                )}
                onPress={() => navigate('notifications')}
                labelStyle={drawerStyles.drawerLabel}
                style={drawerStyles.drawerItem}
                inactiveTintColor={CDP.textSecondary}
                activeTintColor={CDP.primary}
              />
            </>
          )}

          {!isLoggedIn && (
            <>
              <TouchableOpacity
                style={drawerStyles.loginBtn}
                onPress={() => navigate('login')}
                activeOpacity={0.8}
              >
                <Zap color={CDP.bg} size={16} strokeWidth={2.5} />
                <Text style={drawerStyles.loginBtnText}>{t('auth.login')}</Text>
              </TouchableOpacity>
              <DrawerItem
                label={t('drawer.register')}
                icon={({ size }) => (
                  <User color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
                )}
                onPress={() => navigate('register')}
                labelStyle={drawerStyles.drawerLabel}
                style={drawerStyles.drawerItem}
                inactiveTintColor={CDP.textSecondary}
                activeTintColor={CDP.primary}
              />
            </>
          )}
        </View>

        <SectionDivider label="APP" />

        {/* ── App Section ── */}
        <View style={drawerStyles.section}>
          <DrawerItem
            label={t('drawer.settings')}
            icon={({ size }) => (
              <SettingsIcon color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('settings')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />

          <DrawerItem
            label={t('drawer.fees')}
            icon={({ size }) => (
              <CreditCard color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('fees')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />

          {/* Blockchain — special highlight for crypto */}
          <TouchableOpacity
            style={drawerStyles.blockchainBtn}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/blockchain');
            }}
            activeOpacity={0.8}
          >
            <Coins color={CDP.primary} size={18} strokeWidth={2} />
            <Text style={drawerStyles.blockchainBtnText}>{process.env.EXPO_PUBLIC_COIN_NAME || t('drawer.blockchain')}</Text>
            <View style={drawerStyles.solanaBadge}>
              <Text style={drawerStyles.solanaBadgeText}>SOLANA</Text>
            </View>
          </TouchableOpacity>

          {/* Game — special highlight */}
          <TouchableOpacity
            style={drawerStyles.gameBtn}
            onPress={() => navigate('(tabs)', 'game')}
            activeOpacity={0.8}
          >
            <Gamepad2 color={CDP.game} size={18} strokeWidth={2} />
            <Text style={drawerStyles.gameBtnText}>{t('drawer.game')}</Text>
            <View style={drawerStyles.newBadge}>
              <Text style={drawerStyles.newBadgeText}>NEW</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SectionDivider label="SUPORTE" />

        {/* ── Support Section ── */}
        <View style={drawerStyles.section}>
          <DrawerItem
            label={t('drawer.faq')}
            icon={({ size }) => (
              <HelpCircle color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('faq')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />

          <DrawerItem
            label={t('drawer.responsible_gaming')}
            icon={({ size }) => (
              <ShieldCheck color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('responsible-gaming')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />

          <DrawerItem
            label={t('drawer.terms_policy')}
            icon={({ size }) => (
              <FileText color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('terms')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />

          <DrawerItem
            label={t('drawer.contact')}
            icon={({ size }) => (
              <MessageSquare color={CDP.textSecondary} size={size - 2} strokeWidth={1.8} />
            )}
            onPress={() => navigate('contact')}
            labelStyle={drawerStyles.drawerLabel}
            style={drawerStyles.drawerItem}
            inactiveTintColor={CDP.textSecondary}
            activeTintColor={CDP.primary}
          />
        </View>
      </DrawerContentScrollView>

      {/* ── Footer / Logout ── */}
      {isLoggedIn && (
        <View style={[drawerStyles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={drawerStyles.footerDivider} />
          <TouchableOpacity
            style={drawerStyles.logoutBtn}
            onPress={handleSignOut}
            activeOpacity={0.75}
          >
            <LogOut color={CDP.danger} size={18} strokeWidth={2} />
            <Text style={drawerStyles.logoutText}>{t('drawer.logout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Drawer Layout ───────────────────────────────────────────────────────────
export default function DrawerLayout() {
  const status = useAuth.use.status();
  const { t } = useTranslation();

  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }

  const screenHeader = (title: string) => ({
    title,
    headerShown: true,
    headerStyle: {
      backgroundColor: CDP.bg,
      borderBottomWidth: 1,
      borderBottomColor: CDP.borderSubtle,
    } as any,
    headerTintColor: CDP.textPrimary,
    headerTitleStyle: {
      fontWeight: '700' as const,
      letterSpacing: 0.5,
      color: CDP.textPrimary,
    },
  });

  return (
    <Drawer
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: CDP.bg,
          width: '80%',
          borderRightWidth: 1,
          borderRightColor: CDP.border,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0, 0, 0, 0.85)',
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Main' }} />
      <Drawer.Screen name="dashboard" options={screenHeader(t('drawer.dashboard'))} />
      <Drawer.Screen name="settings" options={screenHeader(t('drawer.settings'))} />
      <Drawer.Screen name="terms" options={screenHeader(t('drawer.terms_policy'))} />
      <Drawer.Screen name="fees" options={screenHeader(t('drawer.fees'))} />
      <Drawer.Screen name="contact" options={screenHeader(t('drawer.contact'))} />
      <Drawer.Screen name="faq" options={screenHeader(t('drawer.faq'))} />
      <Drawer.Screen name="responsible-gaming" options={screenHeader(t('drawer.responsible_gaming'))} />
      <Drawer.Screen name="notifications" options={screenHeader(t('notifications.title'))} />
      <Drawer.Screen name="blockchain" options={screenHeader('Blockchain')} />
    </Drawer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.bg,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 24,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: CDP.border,
    marginBottom: 8,
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: CDP.primary,
    opacity: 0.6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: CDP.glowMedium,
    borderWidth: 1,
    borderColor: CDP.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoPulse: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CDP.success,
    borderWidth: 2,
    borderColor: CDP.bg,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: CDP.textPrimary,
    letterSpacing: 3,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CDP.success,
  },
  brandBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: CDP.success,
    letterSpacing: 1.5,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CDP.glow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CDP.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statBadge: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: CDP.textMuted,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: CDP.border,
  },

  // Section
  section: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: CDP.borderSubtle,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: CDP.textMuted,
    letterSpacing: 2,
  },

  // Drawer items
  drawerItem: {
    borderRadius: 12,
    marginVertical: 1,
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: CDP.textSecondary,
    marginLeft: -6,
  },

  // Login CTA
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: CDP.primary,
  },
  loginBtnText: {
    color: CDP.bg,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Blockchain CTA
  blockchainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: CDP.glow,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  blockchainBtnText: {
    flex: 1,
    color: CDP.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  solanaBadge: {
    backgroundColor: 'rgba(153, 69, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  solanaBadgeText: {
    color: '#9945FF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Game CTA
  gameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: CDP.gameDim,
    borderWidth: 1,
    borderColor: `rgba(168, 85, 247, 0.2)`,
  },
  gameBtnText: {
    flex: 1,
    color: CDP.game,
    fontSize: 14,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: CDP.game,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
  },
  footerDivider: {
    height: 1,
    backgroundColor: CDP.borderSubtle,
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: CDP.dangerDim,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 106, 0.15)',
  },
  logoutText: {
    color: CDP.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
