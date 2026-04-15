"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Layers,
  Search,
  PlusCircle,
  Tag,
  Pencil,
  CheckCircle2,
  XCircle,
  X,
  Activity,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminSubcategoriesPage() {
  const router = useRouter();
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        api.get("/admin/subcategory", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSubcategories(subRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleSubmit = async () => {
    if (!name.trim() || !categoryId) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(
        "/admin/subcategory/store",
        { name, category_id: categoryId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchData();
      setName("");
      setCategoryId("");
      setAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.post(
        `/admin/subcategory/status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSubcategories(
        subcategories.map((s) =>
          s.id === id ? { ...s, status: s.status === 1 ? 0 : 1 } : s,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubs = subcategories.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Header Section */}
      <div className="flex flex-col lg:row md:items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-2xl bg-[#141726]/40 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center group shrink-0"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-4">
              Subcategorias{" "}
              <Badge variant="info" className="px-3 py-1 text-[10px]">
                {subcategories.length}
              </Badge>
            </h1>
            <p className="text-slate-500 font-bold mt-1">
              Especifique nichos dentro das categorias globais
            </p>
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            icon={PlusCircle}
            className="rounded-2xl h-12 px-8 bg-indigo-600 shadow-xl shadow-indigo-600/20"
            onClick={() => setAdding(!adding)}
          >
            {adding ? "CANCELAR" : "NOVA SUBCATEGORIA"}
          </Button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar: Form & Stats */}
        <div className="lg:col-span-4 space-y-8">
          {adding && (
            <Card className="p-8 border-indigo-500/20 bg-indigo-500/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Nova Subcategoria
                </h3>
                <button
                  onClick={() => setAdding(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Categoria Pai
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Nome
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                    placeholder="Ex: Futebol Europeu"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full h-14 rounded-[28px] text-xs font-black shadow-lg shadow-indigo-600/10"
                  onClick={handleSubmit}
                >
                  ADICIONAR
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-8 border-white/5 bg-[#141726]/40 shadow-xl space-y-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" /> Métricas Atuais
            </h3>

            <div className="space-y-6">
              {[
                {
                  label: "Subcategorias Ativas",
                  value: subcategories.filter((s) => s.status === 1).length,
                  icon: ToggleRight,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "Média por Categoria",
                  value: categories.length
                    ? (subcategories.length / categories.length).toFixed(1)
                    : 0,
                  icon: LayoutGrid,
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10",
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-[28px] bg-black/30 border border-white/5 group"
                >
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-black text-white">
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform",
                      metric.bg,
                    )}
                  >
                    <metric.icon className={cn("w-5 h-5", metric.color)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Content: Subcategories Grid */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141726]/60 border border-white/5 rounded-[32px] py-5 pl-14 pr-8 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium shadow-2xl backdrop-blur-md"
              placeholder="Pesquise por nome ou categoria pai..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-32 text-center text-slate-600">
                <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Carregando Subcategorias
                </span>
              </div>
            ) : filteredSubs.length > 0 ? (
              filteredSubs.map((sub) => (
                <Card
                  key={sub.id}
                  className="p-8 border-white/5 bg-[#141726]/40 hover:bg-[#141726]/60 hover:border-indigo-500/20 transition-all group rounded-[40px] relative overflow-hidden shadow-2xl"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
                          <Tag className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                          {sub.category?.name || "Sem Categoria"}
                        </span>
                      </div>
                      <Badge
                        variant={sub.status === 1 ? "success" : "danger"}
                        className="px-3 py-1 rounded-lg"
                      >
                        {sub.status === 1 ? "ATIVA" : "OFF"}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-indigo-100 transition-colors uppercase tracking-tight">
                      {sub.name}
                    </h3>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-8">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-slate-700" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          Mercados: 0
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(sub.id)}
                          className={cn(
                            "w-10 h-10 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg",
                            sub.status === 1
                              ? "bg-emerald-500/10 text-emerald-500 hover:text-white hover:bg-emerald-600 shadow-emerald-600/10"
                              : "bg-rose-500/10 text-rose-500 hover:text-white hover:bg-rose-600 shadow-rose-600/10",
                          )}
                        >
                          {sub.status === 1 ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Layers className="absolute -bottom-8 -right-8 w-32 h-32 text-white opacity-[0.02] group-hover:scale-110 transition-transform" />
                </Card>
              ))
            ) : (
              <div className="col-span-full py-32 text-center opacity-30">
                <Layers className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
                  Nenhuma subcategoria encontrada
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
