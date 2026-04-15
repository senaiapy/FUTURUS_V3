import type { TxKeyPath } from '@/lib';

import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath | string;
};

export function ItemsContainer({ children, title }: Props) {
  return (
    <>
      {title && (
        <Text
          className="pt-4 pb-2 text-lg text-neutral-400"
          tx={title as TxKeyPath}
        />
      )}
      <View className="rounded-md border border-neutral-200 dark:border-neutral-600 dark:bg-neutral-800">
        {children}
      </View>
    </>
  );
}
