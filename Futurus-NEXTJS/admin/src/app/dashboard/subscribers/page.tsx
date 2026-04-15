"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Mail,
  Search,
  Filter,
  Download,
  Trash2,
  Send,
  UserCheck,
  Calendar,
} from "lucide-react";
import { Card, Button } from "@/components/ui/PremiumUI";

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<
    { id: number; email: string; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchSubscribers = async () => {
      try {
        const res = await api.get("/admin/subscribers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscribers(res.data.subscribers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, [router]);

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Inscritos...
        </p>
      </div>
    );

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Inscritos na Newsletter
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Gerencie os e-mails captados para marketing e avisos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Download}
            className="rounded-2xl border-none bg-white/5"
          >
            Exportar CSV
          </Button>
          <Button
            variant="primary"
            icon={Send}
            className="rounded-2xl shadow-indigo-600/20"
          >
            Enviar E-mail Geral
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-indigo-500/5 border-indigo-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Total Inscritos
              </p>
              <p className="text-2xl font-black text-white">
                {subscribers.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-emerald-500/5 border-emerald-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Hoje
              </p>
              <p className="text-2xl font-black text-white">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-amber-500/5 border-amber-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Mês Atual
              </p>
              <p className="text-2xl font-black text-white">428</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-[#141726]/60">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar por e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3.5 px-11 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold"
            />
          </div>
          <Button
            variant="secondary"
            icon={Filter}
            className="rounded-2xl border-none bg-white/5 h-[52px] px-6"
          >
            Filtrar
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-visible border-none bg-transparent">
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <Card
                key={s.id}
                className="p-6 hover:translate-x-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                      <Mail className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">
                        {s.email}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Inscrito em:{" "}
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="w-10 h-10 p-0 rounded-xl bg-white/5 border-none"
                    >
                      <Send className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="danger"
                      className="w-10 h-10 p-0 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border-none transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-500 font-bold">
                Nenhum inscrito encontrado
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
import { Clock } from "lucide-react";
