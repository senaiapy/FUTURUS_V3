import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export default function ResponsibleGamingScreen() {
  const { t } = useTranslation();
  const openSupport = () => {
    Linking.openURL('https://cvv.org.br');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('responsible_gaming.title')}</Text>
        <Text style={styles.subtitle}>{t('responsible_gaming.subtitle')}</Text>
      </View>

      <View style={styles.warningBanner}>
        <View style={styles.warningHeader}>
          <AlertTriangle size={20} color={colors.warning[500]} />
          <Text style={styles.warningTitle}>
            {t('responsible_gaming.attention')}
          </Text>
        </View>
        <Text style={styles.warningText}>
          {t('responsible_gaming.warning_text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('responsible_gaming.tips_title')}
        </Text>
        <View style={styles.tipList}>
          {[
            t('responsible_gaming.tips_item_1'),
            t('responsible_gaming.tips_item_2'),
            t('responsible_gaming.tips_item_3'),
            t('responsible_gaming.tips_item_4'),
          ].map((tip, i) => (
            <View key={i} style={styles.tipItem}>
              <CheckCircle2 size={18} color={colors.success[500]} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('responsible_gaming.tools_title')}
        </Text>
        <View style={styles.grid}>
          <View style={styles.toolCard}>
            <ShieldCheck size={24} color={colors.primary[400]} />
            <Text style={styles.toolTitle}>
              {t('responsible_gaming.tool_limits_title')}
            </Text>
            <Text style={styles.toolDesc}>
              {t('responsible_gaming.tool_limits_desc')}
            </Text>
          </View>
          <View style={styles.toolCard}>
            <HeartPulse size={24} color={colors.danger[500]} />
            <Text style={styles.toolTitle}>
              {t('responsible_gaming.tool_exclusion_title')}
            </Text>
            <Text style={styles.toolDesc}>
              {t('responsible_gaming.tool_exclusion_desc')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>
          {t('responsible_gaming.help_title')}
        </Text>
        <Text style={styles.supportOrg}>
          {t('responsible_gaming.help_org')}
        </Text>
        <Text style={styles.supportPhone}>
          {t('responsible_gaming.help_phone')}
        </Text>
        <TouchableOpacity style={styles.supportBtn} onPress={openSupport}>
          <Text style={styles.supportBtnText}>
            {t('responsible_gaming.visit_btn')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[400],
    marginTop: 8,
  },
  warningBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: `${colors.warning[500]}11`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.warning[500]}33`,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning[400],
  },
  warningText: {
    fontSize: 14,
    color: `${colors.warning[100]}aa`,
    lineHeight: 20,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  tipList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.neutral[300],
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.dark[900],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.dark[800],
    alignItems: 'center',
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 12,
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  supportCard: {
    margin: 16,
    padding: 24,
    backgroundColor: `${colors.primary[500]}11`,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${colors.primary[500]}33`,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  supportOrg: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[400],
    marginBottom: 12,
  },
  supportPhone: {
    fontSize: 14,
    color: colors.neutral[400],
    marginBottom: 20,
  },
  supportBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  supportBtnText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});
