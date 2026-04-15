"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Upload,
  Save,
  Calendar,
  Tag,
  Layers,
  FileText,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import { Card, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

export default function CreateMarketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    question: "",
    categoryId: "",
    subcategoryId: "",
    tag: "",
    startDate: "",
    endDate: "",
    type: "single",
    yesPool: "0",
    noPool: "0",
    description: "",
    slug: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchCategories = async () => {
      try {
        const res = await api.get("/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [router]);

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([]);
      return;
    }
    const token = localStorage.getItem("admin_token");
    const fetchSubcats = async () => {
      try {
        const res = await api.get(
          `/admin/subcategories?categoryId=${form.categoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSubcategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubcats();
  }, [form.categoryId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadRes = await api.post("/admin/upload/market", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        imageUrl = uploadRes.data.url || uploadRes.data;
      }

      const marketData = {
        question: form.question,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        subcategoryId: form.subcategoryId
          ? Number(form.subcategoryId)
          : undefined,
        tag: form.tag || undefined,
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : undefined,
        endDate: form.endDate
          ? new Date(form.endDate).toISOString()
          : undefined,
        type: form.type,
        yesPool: Number(form.yesPool) || 0,
        noPool: Number(form.noPool) || 0,
        description: form.description || undefined,
        slug: form.slug || undefined,
        image: imageUrl || undefined,
      };

      await api.post("/admin/markets", marketData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/dashboard/markets");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar mercado. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Criar Novo Mercado
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            Configure os detalhes do seu mercado de previsão
          </p>
        </div>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          className="rounded-2xl px-6 h-12"
          onClick={() => router.push("/dashboard/markets")}
        >
          Voltar
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-10 border-white/5 bg-[#141726]/40">
          <div className="space-y-10">
            {/* Image Upload */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="shrink-0">
                <p className="text-sm font-black text-white mb-1">
                  Imagem do Mercado
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Carregue a imagem que representa o mercado
                </p>
              </div>
              <div className="flex-1">
                <label className="relative flex flex-col items-center justify-center w-full h-48 bg-black/20 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-indigo-500/40 transition-all group overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        370×170px • .png, .jpg, .jpeg
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Categoria
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium appearance-none"
                >
                  <option value="">Selecionar Categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141726]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Subcategoria
                </label>
                <select
                  value={form.subcategoryId}
                  onChange={(e) =>
                    handleChange("subcategoryId", e.target.value)
                  }
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium appearance-none"
                >
                  <option value="">Selecione um</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#141726]">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question */}
            <div>
              <label className="block text-sm font-black text-white mb-3">
                Pergunta do Mercado
              </label>
              <textarea
                value={form.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="ex: Quem ganhará a Eleição Presidencial de 2024?"
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium resize-none h-32"
                required
              />
            </div>

            {/* Tag & Slug */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Tag
                </label>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(e) => handleChange("tag", e.target.value)}
                  placeholder="Defina um Tag único"
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="slug-do-mercado"
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Data de Início
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium scheme-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Data de Término
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium scheme-dark"
                  required
                />
              </div>
            </div>

            {/* Type & Pools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Tipo de Mercado
                </label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium appearance-none"
                >
                  <option value="single" className="bg-[#141726]">
                    Único
                  </option>
                  <option value="multiple" className="bg-[#141726]">
                    Múltiplo
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Pool Inicial de Sim
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                    R$
                  </span>
                  <input
                    type="number"
                    value={form.yesPool}
                    onChange={(e) => handleChange("yesPool", e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Pool Inicial de Não
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                    R$
                  </span>
                  <input
                    type="number"
                    value={form.noPool}
                    onChange={(e) => handleChange("noPool", e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 transition-all font-medium"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-black text-white mb-3">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva os detalhes e critérios de resolução do mercado..."
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium resize-none h-40"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={loading}
                className="rounded-2xl px-12 h-14 bg-indigo-600 shadow-xl shadow-indigo-600/30 text-sm"
              >
                Criar Mercado
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
