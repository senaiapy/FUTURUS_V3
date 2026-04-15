"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function LiveMarketsPage() {
  return (
    <MarketFilterPage
      title="Live Markets"
      subtitle="Mercados ativos recebendo apostas agora"
      filter="live"
      emptyMessage="Nenhum mercado ativo no momento"
    />
  );
}
