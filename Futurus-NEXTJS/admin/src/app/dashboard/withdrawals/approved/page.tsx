"use client";

import WithdrawalFilterPage from "@/components/WithdrawalFilterPage";

export default function ApprovedWithdrawalsPage() {
  return (
    <WithdrawalFilterPage
      title="Approved Withdrawals"
      subtitle="Retiradas aprovadas e processadas com sucesso"
      filter="approved"
      emptyMessage="Nenhuma retirada aprovada"
    />
  );
}
