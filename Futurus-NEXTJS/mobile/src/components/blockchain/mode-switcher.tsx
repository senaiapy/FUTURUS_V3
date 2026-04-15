import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type TradingMode = 'CASH' | 'SOLANA';

type ModeSwitcherProps = {
  value: TradingMode;
  onChange: (mode: TradingMode) => void;
  disabled?: boolean;
};

export function ModeSwitcher({ value, onChange, disabled = false }: ModeSwitcherProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          value === 'CASH' && styles.modeButtonActive,
          value === 'CASH' && styles.cashActive,
        ]}
        onPress={() => !disabled && onChange('CASH')}
        disabled={disabled}
      >
        <Ionicons
          name="wallet-outline"
          size={18}
          color={value === 'CASH' ? '#fff' : '#64748b'}
        />
        <Text
          style={[
            styles.modeText,
            value === 'CASH' && styles.modeTextActive,
          ]}
        >
          {t('BRL')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          value === 'SOLANA' && styles.modeButtonActive,
          value === 'SOLANA' && styles.solanaActive,
        ]}
        onPress={() => !disabled && onChange('SOLANA')}
        disabled={disabled}
      >
        <Ionicons
          name="flash-outline"
          size={18}
          color={value === 'SOLANA' ? '#fff' : '#64748b'}
        />
        <Text
          style={[
            styles.modeText,
            value === 'SOLANA' && styles.modeTextActive,
          ]}
        >
          {t('FUT')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 21,
    gap: 6,
  },
  modeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cashActive: {
    backgroundColor: '#10b981',
  },
  solanaActive: {
    backgroundColor: '#8b5cf6',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  modeTextActive: {
    color: '#fff',
  },
});

export default ModeSwitcher;
