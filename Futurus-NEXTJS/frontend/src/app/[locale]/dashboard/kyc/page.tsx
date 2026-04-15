"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function KYCPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [kycStatus, setKycStatus] = useState<number>(0); // 0: none, 1: verified, 2: pending
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    address: "",
    documentType: "id_card",
    documentId: "",
  });
  
  const [files, setFiles] = useState<{
    document_front: File | null;
    document_back: File | null;
    selfie: File | null;
  }>({
    document_front: null,
    document_back: null,
    selfie: null,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchKYC = async () => {
      if (!session) return;
      try {
        const res = await api.get("/users/kyc-data", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        });
        setKycStatus(res.data.kv || 0);
        // If they already have profile data, pre-fill it
        const profile = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        });
        setFormData((prev) => ({
          ...prev,
          firstname: profile.data.firstname || "",
          lastname: profile.data.lastname || "",
          address: profile.data.address || "",
        }));
      } catch (err) {
        console.error("Failed to fetch KYC", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKYC();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.document_front || !files.document_back || !files.selfie) {
       alert(t("Por favor, anexe a frente, o verso e a selfie para continuar."));
       return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("kycData", JSON.stringify(formData));
      fd.append("document_front", files.document_front);
      fd.append("document_back", files.document_back);
      fd.append("selfie", files.selfie);

      await api.post(
        "/users/kyc-submit",
        fd,
        {
          headers: { 
            Authorization: `Bearer ${(session as any).accessToken}`,
            "Content-Type": "multipart/form-data"
          },
        },
      );
      setKycStatus(2); // Set to pending
    } catch (err) {
      console.error("Failed to submit KYC", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 bg-white rounded-3xl" />
        <div className="h-96 bg-white rounded-[40px]" />
      </div>
    );
  }

  if (kycStatus === 1) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 bg-emerald-50 border border-emerald-100 rounded-[40px] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
          <UserCheck className="w-16 h-16 text-emerald-500" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-[#1a1c2d] tracking-tight">
            {t("Conta Verificada")}
          </h1>
          <p className="text-[15px] text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            {t(
              "Sua identidade foi confirmada com sucesso. Agora você tem acesso ilimitado a todas as funcionalidades e limites da plataforma.",
            )}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 py-4 px-8 bg-white border border-slate-100 rounded-[24px] shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#3b5bdb]" />
          <span className="text-[12px] font-black uppercase tracking-widest text-[#1a1c2d]">
            {t("Status: Verificado")}
          </span>
        </div>
      </div>
    );
  }

  if (kycStatus === 2) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="w-32 h-32 bg-amber-50 border border-amber-100 rounded-[40px] flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
          <Clock className="w-16 h-16 text-amber-500" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-[#1a1c2d] tracking-tight">
            {t("Verificação em Andamento")}
          </h1>
          <p className="text-[15px] text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            {t(
              "Recebemos seus documentos! Nossa equipe está analisando as informações fornecidas. Este processo costuma levar entre 24 e 48 horas úteis.",
            )}
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm max-w-sm mx-auto">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            {t("Protocolo de Solicitação")}
          </p>
          <p className="text-lg font-black text-[#1a1c2d]">
            #KYC-{Math.floor(Math.random() * 90000) + 10000}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1a1c2d] tracking-tight">
            {t("Verificação de Identidade")} (KYC)
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {t(
              "Complete sua verificação para aumentar seus limites e garantir a segurança da sua conta.",
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Nome")}
                </label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  {t("Sobrenome")}
                </label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {t("Endereço Completo")}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-[32px] py-5 px-7 text-[#1a1c2d] font-bold focus:outline-none focus:border-[#3b5bdb] focus:bg-white transition-all shadow-inner resize-none"
                required
              />
            </div>

            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                {t("Tipo de Documento")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "id_card", label: t("RG / CNH") },
                  { id: "passport", label: t("Passaporte") },
                  { id: "driving_license", label: t("Doc. Profissional") },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, documentType: type.id })
                    }
                    className={cn(
                      "p-6 rounded-[24px] border transition-all flex flex-col items-center gap-4 text-center group",
                      formData.documentType === type.id
                        ? "bg-[#3b5bdb] border-[#3b5bdb] text-white shadow-lg shadow-[#3b5bdb]/10"
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200",
                    )}
                  >
                    <FileText
                      className={cn(
                        "w-6 h-6",
                        formData.documentType === type.id
                          ? "text-white"
                          : "text-slate-300 group-hover:text-slate-500",
                      )}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {[
                { id: "document_front", label: "Frente do Documento", icon: FileText },
                { id: "document_back", label: "Verso do Documento", icon: FileText },
                { id: "selfie", label: "Selfie com o Documento", icon: UserCheck },
              ].map((field) => (
                <div key={field.id} className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {t(field.label)}
                  </label>
                  <label className="block border-3 border-dashed border-slate-100 rounded-[40px] p-6 text-center group hover:border-[#3b5bdb]/40 hover:bg-slate-50 transition-all cursor-pointer bg-slate-50/30 relative overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFiles(prev => ({ ...prev, [field.id]: e.target.files![0] }));
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <field.icon className={cn(
                        "w-8 h-8 mx-auto mb-3 transition-all",
                        (files as any)[field.id] ? "text-emerald-500 scale-110" : "text-slate-300 group-hover:scale-110 group-hover:text-[#3b5bdb]"
                      )} />
                      <p className={cn(
                        "text-[13px] font-bold mb-1",
                        (files as any)[field.id] ? "text-emerald-600" : "text-[#1a1c2d]"
                      )}>
                        {(files as any)[field.id] ? (files as any)[field.id].name : t("Clique para buscar o arquivo")}
                      </p>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#3b5bdb] hover:bg-[#2f49b5] disabled:bg-slate-200 text-white py-6 rounded-[24px] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-[#3b5bdb]/20 transition-all flex items-center justify-center gap-4 group"
            >
              {submitting ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t("Enviar Solicitação")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1a1c2d] p-10 rounded-[40px] text-white shadow-xl space-y-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[16px] font-black text-white uppercase tracking-wider mb-8">
                {t("Por que verificar?")}
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                    {t("Limites maiores para saques e depósitos diários.")}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                    {t("Proteção adicional contra fraudes e roubo de conta.")}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                    {t("Acesso antecipado a mercados exclusivos e promoções.")}
                  </p>
                </li>
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 flex gap-5">
            <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-[12px] font-black text-amber-900 uppercase tracking-widest mb-1">
                {t("Atenção")}
              </h4>
              <p className="text-[12px] text-amber-800/70 font-bold italic leading-relaxed">
                {t(
                  "Certifique-se de que todas as informações coincidem com o documento enviado para evitar rejeição da sua solicitação.",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
