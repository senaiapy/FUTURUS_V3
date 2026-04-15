"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function ClosingSoonMarketsPage() {
  return (
    <MarketFilterPage
      title="Fechando em Breve"
      subtitle="Mercados que encerram nos próximos 3 dias"
      filter="closing-soon"
      emptyMessage="Nenhum mercado fechando em breve"
    />
  );
}
