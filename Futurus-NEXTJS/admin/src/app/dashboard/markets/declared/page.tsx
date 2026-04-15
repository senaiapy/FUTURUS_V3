"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function DeclaredMarketsPage() {
  return (
    <MarketFilterPage
      title="Declared Markets"
      subtitle="Mercados com resultado declarado"
      filter="declared"
      emptyMessage="Nenhum mercado declarado"
    />
  );
}
