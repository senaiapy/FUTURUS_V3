"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { ArrowLeft, ImageIcon, AlertTriangle, Upload } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import api from "@/lib/api";

interface Market {
  id: number;
  question: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export default function CreateGroupPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const marketIdFromUrl = searchParams.get("marketId");

  // Market mode: 'select' = choose existing, 'create' = propose new market
  const [marketMode, setMarketMode] = useState<"select" | "create">(
    marketIdFromUrl ? "select" : "select"
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    marketId: marketIdFromUrl || "",
    isPublic: true,
    minContribution: 10,
    maxContribution: "",
    maxParticipants: "",
    targetLiquidity: 1000,
    managerFeePercent: 2,
    decisionMethod: 0,
  });

  // Proposed market form data
  const [proposedMarket, setProposedMarket] = useState({
    question: "",
    categoryId: "",
    subcategoryId: "",
    description: "",
    image: "",
    endDate: "",
    initialYesPool: 100,
    initialNoPool: 100,
  });

  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchMarkets();
    fetchCategories();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await api.get("/markets", { params: { status: 1, limit: 100 } });
      setMarkets(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch markets:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await api.get(`/subcategories`, { params: { categoryId } });
      setSubcategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      setSubcategories([]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      const response = await api.post("/groups/upload/market-image", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setProposedMarket((prev) => ({ ...prev, image: response.data.url }));
    } catch (error) {
      console.error("Failed to upload image:", error);
      setError(t("Falha ao fazer upload da imagem"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        isPublic: formData.isPublic,
        minContribution: formData.minContribution,
        maxContribution: formData.maxContribution ? parseFloat(formData.maxContribution) : undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        targetLiquidity: formData.targetLiquidity,
        managerFeePercent: formData.managerFeePercent,
        decisionMethod: formData.decisionMethod,
      };

      if (marketMode === "select") {
        payload.marketId = parseInt(formData.marketId);
      } else {
        payload.proposedMarket = {
          question: proposedMarket.question,
          categoryId: parseInt(proposedMarket.categoryId),
          subcategoryId: proposedMarket.subcategoryId
            ? parseInt(proposedMarket.subcategoryId)
            : undefined,
          description: proposedMarket.description || undefined,
          image: proposedMarket.image || undefined,
          endDate: new Date(proposedMarket.endDate).toISOString(),
          initialYesPool: proposedMarket.initialYesPool,
          initialNoPool: proposedMarket.initialNoPool,
        };
      }

      const response = await api.post("/groups", payload, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (marketMode === "create") {
        alert(t("Grupo criado! O mercado proposto precisa de aprovação do administrador."));
      }

      router.push(`/dashboard/groups/${response.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || t("Falha ao criar grupo"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleProposedMarketChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProposedMarket((prev) => ({ ...prev, [name]: value }));

    // Fetch subcategories when category changes
    if (name === "categoryId" && value) {
      fetchSubcategories(parseInt(value));
      setProposedMarket((prev) => ({ ...prev, subcategoryId: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6">
        <Link
          href="/dashboard/groups"
          className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t("Criar Grupo")}</h1>
          <p className="text-gray-400 text-sm">{t("Reúna fundos com outros para apostar juntos")}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t("Nome do Grupo")}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={100}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder={t("Ex: Sindicato Crypto Bulls")}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("Descrição")} <span className="text-gray-500">({t("opcional")})</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder={t("Descreva a estratégia do grupo...")}
          />
        </div>

        {/* Market Selection Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t("Mercado")}</label>
          <div className="flex gap-2 sm:gap-4 mb-4">
            <button
              type="button"
              onClick={() => setMarketMode("select")}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                marketMode === "select"
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-slate-800 border-slate-700 text-gray-400 hover:text-white hover:border-slate-600"
              }`}
            >
              {t("Selecionar Existente")}
            </button>
            <button
              type="button"
              onClick={() => setMarketMode("create")}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                marketMode === "create"
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-slate-800 border-slate-700 text-gray-400 hover:text-white hover:border-slate-600"
              }`}
            >
              {t("Criar Novo Mercado")}
            </button>
          </div>

          {marketMode === "select" ? (
            /* Existing Market Dropdown */
            <select
              name="marketId"
              value={formData.marketId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">{t("Selecione um mercado")}</option>
              {markets.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.question}
                </option>
              ))}
            </select>
          ) : (
            /* New Market Form */
            <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              {/* Warning Banner */}
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-400 text-sm">
                  {t("Mercados propostos precisam de aprovação do administrador antes do grupo ficar ativo.")}
                </p>
              </div>

              {/* Market Question */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Pergunta do Mercado")} *
                </label>
                <input
                  type="text"
                  name="question"
                  value={proposedMarket.question}
                  onChange={handleProposedMarketChange}
                  required={marketMode === "create"}
                  minLength={10}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder={t("Ex: O Bitcoin vai ultrapassar $100k em 2025?")}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Categoria")} *
                </label>
                <select
                  name="categoryId"
                  value={proposedMarket.categoryId}
                  onChange={handleProposedMarketChange}
                  required={marketMode === "create"}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">{t("Selecione uma categoria")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("Subcategoria")}
                  </label>
                  <select
                    name="subcategoryId"
                    value={proposedMarket.subcategoryId}
                    onChange={handleProposedMarketChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="">{t("Selecione uma subcategoria")}</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Market Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Descrição do Mercado")}
                </label>
                <textarea
                  name="description"
                  value={proposedMarket.description}
                  onChange={handleProposedMarketChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder={t("Descreva os critérios de resolução do mercado...")}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Imagem do Mercado")}
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-12 rounded-lg object-cover border border-slate-600"
                    />
                  ) : (
                    <div className="w-20 h-12 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-gray-300 hover:bg-slate-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? t("Enviando...") : t("Escolher Imagem")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("Data de Encerramento")} *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={proposedMarket.endDate}
                  onChange={handleProposedMarketChange}
                  required={marketMode === "create"}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Initial Pools */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("Pool Inicial SIM")}
                  </label>
                  <input
                    type="number"
                    name="initialYesPool"
                    value={proposedMarket.initialYesPool}
                    onChange={handleProposedMarketChange}
                    min={10}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t("Pool Inicial NÃO")}
                  </label>
                  <input
                    type="number"
                    name="initialNoPool"
                    value={proposedMarket.initialNoPool}
                    onChange={handleProposedMarketChange}
                    min={10}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t("Privacidade")}</label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isPublic"
                checked={formData.isPublic}
                onChange={() => setFormData((prev) => ({ ...prev, isPublic: true }))}
                className="text-indigo-500 w-4 h-4"
              />
              <span className="text-white text-sm">{t("Público")}</span>
              <span className="text-gray-400 text-xs">({t("Qualquer um pode entrar")})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isPublic"
                checked={!formData.isPublic}
                onChange={() => setFormData((prev) => ({ ...prev, isPublic: false }))}
                className="text-indigo-500 w-4 h-4"
              />
              <span className="text-white text-sm">{t("Privado")}</span>
              <span className="text-gray-400 text-xs">({t("Apenas por convite")})</span>
            </label>
          </div>
        </div>

        {/* Contribution Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("Contribuição Mínima")} (R$)
            </label>
            <input
              type="number"
              name="minContribution"
              value={formData.minContribution}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("Contribuição Máxima")} (R$)
            </label>
            <input
              type="number"
              name="maxContribution"
              value={formData.maxContribution}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              placeholder={t("Sem limite")}
            />
          </div>
        </div>

        {/* Target & Participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("Meta de Liquidez")} (R$)
            </label>
            <input
              type="number"
              name="targetLiquidity"
              value={formData.targetLiquidity}
              onChange={handleChange}
              required
              min={10}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t("Máx. Participantes")}</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min={2}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              placeholder={t("Ilimitado")}
            />
          </div>
        </div>

        {/* Decision Method */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t("Método de Decisão")}</label>
          <select
            name="decisionMethod"
            value={formData.decisionMethod}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
          >
            <option value={0}>{t("Gerente Decide")}</option>
            <option value={1}>{t("Votação dos Membros")}</option>
          </select>
          <p className="text-gray-400 text-xs mt-2">
            {formData.decisionMethod === 0
              ? t("Você escolherá o resultado da aposta para o grupo")
              : t("Membros votam no resultado, ponderado pela contribuição")}
          </p>
        </div>

        {/* Manager Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t("Taxa do Gerente")} (%)</label>
          <input
            type="number"
            name="managerFeePercent"
            value={formData.managerFeePercent}
            onChange={handleChange}
            min={0}
            max={10}
            step="0.1"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
          />
          <p className="text-gray-400 text-xs mt-2">{t("Sua comissão sobre os ganhos do grupo (0-10%)")}</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? t("Criando...") : t("Criar Grupo")}
        </button>
      </form>
    </div>
  );
}
