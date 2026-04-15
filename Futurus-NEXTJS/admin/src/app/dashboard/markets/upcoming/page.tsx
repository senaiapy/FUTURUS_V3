"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function UpcomingMarketsPage() {
  return (
    <MarketFilterPage
      title="Upcoming Markets"
      subtitle="Mercados programados para iniciar em breve"
      filter="upcoming"
      emptyMessage="Nenhum mercado próximo encontrado"
    />
  );
}
