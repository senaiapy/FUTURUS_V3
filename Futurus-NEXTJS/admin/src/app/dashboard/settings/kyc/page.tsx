"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  Info,
  ChevronDown,
  Layout,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function AdminKYCSettingPage() {
  const router = useRouter();
  const [kycData, setKycData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchKYC = async () => {
      try {
        const res = await api.get("/admin/kyc-setting", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKycData(res.data.form_data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKYC();
  }, [router]);

  const addField = () => {
    setKycData([
      ...kycData,
      { name: "", type: "text", validation: "required", options: [] },
    ]);
  };

  const removeField = (index: number) => {
    setKycData(kycData.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("admin_token");
    setSaving(true);
    try {
      await api.post(
        "/admin/kyc-setting",
        { form_data: kycData },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
          Carregando Configuração KYC...
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Formulário KYC
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Defina os campos necessários para verificação de identidade
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

      <Card className="p-6 bg-amber-500/5 border-amber-500/10">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-300 italic">
              Configure com Cuidado
            </p>
            <p className="text-xs text-amber-400/60 mt-1 leading-relaxed">
              Os campos definidos aqui serão solicitados ao usuário quando ele
              tentar realizar ações que exijam KYC (como saques acima do
              limite).
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {kycData.map((field, idx) => (
          <Card
            key={idx}
            className="p-6 bg-[#141726]/60 border-white/5 group hover:border-indigo-500/20 transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Nome do Campo
                </label>
                <input
                  value={field.name}
                  onChange={(e) => {
                    const newKyc = [...kycData];
                    newKyc[idx].name = e.target.value;
                    setKycData(newKyc);
                  }}
                  placeholder="Ex: CPF, CNH ou Comprovante"
                  className="w-full bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Tipo
                </label>
                <div className="relative">
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const newKyc = [...kycData];
                      newKyc[idx].type = e.target.value;
                      setKycData(newKyc);
                    }}
                    className="w-full appearance-none bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold cursor-pointer"
                  >
                    <option value="text">Texto</option>
                    <option value="textarea">Área de Texto</option>
                    <option value="file">Arquivo / Foto</option>
                    <option value="number">Número</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Validação
                </label>
                <div className="relative">
                  <select
                    value={field.validation}
                    onChange={(e) => {
                      const newKyc = [...kycData];
                      newKyc[idx].validation = e.target.value;
                      setKycData(newKyc);
                    }}
                    className="w-full appearance-none bg-[#0B0D17] border border-white/5 rounded-2xl py-3 px-4 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold cursor-pointer"
                  >
                    <option value="required">Obrigatório</option>
                    <option value="optional">Opcional</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button
                  variant="danger"
                  className="w-12 h-12 p-0 rounded-2xl border-none bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white"
                  onClick={() => removeField(idx)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <button
          onClick={addField}
          className="w-full py-8 border-2 border-dashed border-white/5 rounded-[32px] text-slate-600 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-white/1 transition-all flex flex-col items-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">
            Adicionar Novo Campo
          </span>
        </button>
      </div>
    </div>
  );
}
