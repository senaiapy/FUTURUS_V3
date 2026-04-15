"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function CancelledMarketsPage() {
  return (
    <MarketFilterPage
      title="Cancelled Markets"
      subtitle="Mercados cancelados"
      filter="cancelled"
      emptyMessage="Nenhum mercado cancelado"
    />
  );
}
