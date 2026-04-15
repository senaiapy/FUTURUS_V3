import type { DimensionValue, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import * as React from 'react';
import { StyleSheet } from 'react-native';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  return (
    <MotiView
      transition={{
        type: 'timing',
        duration: 1200,
        loop: true,
      }}
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.7 }}
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 181, 36, 0.1)', // Gold with low opacity
    overflow: 'hidden',
  },
});
