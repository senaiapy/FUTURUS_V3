"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Upload,
  Layers,
  Monitor,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";

export default function AdminLogoIconPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [previews, setPreviews] = useState<any>({
    logo: "/logo.png",
    favicon: "/favicon.png",
    logo_dark: "/logo_dark.png",
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleUpload = (type: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev: any) => ({ ...prev, [type]: e.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Carregando Logo e Ícones...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Identidade Visual
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Gerencie o logotipo e favicon do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={Save}
            className="rounded-2xl shadow-indigo-600/20 px-8"
          >
            Salvar Tudo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logo Light */}
        <Card className="p-8 space-y-8 flex flex-col justify-between group overflow-visible">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Logo (Claro)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                PNG ou SVG (Fundo Transparente)
              </p>
            </div>
          </div>

          <div className="relative w-full aspect-video rounded-3xl bg-[#0B0D17] border border-white/5 overflow-hidden flex items-center justify-center group-hover:border-indigo-500/20 transition-all p-8">
            <img
              src={previews.logo}
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              alt="Logo Preview"
            />
            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors pointer-events-none" />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1">
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleUpload("logo", e.target.files[0])
                }
              />
              <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all text-slate-400 font-bold cursor-pointer">
                <Upload className="w-4 h-4" /> Alterar Logo
              </div>
            </label>
            <Button
              variant="danger"
              className="w-14 h-14 p-0 rounded-2xl border-none bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Favicon */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Favicon</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Sugestão: 128x128px
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#0B0D17] border border-white/5">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                <img
                  src={previews.favicon}
                  className="w-8 h-8 object-contain"
                  alt="Favicon Preview"
                />
              </div>
              <div className="flex-1 flex items-center gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      handleUpload("favicon", e.target.files[0])
                    }
                  />
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 font-bold cursor-pointer transition-all">
                    <Upload className="w-4 h-4" /> Alterar
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Logo Dark */}
          <Card className="p-8 space-y-6 bg-slate-100 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Logo (Escuro)
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
                  Para uso em fundos claros
                </p>
              </div>
            </div>
            <div className="w-full h-32 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-6 group-hover:border-indigo-500/40 transition-all">
              <img
                src={previews.logo_dark}
                className="max-w-full max-h-full object-contain"
                alt="Dark Logo Preview"
              />
            </div>
            <label>
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleUpload("logo_dark", e.target.files[0])
                }
              />
              <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-900/5 border border-slate-900/10 hover:bg-slate-900 text-slate-400 hover:text-white font-bold cursor-pointer transition-all">
                <Upload className="w-4 h-4" /> Alterar Logo Dark
              </div>
            </label>
          </Card>
        </div>
      </div>
    </div>
  );
}
