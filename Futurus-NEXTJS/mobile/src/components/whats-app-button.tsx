import * as React from 'react';
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { WhatsApp } from '@/components/ui/icons';

type WhatsAppButtonProps = {
  phoneNumber?: string;
};

export default function WhatsAppButton({
  phoneNumber = '595991474601',
}: WhatsAppButtonProps) {
  // Animated pulse effect
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleWhatsAppPress = async () => {
    try {
      const url = `https://wa.me/${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      }
      else {
        console.error('WhatsApp is not installed or URL can\'t be opened');
      }
    }
    catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  };

  return (
    <>
      {/* Pulse animation ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main WhatsApp Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleWhatsAppPress}
        activeOpacity={0.7}
        accessibilityLabel="Abrir WhatsApp"
        accessibilityRole="button"
      >
        <WhatsApp color="#ffffff" width={28} height={28} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80, // Above tab bar
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366', // WhatsApp green
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  pulseRing: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    opacity: 0.4,
    zIndex: 999,
  },
});
