"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Cookie,
  Save,
  Info,
  ShieldCheck,
  ToggleLeft as Toggle,
  Layout,
  FileText,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function AdminCookiePolicyPage() {
  const router = useRouter();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchPolicy = async () => {
      try {
        const res = await api.get("/admin/cookie-policy", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPolicy(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [router]);

  const handleSave = async () => {
    const token = localStorage.getItem("admin_token");
    setSaving(true);
    try {
      await api.post("/admin/cookie-policy", policy, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Success alert
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Política de Cookies...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Privacidade & Cookies
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Gerencie o aviso de consentimento e termos de privacidade
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            onClick={handleSave}
            className="rounded-2xl shadow-indigo-600/20 px-8"
          >
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-8 space-y-8 bg-[#141726]/80 backdrop-blur-md overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Cookie className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Status do Aviso
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
                  Exibir banner de cookies no frontend
                </p>
              </div>
            </div>
            <div
              onClick={() =>
                setPolicy({ ...policy, status: policy.status === 1 ? 0 : 1 })
              }
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${policy.status === 1 ? "bg-indigo-600" : "bg-slate-800"}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-lg transition-all transform ${policy.status === 1 ? "translate-x-6" : "translate-x-0"}`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Título do Modal
              </label>
              <input
                value={policy?.title || "Nós usamos cookies"}
                onChange={(e) =>
                  setPolicy({ ...policy, title: e.target.value })
                }
                className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Conteúdo/Política (HTML)
              </label>
              <div className="relative group p-1 rounded-[32px] bg-linear-to-b from-white/10 to-transparent border border-white/5 transition-all">
                <textarea
                  value={policy?.short_desc || ""}
                  onChange={(e) =>
                    setPolicy({ ...policy, short_desc: e.target.value })
                  }
                  className="w-full bg-[#0B0D17] border-none rounded-[30px] py-6 px-8 text-white text-sm focus:outline-none min-h-[300px] leading-relaxed font-medium placeholder:font-bold placeholder:text-slate-700"
                  placeholder="Descreva aqui sua política de cookies e privacidade..."
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-indigo-500/5 border-indigo-500/10 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">
              Conformidade LGPD
            </h4>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              Garantir que os usuários tenham ciência e dêem consentimento ao
              uso de cookies é fundamental para estar em conformidade com as
              leis de proteção de dados.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
