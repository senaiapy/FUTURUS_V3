"use client";

import MarketFilterPage from "@/components/MarketFilterPage";

export default function DisabledMarketsPage() {
  return (
    <MarketFilterPage
      title="Disabled Markets"
      subtitle="Mercados desativados pelo administrador"
      filter="disabled"
      emptyMessage="Nenhum mercado desativado"
    />
  );
}
