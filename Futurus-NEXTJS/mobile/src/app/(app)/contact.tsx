import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Mail, MapPin, MessageSquare } from 'lucide-react-native';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/components/ui';
import { CDP } from '@/lib/theme';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormType = z.infer<typeof schema>;

export default function ContactScreen() {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormType) {
    console.log('Sending message:', data);
    Alert.alert(t('common.success'), t('contact.success_msg'));
    reset();
  }

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/5511999999999'); // Use actual number from settings if available
  };

  const openEmail = () => {
    Linking.openURL('mailto:info@futurus.com.br');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('contact.title')}</Text>
        <Text style={styles.subtitle}>{t('contact.subtitle')}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>{t('contact.form_title')}</Text>

        <ControlledInput
          control={control}
          name="name"
          placeholder={t('contact.name_placeholder')}
          containerStyle={styles.inputContainer}
        />

        <ControlledInput
          control={control}
          name="email"
          placeholder={t('contact.email_placeholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
        />

        <ControlledInput
          control={control}
          name="message"
          placeholder={t('contact.message_placeholder')}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          containerStyle={[styles.inputContainer, styles.textArea]}
        />

        <Button
          label={t('contact.send_btn')}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>{t('contact.channels_title')}</Text>

        <TouchableOpacity style={styles.infoCard} onPress={openWhatsApp}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${CDP.success}22` },
            ]}
          >
            <MessageSquare size={20} color={CDP.success} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>WhatsApp</Text>
            <Text style={styles.infoValue}>{t('contact.whatsapp_status')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoCard} onPress={openEmail}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${CDP.primary}22` },
            ]}
          >
            <Mail size={20} color={CDP.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>info@futurus.com.br</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${CDP.warning}22` },
            ]}
          >
            <Clock size={20} color={CDP.warning} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>{t('contact.hours_label')}</Text>
            <Text style={styles.infoValue}>{t('contact.hours_value')}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: `${CDP.danger}22` },
            ]}
          >
            <MapPin size={20} color={CDP.danger} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>{t('contact.location_label')}</Text>
            <Text style={styles.infoValue}>{t('contact.location_value')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CDP.background,
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CDP.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: CDP.textSecondary,
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
    backgroundColor: `${CDP.warning}11`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${CDP.warning}33`,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: CDP.background,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CDP.card,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: CDP.primary,
    height: 56,
    borderRadius: 14,
    marginTop: 8,
  },
  infoSection: {
    padding: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CDP.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CDP.card,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: CDP.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: CDP.textPrimary,
  },
  spacer: {
    height: 40,
  },
});
