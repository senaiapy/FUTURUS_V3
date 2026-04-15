"use client";

import DepositFilterPage from "@/components/DepositFilterPage";

export default function RejectedDepositsPage() {
  return (
    <DepositFilterPage
      title="Depósitos Rejeitados"
      subtitle="Depósitos que foram rejeitados pelo administrador"
      filter="rejected"
      emptyMessage="Nenhum depósito rejeitado"
    />
  );
}
