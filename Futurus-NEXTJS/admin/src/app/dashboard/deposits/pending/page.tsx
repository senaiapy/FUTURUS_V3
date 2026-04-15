"use client";

import DepositFilterPage from "@/components/DepositFilterPage";

export default function PendingDepositsPage() {
  return (
    <DepositFilterPage
      title="Depósitos Pendentes"
      subtitle="Depósitos aguardando aprovação do administrador"
      filter="pending"
      emptyMessage="Nenhum depósito pendente"
    />
  );
}
