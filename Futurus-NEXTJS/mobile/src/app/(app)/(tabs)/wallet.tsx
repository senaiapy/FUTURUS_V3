import * as Clipboard from 'expo-clipboard';
import { Redirect } from 'expo-router';
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  Building2,
  Copy,
  CreditCard,
  Plus,
  Wallet as WalletIcon,
  X,
} from 'lucide-react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useAsaasDepositCard,
  useAsaasDepositPix,
  useAsaasDepositStatus,
  useAsaasWithdrawPix,
  useAsaasWithdrawTransfer,
  useBalance,
  useTransactions,
} from '@/api/wallet';
import { HeaderLinks } from '@/components/header-links';
import { Image, Skeleton } from '@/components/ui';
import { useAuth } from '@/lib';
import { CDP } from '@/lib/theme';

type DepositStep = 'amount' | 'type' | 'card_form' | 'payment';
type PaymentType = 'PIX' | 'CARD' | null;
type WithdrawStep = 'type' | 'pix_form' | 'bank_form';
type WithdrawType = 'pix' | 'bank' | null;
type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export default function WalletScreen() {
  const status = useAuth.use.status();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';

  // Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState<DepositStep>('amount');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentType>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [cpf, setCpf] = useState('');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [holderEmail, setHolderEmail] = useState('');
  const [holderPhone, setHolderPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [province, setProvince] = useState('');

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('type');
  const [withdrawType, setWithdrawType] = useState<WithdrawType>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCpf, setWithdrawCpf] = useState('');

  // PIX Withdraw State
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('CPF');
  const [pixKey, setPixKey] = useState('');

  // Bank Transfer State
  const [bankCode, setBankCode] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountType, setBankAccountType] = useState<'CONTA_CORRENTE' | 'CONTA_POUPANCA'>('CONTA_CORRENTE');
  const [bankHolderName, setBankHolderName] = useState('');

  // Polling for PIX status
  const [pollingTrx, setPollingTrx] = useState<string | null>(null);

  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useBalance();
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useTransactions({ variables: { limit: 10 } });

  // Mutations
  const depositPixMutation = useAsaasDepositPix();
  const depositCardMutation = useAsaasDepositCard();
  const withdrawPixMutation = useAsaasWithdrawPix();
  const withdrawTransferMutation = useAsaasWithdrawTransfer();
  const depositStatusMutation = useAsaasDepositStatus();

  // Poll for PIX payment status
  useEffect(() => {
    if (!pollingTrx)
      return;

    const interval = setInterval(() => {
      depositStatusMutation.mutate(
        { trx: pollingTrx },
        {
          onSuccess: (data) => {
            if (data.deposit.status === 'confirmed') {
              setPollingTrx(null);
              Alert.alert(t('common.success'), t('wallet.deposit_confirmed'));
              closeDepositModal();
              refetchBalance();
              refetchTransactions();
            }
          },
        },
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [pollingTrx]);

  // Redirect to login if not authenticated (must be after all hooks)
  if (status === 'signOut' || status === 'idle') {
    return <Redirect href="/login" />;
  }

  // Format helpers
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Deposit handlers
  const openDepositModal = () => {
    setDepositAmount(0);
    setDepositStep('amount');
    setPaymentType(null);
    setPaymentData(null);
    setCpf('');
    resetCardForm();
    setShowDepositModal(true);
  };

  const closeDepositModal = () => {
    setShowDepositModal(false);
    setDepositStep('amount');
    setDepositAmount(0);
    setPaymentType(null);
    setPaymentData(null);
    setPollingTrx(null);
    resetCardForm();
  };

  const resetCardForm = () => {
    setCardNumber('');
    setHolderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setInstallments(1);
    setHolderEmail('');
    setHolderPhone('');
    setPostalCode('');
    setAddress('');
    setAddressNumber('');
    setProvince('');
  };

  const handleContinueToType = () => {
    if (depositAmount < 10) {
      Alert.alert(t('common.error'), t('wallet.min_deposit_error', { amount: '10,00' }));
      return;
    }
    setDepositStep('type');
  };

  const handleSelectPaymentType = (type: PaymentType) => {
    setPaymentType(type);
    if (type === 'PIX') {
      if (!cpf) {
        Alert.alert(t('common.error'), t('wallet.cpf_required'));
        return;
      }
      depositPixMutation.mutate(
        { amount: depositAmount, cpf: cpf.replace(/\D/g, '') },
        {
          onSuccess: (data) => {
            console.log('PIX Deposit Response:', JSON.stringify(data, null, 2));
            setPaymentData(data);

            // Handle response structure
            if (data.deposit && data.deposit.trx) {
              setPollingTrx(data.deposit.trx);
            }
            else if ((data as any).trx) {
              // Fallback for flat response structure
              setPollingTrx((data as any).trx);
            }
            else {
              console.error('No TRX found in response:', data);
              Alert.alert(t('common.error'), 'Invalid response from server');
              return;
            }

            setDepositStep('payment');
          },
          onError: (err: any) => {
            console.error('PIX Deposit Error:', err);
            Alert.alert(t('common.error'), err.response?.data?.message || t('wallet.pix_error'));
          },
        },
      );
    }
    else if (type === 'CARD') {
      setDepositStep('card_form');
    }
  };

  const handleCardDeposit = () => {
    if (!cardNumber || !holderName || !expiryMonth || !expiryYear || !cvv) {
      Alert.alert(t('common.error'), t('wallet.fill_card_info'));
      return;
    }
    if (!cpf || !holderEmail || !holderPhone || !postalCode || !address || !addressNumber || !province) {
      Alert.alert(t('common.error'), t('wallet.fill_billing_info'));
      return;
    }

    depositCardMutation.mutate(
      {
        amount: depositAmount,
        card_number: cardNumber.replace(/\s/g, ''),
        holder_name: holderName,
        expiry_month: expiryMonth.padStart(2, '0'),
        expiry_year: expiryYear,
        cvv,
        installments,
        holder_cpf: cpf.replace(/\D/g, ''),
        holder_email: holderEmail,
        holder_phone: holderPhone.replace(/\D/g, ''),
        holder_postal_code: postalCode.replace(/\D/g, ''),
        holder_address: address,
        holder_address_number: addressNumber,
        holder_province: province,
      },
      {
        onSuccess: (data) => {
          if (data.deposit.status === 'confirmed') {
            Alert.alert(t('common.success'), t('wallet.card_payment_success'));
            closeDepositModal();
            refetchBalance();
            refetchTransactions();
          }
          else if (data.deposit.status === 'pending') {
            Alert.alert(t('common.info'), t('wallet.card_payment_processing'));
            closeDepositModal();
          }
          else {
            Alert.alert(t('common.error'), t('wallet.card_payment_failed'));
          }
        },
        onError: (err: any) => {
          Alert.alert(t('common.error'), err.response?.data?.message || t('wallet.card_error'));
        },
      },
    );
  };

  // Withdraw handlers
  const openWithdrawModal = () => {
    setWithdrawStep('type');
    setWithdrawType(null);
    setWithdrawAmount('');
    setWithdrawCpf('');
    setPixKeyType('CPF');
    setPixKey('');
    setBankCode('');
    setBankAgency('');
    setBankAccount('');
    setBankAccountType('CONTA_CORRENTE');
    setBankHolderName('');
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
  };

  const handleSelectWithdrawType = (type: WithdrawType) => {
    setWithdrawType(type);
    if (type === 'pix') {
      setWithdrawStep('pix_form');
    }
    else if (type === 'bank') {
      setWithdrawStep('bank_form');
    }
  };

  const handlePixWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 10) {
      Alert.alert(t('common.error'), t('wallet.min_withdraw_error', { amount: '10,00' }));
      return;
    }
    if (!withdrawCpf || !pixKey) {
      Alert.alert(t('common.error'), t('wallet.fill_all_fields'));
      return;
    }

    withdrawPixMutation.mutate(
      {
        amount,
        cpf: withdrawCpf.replace(/\D/g, ''),
        pix_key_type: pixKeyType,
        pix_key: pixKey,
      },
      {
        onSuccess: (data) => {
          Alert.alert(t('common.success'), t('wallet.withdraw_success_msg'));
          closeWithdrawModal();
          refetchBalance();
          refetchTransactions();
        },
        onError: (err: any) => {
          Alert.alert(t('common.error'), err.response?.data?.message || t('wallet.withdraw_error'));
        },
      },
    );
  };

  const handleBankWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 10) {
      Alert.alert(t('common.error'), t('wallet.min_withdraw_error', { amount: '10,00' }));
      return;
    }
    if (!withdrawCpf || !bankCode || !bankAgency || !bankAccount || !bankHolderName) {
      Alert.alert(t('common.error'), t('wallet.fill_all_fields'));
      return;
    }

    withdrawTransferMutation.mutate(
      {
        amount,
        cpf: withdrawCpf.replace(/\D/g, ''),
        bank_code: bankCode,
        bank_agency: bankAgency,
        bank_account: bankAccount,
        bank_account_type: bankAccountType,
        bank_holder_name: bankHolderName,
      },
      {
        onSuccess: (data) => {
          Alert.alert(t('common.success'), t('wallet.withdraw_success_msg'));
          closeWithdrawModal();
          refetchBalance();
          refetchTransactions();
        },
        onError: (err: any) => {
          Alert.alert(t('common.error'), err.response?.data?.message || t('wallet.withdraw_error'));
        },
      },
    );
  };

  const handleCopy = (text: string) => {
    Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert(t('wallet.copy_alert_title'), t('wallet.copy_alert_msg'));
  };

  const addAmount = (value: number) => {
    setDepositAmount(prev => prev + value);
  };

  const calculateCharge = (amount: number, percent: number = 1) => {
    return amount * (percent / 100);
  };

  return (
    <View style={styles.container}>
      <HeaderLinks />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>{t('wallet.total_estimated_balance')}</Text>
            <WalletIcon color={CDP.primary} size={20} />
          </View>
          <Text style={styles.balanceValue}>
            {isLoadingBalance ? '...' : `R$ ${Number.parseFloat(String(balance?.balanceTotal || 0)).toFixed(2)}`}
          </Text>

          <View style={styles.balanceGrid}>
            <View style={styles.miniBalance}>
              <Text style={styles.miniLabel}>{t('wallet.available')}</Text>
              <Text style={styles.miniValue}>
                R$
                {Number.parseFloat(String(balance?.balance || 0)).toFixed(2)}
              </Text>
            </View>
            <View style={styles.miniBalance}>
              <Text style={styles.miniLabel}>{t('wallet.bonus')}</Text>
              <Text style={styles.miniValue}>
                R$
                {Number.parseFloat(String(balance?.balanceBonus || 0)).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={openDepositModal}>
              <Plus color={CDP.success} size={20} />
              <Text style={styles.actionLabel}>{t('wallet.deposit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={openWithdrawModal}>
              <ArrowUpCircle color={CDP.primary} size={20} />
              <Text style={styles.actionLabel}>{t('wallet.withdraw')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('wallet.last_activities')}</Text>

          {isLoadingTransactions
            ? (
                <View style={{ gap: 12 }}>
                  <Skeleton width="100%" height={70} borderRadius={16} />
                  <Skeleton width="100%" height={70} borderRadius={16} />
                  <Skeleton width="100%" height={70} borderRadius={16} />
                </View>
              )
            : transactions?.data?.length
              ? (
                  transactions.data.map(tx => (
                    <View key={tx.id} style={styles.transactionItem}>
                      <View style={[styles.iconCircle, { backgroundColor: CDP.card }]}>
                        {tx.type === 'DEPOSIT'
                          ? (
                              <ArrowDownCircle color={CDP.success} size={20} />
                            )
                          : (
                              <ArrowUpCircle color={CDP.danger} size={20} />
                            )}
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={styles.txTitle}>{tx.description || tx.type}</Text>
                        <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                      </View>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: tx.type === 'DEPOSIT' ? CDP.success : CDP.textPrimary },
                        ]}
                      >
                        {tx.type === 'DEPOSIT' ? '+' : '-'}
                        {' '}
                        R$
                        {Number(tx.amount).toFixed(2)}
                      </Text>
                    </View>
                  ))
                )
              : (
                  <Text style={styles.emptyText}>{t('wallet.no_transactions')}</Text>
                )}
        </View>
      </ScrollView>

      {/* DEPOSIT MODAL */}
      <Modal visible={showDepositModal} animationType="slide" transparent={true} onRequestClose={closeDepositModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {/* Step 1: Amount Selection */}
              {depositStep === 'amount' && (
                <View style={styles.stepContainer}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={closeDepositModal}>
                      <ArrowLeft color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('wallet.deposit')}</Text>
                    <TouchableOpacity onPress={closeDepositModal}>
                      <X color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.amountDisplay}>
                    <Text style={styles.amountLabel}>{t('wallet.amount')}</Text>
                    <Text style={styles.amountValue}>{formatCurrency(depositAmount)}</Text>
                    <Text style={styles.amountHint}>{t('wallet.min_deposit', { amount: '10,00' })}</Text>
                  </View>

                  <View style={styles.amountButtons}>
                    {[10, 50, 100, 200, 500, 1000].map(value => (
                      <TouchableOpacity key={value} style={styles.amountBtn} onPress={() => addAmount(value)}>
                        <Text style={styles.amountBtnText}>
                          +R$
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CPF/CNPJ *</Text>
                    <TextInput
                      style={styles.input}
                      value={cpf}
                      onChangeText={text => setCpf(formatCPF(text))}
                      placeholder="000.000.000-00"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                      maxLength={18}
                    />
                  </View>

                  <TouchableOpacity style={styles.continueBtn} onPress={handleContinueToType}>
                    <Text style={styles.continueBtnText}>{t('wallet.continue')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeBtn} onPress={closeDepositModal}>
                    <Text style={styles.closeBtnText}>{t('wallet.close')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2: Payment Type Selection */}
              {depositStep === 'type' && (
                <View style={styles.stepContainer}>
                  <View style={styles.typeHeader}>
                    <Text style={styles.typeTitle}>{t('wallet.choose_method')}</Text>
                    <TouchableOpacity style={styles.closeCircle} onPress={closeDepositModal}>
                      <X color={CDP.textSecondary} size={16} />
                    </TouchableOpacity>
                  </View>

                  {/* PIX Option */}
                  <TouchableOpacity
                    style={styles.methodOption}
                    onPress={() => handleSelectPaymentType('PIX')}
                    disabled={depositPixMutation.isPending}
                  >
                    <View style={styles.methodIconTeal}>
                      <Image source={{ uri: 'https://logopng.com.br/logos/pix-106.png' }} style={{ width: 24, height: 24 }} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>
                        PIX
                        {' '}
                        <Text style={styles.methodTag}>{t('wallet.pix_no_fee')}</Text>
                      </Text>
                      <Text style={styles.methodDesc}>{t('wallet.no_limit_instant')}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{t('wallet.brazilian_real')}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t('wallet.card_option')}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Credit Card Option */}
                  <TouchableOpacity style={styles.methodOption} onPress={() => handleSelectPaymentType('CARD')}>
                    <View style={styles.methodIconGray}>
                      <CreditCard color={CDP.textSecondary} size={24} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>{t('wallet.credit_debit_card')}</Text>
                      <Text style={styles.methodDesc}>{t('wallet.card_installments')}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>3.99%</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.backBtn} onPress={() => setDepositStep('amount')}>
                    <Text style={styles.backBtnText}>{t('wallet.back')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 3: Card Form */}
              {depositStep === 'card_form' && (
                <View style={styles.stepContainer}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setDepositStep('type')}>
                      <ArrowLeft color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('wallet.card_payment')}</Text>
                    <TouchableOpacity onPress={closeDepositModal}>
                      <X color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.formSection}>{t('wallet.card_info')}</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.card_number')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={cardNumber}
                      onChangeText={text => setCardNumber(formatCardNumber(text))}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.holder_name')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={holderName}
                      onChangeText={setHolderName}
                      placeholder={t('wallet.holder_name_placeholder')}
                      placeholderTextColor={CDP.textPrimary}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>
                        {t('wallet.expiry_month')}
                        {' '}
                        *
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={expiryMonth}
                        onChangeText={setExpiryMonth}
                        placeholder="MM"
                        placeholderTextColor={CDP.textPrimary}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>
                        {t('wallet.expiry_year')}
                        {' '}
                        *
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={expiryYear}
                        onChangeText={setExpiryYear}
                        placeholder="AAAA"
                        placeholderTextColor={CDP.textPrimary}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV *</Text>
                      <TextInput
                        style={styles.input}
                        value={cvv}
                        onChangeText={setCvv}
                        placeholder="000"
                        placeholderTextColor={CDP.textPrimary}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.installments')}
                      {' '}
                      *
                    </Text>
                    <View style={styles.installmentsRow}>
                      {[1, 2, 3, 6, 12].map(n => (
                        <TouchableOpacity
                          key={n}
                          style={[styles.installmentBtn, installments === n && styles.installmentBtnActive]}
                          onPress={() => setInstallments(n)}
                        >
                          <Text style={[styles.installmentText, installments === n && styles.installmentTextActive]}>
                            {n}
                            x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <Text style={styles.formSection}>{t('wallet.holder_info')}</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.email')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={holderEmail}
                      onChangeText={setHolderEmail}
                      placeholder="email@example.com"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.phone')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={holderPhone}
                      onChangeText={text => setHolderPhone(formatPhone(text))}
                      placeholder="(00) 00000-0000"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="phone-pad"
                      maxLength={15}
                    />
                  </View>

                  <Text style={styles.formSection}>{t('wallet.billing_address')}</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.postal_code')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={postalCode}
                      onChangeText={text => setPostalCode(formatCEP(text))}
                      placeholder="00000-000"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                      maxLength={9}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 2 }]}>
                      <Text style={styles.inputLabel}>
                        {t('wallet.street')}
                        {' '}
                        *
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder={t('wallet.street_placeholder')}
                        placeholderTextColor={CDP.textPrimary}
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>
                        {t('wallet.number')}
                        {' '}
                        *
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={addressNumber}
                        onChangeText={setAddressNumber}
                        placeholder="123"
                        placeholderTextColor={CDP.textPrimary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.neighborhood')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={province}
                      onChangeText={setProvince}
                      placeholder={t('wallet.neighborhood_placeholder')}
                      placeholderTextColor={CDP.textPrimary}
                    />
                  </View>

                  <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        {t('wallet.amount')}
                        :
                      </Text>
                      <Text style={styles.summaryValue}>
                        R$
                        {formatCurrency(depositAmount)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        {t('wallet.fee')}
                        {' '}
                        (3.99% + R$0.49):
                      </Text>
                      <Text style={styles.summaryValue}>
                        R$
                        {formatCurrency(depositAmount * 0.0399 + 0.49)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabelBold}>
                        {t('wallet.total')}
                        :
                      </Text>
                      <Text style={styles.summaryValueBold}>
                        R$
                        {formatCurrency(depositAmount + depositAmount * 0.0399 + 0.49)}
                      </Text>
                    </View>
                    {installments > 1 && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>
                          {installments}
                          x de:
                        </Text>
                        <Text style={styles.summaryValue}>
                          R$
                          {' '}
                          {formatCurrency((depositAmount + depositAmount * 0.0399 + 0.49) / installments)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.payBtn, depositCardMutation.isPending && { opacity: 0.7 }]}
                    onPress={handleCardDeposit}
                    disabled={depositCardMutation.isPending}
                  >
                    {depositCardMutation.isPending
                      ? (
                          <ActivityIndicator color={CDP.textPrimary} />
                        )
                      : (
                          <Text style={styles.payBtnText}>
                            {t('wallet.pay')}
                            {' '}
                            R$
                            {formatCurrency(depositAmount + depositAmount * 0.0399 + 0.49)}
                          </Text>
                        )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 4: PIX Payment Display */}
              {depositStep === 'payment' && paymentType === 'PIX' && (
                <View style={styles.stepContainer}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setDepositStep('type')}>
                      <ArrowLeft color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('wallet.send_pix')}</Text>
                    <TouchableOpacity onPress={closeDepositModal}>
                      <X color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.qrContainer}>
                    {paymentData?.pix?.qr_code_base64
                      ? (
                          <Image
                            source={{ uri: `data:image/png;base64,${paymentData.pix.qr_code_base64}` }}
                            style={styles.qrCode}
                          />
                        )
                      : (
                          <ActivityIndicator color={CDP.primary} />
                        )}
                  </View>

                  <Text style={styles.addressLabel}>{t('wallet.pix_code')}</Text>

                  <View style={styles.addressBox}>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {paymentData?.pix?.copy_paste || t('wallet.generating_code')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => handleCopy(paymentData?.pix?.copy_paste || '')}
                  >
                    {copied
                      ? (
                          <Text style={styles.copyBtnText}>{t('wallet.copied_success')}</Text>
                        )
                      : (
                          <>
                            <Copy color={CDP.textPrimary} size={18} />
                            <Text style={styles.copyBtnText}>{t('wallet.copy_pix_code')}</Text>
                          </>
                        )}
                  </TouchableOpacity>

                  <View style={styles.statusBox}>
                    <ActivityIndicator color={CDP.primary} size="small" />
                    <Text style={styles.statusText}>{t('wallet.waiting_payment')}</Text>
                  </View>

                  <TouchableOpacity style={styles.closeBtn} onPress={closeDepositModal}>
                    <Text style={styles.closeBtnText}>{t('wallet.close')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Loading Overlay */}
              {(depositPixMutation.isPending || depositCardMutation.isPending) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color={CDP.textPrimary} size="large" />
                  <Text style={styles.loadingText}>{t('wallet.processing')}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* WITHDRAW MODAL */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent={true} onRequestClose={closeWithdrawModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              {/* Step 1: Withdraw Type Selection */}
              {withdrawStep === 'type' && (
                <View style={styles.stepContainer}>
                  <View style={styles.typeHeader}>
                    <Text style={styles.typeTitle}>{t('wallet.request_withdraw')}</Text>
                    <TouchableOpacity style={styles.closeCircle} onPress={closeWithdrawModal}>
                      <X color={CDP.textSecondary} size={16} />
                    </TouchableOpacity>
                  </View>

                  {/* PIX Option */}
                  <TouchableOpacity style={styles.methodOption} onPress={() => handleSelectWithdrawType('pix')}>
                    <View style={styles.methodIconTeal}>
                      <Image source={{ uri: 'https://logopng.com.br/logos/pix-106.png' }} style={{ width: 24, height: 24 }} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>PIX</Text>
                      <Text style={styles.methodDesc}>{t('wallet.pix_withdraw_desc')}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>1%</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Bank Transfer Option */}
                  <TouchableOpacity style={styles.methodOption} onPress={() => handleSelectWithdrawType('bank')}>
                    <View style={styles.methodIconGray}>
                      <Building2 color={CDP.textSecondary} size={24} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>{t('wallet.bank_transfer')}</Text>
                      <Text style={styles.methodDesc}>{t('wallet.bank_transfer_desc')}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>1.5%</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2: PIX Withdraw Form */}
              {withdrawStep === 'pix_form' && (
                <View style={styles.stepContainer}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setWithdrawStep('type')}>
                      <ArrowLeft color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('wallet.pix_withdraw')}</Text>
                    <TouchableOpacity onPress={closeWithdrawModal}>
                      <X color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.withdraw_amount')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={withdrawAmount}
                      onChangeText={setWithdrawAmount}
                      placeholder="100.00"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CPF/CNPJ *</Text>
                    <TextInput
                      style={styles.input}
                      value={withdrawCpf}
                      onChangeText={text => setWithdrawCpf(formatCPF(text))}
                      placeholder="000.000.000-00"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                      maxLength={18}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.pix_key_type')}
                      {' '}
                      *
                    </Text>
                    <View style={styles.pixKeyTypeRow}>
                      {(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP'] as PixKeyType[]).map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[styles.pixKeyTypeBtn, pixKeyType === type && styles.pixKeyTypeBtnActive]}
                          onPress={() => setPixKeyType(type)}
                        >
                          <Text style={[styles.pixKeyTypeText, pixKeyType === type && styles.pixKeyTypeTextActive]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.pix_key')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={pixKey}
                      onChangeText={setPixKey}
                      placeholder={t('wallet.pix_key_placeholder')}
                      placeholderTextColor={CDP.textPrimary}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.feeBox}>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>{t('wallet.processing_fee', { fee: 1 })}</Text>
                      <Text style={styles.feeValue}>
                        R$
                        {calculateCharge(Number.parseFloat(withdrawAmount) || 0, 1).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.feeRow}>
                      <Text style={styles.netLabel}>{t('wallet.net_value')}</Text>
                      <Text style={styles.netValue}>
                        R$
                        {' '}
                        {((Number.parseFloat(withdrawAmount) || 0) * 0.99).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.payBtn, withdrawPixMutation.isPending && { opacity: 0.7 }]}
                    onPress={handlePixWithdraw}
                    disabled={withdrawPixMutation.isPending}
                  >
                    {withdrawPixMutation.isPending
                      ? (
                          <ActivityIndicator color={CDP.textPrimary} />
                        )
                      : (
                          <Text style={styles.payBtnText}>{t('wallet.confirm_withdraw')}</Text>
                        )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 3: Bank Transfer Form */}
              {withdrawStep === 'bank_form' && (
                <View style={styles.stepContainer}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setWithdrawStep('type')}>
                      <ArrowLeft color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('wallet.bank_withdraw')}</Text>
                    <TouchableOpacity onPress={closeWithdrawModal}>
                      <X color={CDP.textSecondary} size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.withdraw_amount')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={withdrawAmount}
                      onChangeText={setWithdrawAmount}
                      placeholder="100.00"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CPF/CNPJ *</Text>
                    <TextInput
                      style={styles.input}
                      value={withdrawCpf}
                      onChangeText={text => setWithdrawCpf(formatCPF(text))}
                      placeholder="000.000.000-00"
                      placeholderTextColor={CDP.textPrimary}
                      keyboardType="numeric"
                      maxLength={18}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.bank_holder_name')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={bankHolderName}
                      onChangeText={setBankHolderName}
                      placeholder={t('wallet.bank_holder_placeholder')}
                      placeholderTextColor={CDP.textPrimary}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>
                        {t('wallet.bank_code')}
                        {' '}
                        *
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={bankCode}
                        onChangeText={setBankCode}
                        placeholder="001"
                        placeholderTextColor={CDP.textPrimary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>
                        {t('wallet.bank_agency')}
                        {' '}
                        *
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={bankAgency}
                        onChangeText={setBankAgency}
                        placeholder="0001"
                        placeholderTextColor={CDP.textPrimary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.bank_account')}
                      {' '}
                      *
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={bankAccount}
                      onChangeText={setBankAccount}
                      placeholder="12345-6"
                      placeholderTextColor={CDP.textPrimary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      {t('wallet.account_type')}
                      {' '}
                      *
                    </Text>
                    <View style={styles.accountTypeRow}>
                      <TouchableOpacity
                        style={[styles.accountTypeBtn, bankAccountType === 'CONTA_CORRENTE' && styles.accountTypeBtnActive]}
                        onPress={() => setBankAccountType('CONTA_CORRENTE')}
                      >
                        <Text style={[styles.accountTypeText, bankAccountType === 'CONTA_CORRENTE' && styles.accountTypeTextActive]}>
                          {t('wallet.checking')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.accountTypeBtn, bankAccountType === 'CONTA_POUPANCA' && styles.accountTypeBtnActive]}
                        onPress={() => setBankAccountType('CONTA_POUPANCA')}
                      >
                        <Text style={[styles.accountTypeText, bankAccountType === 'CONTA_POUPANCA' && styles.accountTypeTextActive]}>
                          {t('wallet.savings')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.feeBox}>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>{t('wallet.processing_fee', { fee: 1.5 })}</Text>
                      <Text style={styles.feeValue}>
                        R$
                        {calculateCharge(Number.parseFloat(withdrawAmount) || 0, 1.5).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.feeRow}>
                      <Text style={styles.netLabel}>{t('wallet.net_value')}</Text>
                      <Text style={styles.netValue}>
                        R$
                        {' '}
                        {((Number.parseFloat(withdrawAmount) || 0) * 0.985).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.payBtn, withdrawTransferMutation.isPending && { opacity: 0.7 }]}
                    onPress={handleBankWithdraw}
                    disabled={withdrawTransferMutation.isPending}
                  >
                    {withdrawTransferMutation.isPending
                      ? (
                          <ActivityIndicator color={CDP.textPrimary} />
                        )
                      : (
                          <Text style={styles.payBtnText}>{t('wallet.confirm_withdraw')}</Text>
                        )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CDP.background },
  scrollContent: { paddingBottom: 40 },
  balanceCard: {
    margin: 16,
    padding: 24,
    backgroundColor: CDP.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: CDP.card,
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { color: CDP.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  balanceValue: { color: CDP.textPrimary, fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  balanceGrid: { flexDirection: 'row', gap: 16, marginBottom: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: CDP.card },
  miniBalance: { flex: 1 },
  miniLabel: { color: CDP.textSecondary, fontSize: 10, textTransform: 'uppercase' },
  miniValue: { color: CDP.textPrimary, fontSize: 14, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CDP.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CDP.border,
  },
  actionLabel: { color: CDP.textPrimary, fontSize: 14, fontWeight: 'bold' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: CDP.textPrimary, marginBottom: 16 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CDP.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CDP.card,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1, marginLeft: 12 },
  txTitle: { color: CDP.textPrimary, fontSize: 14, fontWeight: 'bold' },
  txDate: { color: CDP.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: CDP.textSecondary, textAlign: 'center', marginTop: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#0a1f1f',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1a3a3a',
    overflow: 'hidden',
  },
  stepContainer: { padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { color: CDP.textPrimary, fontSize: 18, fontWeight: 'bold' },
  amountDisplay: { alignItems: 'center', marginBottom: 24 },
  amountLabel: { color: CDP.textSecondary, fontSize: 14, marginBottom: 8 },
  amountValue: { color: '#4fd1c5', fontSize: 42, fontWeight: 'bold' },
  amountHint: { color: CDP.textSecondary, fontSize: 12, marginTop: 8 },
  amountButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 24 },
  amountBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0d2e2e', borderRadius: 20, borderWidth: 1, borderColor: '#1a4a4a' },
  amountBtnText: { color: CDP.textSecondary, fontSize: 14, fontWeight: '600' },
  continueBtn: { backgroundColor: '#1a3a3a', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  continueBtnText: { color: CDP.textSecondary, fontSize: 16, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: CDP.textPrimary, fontSize: 16, fontWeight: 'bold' },
  backBtn: { backgroundColor: CDP.card, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16, marginHorizontal: 24 },
  backBtnText: { color: CDP.textSecondary, fontSize: 14, fontWeight: 'bold' },

  // Type Selection
  typeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 },
  typeTitle: { color: CDP.textPrimary, fontSize: 18, fontWeight: 'bold', flex: 1 },
  closeCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: CDP.border, alignItems: 'center', justifyContent: 'center' },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  methodIconTeal: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(79, 209, 197, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  methodIconGray: { width: 40, height: 40, borderRadius: 10, backgroundColor: CDP.card, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  methodInfo: { flex: 1 },
  methodName: { color: CDP.textPrimary, fontSize: 16, fontWeight: 'bold' },
  methodTag: { color: CDP.textSecondary, fontWeight: 'normal' },
  methodDesc: { color: CDP.textSecondary, fontSize: 12, marginTop: 2 },
  badge: { backgroundColor: CDP.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: CDP.textPrimary, fontSize: 10, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: CDP.card },
  dividerText: { color: CDP.textSecondary, fontSize: 12 },

  // Forms
  inputContainer: { marginBottom: 16 },
  inputLabel: { color: CDP.textSecondary, fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 12, color: CDP.textPrimary, borderWidth: 1, borderColor: CDP.card, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  formSection: { color: CDP.primary, fontSize: 14, fontWeight: 'bold', marginTop: 8, marginBottom: 16 },

  // Installments
  installmentsRow: { flexDirection: 'row', gap: 8 },
  installmentBtn: { flex: 1, paddingVertical: 12, backgroundColor: CDP.card, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: CDP.border },
  installmentBtnActive: { backgroundColor: CDP.primary, borderColor: CDP.primary },
  installmentText: { color: CDP.textSecondary, fontWeight: 'bold' },
  installmentTextActive: { color: CDP.textPrimary },

  // PIX Key Types
  pixKeyTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pixKeyTypeBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: CDP.card, borderRadius: 8, borderWidth: 1, borderColor: CDP.border },
  pixKeyTypeBtnActive: { backgroundColor: CDP.primary, borderColor: CDP.primary },
  pixKeyTypeText: { color: CDP.textSecondary, fontSize: 12, fontWeight: 'bold' },
  pixKeyTypeTextActive: { color: CDP.textPrimary },

  // Account Type
  accountTypeRow: { flexDirection: 'row', gap: 12 },
  accountTypeBtn: { flex: 1, paddingVertical: 12, backgroundColor: CDP.card, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: CDP.border },
  accountTypeBtnActive: { backgroundColor: CDP.primary, borderColor: CDP.primary },
  accountTypeText: { color: CDP.textSecondary, fontWeight: 'bold' },
  accountTypeTextActive: { color: CDP.textPrimary },

  // Summary
  summaryBox: { backgroundColor: 'rgba(79, 209, 197, 0.1)', padding: 16, borderRadius: 12, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: CDP.textSecondary, fontSize: 12 },
  summaryValue: { color: CDP.textPrimary, fontSize: 14 },
  summaryLabelBold: { color: CDP.textSecondary, fontSize: 14, fontWeight: 'bold' },
  summaryValueBold: { color: CDP.success, fontSize: 16, fontWeight: 'bold' },

  // Fee Box
  feeBox: { backgroundColor: 'rgba(79, 209, 197, 0.1)', padding: 16, borderRadius: 12, marginBottom: 24 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  feeLabel: { color: CDP.textSecondary, fontSize: 12 },
  feeValue: { color: CDP.textPrimary, fontSize: 14 },
  netLabel: { color: CDP.textSecondary, fontSize: 14, fontWeight: 'bold' },
  netValue: { color: CDP.success, fontSize: 16, fontWeight: 'bold' },

  // Buttons
  payBtn: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: CDP.textPrimary, fontSize: 16, fontWeight: 'bold' },
  copyBtn: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  copyBtnText: { color: CDP.textPrimary, fontSize: 16, fontWeight: 'bold' },

  // QR Code
  qrContainer: { alignSelf: 'center', backgroundColor: CDP.textPrimary, padding: 16, borderRadius: 20, marginBottom: 24 },
  qrCode: { width: 180, height: 180 },
  addressLabel: { color: CDP.textSecondary, fontSize: 14, marginBottom: 8 },
  addressBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12, marginBottom: 16 },
  addressText: { color: CDP.textSecondary, fontSize: 11, fontFamily: 'monospace' },

  // Status
  statusBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16, padding: 12, backgroundColor: 'rgba(79, 209, 197, 0.1)', borderRadius: 12 },
  statusText: { color: CDP.primary, fontSize: 14 },

  // Loading
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: CDP.textPrimary, fontSize: 14, marginTop: 16 },
});
