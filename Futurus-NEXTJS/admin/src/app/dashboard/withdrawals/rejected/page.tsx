"use client";

import WithdrawalFilterPage from "@/components/WithdrawalFilterPage";

export default function RejectedWithdrawalsPage() {
  return (
    <WithdrawalFilterPage
      title="Retiradas Rejeitadas"
      subtitle="Solicitações de saque que foram rejeitadas"
      filter="rejected"
      emptyMessage="Nenhuma retirada rejeitada"
    />
  );
}
