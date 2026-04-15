import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react-native';
import * as React from 'react';
import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  UIManager,
} from 'react-native';
import { Text, View } from '@/components/ui';
import { CDP } from '@/lib/theme';

if (
  Platform.OS === 'android'
  && UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: 'O que é o FUTURUS?',
    answer:
      'O FUTURUS é a primeira plataforma brasileira de mercados de previsão. Aqui você pode comprar e vender cotas de eventos futuros em diversas categorias como política, esportes, economia e entretenimento.',
  },
  {
    question: 'Como funcionam os mercados de previsão?',
    answer:
      'Cada mercado é baseado em uma pergunta sobre o futuro. As cotas variam entre R$ 0,01 e R$ 0,99, representando a probabilidade do evento ocorrer. Se o evento acontecer, as cotas vencedoras valem R$ 1,00 cada.',
  },
  {
    question: 'Como faço para depositar?',
    answer:
      'Você pode depositar instantaneamente via PIX ou utilizando criptomoedas. O valor mínimo de depósito é de R$ 10,00.',
  },
  {
    question: 'Como recebo meus lucros?',
    answer:
      'Assim que um mercado é resolvido, os valores são creditados em sua carteira. Você pode solicitar o saque via PIX a qualquer momento, observando o valor mínimo de saque.',
  },
  {
    question: 'A plataforma é segura?',
    answer:
      'Sim, utilizamos criptografia AES-256 e protocolos de segurança avançados para proteger seus dados e fundos. Todas as transações são auditáveis e transparentes.',
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      style={[styles.faqCard, expanded && styles.expandedCard]}
      onPress={toggle}
      activeOpacity={0.7}
    >
      <View style={styles.questionRow}>
        <Text style={styles.questionText}>{question}</Text>
        {expanded
          ? (
              <ChevronUp size={20} color={CDP.primary} />
            )
          : (
              <ChevronDown size={20} color={CDP.textMuted} />
            )}
      </View>
      {expanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <HelpCircle size={32} color={CDP.primary} />
        </View>
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.subtitle}>Dúvidas frequentes sobre o FUTURUS</Text>
      </View>

      <View style={styles.listContainer}>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </View>

      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>Ainda tem dúvidas?</Text>
        <Text style={styles.supportText}>
          Nossa equipe de suporte está pronta para te ajudar 24/7.
        </Text>
        <TouchableOpacity style={styles.supportBtn}>
          <Text style={styles.supportBtnText}>Falar com Suporte</Text>
        </TouchableOpacity>
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
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: `${CDP.primary}11`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  faqCard: {
    backgroundColor: CDP.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CDP.card,
  },
  expandedCard: {
    borderColor: `${CDP.primary}44`,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: CDP.textPrimary,
    paddingRight: 12,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CDP.card,
  },
  answerText: {
    fontSize: 14,
    color: CDP.textSecondary,
    lineHeight: 22,
  },
  supportCard: {
    backgroundColor: `${CDP.primary}11`,
    margin: 16,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${CDP.primary}33`,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CDP.textPrimary,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: CDP.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  supportBtn: {
    backgroundColor: CDP.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  supportBtnText: {
    color: CDP.textPrimary,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});
