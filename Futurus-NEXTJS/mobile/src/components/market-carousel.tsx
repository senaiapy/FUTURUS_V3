import type { Market } from '@/api/markets/types';
import * as React from 'react';
import { Dimensions, FlatList, StyleSheet } from 'react-native';

import { View } from '@/components/ui';
import { MarketCardCarousel } from './market-card-carousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.75 + 20; // Card width + margin

type Props = {
  markets: Market[];
};

export function MarketCarousel({ markets }: Props) {
  const flatListRef = React.useRef<FlatList>(null);
  const currentIndexRef = React.useRef(0);

  // Auto-scroll effect
  React.useEffect(() => {
    if (markets.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      currentIndexRef.current
        = (currentIndexRef.current + 1) % (markets.length * 2);
      flatListRef.current?.scrollToOffset({
        offset: currentIndexRef.current * ITEM_WIDTH,
        animated: true,
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [markets.length]);

  if (!markets || markets.length === 0) {
    return null;
  }

  // Double markets for infinite scroll effect
  const displayMarkets = [...markets, ...markets];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={displayMarkets}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <MarketCardCarousel market={item} />}
        contentContainerStyle={styles.contentContainer}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        scrollEnabled={true}
        onMomentumScrollEnd={(event) => {
          currentIndexRef.current = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH,
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    width: '100%',
  },
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 0,
  },
});
