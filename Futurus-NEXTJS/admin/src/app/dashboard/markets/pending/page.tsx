"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function PendingMarketsPage() {
  return (
    <MarketFilterPage
      title="Pending Resolution"
      subtitle="Mercados aguardando declaração de resultado"
      filter="pending"
      emptyMessage="Nenhum mercado pendente de resolução"
    />
  );
}
