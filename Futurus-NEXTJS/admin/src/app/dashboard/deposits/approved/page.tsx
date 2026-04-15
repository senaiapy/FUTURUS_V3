"use client";

import DepositFilterPage from "@/components/DepositFilterPage";

export default function ApprovedDepositsPage() {
  return (
    <DepositFilterPage
      title="Approved Deposits"
      subtitle="Depósitos aprovados e creditados com sucesso"
      filter="approved"
      emptyMessage="Nenhum depósito aprovado"
    />
  );
}
