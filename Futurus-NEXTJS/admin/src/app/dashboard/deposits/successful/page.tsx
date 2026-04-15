"use client";

import DepositFilterPage from "@/components/DepositFilterPage";

export default function SuccessfulDepositsPage() {
  return (
    <DepositFilterPage
      title="Depósitos com Sucesso"
      subtitle="Depósitos processados com sucesso via gateway automático"
      filter="approved"
      emptyMessage="Nenhum depósito com sucesso"
    />
  );
}
