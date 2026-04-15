import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useBlockchainWallet,
  useCreateWallet,
  useSyncBalances,
} from '@/api/blockchain';

type WalletCardProps = {
  onBalanceChange?: (balance: { sol: number; fut: number }) => void;
  compact?: boolean;
};

export function WalletCard({ onBalanceChange, compact = false }: WalletCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const { data: wallet, isLoading, refetch } = useBlockchainWallet();
  const { mutate: syncBalances, isPending: syncing } = useSyncBalances as any;
  const { mutate: createWallet, isPending: creating } = useCreateWallet();

  const handleCopyAddress = useCallback(async () => {
    if (wallet?.publicKey) {
      await Clipboard.setStringAsync(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [wallet?.publicKey]);

  const handleSyncBalances = useCallback(() => {
    syncBalances(undefined, {
      onSuccess: (data: any) => {
        if (onBalanceChange) {
          onBalanceChange({ sol: data.solBalance, fut: data.futBalance });
        }
        refetch();
      },
      onError: () => {
        Alert.alert(t('Error'), t('Failed to sync balances'));
      },
    });
  }, [syncBalances, onBalanceChange, refetch, t]);

  const handleCreateWallet = useCallback(() => {
    createWallet(undefined, {
      onSuccess: () => {
        refetch();
      },
      onError: () => {
        Alert.alert(t('Error'), t('Failed to create wallet'));
      },
    });
  }, [createWallet, refetch, t]);

  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <ActivityIndicator color="#8b5cf6" />
      </View>
    );
  }

  if (!wallet?.hasWallet) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="wallet-outline" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.emptyTitle}>{t('No Solana Wallet')}</Text>
          {!compact && (
            <Text style={styles.emptyDescription}>
              {t('Create a wallet to trade with FUT tokens on Solana.')}
            </Text>
          )}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateWallet}
            disabled={creating}
          >
            {creating
              ? (
                  <ActivityIndicator color="#fff" size="small" />
                )
              : (
                  <Text style={styles.createButtonText}>{t('Create Wallet')}</Text>
                )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactBalance}>
          <View style={styles.futBadge}>
            <Text style={styles.futBadgeText}>F</Text>
          </View>
          <Text style={styles.compactBalanceText}>
            {(wallet.futBalance || 0).toFixed(2)}
            {' '}
            FUT
          </Text>
        </View>
        <View style={styles.compactDivider} />
        <View style={styles.compactBalance}>
          <View style={styles.solBadge}>
            <Text style={styles.solBadgeText}>S</Text>
          </View>
          <Text style={styles.compactBalanceText}>
            {(wallet.solBalance || 0).toFixed(4)}
            {' '}
            SOL
          </Text>
        </View>
        <TouchableOpacity
          style={styles.compactRefresh}
          onPress={handleSyncBalances}
          disabled={syncing}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color="#8b5cf6"
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet" size={20} color="#8b5cf6" />
          </View>
          <View>
            <Text style={styles.walletTitle}>{t('Solana Wallet')}</Text>
            <View style={styles.addressRow}>
              <Text style={styles.address}>
                {wallet.publicKey?.slice(0, 6)}
                ...
                {wallet.publicKey?.slice(-4)}
              </Text>
              <TouchableOpacity onPress={handleCopyAddress}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={14}
                  color={copied ? '#10b981' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleSyncBalances}
          disabled={syncing}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>
      </View>

      {/* Balances */}
      <View style={styles.balancesRow}>
        <View style={[styles.balanceCard, styles.futCard]}>
          <View style={styles.balanceHeader}>
            <View style={styles.futBadge}>
              <Text style={styles.futBadgeText}>F</Text>
            </View>
            <Text style={styles.tokenName}>FUT Token</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {(wallet.futBalance || 0).toFixed(2)}
          </Text>
        </View>

        <View style={[styles.balanceCard, styles.solCard]}>
          <View style={styles.balanceHeader}>
            <View style={styles.solBadge}>
              <Text style={styles.solBadgeText}>S</Text>
            </View>
            <Text style={styles.tokenName}>SOL</Text>
          </View>
          <Text style={styles.balanceAmount}>
            {(wallet.solBalance || 0).toFixed(4)}
          </Text>
        </View>
      </View>

      {wallet.isCustodial && (
        <Text style={styles.custodialNote}>
          {t('This is a custodial wallet managed by Futurus')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  containerCompact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748b',
  },
  refreshButton: {
    padding: 8,
  },
  balancesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  futCard: {
    backgroundColor: '#faf5ff',
  },
  solCard: {
    backgroundColor: '#eff6ff',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  futBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  futBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  solBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  tokenName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  custodialNote: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f3e8ff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  compactBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactBalanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  compactDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#cbd5e1',
  },
  compactRefresh: {
    marginLeft: 'auto',
    padding: 4,
  },
});

export default WalletCard;
