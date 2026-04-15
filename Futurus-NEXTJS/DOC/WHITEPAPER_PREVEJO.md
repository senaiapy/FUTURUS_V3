# PREVEJO Whitepaper

**Uma Plataforma de Mercados de Previsão de Nova Geração com Grupos Sindicatos**

**Versão 2.0 | Março 2026**

---

## Índice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Introdução](#2-introdução)
3. [Declaração do Problema](#3-declaração-do-problema)
4. [Visão Geral da Solução](#4-visão-geral-da-solução)
5. [Arquitetura da Plataforma](#5-arquitetura-da-plataforma)
6. [Funcionalidades Principais](#6-funcionalidades-principais)
7. [Sistema de Grupos Sindicatos](#7-sistema-de-grupos-sindicatos)
8. [Stack Tecnológico](#8-stack-tecnológico)
9. [Segurança e Conformidade](#9-segurança-e-conformidade)
10. [Infraestrutura de Pagamentos](#10-infraestrutura-de-pagamentos)
11. [Gamificação e Engajamento](#11-gamificação-e-engajamento)
12. [Experiência Mobile](#12-experiência-mobile)
13. [Administração e Operações](#13-administração-e-operações)
14. [Roadmap](#14-roadmap)
15. [Conclusão](#15-conclusão)

---

## 1. Resumo Executivo

**PREVEJO** é uma plataforma abrangente de mercados de previsão que revoluciona a forma como os usuários participam de previsões sobre eventos futuros. Construída sobre uma arquitetura moderna e escalável, o PREVEJO combina mercados de previsão tradicionais com **Grupos Sindicatos** inovadores - um recurso de apostas sociais que permite aos usuários reunir recursos e fazer previsões coletivas.

### Destaques Principais

| Métrica | Descrição |
|---------|-----------|
| **Tipo de Plataforma** | Mercado de Previsão Centralizado |
| **Multi-Plataforma** | Web (Next.js), Mobile (Expo/React Native), Painel Admin |
| **Recurso Exclusivo** | Grupos Sindicatos para apostas coletivas |
| **Métodos de Pagamento** | PIX, Cartão de Crédito, PayPal, Stripe, Cripto |
| **Idiomas** | Português, Inglês, Espanhol, Árabe |
| **Tempo Real** | Atualizações de mercado ao vivo via WebSocket |

---

## 2. Introdução

### 2.1 O Que São Mercados de Previsão?

Mercados de previsão são mercados especulativos onde os participantes negociam sobre os resultados de eventos futuros. Diferente das apostas tradicionais, os mercados de previsão agregam inteligência coletiva para produzir estimativas precisas de probabilidade para eventos que vão desde eleições políticas até resultados esportivos.

### 2.2 A Visão do PREVEJO

O PREVEJO tem como objetivo democratizar os mercados de previsão, tornando-os:

- **Acessíveis**: Disponível na web e mobile, em múltiplos idiomas
- **Sociais**: Grupos Sindicatos permitem previsões colaborativas
- **Seguros**: Segurança de nível empresarial com verificação KYC
- **Envolventes**: Mecânicas de gamificação para melhorar a experiência do usuário
- **Inclusivos**: Múltiplos métodos de pagamento incluindo opções regionais (PIX para Brasil)

---

## 3. Declaração do Problema

### 3.1 Desafios do Mercado Atual

| Desafio | Descrição |
|---------|-----------|
| **Altas Barreiras de Entrada** | Usuários individuais carecem de capital para posições significativas |
| **Recursos Sociais Limitados** | Plataformas existentes operam de forma isolada |
| **Experiência Mobile Ruim** | A maioria das plataformas não possui aplicativos móveis nativos |
| **Limitações de Pagamento Regional** | Falta de suporte para métodos de pagamento locais |
| **Experiência do Usuário Complexa** | Curvas de aprendizado íngremes para novos usuários |

### 3.2 Oportunidade de Mercado

A indústria global de mercados de previsão está experimentando rápido crescimento, impulsionada por:

- Interesse crescente em veículos alternativos de investimento
- Aceitação crescente de produtos financeiros gamificados
- Demanda por ferramentas financeiras sociais e colaborativas
- Expansão de bases de usuários mobile-first em mercados emergentes

---

## 4. Visão Geral da Solução

### 4.1 A Abordagem do PREVEJO

O PREVEJO aborda os desafios do mercado através de:

1. **Grupos Sindicatos**: Grupos de apostas coletivas que reduzem os requisitos de capital individual
2. **Presença Multi-Plataforma**: Experiências nativas na web e mobile
3. **Localização**: Suporte multi-idioma com integração de pagamentos regionais
4. **Gamificação**: Mecânicas que impulsionam engajamento, incluindo tarefas, indicações e recompensas
5. **Supervisão Administrativa**: Ferramentas de gerenciamento abrangentes para operadores da plataforma

### 4.2 Componentes da Plataforma

```
┌─────────────────────────────────────────────────────────────────┐
│                        ECOSSISTEMA PREVEJO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐   │
│   │   FRONTEND  │   │    ADMIN    │   │       MOBILE        │   │
│   │  Next.js 16 │   │  Next.js 16 │   │   Expo 54 + RN 0.81 │   │
│   │   Porta 3000│   │   Porta 3002│   │   iOS / Android     │   │
│   └──────┬──────┘   └──────┬──────┘   └──────────┬──────────┘   │
│          │                 │                      │              │
│          └─────────────────┼──────────────────────┘              │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │     BACKEND     │                            │
│                   │   NestJS 11     │                            │
│                   │    Porta 3001   │                            │
│                   └────────┬────────┘                            │
│                            │                                     │
│                   ┌────────▼────────┐                            │
│                   │   PostgreSQL    │                            │
│                   │  Prisma 6.4.1   │                            │
│                   └─────────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Arquitetura da Plataforma

### 5.1 Arquitetura de Serviços

| Serviço | Tecnologia | Porta | Propósito |
|---------|------------|-------|-----------|
| **Frontend** | Next.js 16 + React 19 | 3000 | Aplicação web pública |
| **Backend API** | NestJS 11 + Prisma | 3001 | API REST e lógica de negócios |
| **Painel Admin** | Next.js 16 + React 19 | 3002 | Dashboard administrativo |
| **Mobile** | Expo 54 + React Native 0.81 | - | Aplicações iOS/Android |
| **Banco de Dados** | PostgreSQL 15 | 5432 | Armazenamento primário de dados |

### 5.2 Decisões Arquiteturais Chave

#### Backend Monolítico com Estrutura Modular

O backend segue a arquitetura modular do NestJS:

```
backend/src/
├── auth/           # Autenticação e autorização
├── users/          # Gerenciamento de usuários
├── markets/        # Operações de mercado
├── groups/         # Grupos Sindicatos
├── bets/           # Lógica de trading/apostas
├── payments/       # Processamento de pagamentos
├── notifications/  # Notificações em tempo real
├── admin/          # Operações administrativas
└── prisma/         # Camada de banco de dados
```

#### Comunicação em Tempo Real

- **Socket.io** alimenta recursos em tempo real
- Atualizações de preços de mercado ao vivo
- Notificações de entrada/saída de membros em grupos
- Confirmações instantâneas de transações

### 5.3 Arquitetura de Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUXO DE DADOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   AÇÃO DO USUÁRIO                                                │
│       │                                                          │
│       ▼                                                          │
│   ┌───────────────┐                                              │
│   │  Frontend/    │                                              │
│   │   App Mobile  │                                              │
│   └───────┬───────┘                                              │
│           │ HTTP/WebSocket                                       │
│           ▼                                                      │
│   ┌───────────────┐      ┌───────────────┐                       │
│   │  Camada API   │─────▶│    Guards     │ (Auth, Rate Limit)   │
│   │   (NestJS)    │      │   & Filters   │                       │
│   └───────┬───────┘      └───────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐      ┌───────────────┐                       │
│   │   Services    │─────▶│   APIs        │ (Stripe, PayPal)     │
│   │  (Negócios)   │      │   Externas    │                       │
│   └───────┬───────┘      └───────────────┘                       │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐      ┌───────────────┐                       │
│   │    Prisma     │─────▶│  PostgreSQL   │                       │
│   │     ORM       │      │ Banco de Dados│                       │
│   └───────────────┘      └───────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Funcionalidades Principais

### 6.1 Mercados e Trading

#### Tipos de Mercado

- **Mercados Binários**: Previsões de resultado SIM/NÃO
- **Baseados em Eventos**: Esportes, política, entretenimento, economia
- **Com Prazo Definido**: Mercados com datas de resolução definidas
- **Mercados Temporários**: Mercados flash para eventos de curto prazo

#### Mecânicas de Trading

| Recurso | Descrição |
|---------|-----------|
| **Descoberta de Preços** | Precificação dinâmica baseada na atividade do mercado |
| **Negociação de Cotas** | Comprar/vender cotas representando probabilidades de resultado |
| **Acompanhamento de Posições** | Gerenciamento de portfólio em tempo real |
| **Cálculo de L&P** | Visualização instantânea de lucros/perdas |

### 6.2 Gerenciamento de Usuários

#### Métodos de Autenticação

- Email/usuário + senha
- Google OAuth
- Facebook OAuth
- Autenticação de Dois Fatores (2FA)

#### Recursos do Perfil de Usuário

- Sistema de verificação KYC
- Configurações de segurança da conta
- Histórico de logins
- Gerenciamento de saldo

### 6.3 Dashboard

O dashboard do usuário fornece:

- **Visão Geral do Saldo**: Saldo atual da conta
- **Resumo de Posições**: Posições ativas e performance
- **Atividade Recente**: Últimas transações e trades
- **Lista de Favoritos**: Mercados marcados
- **Status de Segurança**: Status de 2FA e alertas

---

## 7. Sistema de Grupos Sindicatos

### 7.1 Visão Geral

Grupos Sindicatos é o recurso principal do PREVEJO, permitindo que usuários reúnam recursos para previsões coletivas. Esta camada social transforma apostas individuais em uma experiência colaborativa.

### 7.2 Conceitos Chave

| Termo | Definição |
|-------|-----------|
| **Sindicato/Grupo** | Coletivo de usuários reunindo fundos para uma única posição de mercado |
| **Gerente** | O criador do grupo que define regras e seleciona resultados |
| **Membro** | Um participante que contribui com fundos para o pool |
| **Contribuição** | O valor que um membro investe no grupo |
| **Percentual de Propriedade** | Participação do membro no pool (contribuição / pool total) |

### 7.3 Ciclo de Vida do Grupo

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  RASCUNHO   │───▶│  AGUARDANDO │───▶│   ABERTO    │
│  (Criado)   │    │  APROVAÇÃO  │    │ (Aceitando) │
└─────────────┘    └──────┬──────┘    └──────┬──────┘
                         │                   │
                    ┌────▼────┐              │
                    │REJEITADO│              │
                    └─────────┘              │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  RESOLVIDO  │◀───│  EXECUTADO  │◀───│  BLOQUEADO  │
│  (Pagamento)│    │(Aposta Ativa)│   │  (Apostando)│
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                   ┌─────────▼─────────┐
                                   │    AGUARDANDO     │
                                   │ APROVAÇÃO RESULT. │
                                   └───────────────────┘
```

### 7.4 Referência de Status

| Código | Status | Descrição |
|--------|--------|-----------|
| 0 | RASCUNHO | Estado inicial, não submetido |
| 1 | AGUARDANDO_APROVAÇÃO | Aguardando revisão do admin |
| 2 | REJEITADO | Admin rejeitou o grupo |
| 3 | ABERTO | Aceitando contribuições de membros |
| 4 | BLOQUEADO | Sem mais entradas, aguardando decisão |
| 5 | VOTAÇÃO | Membros votando (se método de votação) |
| 6 | EXECUTADO | Aposta realizada no mercado |
| 7 | RESOLVIDO | Pagamentos completos |
| 8 | CANCELADO | Admin cancelou |
| 9 | REEMBOLSADO | Todos os membros reembolsados |
| 10 | AGUARDANDO_APROVAÇÃO_RESULTADO | Gerente declarou resultado, aguardando admin |

### 7.5 Tipos de Grupo

| Tipo | Visibilidade | Método de Entrada |
|------|--------------|-------------------|
| **Público** | Qualquer um pode ver e entrar | Entrada direta via link de compartilhamento |
| **Privado** | Apenas por convite | Link de WhatsApp/código de convite |

### 7.6 Métodos de Decisão

| Método | Descrição | Caso de Uso |
|--------|-----------|-------------|
| **Gerente** | Criador do grupo seleciona resultado | Grupos baseados em confiança |
| **Votação** | Votação ponderada por capital dos membros | Grupos democráticos |

### 7.7 Distribuição de Pagamentos

Quando um mercado é resolvido:

1. **Calcular Ganhos Totais**: Baseado nas cotas compradas
2. **Aplicar Taxa da Plataforma**: Percentual configurável (padrão 2%)
3. **Aplicar Taxa do Gerente**: Comissão opcional para o criador do grupo (0-10%)
4. **Distribuir Pro-Rata**: Cada membro recebe baseado no % de propriedade

**Fórmula:**
```
Pagamento_Usuário = (Ganhos_Grupo × (1 - Taxa_Plataforma - Taxa_Gerente)) × Percentual_Propriedade_Usuário
```

### 7.8 Endpoints da API

#### Endpoints do Usuário (`/groups`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/groups` | Criar novo grupo |
| GET | `/groups` | Listar grupos públicos |
| GET | `/groups/my` | Obter grupos do usuário |
| GET | `/groups/:slug` | Obter detalhes do grupo |
| POST | `/groups/:id/join` | Entrar no grupo |
| POST | `/groups/:id/leave` | Sair do grupo |
| POST | `/groups/:id/lock` | Bloquear grupo (gerente) |
| POST | `/groups/:id/set-outcome` | Definir resultado (gerente) |

#### Endpoints Admin (`/admin/groups`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/groups` | Listar todos os grupos |
| POST | `/admin/groups/:id/approve` | Aprovar grupo |
| POST | `/admin/groups/:id/reject` | Rejeitar grupo |
| POST | `/admin/groups/:id/approve-result` | Aprovar resultado e executar |
| POST | `/admin/groups/:id/cancel` | Cancelar e reembolsar |

---

## 8. Stack Tecnológico

### 8.1 Tecnologias Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 16.1.6 | Framework React com SSR |
| **React** | 19.2.3 | Biblioteca de componentes UI |
| **Tailwind CSS** | 4.x | Estilização utility-first |
| **next-intl** | 4.8.3 | Internacionalização |
| **NextAuth** | 5.0.0-beta | Autenticação |
| **React Hook Form** | 7.71.2 | Gerenciamento de formulários |
| **Zod** | 4.3.6 | Validação de schemas |
| **Socket.io Client** | 4.8.3 | Comunicação em tempo real |
| **Lucide React** | 0.575 | Biblioteca de ícones |

### 8.2 Tecnologias Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **NestJS** | 11.0.1 | Framework de servidor |
| **Prisma** | 6.4.1 | ORM e toolkit de banco de dados |
| **PostgreSQL** | 15 | Banco de dados primário |
| **Socket.io** | 4.8.3 | Servidor em tempo real |
| **Passport.js** | 0.7.0 | Middleware de autenticação |
| **bcryptjs** | 3.0.3 | Hash de senhas |
| **class-validator** | 0.15.1 | Validação de DTOs |
| **Stripe SDK** | 17.5.0 | Processamento de pagamentos |

### 8.3 Tecnologias Mobile

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Expo** | 54.0.32 | Framework React Native |
| **React Native** | 0.81.5 | Mobile cross-platform |
| **Expo Router** | 6.0.22 | Navegação baseada em arquivos |
| **React Query** | 5.90.19 | Gerenciamento de estado do servidor |
| **Zustand** | 5.0.10 | Gerenciamento de estado do cliente |
| **MMKV** | 4.1.1 | Armazenamento persistente |
| **React Native Reanimated** | 4.1.6 | Animações |

### 8.4 Desenvolvimento e DevOps

| Tecnologia | Propósito |
|------------|-----------|
| **Docker** | Containerização |
| **Docker Compose** | Orquestração multi-container |
| **TypeScript** | Desenvolvimento type-safe |
| **ESLint** | Linting de código |
| **Jest** | Testes unitários |
| **Husky** | Git hooks |
| **EAS** | Expo Application Services |

---

## 9. Segurança e Conformidade

### 9.1 Segurança de Autenticação

| Recurso | Implementação |
|---------|---------------|
| **Hash de Senhas** | bcryptjs com salt rounds |
| **Tokens JWT** | Tokens de acesso/refresh assinados |
| **Suporte 2FA** | Autenticação baseada em TOTP |
| **OAuth** | Integração Google e Facebook |
| **Gerenciamento de Sessões** | Manipulação segura de cookies |

### 9.2 Segurança da API

| Medida | Descrição |
|--------|-----------|
| **Rate Limiting** | Throttling em endpoints sensíveis |
| **Validação de Entrada** | class-validator para todos os DTOs |
| **Proteção XSS** | Sanitização com DOMPurify |
| **Configuração CORS** | Políticas de origem restritas |
| **Guards JWT** | Rotas protegidas |

### 9.3 Segurança Financeira

| Medida | Descrição |
|--------|-----------|
| **Transações Atômicas** | Transações de banco de dados para mudanças de saldo |
| **Prevenção de Double-Spend** | Verificações de saldo antes de deduções |
| **Trilha de Auditoria** | Log completo de transações |
| **Garantias de Reembolso** | Reembolsos automáticos em falhas |
| **Precisão Decimal** | Decimal.js para cálculos financeiros |

### 9.4 KYC e Conformidade

- Sistema de verificação de documentos
- Fluxo de validação de identidade
- Processo de aprovação administrativa
- Capacidades de relatórios de conformidade

### 9.5 Controle de Acesso

| Função | Permissões |
|--------|------------|
| **Usuário** | Negociar, entrar em grupos, gerenciar perfil |
| **Gerente de Grupo** | Criar/gerenciar grupos, definir resultados |
| **Admin Staff** | Acesso admin limitado (configurável) |
| **Super Admin** | Acesso completo à plataforma |

---

## 10. Infraestrutura de Pagamentos

### 10.1 Métodos de Pagamento Suportados

#### Depósitos

| Método | Provedor | Regiões |
|--------|----------|---------|
| **PIX** | Asaas | Brasil |
| **Cartão de Crédito/Débito** | Stripe, Asaas | Global |
| **PayPal** | PayPal | Global |
| **Transferência Bancária** | Manual | Brasil |
| **Criptomoeda** | - | Global |

#### Saques

| Método | Provedor | Processamento |
|--------|----------|---------------|
| **PIX** | Asaas | Instantâneo |
| **Transferência Bancária** | Manual | 1-3 dias |
| **PayPal** | PayPal | 1-2 dias |

### 10.2 Fluxo de Pagamento

```
REQUISIÇÃO USUÁRIO       BACKEND            PROVEDOR PAGAMENTO
       │                    │                       │
       │  Requisição Depósito│                      │
       │───────────────────▶│                       │
       │                    │   Criar Sessão        │
       │                    │──────────────────────▶│
       │                    │   URL da Sessão       │
       │                    │◀──────────────────────│
       │   URL Redirecionamento                     │
       │◀───────────────────│                       │
       │                    │                       │
       │   [Usuário Paga]   │                       │
       │─ ─ ─ ─ ─ ─ ─ ─ ─ ─▶│                       │
       │                    │                       │
       │                    │   Webhook             │
       │                    │◀──────────────────────│
       │                    │                       │
       │                    │   Atualizar Saldo     │
       │                    │   (Transação DB)      │
       │                    │                       │
       │   Saldo Atualizado │                       │
       │◀───────────────────│                       │
```

### 10.3 Endpoints da API

#### Integração Stripe

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/stripe/methods` | GET | Obter configuração do Stripe |
| `/stripe/deposit/create-session` | POST | Criar sessão de pagamento |
| `/stripe/deposit/status/:trx` | GET | Verificar status do depósito |
| `/stripe/webhook` | POST | Tratar eventos do Stripe |

#### Integração PayPal

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/paypal/methods` | GET | Obter configuração do PayPal |
| `/paypal/deposit/create` | POST | Criar ordem PayPal |
| `/paypal/deposit/capture/:orderId` | POST | Capturar pagamento |
| `/paypal/ipn` | POST | Tratar IPN do PayPal |

#### Integração Asaas (Brasil)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/asaas/balance` | GET | Obter saldo do usuário |
| `/asaas/deposit/pix` | POST | Depósito PIX |
| `/asaas/deposit/card` | POST | Depósito cartão |
| `/asaas/withdraw/pix` | POST | Saque PIX |
| `/asaas/ipn` | POST | Tratar webhook do Asaas |

---

## 11. Gamificação e Engajamento

### 11.1 Sistema de Tarefas

Usuários ganham moedas completando tarefas:

| Tipo de Tarefa | Exemplos | Recompensa |
|----------------|----------|------------|
| **Diária** | Login, fazer primeira negociação | Variável |
| **Semanal** | Negociar 5 vezes, indicar um amigo | Maior |
| **Única** | Completar KYC, primeiro depósito | Bônus |

### 11.2 Estados das Tarefas

```
BLOQUEADA ──▶ DISPONÍVEL ──▶ EM_PROGRESSO ──▶ AGUARDANDO_VERIFICAÇÃO ──▶ CONCLUÍDA
```

### 11.3 Programa de Indicações

- Gerar códigos de indicação únicos
- Acompanhar usuários indicados
- Ganhar comissões na atividade de indicações
- Compartilhar via redes sociais/clipboard

### 11.4 Ranking

- Rankings globais baseados em performance
- Competições por período
- Mecânicas de reconhecimento social

---

## 12. Experiência Mobile

### 12.1 Suporte de Plataformas

| Plataforma | Versão Mínima |
|------------|---------------|
| **iOS** | iOS 15+ |
| **Android** | Android 10+ |
| **Web** | React Native Web |

### 12.2 Recursos Mobile

#### Estrutura de Navegação

```
┌─────────────────────────────────────────────┐
│              ABAS INFERIORES                │
├─────────┬─────────┬─────────┬───────┬───────┤
│Mercados │Portfólio│Carteira │ Jogo  │Perfil │
└─────────┴─────────┴─────────┴───────┴───────┘
```

#### Telas Principais

- **Mercados**: Navegar, buscar, filtrar previsões
- **Portfólio**: Posições ativas, acompanhamento de L&P
- **Carteira**: Saldo, depósitos, saques
- **Jogo**: Tarefas, indicações, saldo de moedas
- **Perfil**: Configurações, segurança, suporte

### 12.3 Recursos Específicos Mobile

| Recurso | Tecnologia |
|---------|------------|
| **Armazenamento Persistente** | MMKV |
| **Atualizações OTA** | Expo Updates |
| **API de Compartilhamento** | React Native Share |
| **Clipboard** | expo-clipboard |
| **Deep Linking** | expo-linking |
| **Animações Suaves** | Reanimated + Moti |

---

## 13. Administração e Operações

### 13.1 Dashboard Administrativo

O painel admin fornece ferramentas de gerenciamento abrangentes:

#### Estatísticas do Dashboard

- Total de usuários e usuários ativos
- Resumos de depósitos/saques
- Acompanhamento de lucros/perdas
- Breakdown de status de mercados
- Visualizações de tendências (Recharts)

### 13.2 Módulos de Gerenciamento

| Módulo | Capacidades |
|--------|-------------|
| **Usuários** | Visualizar, banir, adicionar/subtrair saldo, aprovação KYC |
| **Mercados** | Criar, editar, resolver, cancelar mercados |
| **Depósitos** | Aprovar, rejeitar, acompanhar transações |
| **Saques** | Processar, aprovar, rejeitar saques |
| **Suporte** | Gerenciamento de tickets, respostas |
| **Grupos** | Aprovar, rejeitar, cancelar sindicatos |
| **Conteúdo** | Posts de blog, páginas CMS, FAQs |

### 13.3 Sistema de Permissões

| Função | Descrição |
|--------|-----------|
| **Super Admin** | Acesso completo, pode gerenciar permissões |
| **Admin Staff** | Acesso configurável por módulo |

#### Tipos de Permissão

- **Acesso**: `access` (pode visualizar) ou `lock` (não pode acessar)
- **Modo**: `read` (somente visualização) ou `read_write` (visualizar e editar)

### 13.4 Sistema de Notificações

Notificações automatizadas para:

- Solicitações de aprovação de grupos
- Revisões de declaração de resultados
- Verificações KYC
- Atualizações de tickets de suporte

---

## 14. Roadmap

### Fase 1: Fundação (Concluída)

- [x] Arquitetura central da plataforma
- [x] Autenticação e gerenciamento de usuários
- [x] Funcionalidade de trading de mercados
- [x] Painel admin com controles completos
- [x] Suporte multi-idioma

### Fase 2: Grupos Sindicatos (Concluída)

- [x] Criação e gerenciamento de grupos
- [x] Fluxos de entrada/saída de membros
- [x] Fluxo de decisão do gerente
- [x] Sistema de aprovação administrativa
- [x] Declaração e execução de resultados
- [x] Distribuição de pagamentos

### Fase 3: App Mobile (Concluída)

- [x] Aplicações iOS e Android
- [x] Paridade completa de recursos com web
- [x] Capacidade de atualização OTA
- [x] Deploy em lojas de aplicativos

### Fase 4: Melhorias (Planejado)

- [ ] **Prevejo Coin**: Sistema de token nativo
  - Recompensas em token
  - Mecanismos de staking
  - Incentivos de trading

- [ ] **Integração IA**
  - Ferramentas de análise de mercado
  - Assistência em previsões
  - Criação automatizada de mercados

- [ ] **Analytics Avançado**
  - Insights de comportamento de usuários
  - Métricas de performance de mercado
  - Modelagem preditiva

### Fase 5: Expansão (Futuro)

- [ ] Provedores de pagamento adicionais
- [ ] Novas localizações regionais
- [ ] API para integrações de terceiros
- [ ] Soluções white-label

---

## 15. Conclusão

O PREVEJO representa um novo paradigma em mercados de previsão, combinando:

- **Tecnologia Moderna**: Construído em frameworks de ponta (Next.js 16, NestJS 11, React Native 0.81)
- **Inovação Social**: Grupos Sindicatos permitem previsões colaborativas
- **Acessibilidade Global**: Multi-plataforma, multi-idioma, suporte multi-pagamento
- **Segurança Empresarial**: KYC, 2FA e trilhas de auditoria abrangentes
- **Experiência Envolvente**: Mecânicas de gamificação impulsionam retenção de usuários

A plataforma é projetada para escalabilidade, manutenibilidade e desenvolvimento rápido de recursos. Com uma base arquitetural sólida e recursos inovadores como Grupos Sindicatos, o PREVEJO está posicionado para capturar participação de mercado significativa na crescente indústria de mercados de previsão.

---

## Apêndice A: Formato de Resposta da API

Todas as respostas da API seguem um formato padronizado:

```json
{
  "success": true,
  "message": "Operação concluída com sucesso",
  "data": { ... }
}
```

## Apêndice B: Configuração de Ambiente

### Frontend

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL da API Backend |
| `NEXTAUTH_SECRET` | Chave de criptografia de sessão |
| `NEXTAUTH_URL` | URL de callback de autenticação |

### Backend

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Chave de assinatura JWT |
| `STRIPE_SECRET_KEY` | Chave de API do Stripe |
| `PAYPAL_CLIENT_ID` | Credenciais do PayPal |
| `ASAAS_API_KEY` | Chave de API do Asaas |

### Mobile

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | Endpoint da API |
| `EXPO_PUBLIC_APP_ENV` | Ambiente (dev/preview/prod) |

---

## Apêndice C: Visão Geral do Schema do Banco de Dados

### Modelos Principais

```
User ──────────── GroupMember ──────────── Group
  │                                          │
  │                                          │
  ├──── Transaction                   GroupOrder
  │                                          │
  ├──── Purchase ────────── Market ──────────┘
  │                            │
  └──── SupportTicket     MarketOption
```

### Tabelas Principais

| Tabela | Propósito |
|--------|-----------|
| `User` | Contas e perfis de usuários |
| `Market` | Mercados de previsão |
| `MarketOption` | Resultados de mercado (SIM/NÃO) |
| `Purchase` | Negociações individuais |
| `Group` | Grupos sindicatos |
| `GroupMember` | Membros e contribuições do grupo |
| `GroupOrder` | Negociações coletivas |
| `Transaction` | Transações financeiras |
| `AdminNotification` | Alertas administrativos |
| `UserNotification` | Notificações de usuários |

---

**Informações do Documento**

| Campo | Valor |
|-------|-------|
| **Versão** | 2.0 |
| **Última Atualização** | Março 2026 |
| **Autores** | Equipe de Desenvolvimento PREVEJO |
| **Status** | Produção |

---

*Este whitepaper é destinado a stakeholders técnicos e de negócios para entender a arquitetura, recursos e capacidades da plataforma PREVEJO.*
