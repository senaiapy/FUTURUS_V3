"use client";

import DepositFilterPage from "@/components/DepositFilterPage";

export default function InitiatedDepositsPage() {
  return (
    <DepositFilterPage
      title="Initiated Deposits"
      subtitle="Depósitos iniciados mas ainda não completados"
      filter=""
      emptyMessage="Nenhum depósito iniciado"
    />
  );
}
