/* eslint-disable max-lines-per-function */
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ChevronDown, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as z from 'zod';

import { useRegister } from '@/api/auth';
import { Button, Checkbox, ControlledInput, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { signIn } from '@/lib/auth';

const COUNTRY_CODES = [
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
];

function schema(t: any) {
  return z.object({
    name: z.string({ message: t('auth.error_name_required') }).min(3),
    email: z
      .string({ message: t('auth.error_email_required') })
      .email(t('auth.error_email_invalid')),
    phone: z.string().optional(),
    password: z
      .string({ message: t('auth.error_password_required') })
      .min(8, t('auth.error_password_min')),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t('auth.error_accept_terms_required'),
    }),
  });
}

export type RegisterFormType = z.infer<ReturnType<typeof schema>>;

export function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const [selectedCountry, setSelectedCountry] = React.useState(COUNTRY_CODES[0]);
  const [showCountryModal, setShowCountryModal] = React.useState(false);

  const currentSchema = React.useMemo(() => schema(t), [t]);

  const { handleSubmit, control } = useForm<RegisterFormType>({
    resolver: zodResolver(currentSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormType> = (data) => {
    const { acceptTerms: _, phone, ...rest } = data;
    const registerData = {
      ...rest,
      phone: phone ? `${selectedCountry.code}${phone}` : undefined,
    };
    register(registerData as any, {
      onSuccess: (response) => {
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
          = error?.response?.data?.message || t('auth.registration_failed');
        Alert.alert(t('common.error'), errorMessage);
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.create_account_title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.create_account_subtitle')}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <User size={18} color={colors.primary[400]} />
              <Text style={styles.label}>{t('auth.full_name')}</Text>
            </View>
            <ControlledInput
              control={control}
              name="name"
              placeholder="John Doe"
              containerStyle={styles.inputContainer}
            />
          </View>

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
              <Phone size={18} color={colors.primary[400]} />
              <Text style={styles.label}>{t('auth.phone_optional')}</Text>
            </View>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <ChevronDown size={16} color={colors.neutral[400]} />
              </TouchableOpacity>
              <View style={styles.phoneInputWrapper}>
                <ControlledInput
                  control={control}
                  name="phone"
                  placeholder={t('auth.phone_placeholder')}
                  keyboardType="phone-pad"
                  containerStyle={styles.phoneInputContainer}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Lock size={18} color={colors.primary[400]} />
              <Text style={styles.label}>{t('auth.password')}</Text>
            </View>
            <ControlledInput
              control={control}
              name="password"
              placeholder={t('auth.password_register_placeholder')}
              secureTextEntry
              showPasswordToggle
              containerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.termsContainer}>
            <Controller
              control={control}
              name="acceptTerms"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onChange(!value)}
                    style={styles.checkboxRow}
                  >
                    <Checkbox
                      checked={value}
                      onChange={onChange}
                      accessibilityLabel={t('auth.accept_terms_label')}
                    />
                    <Text style={styles.termsText}>
                      {t('auth.accept_terms_label')}
                    </Text>
                  </TouchableOpacity>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <Button
            label={
              isPending ? t('common.loading') : t('auth.create_account_btn')
            }
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
            style={styles.signUpBtn}
            textClassName="font-bold text-lg"
          />

          <View style={styles.securityRow}>
            <ShieldCheck size={14} color={colors.success[500]} />
            <Text style={styles.securityText}>
              {t('auth.data_protection_notice')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('auth.have_account')}
            {' '}
            <Text
              style={styles.signInLink}
              onPress={() => router.push('/login')}
            >
              {t('auth.sign_in')}
            </Text>
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('auth.select_country')}</Text>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.countryItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.country}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[950],
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral[400],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[200],
  },
  inputContainer: {
    backgroundColor: colors.dark[950],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark[800],
  },
  signUpBtn: {
    backgroundColor: colors.primary[600],
    height: 56,
    borderRadius: 14,
    marginTop: 12,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityText: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.neutral[400],
  },
  signInLink: {
    color: colors.primary[400],
    fontWeight: 'bold',
  },
  termsContainer: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[300],
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger[500],
    marginTop: 4,
    marginLeft: 32,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark[950],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    height: 48,
    gap: 6,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 14,
    color: colors.neutral[200],
    fontWeight: '500',
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInputContainer: {
    backgroundColor: colors.dark[950],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.dark[900],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[800],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[800],
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: `${colors.primary[600]}20`,
  },
  countryItemFlag: {
    fontSize: 24,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[200],
  },
  countryItemCode: {
    fontSize: 14,
    color: colors.neutral[400],
    fontWeight: '500',
  },
});
