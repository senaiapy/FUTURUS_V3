import type { TxKeyPath } from '@/lib';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';

type ItemProps = {
  text: TxKeyPath | string;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  textClassName?: string;
};

export function Item({
  text,
  value,
  icon,
  onPress,
  textClassName,
}: ItemProps) {
  const isPressable = onPress !== undefined;
  return (
    <Pressable
      onPress={onPress}
      pointerEvents={isPressable ? 'auto' : 'none'}
      className="flex-1 flex-row items-center justify-between px-4 py-2"
    >
      <View className="flex-row items-center">
        {icon && <View className="pr-2">{icon}</View>}
        <Text
          tx={text as TxKeyPath}
          className={textClassName || 'text-neutral-300'}
        />
      </View>
      <View className="flex-row items-center">
        <Text className="text-neutral-400 dark:text-neutral-400">{value}</Text>
        {isPressable && (
          <View className="pl-2">
            <ArrowRight />
          </View>
        )}
      </View>
    </Pressable>
  );
}
