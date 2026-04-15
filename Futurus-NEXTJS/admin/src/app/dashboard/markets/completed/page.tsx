"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function CompletedMarketsPage() {
  return (
    <MarketFilterPage
      title="Completed Markets"
      subtitle="Mercados finalizados com pagamentos processados"
      filter="completed"
      emptyMessage="Nenhum mercado completado"
    />
  );
}
