import {
  Check,
  Copy,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useRecoveryCodes,
  useTwoFactorStatus,
} from '@/api/settings/use-2fa';
import { Text } from '@/components/ui';

import { CDP } from '@/lib/theme';
import {
  RecoveryCodesSection,
  TwoFactorHeader,
  TwoFactorStatusCard,
} from './2fa-components';

// Helper to extract error message from API response (handles both Laravel and NestJS formats)
function extractErrorMessage(error: any, fallback: string): string {
  const message = error?.response?.data?.message;
  if (typeof message === 'string') {
    return message;
  }
  // Laravel format: { message: { error: [...] } } or { message: { code: [...] } }
  if (message && typeof message === 'object') {
    const errors = message.error || message.code || message.key || Object.values(message)[0];
    if (Array.isArray(errors) && errors.length > 0) {
      return String(errors[0]);
    }
  }
  return fallback;
}

export default function TwoFactorScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [code, setCode] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [showRecovery, setShowRecovery] = React.useState(false);

  const { data: status, isLoading, refetch, isError } = useTwoFactorStatus();
  const { mutate: enable, isPending: isEnabling } = useEnableTwoFactor();
  const { mutate: disable, isPending: isDisabling } = useDisableTwoFactor();
  const { data: recoveryCodes } = useRecoveryCodes({ enabled: showRecovery });

  const handleCopySecret = () => {
    if (status?.secret) {
      Clipboard.setString(status.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnable = () => {
    // Laravel requires both 'key' (secret) and 'code', NestJS only needs 'code'
    enable(
      { code, key: status?.secret },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), '2FA ativado com sucesso!');
          refetch();
          setCode('');
          setShowRecovery(true);
        },
        onError: (error: any) => {
          Alert.alert(
            t('common.error'),
            extractErrorMessage(error, 'Código inválido'),
          );
        },
      },
    );
  };

  const handleDisable = () => {
    disable(
      { code },
      {
        onSuccess: () => {
          Alert.alert(t('common.success'), '2FA desativado com sucesso!');
          refetch();
          setCode('');
        },
        onError: (error: any) => {
          Alert.alert(
            t('common.error'),
            extractErrorMessage(error, 'Código inválido'),
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={CDP.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TwoFactorHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TwoFactorStatusCard enabled={!!status?.enabled} />

        {!status?.enabled
          ? (
              <View style={styles.setupContainer}>
                <Text style={styles.sectionLabel}>CONFIGURAR AGORA</Text>

                <View style={styles.qrContainer}>
                  <View style={styles.qrWrapper}>
                    {isError
                      ? (
                          <View style={styles.errorBox}>
                            <Text style={styles.errorText}>Erro ao carregar QR Code</Text>
                            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
                              <Text style={styles.retryText}>TENTAR NOVAMENTE</Text>
                            </TouchableOpacity>
                          </View>
                        )
                      : (status?.totpUri || status?.qrCodeUrl)
                          ? (
                              <View style={{ width: 200, height: 200 }}>
                                {status.totpUri
                                  ? (
                                      <QRCode
                                        value={status.totpUri}
                                        size={200}
                                        backgroundColor="white"
                                        color="black"
                                      />
                                    )
                                  : (
                                      <Image
                                        key={status.qrCodeUrl}
                                        source={{ uri: status.qrCodeUrl }}
                                        style={{ width: 200, height: 200 }}
                                        resizeMode="contain"
                                      />
                                    )}
                              </View>
                            )
                          : status?.secret
                            ? (
                                <QRCode
                                  value={`otpauth://totp/Futurus?secret=${status.secret}`}
                                  size={200}
                                  backgroundColor="white"
                                  color="black"
                                />
                              )
                            : (
                                <View style={styles.loadingPlaceholder}>
                                  <ActivityIndicator color={CDP.primary} size="large" />
                                </View>
                              )}
                  </View>

                  <View style={styles.secretRow}>
                    <Text style={styles.secretText} numberOfLines={1}>
                      {status?.secret || 'XXXX-XXXX-XXXX-XXXX'}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={handleCopySecret}
                    >
                      {copied
                        ? (
                            <Check color={CDP.success} size={16} />
                          )
                        : (
                            <Copy color={CDP.textSecondary} size={16} />
                          )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>CÓDIGO DE VERIFICAÇÃO</Text>
                  <View style={styles.inputWrapper}>
                    <Lock color={CDP.textMuted} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="000 000"
                      placeholderTextColor={CDP.textMuted}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    code.length !== 6 && styles.disabledBtn,
                  ]}
                  onPress={handleEnable}
                  disabled={code.length !== 6 || isEnabling}
                >
                  {isEnabling
                    ? (
                        <Loader2 color={CDP.bg} size={24} />
                      )
                    : (
                        <>
                          <ShieldCheck color={CDP.bg} size={20} strokeWidth={2.5} />
                          <Text style={styles.primaryBtnText}>ATIVAR SEGURANÇA</Text>
                        </>
                      )}
                </TouchableOpacity>
              </View>
            )
          : (
              <View style={styles.enabledContainer}>
                <View style={styles.iconCircle}>
                  <Smartphone color={CDP.primary} size={48} />
                </View>

                <Text style={styles.enabledText}>PROTEÇÃO TOTAL</Text>
                <Text style={styles.enabledDesc}>
                  A autenticação de dois fatores está ativa. Para desativação,
                  digite o código atual abaixo.
                </Text>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>
                    DIGITE O CÓDIGO PARA DESATIVAR
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Lock color={CDP.textMuted} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="000 000"
                      placeholderTextColor={CDP.textMuted}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.dangerBtn,
                    code.length !== 6 && styles.disabledBtn,
                  ]}
                  onPress={handleDisable}
                  disabled={code.length !== 6 || isDisabling}
                >
                  {isDisabling
                    ? (
                        <Loader2 color={CDP.danger} size={24} />
                      )
                    : (
                        <>
                          <ShieldAlert color={CDP.danger} size={20} strokeWidth={2.5} />
                          <Text style={styles.dangerBtnText}>DESATIVAR SEGURANÇA</Text>
                        </>
                      )}
                </TouchableOpacity>

                {recoveryCodes && <RecoveryCodesSection codes={recoveryCodes} />}
              </View>
            )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.bg,
  },
  center: {
    flex: 1,
    backgroundColor: CDP.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  setupContainer: {
    gap: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: CDP.textMuted,
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  qrContainer: {
    backgroundColor: CDP.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CDP.border,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    minHeight: 232,
    width: 232,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingPlaceholder: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  errorBox: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 12,
    color: CDP.danger,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 75, 106, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CDP.danger,
  },
  retryText: {
    fontSize: 10,
    color: CDP.danger,
    fontWeight: '800',
  },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  secretText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: CDP.primary,
    fontWeight: '700',
    flex: 1,
  },
  copyBtn: {
    padding: 4,
  },
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CDP.textMuted,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CDP.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CDP.border,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: CDP.textPrimary,
    letterSpacing: 4,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 20,
    backgroundColor: CDP.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    shadowColor: CDP.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: CDP.bg,
    letterSpacing: 1,
  },
  enabledContainer: {
    alignItems: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CDP.glowMedium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CDP.primary,
    marginBottom: 10,
  },
  enabledText: {
    fontSize: 24,
    fontWeight: '900',
    color: CDP.textPrimary,
    letterSpacing: 1,
  },
  enabledDesc: {
    fontSize: 14,
    color: CDP.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  dangerBtn: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 75, 106, 0.05)',
    borderWidth: 1,
    borderColor: CDP.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: CDP.danger,
    letterSpacing: 1,
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
