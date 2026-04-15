"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function DraftMarketsPage() {
  return (
    <MarketFilterPage
      title="Draft Markets"
      subtitle="Mercados em rascunho aguardando publicação"
      filter="draft"
      emptyMessage="Nenhum rascunho encontrado"
    />
  );
}
