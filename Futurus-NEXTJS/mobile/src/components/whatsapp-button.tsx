import Env from '@env';
import { MotiView } from 'moti';

import * as React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

import { WhatsApp } from '@/components/ui/icons';

import colors from './ui/colors';

export function WhatsAppButton() {
  const handlePress = () => {
    const phoneNumber = Env.NEXT_PUBLIC_ZAP_PHONE || '5511995009969';
    const message = 'Oi';
    if (phoneNumber) {
      Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={styles.button}
      >
        <MotiView
          from={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{
            type: 'timing',
            duration: 2000,
            loop: true,
            repeatReverse: false,
          }}
          style={[styles.pulse, { backgroundColor: '#25D366' }]}
        />
        <WhatsApp color={colors.white} width={28} height={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
    marginBottom: 140, // Increased further to avoid overlap with redesigned TabBar
    zIndex: 9999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  pulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
  },
});
