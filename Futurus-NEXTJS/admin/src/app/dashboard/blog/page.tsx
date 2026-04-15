"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Blog {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  image?: string;
  category?: string;
  author?: string;
  status: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api$/, "");

const getImageUrl = (image?: string) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${API_BASE}${image}`;
};

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "Mercados",
    author: "Admin",
    status: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categories = ["Mercados", "Previsoes", "Analises", "Tutoriais", "Novidades", "Geral"];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await api.get("/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    setForm({
      title: "",
      description: "",
      content: "",
      category: "Mercados",
      author: "Admin",
      status: 1,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      description: blog.description || "",
      content: blog.content || "",
      category: blog.category || "Geral",
      author: blog.author || "Admin",
      status: blog.status,
    });
    setImageFile(null);
    setImagePreview(getImageUrl(blog.image));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Titulo e obrigatorio");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("author", form.author);
      formData.append("status", String(form.status));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingBlog) {
        await api.put(`/admin/blogs/${editingBlog.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/admin/blogs", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      console.error("Failed to save blog", err);
      alert("Erro ao salvar artigo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      await api.delete(`/admin/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (err) {
      console.error("Failed to delete blog", err);
      alert("Erro ao excluir artigo");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem("admin_token");
      await api.post(`/admin/blogs/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Gerenciamento de Blog
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Crie e gerencie artigos para o blog da plataforma
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" />
          Novo Artigo
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-[#141726]/60 border border-white/5 px-5 py-3 rounded-2xl w-full md:w-96">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar artigos..."
          className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-slate-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Blog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#141726]/60 rounded-3xl h-80 border border-white/5" />
          ))
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-[#141726]/60 rounded-3xl border border-white/5 overflow-hidden group hover:border-indigo-500/30 transition-all"
            >
              {/* Image */}
              <div className="aspect-[16/9] bg-slate-900 relative overflow-hidden">
                {blog.image ? (
                  <img
                    src={getImageUrl(blog.image) || ""}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-700" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      blog.status === 1
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    )}
                  >
                    {blog.status === 1 ? "Publicado" : "Rascunho"}
                  </span>
                </div>
                {/* Category */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {blog.category || "Geral"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
                  {blog.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {blog.description || "Sem descricao"}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {blog.views} views
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => openEditModal(blog)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-xl transition-all text-sm font-bold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(blog.id)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      blog.status === 1
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    )}
                    title={blog.status === 1 ? "Despublicar" : "Publicar"}
                  >
                    {blog.status === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-[#141726]/60 rounded-3xl border border-dashed border-white/10">
            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">Nenhum artigo encontrado</p>
            <p className="text-slate-600 text-sm mt-1">Clique em "Novo Artigo" para criar seu primeiro post</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d2e] rounded-3xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {editingBlog ? "Editar Artigo" : "Novo Artigo"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-3">
                  Imagem de Capa
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-[16/9] bg-slate-900/50 rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all overflow-hidden group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Upload className="w-10 h-10 text-slate-600" />
                      <p className="text-sm text-slate-500">Clique para enviar imagem</p>
                      <p className="text-xs text-slate-600">PNG, JPG ou WEBP (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Titulo *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                  placeholder="Digite o titulo do artigo"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Descricao
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                  placeholder="Breve descricao do artigo"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Conteudo
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                  placeholder="Conteudo completo do artigo (suporta HTML)"
                />
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Categoria
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                    placeholder="Nome do autor"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 1 })}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      form.status === 1
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-900/50 text-slate-500 border border-white/10"
                    )}
                  >
                    Publicado
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 0 })}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      form.status === 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-slate-900/50 text-slate-500 border border-white/10"
                    )}
                  >
                    Rascunho
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-white/5 text-slate-400 hover:text-white rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {editingBlog ? "Atualizar" : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
