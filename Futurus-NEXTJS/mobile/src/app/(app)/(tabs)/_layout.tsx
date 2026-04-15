import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { Tabs, useNavigation, useRouter } from 'expo-router';
import {
  BarChart3,
  Briefcase,
  Home,
  Menu,
  User as UserIcon,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useAuth } from '@/lib';
import { CDP, THEME } from '@/lib/theme';

// ─── Animated Tab Icon ───────────────────────────────────────────────────────
const AnimatedTabIcon = React.memo(
  ({
    icon: Icon,
    focused,
    size = 22,
  }: {
    icon: React.ComponentType<any>;
    focused: boolean;
    size?: number;
  }) => {
    const scaleAnim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;
    const glowAnim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: focused ? 1 : 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(glowAnim, {
          toValue: focused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused, scaleAnim, glowAnim]);

    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={tabIconStyles.iconContainer}>
        {/* Glow ring */}
        <Animated.View
          style={[
            tabIconStyles.glowRing,
            { opacity: glowOpacity },
          ]}
        />
        <Icon
          color={focused ? CDP.primary : CDP.textMuted}
          size={size}
          strokeWidth={focused ? 2.5 : 1.8}
        />
      </View>
    );
  },
);

const tabIconStyles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CDP.glow,
    borderWidth: 1,
    borderColor: CDP.border,
  },
});

// ─── Floating Tab Bar ────────────────────────────────────────────────────────
function FloatingTabBar({ state, descriptors, navigation: tabNavigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        floatingStyles.wrapper,
        { bottom: insets.bottom + 12 },
      ]}
      pointerEvents="box-none"
    >
      <View style={floatingStyles.pill}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Don't render hidden tabs
          if (options.href === null)
            return null;

          const onPress = () => {
            const event = tabNavigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              tabNavigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                floatingStyles.tabItem,
                isFocused && floatingStyles.tabItemActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? CDP.primary : CDP.textMuted,
                size: 22,
              })}
              {isFocused && (
                <Text style={floatingStyles.activeLabel} numberOfLines={1}>
                  {typeof options.title === 'string' ? options.title : route.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const floatingStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 12, 26, 0.92)',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: CDP.border,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 0,
    // iOS shadow
    shadowColor: CDP.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    // Android elevation
    elevation: 20,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 28,
    minHeight: 48,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: CDP.glow,
    borderWidth: 1,
    borderColor: CDP.border,
    paddingHorizontal: 12,
  },
  activeLabel: {
    color: CDP.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

function HeaderLeft() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={styles.headerLeftBtn}
      android_ripple={{ color: 'rgba(255,181,36,0.1)', borderless: false }}
    >
      <Menu color={CDP.textPrimary} size={22} strokeWidth={1.8} />
    </Pressable>
  );
};

function HeaderRight() {
  const { t } = useTranslation();
  const router = useRouter();
  const status = useAuth.use.status();
  const isLoggedIn = status === 'signIn';

  return (
    <View style={styles.headerRight}>
      {isLoggedIn
        ? (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/dashboard')}
                style={styles.headerActionHighlight}
              >
                <Text style={styles.headerActionHighlightText}>
                  {t('drawer.dashboard')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/contact' as any)}
                style={styles.headerActionSecondary}
              >
                <Text style={styles.headerActionSecondaryText}>
                  {t('drawer.contact')}
                </Text>
              </TouchableOpacity>
            </>
          )
        : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/login')}
              style={styles.headerActionPrimary}
            >
              <Text style={styles.headerActionPrimaryText}>
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          )}
    </View>
  );
};

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        tabBarHideOnKeyboard: true,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.markets'),
          headerTitle: 'FUTURUS',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={Home} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: t('tabs.portfolio'),
          headerTitle: t('tabs.portfolio'),
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={Briefcase} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: t('tabs.wallet'),
          headerTitle: t('tabs.wallet'),
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={WalletIcon} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="game"
        options={{
          href: null,
          title: t('tabs.game'),
          headerTitle: 'FUTURUS',
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={BarChart3} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          headerTitle: t('tabs.profile'),
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={UserIcon} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: CDP.bg,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: CDP.borderSubtle,
  } as any,
  headerTitleStyle: {
    color: CDP.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerLeftBtn: {
    marginLeft: 16,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  headerActionPrimary: {
    backgroundColor: CDP.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerActionPrimaryText: {
    color: CDP.bg,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  headerActionSecondary: {
    borderWidth: 1,
    borderColor: CDP.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.05)',
  },
  headerActionSecondaryText: {
    color: CDP.primary,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  headerActionHighlight: {
    backgroundColor: CDP.secondary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerActionHighlightText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
