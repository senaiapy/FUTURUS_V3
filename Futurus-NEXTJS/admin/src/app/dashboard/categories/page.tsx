"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import {
  Tag,
  ArrowLeft,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
  ChevronRight,
  LayoutGrid,
  TrendingUp,
  Activity,
  Trash2,
  X,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/PremiumUI";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState("");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const addCategory = async () => {
    if (!newCat.trim()) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await api.post(
        "/admin/categories",
        { name: newCat },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCategories([res.data, ...categories]);
      setNewCat("");
      setAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.patch(
        `/admin/categories/${id}/status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCategories(
        categories.map((c) =>
          c.id === id ? { ...c, status: c.status === 1 ? 0 : 1 } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
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
              Categorias{" "}
              <Badge variant="info" className="px-3 py-1 text-[10px]">
                {categories.length}
              </Badge>
            </h1>
            <p className="text-slate-500 font-bold mt-1">
              Estrutura de organização global dos mercados
            </p>
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            icon={Plus}
            className="rounded-2xl h-12 px-8 bg-indigo-600 shadow-xl shadow-indigo-600/20"
            onClick={() => setAdding(!adding)}
          >
            {adding ? "CANCELAR" : "NOVA CATEGORIA"}
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
                  Nova Categoria
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
                    Nome da Categoria
                  </label>
                  <input
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white font-black text-sm focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                    placeholder="Ex: Tecnologia, Esportes..."
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full h-14 rounded-[28px] text-xs font-black shadow-lg shadow-indigo-600/10"
                  onClick={addCategory}
                >
                  CRIAR AGORA
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-8 border-white/5 bg-[#141726]/40 shadow-xl space-y-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" /> Visão Geral
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-[28px] bg-black/30 border border-white/5 group">
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">
                    Ativas
                  </p>
                  <p className="text-2xl font-black text-white">
                    {categories.filter((c) => c.status === 1).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <ToggleRight className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-[28px] bg-black/30 border border-white/5 group">
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">
                    Total de Mercados
                  </p>
                  <p className="text-2xl font-black text-white">
                    {categories.reduce(
                      (acc, c) => acc + (c._count?.markets || 0),
                      0,
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
                Precisa de ajuda com a estrutura?
              </p>
              <Button
                variant="secondary"
                className="w-full mt-4 h-12 rounded-2xl text-[10px] font-black"
              >
                DOCUMENTAÇÃO
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Content: Categories List */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141726]/60 border border-white/5 rounded-[32px] py-5 pl-14 pr-8 text-white text-sm focus:outline-none focus:border-indigo-500/40 placeholder:text-slate-600 transition-all font-medium shadow-2xl backdrop-blur-md"
              placeholder="Busque por nome ou slug da categoria..."
            />
          </div>

          <div className="bg-[#141726]/20 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Categoria
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                      Mercados
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                      Status
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-10 py-32 text-center text-slate-600"
                      >
                        <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
                          Carregando Lista
                        </span>
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map((cat) => (
                      <tr
                        key={cat.id}
                        className="group hover:bg-white/1 transition-all"
                      >
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all shrink-0">
                              <Tag className="w-5 h-5 text-slate-600 group-hover:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-base font-black text-white group-hover:text-indigo-100 transition-colors uppercase tracking-tight">
                                {cat.name}
                              </p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-1 opacity-60">
                                /{cat.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-white">
                              {cat._count?.markets || 0}
                            </span>
                            <span className="text-[9px] text-slate-600 font-bold uppercase mt-1">
                              Conectados
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-center">
                          <Badge
                            variant={cat.status === 1 ? "success" : "danger"}
                            className="px-4 py-1.5 rounded-xl uppercase tracking-widest text-[9px]"
                          >
                            {cat.status === 1 ? "ATIVO" : "DESLIGADO"}
                          </Badge>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => toggleStatus(cat.id)}
                              className={cn(
                                "p-2.5 rounded-xl transition-all active:scale-95 group/btn",
                                cat.status === 1
                                  ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white"
                                  : "bg-white/5 text-slate-500 hover:text-white hover:bg-slate-700",
                              )}
                            >
                              {cat.status === 1 ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-indigo-600 transition-all">
                              <Pencil className="w-4.5 h-4.5" />
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-rose-500 transition-all">
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-10 py-32 text-center opacity-30"
                      >
                        <Tag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <span className="text-sm font-black text-slate-600 uppercase tracking-widest">
                          Nenhuma categoria encontrada
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
