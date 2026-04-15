/* eslint-disable max-lines-per-function */
import { Image } from 'expo-image';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import {
  ArrowUpRight,
  Flame,
  Search,
  X,
  Zap,
} from 'lucide-react-native';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  View as RNView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { useMarkets } from '@/api/markets';
import { MarketCarousel } from '@/components/market-carousel';
import { MarketCard, Skeleton, Text, View } from '@/components/ui';
import { useAuth } from '@/lib';
import { CDP } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Ticker Data ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { id: 'btc', label: 'BTC/BRL', value: '+2.4%', positive: true },
  { id: 'ibov', label: 'IBOV', value: '-0.8%', positive: false },
  { id: 'usd', label: 'USD/BRL', value: '+1.2%', positive: true },
  { id: 'eth', label: 'ETH/BRL', value: '+5.1%', positive: true },
  { id: 'petr', label: 'PETRO', value: '-1.4%', positive: false },
  { id: 'eur', label: 'EURO/BRL', value: '+0.6%', positive: true },
  { id: 'xau', label: 'XAU/USD', value: '+0.3%', positive: true },
  { id: 'selic', label: 'SELIC', value: '10.75%', positive: true },
];

// ─── Live Ticker ─────────────────────────────────────────────────────────────
const LiveTicker = React.memo(() => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const TICKER_WIDTH = SCREEN_WIDTH * 2.5;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -TICKER_WIDTH / 2,
        duration: 20000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [scrollX, TICKER_WIDTH]);

  const duplicated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <RNView style={tickerStyles.wrapper}>
      <Animated.View
        style={[tickerStyles.track, { transform: [{ translateX: scrollX }] }]}
      >
        {duplicated.map((item, index) => (
          <RNView key={`ticker-${item.id}-${index}`} style={tickerStyles.item}>
            <Text style={tickerStyles.label}>{item.label}</Text>
            <Text
              style={[
                tickerStyles.value,
                { color: item.positive ? CDP.success : CDP.danger },
              ]}
            >
              {item.positive ? '▲' : '▼'}
              {' '}
              {item.value}
            </Text>
            <RNView style={tickerStyles.sep} />
          </RNView>
        ))}
      </Animated.View>
      <RNView style={tickerStyles.liveBadge}>
        <RNView style={tickerStyles.liveDot} />
        <Text style={tickerStyles.liveText}>AO VIVO</Text>
      </RNView>
    </RNView>
  );
});

const tickerStyles = StyleSheet.create({
  wrapper: {
    height: 40,
    backgroundColor: CDP.surface,
    borderBottomWidth: 1,
    borderBottomColor: CDP.border,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 64,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: CDP.textSecondary,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
  },
  sep: {
    width: 1,
    height: 14,
    backgroundColor: CDP.border,
    marginLeft: 12,
  },
  liveBadge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: CDP.surface,
    borderRightWidth: 1,
    borderRightColor: CDP.border,
    zIndex: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CDP.success,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: CDP.success,
    letterSpacing: 1.5,
  },
});

// ─── Category Pills ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'economia', label: 'Economia' },
  { id: 'politica', label: 'Política' },
  { id: 'esportes', label: 'Esportes' },
  { id: 'tecnologia', label: 'Tech' },
  { id: 'outros', label: 'Outros' },
];

type CategoryItem = { id: string; label: string };

const CategoryPill = React.memo(
  ({
    item,
    isActive,
    onPress,
  }: {
    item: CategoryItem;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[catStyles.pill, isActive && catStyles.pillActive]}
    >
      <Text style={[catStyles.pillText, isActive && catStyles.pillTextActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  ),
);

const catStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: CDP.glowMedium,
    borderColor: CDP.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: CDP.textMuted,
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: CDP.primary,
  },
});

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = React.memo(
  ({
    label,
    value,
    sub,
    icon: Icon,
    positive = true,
  }: {
    label: string;
    value: string;
    sub: string;
    icon: React.ComponentType<any>;
    positive?: boolean;
  }) => (
    <RNView style={statStyles.card}>
      <RNView style={statStyles.iconWrap}>
        <Icon
          size={16}
          color={positive ? CDP.primary : CDP.danger}
          strokeWidth={2.5}
        />
      </RNView>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.sub, { color: positive ? CDP.success : CDP.danger }]}>
        {sub}
      </Text>
    </RNView>
  ),
);

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: CDP.card,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
    borderRadius: 18,
    padding: 14,
    alignItems: 'flex-start',
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: CDP.glow,
    borderWidth: 1,
    borderColor: CDP.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: CDP.textPrimary,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: CDP.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── How It Works Step ────────────────────────────────────────────────────────
const STEP_EMOJIS = ['🎯', '💰', '🏆'];

const HowItWorksStep = React.memo(
  ({
    index,
    title,
    desc,
  }: {
    index: number;
    title: string;
    desc: string;
  }) => (
    <RNView style={howStyles.step}>
      <RNView style={howStyles.left}>
        <Text style={howStyles.emoji}>{STEP_EMOJIS[index - 1]}</Text>
        {index < 3 && <RNView style={howStyles.line} />}
      </RNView>
      <RNView style={howStyles.right}>
        <RNView style={howStyles.numBadge}>
          <Text style={howStyles.num}>{String(index).padStart(2, '0')}</Text>
        </RNView>
        <Text style={howStyles.title}>{title}</Text>
        <Text style={howStyles.desc}>{desc}</Text>
      </RNView>
    </RNView>
  ),
);

const howStyles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 24,
  },
  left: {
    alignItems: 'center',
    width: 48,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: CDP.border,
  },
  right: {
    flex: 1,
    paddingBottom: 4,
  },
  numBadge: {
    width: 28,
    height: 24,
    borderRadius: 12,
    backgroundColor: CDP.glowMedium,
    borderWidth: 1,
    borderColor: CDP.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  num: {
    fontSize: 10,
    fontWeight: '800',
    color: CDP.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: CDP.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 13,
    color: CDP.textSecondary,
    lineHeight: 19,
  },
});

// ─── Market Item (top-level to avoid nested component lint) ──────────────────
const MarketItem = React.memo(({ item }: { item: any }) => (
  <RNView style={s.marketItem}>
    <MarketCard
      market={item}
      compact
      onPress={() => router.push(`/(app)/market/${item.slug}`)}
    />
  </RNView>
));

// ─── Category FlatList key extractor ─────────────────────────────────────────
const categoryKeyExtractor = (item: CategoryItem) => item.id;
const marketKeyExtractor = (item: any) => String(item.id);

// ─── Markets Screen ───────────────────────────────────────────────────────────
function MarketsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { category } = useLocalSearchParams<{ category: string }>();
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  const { data, isLoading, isRefetching, error, refetch } = useMarkets({
    variables: {
      page: 1,
      limit: 20,
      search,
      category: (category
        || (selectedCategory !== 'all' ? selectedCategory : undefined)) as any,
    },
  });

  const status = useAuth.use.status();
  const isLoggedIn = status === 'signIn';
  const totalMarkets = data?.meta?.total || 0;

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [selectedCategory]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const onRefresh = useCallback(() => refetch(), [refetch]);

  const renderMarketItem = useCallback(
    ({ item }: { item: any }) => <MarketItem item={item} />,
    [],
  );

  const handleCategorySelect = useCallback(
    (id: string) => setSelectedCategory(id),
    [],
  );

  const renderCategoryPill = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <CategoryPill
        item={item}
        isActive={selectedCategory === item.id}
        onPress={() => handleCategorySelect(item.id)}
      />
    ),
    [selectedCategory, handleCategorySelect],
  );

  if (isLoading && !isRefetching) {
    return (
      <View style={[s.center, { padding: 20, justifyContent: 'flex-start', paddingTop: 60 }]}>
        <Skeleton width="100%" height={240} borderRadius={24} style={{ marginBottom: 20 }} />
        <Skeleton width="60%" height={32} borderRadius={8} style={{ marginBottom: 24, alignSelf: 'flex-start' }} />
        <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 }}>
          <Skeleton width="48%" height={160} borderRadius={20} />
          <Skeleton width="48%" height={160} borderRadius={20} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <Skeleton width="48%" height={160} borderRadius={20} />
          <Skeleton width="48%" height={160} borderRadius={20} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{t('home.error_oops')}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
          <Text style={s.retryText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ListHeader = (
    <RNView>
      {/* Ticker */}
      {process.env.EXPO_PUBLIC_APP_NAME !== 'Futurus' && <LiveTicker />}

      {/* Search */}
      <RNView style={s.searchRow}>
        <RNView style={s.searchBar}>
          <Search color={CDP.textMuted} size={18} />
          <TextInput
            placeholder={t('home.search_placeholder')}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={CDP.textMuted}
            style={s.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X color={CDP.textMuted} size={16} />
            </TouchableOpacity>
          )}
        </RNView>
      </RNView>

      {/* Hero */}
      <RNView style={s.hero}>
        <Animated.View style={[s.heroGlow, { opacity: pulseAnim }]} />

        <RNView style={s.heroBadge}>
          <RNView style={s.heroBadgeDot} />
          <Text style={s.heroBadgeText}>
            {t('home.active_markets_count', { count: totalMarkets })}
          </Text>
        </RNView>

        <Text style={s.heroTitle}>
          {t('home.hero_title_1')}
          {'\n'}
          <Text style={s.heroTitleAccent}>{t('home.hero_title_2')}</Text>
        </Text>

        <Text style={s.heroSub}>{t('home.hero_description')}</Text>

        <MarketCarousel markets={data?.data || []} />

        {!isLoggedIn && (
          <RNView style={s.heroCTAs}>
            <TouchableOpacity
              style={s.ctaPrimary}
              onPress={() => router.push('/register')}
              activeOpacity={0.85}
            >
              <Zap color={CDP.bg} size={16} strokeWidth={2.5} />
              <Text style={s.ctaPrimaryText}>{t('home.get_started_free')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.ctaSecondary}
              onPress={() => {
                flatListRef.current?.scrollToOffset({
                  offset: 500,
                  animated: true,
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={s.ctaSecondaryText}>{t('home.how_it_works')}</Text>
              <ArrowUpRight color={CDP.primary} size={16} strokeWidth={2} />
            </TouchableOpacity>
          </RNView>
        )}
      </RNView>

      {/* Stats row removed because it is rendering at the bottom of the screen improperly */}

      {/* Category pills */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={categoryKeyExtractor}
        contentContainerStyle={s.categoryList}
        renderItem={renderCategoryPill}
      />

      {/* Gamify card */}
      {process.env.EXPO_PUBLIC_APP_NAME !== 'Futurus' && (
        <TouchableOpacity
          style={s.gamifyCard}
          onPress={() => navigation.navigate('game')}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1621504450181-5d356f63d3ee?w=800',
            }}
            style={s.gamifyImage}
          />
          <RNView style={s.gamifyOverlay} />
          <RNView style={s.gamifyContent}>
            <RNView style={s.gamifyBadgeRow}>
              <RNView style={s.badgeYellow}>
                <Text style={s.badgeYellowText}>{t('home.new')}</Text>
              </RNView>
              <RNView style={s.badgePurple}>
                <Text style={s.badgePurpleText}>{t('home.gamification')}</Text>
              </RNView>
            </RNView>
            <Text style={s.gamifyTitle} numberOfLines={1}>
              {t('home.gamify_title')}
            </Text>
            <Text style={s.gamifyDesc} numberOfLines={2}>
              {t('home.gamify_desc')}
            </Text>
            <RNView style={s.gamifyCTA}>
              <Text style={s.gamifyCTAText}>{t('home.start_earning')}</Text>
              <ArrowUpRight color={CDP.warning} size={18} strokeWidth={2.5} />
            </RNView>
          </RNView>
        </TouchableOpacity>
      )}

      {/* How It Works */}
      {process.env.EXPO_PUBLIC_APP_NAME !== 'Futurus' && (
        <RNView style={s.howSection}>
          <Text style={s.sectionTitle}>{t('home.how_it_works')}</Text>
          <Text style={s.sectionSub}>{t('home.how_it_works_subtitle')}</Text>
          <HowItWorksStep
            index={1}
            title={t('home.step_1_title')}
            desc={t('home.step_1_desc')}
          />
          <HowItWorksStep
            index={2}
            title={t('home.step_2_title')}
            desc={t('home.step_2_desc')}
          />
          <HowItWorksStep
            index={3}
            title={t('home.step_3_title')}
            desc={t('home.step_3_desc')}
          />
        </RNView>
      )}

      {/* Featured header */}
      <RNView style={s.featuredHeader}>
        <RNView style={s.featuredLeft}>
          <Flame color={CDP.warning} size={18} strokeWidth={2} />
          <Text style={s.featuredTitle}>{t('home.featured_markets')}</Text>
        </RNView>
        <Text style={s.featuredCount}>
          {t('home.markets_found', { count: totalMarkets })}
        </Text>
      </RNView>
    </RNView>
  );

  return (
    <View style={s.container}>
      <FlatList
        ref={flatListRef}
        data={data?.data || []}
        keyExtractor={marketKeyExtractor}
        renderItem={renderMarketItem}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={(
          <RNView style={s.emptyBox}>
            <Text style={s.emptyText}>{t('home.no_markets_match')}</Text>
          </RNView>
        )}
        columnWrapperStyle={s.columnWrapper}
        contentContainerStyle={s.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={CDP.primary}
            colors={[CDP.primary]}
          />
        )}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={5}
        initialNumToRender={6}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: CDP.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CDP.bg,
    gap: 16,
  },
  loadingText: { color: CDP.textSecondary, fontSize: 14, marginTop: 12 },
  errorText: { color: CDP.danger, fontSize: 16 },
  retryBtn: {
    backgroundColor: CDP.glowMedium,
    borderWidth: 1,
    borderColor: CDP.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: CDP.primary, fontWeight: '700' },

  // Search
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CDP.bg,
    borderBottomWidth: 1,
    borderBottomColor: CDP.borderSubtle,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: CDP.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
  },
  searchInput: { flex: 1, color: CDP.textPrimary, fontSize: 14 },

  // Hero
  hero: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    alignSelf: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CDP.glowMedium,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CDP.border,
    marginBottom: 20,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CDP.success,
  },
  heroBadgeText: {
    color: CDP.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: CDP.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroTitleAccent: { color: CDP.primary },
  heroSub: {
    fontSize: 14,
    color: CDP.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  heroCTAs: { width: '100%', gap: 10, marginTop: 20 },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CDP.primary,
    paddingVertical: 17,
    borderRadius: 16,
    shadowColor: CDP.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaPrimaryText: { color: CDP.bg, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CDP.glow,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  ctaSecondaryText: { color: CDP.primary, fontSize: 15, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: CDP.bg,
  },
  statGap: { width: 10 },

  // Category
  categoryList: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },

  // Gamify
  gamifyCard: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  gamifyImage: { width: '100%', height: '100%' },
  gamifyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 6, 20, 0.75)',
  },
  gamifyContent: { position: 'absolute', inset: 0, padding: 20, justifyContent: 'center' },
  gamifyBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badgeYellow: {
    backgroundColor: 'rgba(255, 181, 69, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 181, 69, 0.35)',
  },
  badgeYellowText: { color: CDP.warning, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  badgePurple: {
    backgroundColor: CDP.gameDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  badgePurpleText: { color: CDP.game, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  gamifyTitle: {
    color: CDP.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  gamifyDesc: {
    color: 'rgba(240, 246, 255, 0.75)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  gamifyCTA: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gamifyCTAText: { color: CDP.warning, fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },

  // How It Works
  howSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: CDP.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: CDP.borderSubtle,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: CDP.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13,
    color: CDP.textSecondary,
    marginBottom: 24,
    lineHeight: 19,
  },

  // Featured
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  featuredLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featuredTitle: { fontSize: 18, fontWeight: '800', color: CDP.textPrimary, letterSpacing: -0.2 },
  featuredCount: { fontSize: 12, color: CDP.textMuted, fontWeight: '600' },

  // Market grid
  flatListContent: { paddingBottom: 32 },
  columnWrapper: { paddingHorizontal: 10, gap: 10 },
  marketItem: { flex: 1, marginBottom: 10 },
  emptyBox: { padding: 60, alignItems: 'center' },
  emptyText: { color: CDP.textMuted, fontSize: 15, textAlign: 'center' },
});

export default MarketsScreen;
