import { useRouter } from 'expo-router';
import { Coins, ShieldCheck, TrendingUp, Zap } from 'lucide-react-native';
import { MotiText, MotiView } from 'moti';
import * as React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { useIsFirstTime } from '@/lib/hooks';

const { width, height } = Dimensions.get('window');

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />

      <View style={styles.topSection}>
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 1500 }}
          style={styles.glowContainer}
        >
          <View style={styles.glow} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, type: 'timing', duration: 800 }}
          style={styles.logoPlaceholder}
        >
          <Zap color={colors.primary[400]} size={80} strokeWidth={1.5} />
        </MotiView>
      </View>

      <View style={styles.contentSection}>
        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          style={styles.title}
        >
          FUTURUS
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 800 }}
          style={styles.subtitle}
        >
          Predict the future. Profit today.
        </MotiText>

        <View style={styles.featuresContainer}>
          <FeatureItem
            delay={1000}
            icon={<TrendingUp color={colors.primary[400]} size={24} />}
            title="Hybrid Prediction Markets"
            desc="Predict on politics, sports, and crypto."
          />
          <FeatureItem
            delay={1200}
            icon={<ShieldCheck color={colors.success[500]} size={24} />}
            title="Decentralized Security"
            desc="Funds secured by smart contracts."
          />
          <FeatureItem
            delay={1400}
            icon={<Coins color={colors.warning[500]} size={24} />}
            title="Low Fees, Fast Payouts"
            desc="Withdraw your wins instantly."
          />
        </View>
      </View>

      <SafeAreaView style={styles.footer}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 1800 }}
          style={styles.buttonContainer}
        >
          <Button
            label="Get Started"
            style={styles.btn}
            textClassName="font-bold text-lg"
            onPress={() => {
              setIsFirstTime(false);
              router.replace('/login');
            }}
          />
        </MotiView>
      </SafeAreaView>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
  delay,
}: {
  icon: any;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay }}
      style={styles.featureItem}
    >
      <View style={styles.featureIcon}>{icon}</View>
      <View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  topSection: {
    height: height * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
  },
  glow: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: colors.primary[600],
    opacity: 0.15,
    filter: 'blur(100px)',
  },
  logoPlaceholder: {
    zIndex: 2,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary[400],
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  featuresContainer: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.dark[900],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.dark[800],
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  footer: {
    padding: 32,
  },
  buttonContainer: {
    width: '100%',
  },
  btn: {
    backgroundColor: colors.primary[600],
    height: 60,
    borderRadius: 18,
  },
});
