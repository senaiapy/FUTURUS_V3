"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  History,
  Filter,
} from "lucide-react";
import { Decimal } from "decimal.js";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session) return;
      try {
        const res = await api.get("/transactions", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        });
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [session]);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.details.toLowerCase().includes(search.toLowerCase()) ||
      tx.trx.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Log de Transações")}
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Visualize todo o fluxo financeiro da sua conta, incluindo depósitos, saques e compras.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-100 px-5 py-3 rounded-[20px] w-full md:w-80 shadow-sm focus-within:border-[#3b5bdb] transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("Buscar TRX ou detalhes...")}
              className="bg-transparent border-none outline-none text-[13px] text-slate-600 w-full font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-white border border-slate-100 p-3 rounded-[20px] text-slate-400 hover:text-[#3b5bdb] transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {t("Transação")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {t("Detalhes")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                  {t("Valor")}
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                  {t("Saldo Posterior")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8">
                      <div className="h-6 bg-slate-50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                            tx.trxType === "+"
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-rose-50 text-rose-500",
                          )}
                        >
                          {tx.trxType === "+" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                            {tx.trx}
                          </p>
                          <p className="text-[13px] font-bold text-[#1a1c2d]">
                            {new Date(tx.createdAt).toLocaleDateString()}{" "}
                            {new Date(tx.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[14px] font-medium text-[#1a1c2d]">
                        {tx.details}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span
                        className={cn(
                          "text-[15px] font-black flex items-center justify-end gap-1",
                          tx.trxType === "+"
                            ? "text-emerald-500"
                            : "text-rose-500",
                        )}
                      >
                        {tx.trxType}
                        {t("R$")}
                        {new Decimal(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[14px] font-bold text-[#1a1c2d]">
                        {t("R$")}
                        {new Decimal(tx.postBalance).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <History className="w-16 h-16 text-slate-300" />
                      <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                        {t("Data not found")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
