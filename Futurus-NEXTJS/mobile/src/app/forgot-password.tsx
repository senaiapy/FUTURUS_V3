import { useRouter } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { useForgotPassword } from '@/api/auth';
import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const { mutate: forgotPassword, isPending: loading } = useForgotPassword();

  const handleReset = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('auth.enter_email_error'));
      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), t('auth.reset_instructions_sent'), [
            { text: t('common.ok'), onPress: () => router.back() },
          ]);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || t('common.error');
          Alert.alert(t('common.error'), message);
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('auth.forgot_password_header')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={48} color={colors.primary[400]} />
        </View>

        <Text style={styles.title}>{t('auth.forgot_password_title')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.forgot_password_subtitle')}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <View style={styles.inputContainer}>
            <Mail
              size={20}
              color={colors.neutral[500]}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.email_placeholder')}
              placeholderTextColor={colors.neutral[600]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <Button
          label={
            loading ? t('common.loading') : t('auth.send_instructions_btn')
          }
          onPress={handleReset}
          loading={loading}
          disabled={loading}
          style={styles.resetBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 16,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary[950]}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[300],
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark[900],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark[800],
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: colors.white,
    fontSize: 16,
  },
  resetBtn: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary[600],
    borderRadius: 14,
  },
});
