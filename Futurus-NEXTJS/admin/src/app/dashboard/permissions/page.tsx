"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Eye,
  Pencil,
  X,
  Check,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import api from "@/lib/api";
import { usePermissions, ADMIN_ROUTES, DEFAULT_PERMISSIONS } from "@/contexts/PermissionsContext";
import AccessDenied from "@/components/AccessDenied";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  image?: string;
  status?: number;
}

interface RoutePermission {
  access: "lock" | "access";
  mode: "read" | "read_write";
}

interface PermissionsMap {
  [key: string]: RoutePermission;
}

interface AdminPermission {
  id: number;
  userId: number;
  isActive: boolean;
  permissions: PermissionsMap;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export default function PermissionsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();

  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<AdminPermission | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editPermissions, setEditPermissions] = useState<PermissionsMap>(DEFAULT_PERMISSIONS);
  const [editIsActive, setEditIsActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/");
        return;
      }

      const [permRes, usersRes] = await Promise.all([
        api.get("/admin/permissions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/admin/permissions/available-users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPermissions(Array.isArray(permRes.data) ? permRes.data : []);
      setAvailableUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permissionsLoading && isAdmin) {
      fetchData();
    }
  }, [permissionsLoading, isAdmin]);

  // If not admin, show access denied
  if (!permissionsLoading && !isAdmin) {
    return (
      <AccessDenied
        message="Only super admins can access permissions management"
        showLogout={false}
        showBack={true}
      />
    );
  }

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredPermissions = permissions.filter((p) =>
    p.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      await api.post(
        "/admin/permissions",
        {
          userId: selectedUserId,
          isActive: editIsActive,
          permissions: editPermissions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowAddModal(false);
      setSelectedUserId(null);
      setEditPermissions(DEFAULT_PERMISSIONS);
      setEditIsActive(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      await api.put(
        `/admin/permissions/${selectedPermission.userId}`,
        {
          isActive: editIsActive,
          permissions: editPermissions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowEditModal(false);
      setSelectedPermission(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePermission = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this user from admin access?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      await api.delete(`/admin/permissions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to remove user");
    }
  };

  const handleToggleActive = async (permission: AdminPermission) => {
    try {
      const token = localStorage.getItem("admin_token");
      await api.put(
        `/admin/permissions/${permission.userId}`,
        { isActive: !permission.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const openEditModal = (permission: AdminPermission) => {
    setSelectedPermission(permission);
    setEditPermissions(permission.permissions);
    setEditIsActive(permission.isActive);
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setSelectedUserId(null);
    setEditPermissions(DEFAULT_PERMISSIONS);
    setEditIsActive(false);
    setShowAddModal(true);
  };

  const toggleRouteAccess = (routeKey: string) => {
    setEditPermissions((prev) => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        access: prev[routeKey]?.access === "access" ? "lock" : "access",
      },
    }));
  };

  const toggleRouteMode = (routeKey: string) => {
    setEditPermissions((prev) => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        mode: prev[routeKey]?.mode === "read_write" ? "read" : "read_write",
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Shield className="w-7 h-7 text-indigo-500" />
            User Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage admin panel access for staff members
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      {/* Permissions Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Routes Access
                </th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((perm) => {
                  const accessCount = Object.values(perm.permissions).filter(
                    (p) => p.access === "access"
                  ).length;
                  const writeCount = Object.values(perm.permissions).filter(
                    (p) => p.access === "access" && p.mode === "read_write"
                  ).length;

                  return (
                    <tr
                      key={perm.id}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-indigo-400">
                              {perm.user.username[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-white">{perm.user.username}</p>
                            <p className="text-xs text-slate-500">{perm.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(perm)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all",
                            perm.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          )}
                        >
                          {perm.isActive ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              Locked
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">
                            <span className="font-bold text-indigo-400">{accessCount}</span> routes
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="text-sm text-slate-400">
                            <span className="font-bold text-emerald-400">{writeCount}</span> writable
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(perm)}
                            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                            title="Edit Permissions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermission(perm.userId)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Remove Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No staff members with admin access</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Click &quot;Add Staff Member&quot; to grant admin panel access
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Add Staff Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* User Selection */}
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">
                  Select User
                </label>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-bold text-white">Admin Access</p>
                  <p className="text-xs text-slate-500">Enable or disable admin panel access</p>
                </div>
                <button
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    editIsActive ? "bg-emerald-500" : "bg-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                      editIsActive ? "left-6" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Permissions Table */}
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">
                  Route Permissions
                </label>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="text-left text-xs font-bold text-slate-500 px-4 py-3">
                          Route
                        </th>
                        <th className="text-center text-xs font-bold text-slate-500 px-4 py-3">
                          Access
                        </th>
                        <th className="text-center text-xs font-bold text-slate-500 px-4 py-3">
                          Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ADMIN_ROUTES.map((route) => {
                        const perm = editPermissions[route.key] || DEFAULT_PERMISSIONS[route.key];
                        return (
                          <tr key={route.key} className="border-t border-white/5">
                            <td className="px-4 py-3 text-sm text-white">{route.label}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleRouteAccess(route.key)}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                  perm?.access === "access"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                )}
                              >
                                {perm?.access === "access" ? "Unlocked" : "Locked"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleRouteMode(route.key)}
                                disabled={perm?.access === "lock"}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                  perm?.access === "lock"
                                    ? "bg-slate-700/50 text-slate-600 cursor-not-allowed"
                                    : perm?.mode === "read_write"
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "bg-amber-500/10 text-amber-400"
                                )}
                              >
                                {perm?.mode === "read_write" ? (
                                  <span className="flex items-center gap-1">
                                    <Pencil className="w-3 h-3" />
                                    Read/Write
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    Read Only
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!selectedUserId || saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Permissions</h2>
                <p className="text-xs text-slate-500">{selectedPermission.user.username}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-bold text-white">Admin Access</p>
                  <p className="text-xs text-slate-500">Enable or disable admin panel access</p>
                </div>
                <button
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    editIsActive ? "bg-emerald-500" : "bg-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
                      editIsActive ? "left-6" : "left-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Permissions Table */}
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block">
                  Route Permissions
                </label>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="text-left text-xs font-bold text-slate-500 px-4 py-3">
                          Route
                        </th>
                        <th className="text-center text-xs font-bold text-slate-500 px-4 py-3">
                          Access
                        </th>
                        <th className="text-center text-xs font-bold text-slate-500 px-4 py-3">
                          Mode
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ADMIN_ROUTES.map((route) => {
                        const perm = editPermissions[route.key] || DEFAULT_PERMISSIONS[route.key];
                        return (
                          <tr key={route.key} className="border-t border-white/5">
                            <td className="px-4 py-3 text-sm text-white">{route.label}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleRouteAccess(route.key)}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                  perm?.access === "access"
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                )}
                              >
                                {perm?.access === "access" ? "Unlocked" : "Locked"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleRouteMode(route.key)}
                                disabled={perm?.access === "lock"}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                  perm?.access === "lock"
                                    ? "bg-slate-700/50 text-slate-600 cursor-not-allowed"
                                    : perm?.mode === "read_write"
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "bg-amber-500/10 text-amber-400"
                                )}
                              >
                                {perm?.mode === "read_write" ? (
                                  <span className="flex items-center gap-1">
                                    <Pencil className="w-3 h-3" />
                                    Read/Write
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    Read Only
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermission}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
