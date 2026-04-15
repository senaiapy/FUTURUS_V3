"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "en" | "pt" | "es";

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Blockchain translations
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Sidebar menu
    "menu.blockchain": "Blockchain",
    "menu.blockchain.dashboard": "Dashboard",
    "menu.blockchain.wallets": "Wallets",
    "menu.blockchain.markets": "Markets",
    "menu.blockchain.transactions": "Transactions",
    "menu.blockchain.statistics": "Statistics",

    // Blockchain Dashboard
    "blockchain.dashboard.title": "Blockchain Dashboard",
    "blockchain.dashboard.subtitle": "Monitor Solana blockchain activity and statistics",
    "blockchain.sync": "Sync All",
    "blockchain.syncing": "Syncing...",
    "blockchain.active": "Active",
    "blockchain.onChain": "On-Chain",
    "blockchain.volume": "Volume",
    "blockchain.totalWallets": "Total Solana Wallets",
    "blockchain.custodial": "Custodial",
    "blockchain.linked": "Linked",
    "blockchain.marketsDeployed": "Markets Deployed",
    "blockchain.activeMarkets": "Active",
    "blockchain.resolvedMarkets": "Resolved",
    "blockchain.totalFutVolume": "Total FUT Volume",
    "blockchain.totalTransactions": "Total Transactions",
    "blockchain.pending": "pending",
    "blockchain.manageWallets": "Manage Wallets",
    "blockchain.manageWalletsDesc": "View and manage user Solana wallets",
    "blockchain.deployMarkets": "Deploy Markets",
    "blockchain.deployMarketsDesc": "Deploy and manage blockchain markets",
    "blockchain.viewTransactions": "View Transactions",
    "blockchain.viewTransactionsDesc": "Browse all blockchain transactions",
    "blockchain.recentTransactions": "Recent Transactions",
    "blockchain.viewAll": "View All",
    "blockchain.txHash": "TX Hash",
    "blockchain.type": "Type",
    "blockchain.user": "User",
    "blockchain.amount": "Amount",
    "blockchain.status": "Status",
    "blockchain.date": "Date",
    "blockchain.noTransactions": "No blockchain transactions yet",
    "blockchain.confirmed": "Confirmed",
    "blockchain.pendingStatus": "Pending",
    "blockchain.failed": "Failed",
    "blockchain.unknown": "Unknown",

    // Wallets page
    "wallets.title": "Solana Wallets",
    "wallets.subtitle": "Manage user Solana wallets and balances",
    "wallets.search": "Search by wallet address, user name, or email...",
    "wallets.walletAddress": "Wallet Address",
    "wallets.futBalance": "FUT Balance",
    "wallets.solBalance": "SOL Balance",
    "wallets.lastSync": "Last Sync",
    "wallets.actions": "Actions",
    "wallets.never": "Never",
    "wallets.noWallets": "No wallets found",
    "wallets.showing": "Showing",
    "wallets.to": "to",
    "wallets.of": "of",
    "wallets.walletsCount": "wallets",
    "wallets.page": "Page",

    // Markets page
    "markets.title": "Blockchain Markets",
    "markets.subtitle": "Deploy and manage on-chain prediction markets",
    "markets.deployMarket": "Deploy Market",
    "markets.search": "Search markets...",
    "markets.allStatus": "All Status",
    "markets.market": "Market",
    "markets.onChainId": "On-Chain ID",
    "markets.futVolume": "FUT Volume",
    "markets.result": "Result",
    "markets.noMarkets": "No blockchain markets found",
    "markets.deployFirst": "Deploy your first market",
    "markets.deployToBlockchain": "Deploy Market to Blockchain",
    "markets.noAvailable": "No markets available for deployment",
    "markets.allDeployed": "All active markets are already deployed",
    "markets.deploy": "Deploy",
    "markets.deploying": "Deploying...",
    "markets.syncFromChain": "Sync from chain",
    "markets.resolveYes": "Resolve YES",
    "markets.resolveNo": "Resolve NO",
    "markets.confirmResolve": "Are you sure you want to resolve this market as",

    // Transactions page
    "transactions.title": "Blockchain Transactions",
    "transactions.subtitle": "View all Solana blockchain transactions",
    "transactions.exportCsv": "Export CSV",
    "transactions.search": "Search by tx hash, user name, or email...",
    "transactions.allTypes": "All Types",
    "transactions.bet": "Bet",
    "transactions.claim": "Claim",
    "transactions.deposit": "Deposit",
    "transactions.withdraw": "Withdraw",
    "transactions.allStatus": "All Status",
    "transactions.noTransactions": "No transactions found",
    "transactions.transactionsCount": "transactions",

    // Stats page
    "stats.title": "Blockchain Statistics",
    "stats.subtitle": "Detailed analytics and insights",
    "stats.7days": "7 Days",
    "stats.30days": "30 Days",
    "stats.90days": "90 Days",
    "stats.totalWallets": "Total Wallets",
    "stats.marketsDeployed": "Markets Deployed",
    "stats.futVolume": "FUT Volume",
    "stats.totalTransactions": "Total Transactions",
    "stats.volumeByDay": "Volume by Day",
    "stats.topMarkets": "Top Markets by Volume",
    "stats.bets": "bets",
    "stats.noVolumeData": "No volume data available",
    "stats.noMarketData": "No market data available",
    "stats.transactionsByType": "Transactions by Type",
    "stats.noTransactionData": "No transaction data available",
  },
  pt: {
    // Sidebar menu
    "menu.blockchain": "Blockchain",
    "menu.blockchain.dashboard": "Painel",
    "menu.blockchain.wallets": "Carteiras",
    "menu.blockchain.markets": "Mercados",
    "menu.blockchain.transactions": "Transações",
    "menu.blockchain.statistics": "Estatísticas",

    // Blockchain Dashboard
    "blockchain.dashboard.title": "Painel Blockchain",
    "blockchain.dashboard.subtitle": "Monitore a atividade e estatísticas da blockchain Solana",
    "blockchain.sync": "Sincronizar Tudo",
    "blockchain.syncing": "Sincronizando...",
    "blockchain.active": "Ativo",
    "blockchain.onChain": "On-Chain",
    "blockchain.volume": "Volume",
    "blockchain.totalWallets": "Total de Carteiras Solana",
    "blockchain.custodial": "Custodial",
    "blockchain.linked": "Vinculada",
    "blockchain.marketsDeployed": "Mercados Implantados",
    "blockchain.activeMarkets": "Ativos",
    "blockchain.resolvedMarkets": "Resolvidos",
    "blockchain.totalFutVolume": "Volume Total de FUT",
    "blockchain.totalTransactions": "Total de Transações",
    "blockchain.pending": "pendentes",
    "blockchain.manageWallets": "Gerenciar Carteiras",
    "blockchain.manageWalletsDesc": "Visualize e gerencie carteiras Solana dos usuários",
    "blockchain.deployMarkets": "Implantar Mercados",
    "blockchain.deployMarketsDesc": "Implante e gerencie mercados blockchain",
    "blockchain.viewTransactions": "Ver Transações",
    "blockchain.viewTransactionsDesc": "Navegue por todas as transações blockchain",
    "blockchain.recentTransactions": "Transações Recentes",
    "blockchain.viewAll": "Ver Todas",
    "blockchain.txHash": "Hash TX",
    "blockchain.type": "Tipo",
    "blockchain.user": "Usuário",
    "blockchain.amount": "Valor",
    "blockchain.status": "Status",
    "blockchain.date": "Data",
    "blockchain.noTransactions": "Nenhuma transação blockchain ainda",
    "blockchain.confirmed": "Confirmada",
    "blockchain.pendingStatus": "Pendente",
    "blockchain.failed": "Falhou",
    "blockchain.unknown": "Desconhecido",

    // Wallets page
    "wallets.title": "Carteiras Solana",
    "wallets.subtitle": "Gerencie carteiras Solana dos usuários e saldos",
    "wallets.search": "Buscar por endereço de carteira, nome ou email...",
    "wallets.walletAddress": "Endereço da Carteira",
    "wallets.futBalance": "Saldo FUT",
    "wallets.solBalance": "Saldo SOL",
    "wallets.lastSync": "Última Sinc.",
    "wallets.actions": "Ações",
    "wallets.never": "Nunca",
    "wallets.noWallets": "Nenhuma carteira encontrada",
    "wallets.showing": "Mostrando",
    "wallets.to": "a",
    "wallets.of": "de",
    "wallets.walletsCount": "carteiras",
    "wallets.page": "Página",

    // Markets page
    "markets.title": "Mercados Blockchain",
    "markets.subtitle": "Implante e gerencie mercados de previsão on-chain",
    "markets.deployMarket": "Implantar Mercado",
    "markets.search": "Buscar mercados...",
    "markets.allStatus": "Todos os Status",
    "markets.market": "Mercado",
    "markets.onChainId": "ID On-Chain",
    "markets.futVolume": "Volume FUT",
    "markets.result": "Resultado",
    "markets.noMarkets": "Nenhum mercado blockchain encontrado",
    "markets.deployFirst": "Implante seu primeiro mercado",
    "markets.deployToBlockchain": "Implantar Mercado na Blockchain",
    "markets.noAvailable": "Nenhum mercado disponível para implantação",
    "markets.allDeployed": "Todos os mercados ativos já estão implantados",
    "markets.deploy": "Implantar",
    "markets.deploying": "Implantando...",
    "markets.syncFromChain": "Sincronizar da chain",
    "markets.resolveYes": "Resolver SIM",
    "markets.resolveNo": "Resolver NÃO",
    "markets.confirmResolve": "Tem certeza que deseja resolver este mercado como",

    // Transactions page
    "transactions.title": "Transações Blockchain",
    "transactions.subtitle": "Veja todas as transações da blockchain Solana",
    "transactions.exportCsv": "Exportar CSV",
    "transactions.search": "Buscar por hash tx, nome do usuário ou email...",
    "transactions.allTypes": "Todos os Tipos",
    "transactions.bet": "Aposta",
    "transactions.claim": "Resgate",
    "transactions.deposit": "Depósito",
    "transactions.withdraw": "Saque",
    "transactions.allStatus": "Todos os Status",
    "transactions.noTransactions": "Nenhuma transação encontrada",
    "transactions.transactionsCount": "transações",

    // Stats page
    "stats.title": "Estatísticas Blockchain",
    "stats.subtitle": "Análises e insights detalhados",
    "stats.7days": "7 Dias",
    "stats.30days": "30 Dias",
    "stats.90days": "90 Dias",
    "stats.totalWallets": "Total de Carteiras",
    "stats.marketsDeployed": "Mercados Implantados",
    "stats.futVolume": "Volume FUT",
    "stats.totalTransactions": "Total de Transações",
    "stats.volumeByDay": "Volume por Dia",
    "stats.topMarkets": "Top Mercados por Volume",
    "stats.bets": "apostas",
    "stats.noVolumeData": "Nenhum dado de volume disponível",
    "stats.noMarketData": "Nenhum dado de mercado disponível",
    "stats.transactionsByType": "Transações por Tipo",
    "stats.noTransactionData": "Nenhum dado de transação disponível",
  },
  es: {
    // Sidebar menu
    "menu.blockchain": "Blockchain",
    "menu.blockchain.dashboard": "Panel",
    "menu.blockchain.wallets": "Billeteras",
    "menu.blockchain.markets": "Mercados",
    "menu.blockchain.transactions": "Transacciones",
    "menu.blockchain.statistics": "Estadísticas",

    // Blockchain Dashboard
    "blockchain.dashboard.title": "Panel Blockchain",
    "blockchain.dashboard.subtitle": "Monitorea la actividad y estadísticas de la blockchain Solana",
    "blockchain.sync": "Sincronizar Todo",
    "blockchain.syncing": "Sincronizando...",
    "blockchain.active": "Activo",
    "blockchain.onChain": "On-Chain",
    "blockchain.volume": "Volumen",
    "blockchain.totalWallets": "Total de Billeteras Solana",
    "blockchain.custodial": "Custodia",
    "blockchain.linked": "Vinculada",
    "blockchain.marketsDeployed": "Mercados Desplegados",
    "blockchain.activeMarkets": "Activos",
    "blockchain.resolvedMarkets": "Resueltos",
    "blockchain.totalFutVolume": "Volumen Total de FUT",
    "blockchain.totalTransactions": "Total de Transacciones",
    "blockchain.pending": "pendientes",
    "blockchain.manageWallets": "Gestionar Billeteras",
    "blockchain.manageWalletsDesc": "Ver y gestionar billeteras Solana de usuarios",
    "blockchain.deployMarkets": "Desplegar Mercados",
    "blockchain.deployMarketsDesc": "Desplegar y gestionar mercados blockchain",
    "blockchain.viewTransactions": "Ver Transacciones",
    "blockchain.viewTransactionsDesc": "Navegar todas las transacciones blockchain",
    "blockchain.recentTransactions": "Transacciones Recientes",
    "blockchain.viewAll": "Ver Todas",
    "blockchain.txHash": "Hash TX",
    "blockchain.type": "Tipo",
    "blockchain.user": "Usuario",
    "blockchain.amount": "Monto",
    "blockchain.status": "Estado",
    "blockchain.date": "Fecha",
    "blockchain.noTransactions": "Sin transacciones blockchain aún",
    "blockchain.confirmed": "Confirmada",
    "blockchain.pendingStatus": "Pendiente",
    "blockchain.failed": "Fallida",
    "blockchain.unknown": "Desconocido",

    // Wallets page
    "wallets.title": "Billeteras Solana",
    "wallets.subtitle": "Gestiona billeteras Solana de usuarios y saldos",
    "wallets.search": "Buscar por dirección de billetera, nombre o email...",
    "wallets.walletAddress": "Dirección de Billetera",
    "wallets.futBalance": "Saldo FUT",
    "wallets.solBalance": "Saldo SOL",
    "wallets.lastSync": "Última Sinc.",
    "wallets.actions": "Acciones",
    "wallets.never": "Nunca",
    "wallets.noWallets": "Ninguna billetera encontrada",
    "wallets.showing": "Mostrando",
    "wallets.to": "a",
    "wallets.of": "de",
    "wallets.walletsCount": "billeteras",
    "wallets.page": "Página",

    // Markets page
    "markets.title": "Mercados Blockchain",
    "markets.subtitle": "Despliega y gestiona mercados de predicción on-chain",
    "markets.deployMarket": "Desplegar Mercado",
    "markets.search": "Buscar mercados...",
    "markets.allStatus": "Todos los Estados",
    "markets.market": "Mercado",
    "markets.onChainId": "ID On-Chain",
    "markets.futVolume": "Volumen FUT",
    "markets.result": "Resultado",
    "markets.noMarkets": "Ningún mercado blockchain encontrado",
    "markets.deployFirst": "Despliega tu primer mercado",
    "markets.deployToBlockchain": "Desplegar Mercado en Blockchain",
    "markets.noAvailable": "Ningún mercado disponible para despliegue",
    "markets.allDeployed": "Todos los mercados activos ya están desplegados",
    "markets.deploy": "Desplegar",
    "markets.deploying": "Desplegando...",
    "markets.syncFromChain": "Sincronizar de chain",
    "markets.resolveYes": "Resolver SÍ",
    "markets.resolveNo": "Resolver NO",
    "markets.confirmResolve": "¿Estás seguro de que quieres resolver este mercado como",

    // Transactions page
    "transactions.title": "Transacciones Blockchain",
    "transactions.subtitle": "Ver todas las transacciones de la blockchain Solana",
    "transactions.exportCsv": "Exportar CSV",
    "transactions.search": "Buscar por hash tx, nombre de usuario o email...",
    "transactions.allTypes": "Todos los Tipos",
    "transactions.bet": "Apuesta",
    "transactions.claim": "Reclamar",
    "transactions.deposit": "Depósito",
    "transactions.withdraw": "Retiro",
    "transactions.allStatus": "Todos los Estados",
    "transactions.noTransactions": "Ninguna transacción encontrada",
    "transactions.transactionsCount": "transacciones",

    // Stats page
    "stats.title": "Estadísticas Blockchain",
    "stats.subtitle": "Análisis e información detallada",
    "stats.7days": "7 Días",
    "stats.30days": "30 Días",
    "stats.90days": "90 Días",
    "stats.totalWallets": "Total de Billeteras",
    "stats.marketsDeployed": "Mercados Desplegados",
    "stats.futVolume": "Volumen FUT",
    "stats.totalTransactions": "Total de Transacciones",
    "stats.volumeByDay": "Volumen por Día",
    "stats.topMarkets": "Top Mercados por Volumen",
    "stats.bets": "apuestas",
    "stats.noVolumeData": "Sin datos de volumen disponibles",
    "stats.noMarketData": "Sin datos de mercado disponibles",
    "stats.transactionsByType": "Transacciones por Tipo",
    "stats.noTransactionData": "Sin datos de transacción disponibles",
  },
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    // Load saved locale from localStorage, default to Portuguese
    const savedLocale = localStorage.getItem("admin_locale") as Locale;
    if (savedLocale && ["en", "pt", "es"].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
    // If no saved locale, keep Portuguese as default (already set in useState)
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("admin_locale", newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || translations["en"][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
