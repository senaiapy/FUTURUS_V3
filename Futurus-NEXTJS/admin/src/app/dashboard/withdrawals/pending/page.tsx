"use client";

import WithdrawalFilterPage from "@/components/WithdrawalFilterPage";

export default function PendingWithdrawalsPage() {
  return (
    <WithdrawalFilterPage
      title="Retiradas Pendentes"
      subtitle="Solicitações de saque aguardando aprovação"
      filter="pending"
      emptyMessage="Nenhuma retirada pendente"
    />
  );
}
