/* eslint-disable max-lines-per-function */
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import * as z from 'zod';

import { useLogin, useVerify2fa } from '@/api/auth';
import { Button, ControlledInput, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { signIn } from '@/lib/auth';

function schema(t: any) {
  return z.object({
    email: z
      .string({
        message: t('auth.error_email_required'),
      })
      .email(t('auth.error_email_invalid')),
    password: z
      .string({
        message: t('auth.error_password_required'),
      })
      .min(8, t('auth.error_password_min')),
  });
}

export type FormType = z.infer<ReturnType<typeof schema>>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export function LoginForm({ onSubmit = () => {} }: LoginFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const { mutate: verify2fa, isPending: isVerifying } = useVerify2fa();

  // 2FA state
  const [show2faModal, setShow2faModal] = React.useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = React.useState<number | null>(null);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');

  const currentSchema = React.useMemo(() => schema(t), [t]);

  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(currentSchema),
  });

  const handleVerify2fa = () => {
    if (!twoFactorUserId || twoFactorCode.length !== 6)
      return;

    verify2fa(
      { userId: twoFactorUserId, code: twoFactorCode },
      {
        onSuccess: (response) => {
          setShow2faModal(false);
          setTwoFactorCode('');
          signIn({
            token: {
              access: response.access_token,
              refresh: response.refresh_token || '',
            },
            user: response.user,
          });
          router.replace('/(app)/(tabs)');
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || t('auth.invalid_2fa_code');
          Alert.alert(t('common.error'), errorMessage);
        },
      },
    );
  };

  const onSubmitForm: SubmitHandler<FormType> = (data) => {
    login(data, {
      onSuccess: (response: any) => {
        // Check if 2FA is required
        if (response.requires2fa) {
          setTwoFactorUserId(response.userId);
          setShow2faModal(true);
          return;
        }

        signIn({
          token: {
            access: response.access_token,
            refresh: response.refresh_token || '',
          },
          user: response.user,
        });
        router.replace('/(app)/(tabs)');
      },
      onError: (error: any) => {
        const errorMessage
          = error?.response?.data?.message || t('auth.invalid_credentials');
        Alert.alert(t('auth.login_failed'), errorMessage);
      },
    });
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/futurus-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('auth.welcome_back_title')}</Text>
          <Text style={styles.subtitle}>{t('auth.welcome_back_subtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Mail size={18} color={colors.primary[400]} />
              <Text style={styles.label}>{t('auth.email')}</Text>
            </View>
            <ControlledInput
              control={control}
              name="email"
              placeholder={t('auth.email_placeholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Lock size={18} color={colors.primary[400]} />
              <Text style={styles.label}>{t('auth.password')}</Text>
            </View>
            <ControlledInput
              control={control}
              name="password"
              placeholder={t('auth.password_placeholder')}
              secureTextEntry
              showPasswordToggle
              containerStyle={styles.inputContainer}
            />
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>
          </View>

          <Button
            label={isPending ? t('common.loading') : t('auth.login')}
            onPress={handleSubmit(onSubmitForm)}
            loading={isPending}
            disabled={isPending}
            style={styles.signInBtn}
            textClassName="font-bold text-lg"
          />

          <View style={styles.signUpRow}>
            <Text style={styles.footerText}>
              {t('auth.no_account')}
              {' '}
              <Text
                style={styles.signUpLink}
                onPress={() => router.push('/register')}
              >
                {t('auth.request_access')}
              </Text>
            </Text>
          </View>

          <View style={styles.securityRow}>
            <ShieldCheck size={14} color={colors.success[500]} />
            <Text style={styles.securityText}>{t('auth.security_notice')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 2FA Verification Modal */}
      <Modal
        visible={show2faModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShow2faModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KeyRound size={40} color={colors.primary[400]} />
              <Text style={styles.modalTitle}>{t('auth.2fa_verification')}</Text>
              <Text style={styles.modalSubtitle}>{t('auth.enter_2fa_code')}</Text>
            </View>

            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              placeholderTextColor={colors.neutral[500]}
              keyboardType="number-pad"
              maxLength={6}
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShow2faModal(false);
                  setTwoFactorCode('');
                }}
              >
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <Button
                label={isVerifying ? t('common.loading') : t('auth.verify')}
                onPress={handleVerify2fa}
                loading={isVerifying}
                disabled={twoFactorCode.length !== 6 || isVerifying}
                style={styles.verifyBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center' as const,
    maxWidth: 240,
  },
  formCard: {
    backgroundColor: colors.dark[900],
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.dark[800],
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.neutral[200],
  },
  inputContainer: {
    backgroundColor: colors.dark[950],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark[800],
  },
  forgotBtn: {
    alignSelf: 'flex-end' as const,
    marginTop: 8,
  },
  forgotText: {
    fontSize: 12,
    color: colors.primary[400],
    fontWeight: '500' as const,
  },
  signInBtn: {
    backgroundColor: colors.primary[600],
    height: 56,
    borderRadius: 14,
    marginTop: 12,
  },
  signUpRow: {
    alignItems: 'center' as const,
    marginTop: 20,
  },
  securityRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    marginTop: 20,
  },
  securityText: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral[400],
  },
  signUpLink: {
    color: colors.primary[400],
    fontWeight: 'bold' as const,
  },
  // 2FA Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.dark[900],
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.dark[800],
  },
  modalHeader: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: colors.white,
    marginTop: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center' as const,
    marginTop: 8,
  },
  codeInput: {
    backgroundColor: colors.dark[950],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark[800],
    height: 60,
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.white,
    textAlign: 'center' as const,
    letterSpacing: 8,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark[700],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.neutral[400],
  },
  verifyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary[600],
  },
});
