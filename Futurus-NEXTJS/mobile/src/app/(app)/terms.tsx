import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export default function TermsScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>
          {t('terms.title')}
        </Text>
        <Text style={styles.intro}>
          {t('terms.intro')}
        </Text>
        <Text style={styles.sectionTitle}>
          {t('terms.section1_title')}
        </Text>
        <Text style={styles.content}>
          {t('terms.section1_content')}
        </Text>
        <Text style={styles.sectionTitle}>
          {t('terms.section2_title')}
        </Text>
        <Text style={styles.content}>
          {t('terms.section2_content')}
        </Text>
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  scrollContent: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    color: colors.neutral[400],
    marginBottom: 32,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    color: colors.neutral[300],
    lineHeight: 22,
    marginBottom: 24,
  },
  spacer: {
    height: 40,
  },
});
