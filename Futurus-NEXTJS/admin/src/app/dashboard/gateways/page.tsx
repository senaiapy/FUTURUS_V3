"use client";

import { CreditCard, Wallet, Plus, Edit, Trash2, Settings, X, Check, QrCode, Banknote } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const t = (s: string) => s;

interface Gateway {
  id: number;
  code: number;
  name: string;
  alias: string;
  status: number;
  gatewayParameters?: string;
  currencies?: GatewayCurrency[];
}

interface GatewayCurrency {
  id: number;
  methodCode: number;
  name: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  fixedCharge: number;
  percentCharge: number;
  rate: number;
  gatewayParameter?: string;
}

interface WithdrawMethod {
  id: number;
  name: string;
  status: number;
  minLimit: number;
  maxLimit: number;
  fixedCharge: number;
  percentCharge: number;
  currency: string;
}

export default function GatewaysPage() {
  const [activeTab, setActiveTab] = useState<"automatic" | "manual">("automatic");
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [manualMethods, setManualMethods] = useState<WithdrawMethod[]>([]);
  const [gatewayCurrencies, setGatewayCurrencies] = useState<GatewayCurrency[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddGatewayModal, setShowAddGatewayModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<GatewayCurrency | null>(null);

  // Form states
  const [configForm, setConfigForm] = useState<any>({
    api_key: "",
    mode: "sandbox",
    client_id: "",
    client_secret: "",
    publishable_key: "",
    secret_key: "",
  });
  const [currencyForm, setCurrencyForm] = useState({
    name: "",
    currency: "BRL",
    minAmount: "10",
    maxAmount: "50000",
    fixedCharge: "0",
    percentCharge: "2",
    rate: "1",
  });
  const [methodForm, setMethodForm] = useState({
    name: "",
    minLimit: "50",
    maxLimit: "10000",
    fixedCharge: "0",
    percentCharge: "1",
    currency: "BRL",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [autoRes, manualRes, currRes] = await Promise.all([
        api.get("/admin/gateways/automatic"),
        api.get("/admin/gateways/manual"),
        api.get("/admin/gateways/currencies"),
      ]);
      setGateways(autoRes.data || []);
      setManualMethods(manualRes.data || []);
      setGatewayCurrencies(currRes.data || []);
    } catch (err) {
      console.error("Failed to fetch gateways:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGatewayStatus = async (id: number, currentStatus: number) => {
    try {
      await api.patch(`/admin/gateways/automatic/${id}/status`, {
        status: currentStatus === 1 ? 0 : 1,
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle gateway status:", err);
    }
  };

  const toggleMethodStatus = async (id: number, currentStatus: number) => {
    try {
      await api.patch(`/admin/gateways/manual/${id}/status`, {
        status: currentStatus === 1 ? 0 : 1,
      });
      fetchData();
    } catch (err) {
      console.error("Failed to toggle method status:", err);
    }
  };

  const openConfigModal = (gateway: Gateway) => {
    setSelectedGateway(gateway);
    // Find the currency for this gateway
    const currency = gatewayCurrencies.find(c => c.methodCode === gateway.code);
    setSelectedCurrency(currency || null);

    // Parse existing config based on gateway type
    if (currency?.gatewayParameter) {
      try {
        const params = JSON.parse(currency.gatewayParameter);

        // Asaas gateways
        if (gateway.code === 127 || gateway.code === 128) {
          setConfigForm({
            api_key: params.api_key || "",
            mode: params.mode || "sandbox",
          });
        }
        // PayPal gateway
        else if (gateway.code === 201) {
          setConfigForm({
            client_id: params.client_id || "",
            client_secret: params.client_secret || "",
            mode: params.mode || "sandbox",
          });
        }
        // Stripe gateway
        else if (gateway.code === 202) {
          setConfigForm({
            publishable_key: params.publishable_key || "",
            secret_key: params.secret_key || "",
          });
        }
      } catch {
        setConfigForm({
          api_key: "",
          mode: "sandbox",
          client_id: "",
          client_secret: "",
          publishable_key: "",
          secret_key: "",
        });
      }
    }

    if (currency) {
      setCurrencyForm({
        name: currency.name || "",
        currency: currency.currency || "BRL",
        minAmount: String(currency.minAmount || "10"),
        maxAmount: String(currency.maxAmount || "50000"),
        fixedCharge: String(currency.fixedCharge || "0"),
        percentCharge: String(currency.percentCharge || "2"),
        rate: String(currency.rate || "1"),
      });
    }

    setShowConfigModal(true);
  };

  const saveGatewayConfig = async () => {
    if (!selectedGateway) return;

    try {
      setSaving(true);

      // Build gateway parameter based on gateway type
      let gatewayParameter = "";

      if (selectedGateway.code === 127 || selectedGateway.code === 128) {
        // Asaas gateways
        gatewayParameter = JSON.stringify({
          api_key: configForm.api_key,
          mode: configForm.mode,
        });
      } else if (selectedGateway.code === 201) {
        // PayPal gateway
        gatewayParameter = JSON.stringify({
          client_id: configForm.client_id,
          client_secret: configForm.client_secret,
          mode: configForm.mode,
        });
      } else if (selectedGateway.code === 202) {
        // Stripe gateway
        gatewayParameter = JSON.stringify({
          publishable_key: configForm.publishable_key,
          secret_key: configForm.secret_key,
        });
      }

      if (selectedCurrency) {
        // Update existing currency
        await api.patch(`/admin/gateways/currencies/${selectedCurrency.id}`, {
          name: currencyForm.name,
          currency: currencyForm.currency,
          minAmount: parseFloat(currencyForm.minAmount),
          maxAmount: parseFloat(currencyForm.maxAmount),
          fixedCharge: parseFloat(currencyForm.fixedCharge),
          percentCharge: parseFloat(currencyForm.percentCharge),
          rate: parseFloat(currencyForm.rate),
          gatewayParameter,
        });
      } else {
        // Create new currency for this gateway
        await api.post("/admin/gateways/currencies", {
          methodCode: selectedGateway.code,
          name: currencyForm.name || selectedGateway.name,
          currency: currencyForm.currency,
          symbol: "R$",
          minAmount: parseFloat(currencyForm.minAmount),
          maxAmount: parseFloat(currencyForm.maxAmount),
          fixedCharge: parseFloat(currencyForm.fixedCharge),
          percentCharge: parseFloat(currencyForm.percentCharge),
          rate: parseFloat(currencyForm.rate),
          gatewayParameter,
        });
      }

      setShowConfigModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save gateway config:", err);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const addAsaasGateway = async (type: "pix" | "card") => {
    try {
      setSaving(true);

      const code = type === "pix" ? 127 : 128;
      const name = type === "pix" ? "Asaas PIX" : "Asaas Credit Card";
      const alias = type === "pix" ? "AsaasPix" : "AsaasCard";

      // Check if gateway already exists
      const existing = gateways.find(g => g.code === code);
      if (existing) {
        alert(`${name} gateway already exists!`);
        return;
      }

      // Create gateway
      await api.post("/admin/gateways/automatic", {
        code,
        name,
        alias,
        status: 1,
        crypto: 0,
        gatewayParameters: JSON.stringify({ api_key: "", mode: "sandbox" }),
      });

      // Create default currency
      await api.post("/admin/gateways/currencies", {
        methodCode: code,
        name,
        currency: "BRL",
        symbol: "R$",
        minAmount: 10,
        maxAmount: 50000,
        fixedCharge: 0,
        percentCharge: type === "pix" ? 1.5 : 3.5,
        rate: 1,
        gatewayParameter: JSON.stringify({ api_key: "", mode: "sandbox" }),
      });

      setShowAddGatewayModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to add gateway:", err);
      alert("Failed to add gateway");
    } finally {
      setSaving(false);
    }
  };

  const addPayPalGateway = async () => {
    try {
      setSaving(true);

      const code = 201;
      const name = "PayPal";
      const alias = "PayPal";

      // Check if gateway already exists
      const existing = gateways.find(g => g.code === code);
      if (existing) {
        alert(`${name} gateway already exists!`);
        return;
      }

      // Create gateway
      await api.post("/admin/gateways/automatic", {
        code,
        name,
        alias,
        status: 1,
        crypto: 0,
        gatewayParameters: JSON.stringify({ client_id: "", client_secret: "", mode: "sandbox" }),
      });

      // Create default currency
      await api.post("/admin/gateways/currencies", {
        methodCode: code,
        name,
        currency: "USD",
        symbol: "$",
        minAmount: 5,
        maxAmount: 10000,
        fixedCharge: 0,
        percentCharge: 2.9,
        rate: 1,
        gatewayParameter: JSON.stringify({ client_id: "", client_secret: "", mode: "sandbox" }),
      });

      setShowAddGatewayModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to add PayPal gateway:", err);
      alert("Failed to add PayPal gateway");
    } finally {
      setSaving(false);
    }
  };

  const addStripeGateway = async () => {
    try {
      setSaving(true);

      const code = 202;
      const name = "Stripe";
      const alias = "Stripe";

      // Check if gateway already exists
      const existing = gateways.find(g => g.code === code);
      if (existing) {
        alert(`${name} gateway already exists!`);
        return;
      }

      // Create gateway
      await api.post("/admin/gateways/automatic", {
        code,
        name,
        alias,
        status: 1,
        crypto: 0,
        gatewayParameters: JSON.stringify({ publishable_key: "", secret_key: "" }),
      });

      // Create default currency
      await api.post("/admin/gateways/currencies", {
        methodCode: code,
        name,
        currency: "USD",
        symbol: "$",
        minAmount: 5,
        maxAmount: 10000,
        fixedCharge: 0,
        percentCharge: 2.9,
        rate: 1,
        gatewayParameter: JSON.stringify({ publishable_key: "", secret_key: "" }),
      });

      setShowAddGatewayModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to add Stripe gateway:", err);
      alert("Failed to add Stripe gateway");
    } finally {
      setSaving(false);
    }
  };

  const addWithdrawMethod = async (type: "pix" | "transfer") => {
    try {
      setSaving(true);

      const name = type === "pix" ? "PIX Withdraw" : "Bank Transfer";

      await api.post("/admin/gateways/manual", {
        name,
        minLimit: parseFloat(methodForm.minLimit),
        maxLimit: parseFloat(methodForm.maxLimit),
        fixedCharge: parseFloat(methodForm.fixedCharge),
        percentCharge: parseFloat(methodForm.percentCharge),
        currency: methodForm.currency,
        status: 1,
        rate: 1,
      });

      setShowAddMethodModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to add method:", err);
      alert("Failed to add withdraw method");
    } finally {
      setSaving(false);
    }
  };

  const getGatewayIcon = (alias: string, code: number) => {
    if (alias?.toLowerCase().includes("pix")) {
      return <QrCode className="w-5 h-5 text-emerald-400" />;
    } else if (alias?.toLowerCase().includes("card")) {
      return <CreditCard className="w-5 h-5 text-blue-400" />;
    } else if (code === 201) {
      // PayPal
      return <Wallet className="w-5 h-5 text-blue-500" />;
    } else if (code === 202) {
      // Stripe
      return <CreditCard className="w-5 h-5 text-purple-400" />;
    }
    return <Banknote className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="min-h-screen">
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("Payment Gateways")}
          </h1>
          <p className="text-slate-400">
            {t("Manage payment gateways (Asaas, PayPal, Stripe) and withdrawal methods")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("automatic")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "automatic"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span>{t("Automatic Gateways")}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span>{t("Withdraw Methods")}</span>
            </div>
          </button>
        </div>

        {/* Add New Button */}
        <div className="mb-6">
          <button
            onClick={() => activeTab === "automatic" ? setShowAddGatewayModal(true) : setShowAddMethodModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>
              {activeTab === "automatic" ? t("Add Asaas Gateway") : t("Add Withdraw Method")}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-white/5">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">{t("Loading...")}</p>
          </div>
        ) : activeTab === "automatic" ? (
          <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-white/5">
            {gateways.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t("No Gateways Configured")}</h3>
                <p className="text-slate-400 mb-6">{t("Add Asaas PIX or Credit Card gateway to start accepting payments")}</p>
                <button
                  onClick={() => setShowAddGatewayModal(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {t("Add Gateway")}
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      {t("Gateway")}
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      {t("Code")}
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      {t("Limits")}
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      {t("Charges")}
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      {t("Status")}
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      {t("Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gateways.map((gateway) => {
                    const currency = gatewayCurrencies.find(c => c.methodCode === gateway.code);
                    const hasConfig = currency?.gatewayParameter && JSON.parse(currency.gatewayParameter).api_key;

                    return (
                      <tr
                        key={gateway.id}
                        className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-white">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              gateway.alias?.toLowerCase().includes("pix")
                                ? "bg-emerald-500/20"
                                : gateway.code === 201
                                ? "bg-blue-500/20"
                                : gateway.code === 202
                                ? "bg-purple-500/20"
                                : "bg-blue-500/20"
                            }`}>
                              {getGatewayIcon(gateway.alias || "", gateway.code)}
                            </div>
                            <div>
                              <span className="font-semibold block">{gateway.name}</span>
                              <span className="text-xs text-slate-500">{gateway.alias}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          <span className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">
                            {gateway.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {currency ? (
                            <div className="text-sm">
                              <div>Min: R$ {currency.minAmount}</div>
                              <div>Max: R$ {currency.maxAmount}</div>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {currency ? (
                            <div className="text-sm">
                              <div>Fixed: R$ {currency.fixedCharge}</div>
                              <div>Percent: {currency.percentCharge}%</div>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                gateway.status === 1
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {gateway.status === 1 ? t("Active") : t("Inactive")}
                            </span>
                            {!hasConfig && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                                {t("Not Configured")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openConfigModal(gateway)}
                              className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-colors"
                              title={t("Configure")}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleGatewayStatus(gateway.id, gateway.status)}
                              className={`p-2 rounded-lg transition-colors ${
                                gateway.status === 1
                                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                  : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                              }`}
                              title={gateway.status === 1 ? t("Disable") : t("Enable")}
                            >
                              {gateway.status === 1 ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {manualMethods.length === 0 ? (
              <div className="col-span-full bg-slate-800/50 rounded-2xl p-12 text-center border border-white/5">
                <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t("No Withdraw Methods")}</h3>
                <p className="text-slate-400 mb-6">{t("Add PIX or Bank Transfer withdrawal methods")}</p>
                <button
                  onClick={() => setShowAddMethodModal(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {t("Add Method")}
                </button>
              </div>
            ) : (
              manualMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        method.name?.toLowerCase().includes("pix")
                          ? "bg-emerald-500/20"
                          : "bg-blue-500/20"
                      }`}>
                        {method.name?.toLowerCase().includes("pix") ? (
                          <QrCode className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Banknote className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {method.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleMethodStatus(method.id, method.status)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        method.status === 1
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      {method.status === 1 ? t("Active") : t("Inactive")}
                    </button>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Min Amount")}:</span>
                      <span className="text-white font-semibold">
                        R$ {method.minLimit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Max Amount")}:</span>
                      <span className="text-white font-semibold">
                        R$ {method.maxLimit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Fixed Charge")}:</span>
                      <span className="text-white font-semibold">
                        R$ {method.fixedCharge}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t("Percent Charge")}:</span>
                      <span className="text-white font-semibold">
                        {method.percentCharge}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      <span>{t("Edit")}</span>
                    </button>
                    <button className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      <span>{t("Delete")}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Configuration Modal */}
      {showConfigModal && selectedGateway && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {t("Configure")} {selectedGateway.name}
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* API Configuration - Varies by gateway type */}
              <div className="space-y-4">
                {(selectedGateway.code === 127 || selectedGateway.code === 128) && (
                  <>
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                      {t("Asaas API Configuration")}
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("API Key")}
                      </label>
                      <input
                        type="text"
                        value={configForm.api_key || ""}
                        onChange={(e) => setConfigForm({ ...configForm, api_key: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="$aact_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("Mode")}
                      </label>
                      <select
                        value={configForm.mode || "sandbox"}
                        onChange={(e) => setConfigForm({ ...configForm, mode: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="sandbox">{t("Sandbox (Testing)")}</option>
                        <option value="production">{t("Production (Live)")}</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedGateway.code === 201 && (
                  <>
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                      {t("PayPal API Configuration")}
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("Client ID")}
                      </label>
                      <input
                        type="text"
                        value={configForm.client_id || ""}
                        onChange={(e) => setConfigForm({ ...configForm, client_id: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="AXu..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("Client Secret")}
                      </label>
                      <input
                        type="password"
                        value={configForm.client_secret || ""}
                        onChange={(e) => setConfigForm({ ...configForm, client_secret: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="EO..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("Mode")}
                      </label>
                      <select
                        value={configForm.mode || "sandbox"}
                        onChange={(e) => setConfigForm({ ...configForm, mode: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="sandbox">{t("Sandbox (Testing)")}</option>
                        <option value="live">{t("Live (Production)")}</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedGateway.code === 202 && (
                  <>
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                      {t("Stripe API Configuration")}
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("Publishable Key")}
                      </label>
                      <input
                        type="text"
                        value={configForm.publishable_key || ""}
                        onChange={(e) => setConfigForm({ ...configForm, publishable_key: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        {t("Secret Key")}
                      </label>
                      <input
                        type="password"
                        value={configForm.secret_key || ""}
                        onChange={(e) => setConfigForm({ ...configForm, secret_key: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="sk_test_..."
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Currency Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                  {t("Payment Settings")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t("Min Amount")}
                    </label>
                    <input
                      type="number"
                      value={currencyForm.minAmount}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, minAmount: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t("Max Amount")}
                    </label>
                    <input
                      type="number"
                      value={currencyForm.maxAmount}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, maxAmount: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t("Fixed Charge")} (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currencyForm.fixedCharge}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, fixedCharge: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t("Percent Charge")} (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currencyForm.percentCharge}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, percentCharge: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Webhook Info */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                <h4 className="text-sm font-bold text-amber-400 mb-2">{t("Webhook URL")}</h4>
                <p className="text-xs text-slate-400 mb-2">
                  {(selectedGateway.code === 127 || selectedGateway.code === 128)
                    ? t("Configure this URL in your Asaas dashboard to receive payment notifications:")
                    : selectedGateway.code === 201
                    ? t("Configure this URL in your PayPal Developer Dashboard:")
                    : selectedGateway.code === 202
                    ? t("Configure this URL in your Stripe Dashboard (Webhooks):")
                    : t("Configure this webhook URL in your payment provider dashboard:")}
                </p>
                <code className="block bg-slate-800 px-3 py-2 rounded text-emerald-400 text-xs break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}
                  {(selectedGateway.code === 127 || selectedGateway.code === 128)
                    ? "/api/asaas/ipn"
                    : selectedGateway.code === 201
                    ? "/api/paypal/ipn"
                    : selectedGateway.code === 202
                    ? "/api/stripe/webhook"
                    : "/api/webhook"}
                </code>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-white/5">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={saveGatewayConfig}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? t("Saving...") : t("Save Configuration")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Gateway Modal */}
      {showAddGatewayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-white">
                {t("Add Payment Gateway")}
              </h2>
              <button
                onClick={() => setShowAddGatewayModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400 text-sm">
                {t("Select a payment gateway to add:")}
              </p>

              {/* Asaas Gateways */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("Asaas (Brazilian)")}
                </h3>
                <button
                  onClick={() => addAsaasGateway("pix")}
                  disabled={saving || gateways.some(g => g.code === 127)}
                  className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-bold">Asaas PIX</h3>
                      <p className="text-emerald-400 text-sm">{t("Instant payments via PIX")}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => addAsaasGateway("card")}
                  disabled={saving || gateways.some(g => g.code === 128)}
                  className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-bold">Asaas Credit Card</h3>
                      <p className="text-blue-400 text-sm">{t("Credit/Debit card payments")}</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* International Gateways */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t("International")}
                </h3>
                <button
                  onClick={addPayPalGateway}
                  disabled={saving || gateways.some(g => g.code === 201)}
                  className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-bold">PayPal</h3>
                      <p className="text-blue-400 text-sm">{t("Accept PayPal payments worldwide")}</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={addStripeGateway}
                  disabled={saving || gateways.some(g => g.code === 202)}
                  className="w-full p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-bold">Stripe</h3>
                      <p className="text-purple-400 text-sm">{t("Global card processing platform")}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Withdraw Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">
                {t("Add Withdraw Method")}
              </h2>
              <button
                onClick={() => setShowAddMethodModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-400 text-sm">
                {t("Select the type of withdrawal method to add:")}
              </p>
              <button
                onClick={() => addWithdrawMethod("pix")}
                disabled={saving}
                className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold">PIX Withdraw</h3>
                    <p className="text-emerald-400 text-sm">{t("Instant PIX withdrawals")}</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => addWithdrawMethod("transfer")}
                disabled={saving}
                className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold">Bank Transfer</h3>
                    <p className="text-blue-400 text-sm">{t("TED/DOC bank transfers")}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
