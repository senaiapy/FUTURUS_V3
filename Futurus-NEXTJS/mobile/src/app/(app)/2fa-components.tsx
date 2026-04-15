import * as ClipboardHelper from 'expo-clipboard';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clipboard,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react-native';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import { CDP, THEME } from '@/lib/theme';

export function RecoveryCodesSection({ codes }: { codes: string[] }) {
  const copyToClipboard = async () => {
    await ClipboardHelper.setStringAsync(codes.join('\n'));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Códigos de Recuperação</Text>
      <View style={styles.codesGrid}>
        {codes.map(code => (
          <View key={code} style={styles.codeItem}>
            <Text style={styles.codeText}>{code}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.copyBtn} onPress={copyToClipboard}>
        <Clipboard size={16} color={CDP.primary} />
        <Text style={styles.copyBtnText}>Copiar Códigos</Text>
      </TouchableOpacity>
    </View>
  );
}

export function TwoFactorHeader() {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <ArrowLeft color={CDP.textPrimary} size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Segurança 2FA</Text>
    </View>
  );
}

export function TwoFactorStatusCard({ enabled }: { enabled: boolean }) {
  return (
    <View style={styles.statusCard}>
      <View
        style={[
          styles.statusIcon,
          enabled ? styles.statusIconEnabled : styles.statusIconDisabled,
        ]}
      >
        {enabled
          ? (
              <ShieldCheck color={CDP.success} size={40} />
            )
          : (
              <ShieldAlert color={CDP.danger} size={40} />
            )}
      </View>
      <Text style={styles.statusTitle}>
        {enabled ? 'PROTEÇÃO ATIVA' : 'PROTEÇÃO DESATIVADA'}
      </Text>
      <Text style={styles.statusDesc}>
        {enabled
          ? 'Sua conta está mais segura e protegida contra acessos não autorizados.'
          : 'Seu acesso está protegido apenas por senha. Recomendamos ativar o 2FA.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: CDP.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: CDP.border,
    marginBottom: 24,
  },
  sectionTitle: {
    color: CDP.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  codeItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  codeText: {
    color: CDP.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  copyBtnText: {
    color: CDP.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: CDP.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: CDP.textPrimary,
    textAlign: 'center',
    marginRight: 40,
  },
  statusCard: {
    backgroundColor: CDP.surface,
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CDP.border,
    marginBottom: 24,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusIconEnabled: {
    backgroundColor: 'rgba(0, 229, 160, 0.1)',
    borderColor: 'rgba(0, 229, 160, 0.2)',
    borderWidth: 1,
  },
  statusIconDisabled: {
    backgroundColor: 'rgba(255, 75, 106, 0.1)',
    borderColor: 'rgba(255, 75, 106, 0.2)',
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: CDP.textPrimary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  statusDesc: {
    fontSize: 13,
    color: CDP.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
});

// This file contains shared components, not a screen
// The default export is required to prevent Expo Router warnings
export default function TwoFactorComponentsPlaceholder() {
  return null;
}
