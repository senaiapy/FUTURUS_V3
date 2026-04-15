"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Target,
  Search,
  Filter,
  Power,
} from "lucide-react";

interface GameTask {
  id: number;
  name: string;
  description: string;
  type: "ONE_TIME" | "DAILY" | "WEEKLY" | "REFERRAL";
  coinReward: number;
  status: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function GameTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState<GameTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<GameTask | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "ONE_TIME" as GameTask["type"],
    coinReward: 100,
    icon: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<GameTask["type"] | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<number | "ALL">("ALL");
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await api.get("/game/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data.tasks || []);
        setPagination(res.data.pagination || pagination);
      } catch (err) {
        console.error("Failed to fetch game tasks:", err);
        // Fallback demo data
        setTasks([
          {
            id: 1,
            name: "Complete Profile",
            description: "Fill in your profile information to get started",
            type: "ONE_TIME",
            coinReward: 100,
            status: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Make First Trade",
            description: "Complete your first prediction market trade",
            type: "ONE_TIME",
            coinReward: 200,
            status: 1,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 3,
            name: "Refer a Friend",
            description: "Invite a friend using your referral code",
            type: "REFERRAL",
            coinReward: 500,
            status: 1,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 4,
            name: "Daily Login",
            description: "Log in to the app daily to earn coins",
            type: "DAILY",
            coinReward: 10,
            status: 1,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: 5,
            name: "Weekly Challenge",
            description: "Complete 5 trades in a week",
            type: "WEEKLY",
            coinReward: 50,
            status: 0,
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 345600000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || task.type === filterType;
    const matchesStatus =
      filterStatus === "ALL" || task.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateTask = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.post("/game/tasks", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCreateModal(false);
      resetForm();
      // Reload tasks
      const tasksRes = await api.get("/game/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasksRes.data.tasks || []);
      alert("Task created successfully!");
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.put(`/game/tasks/${editingTask.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingTask(null);
      setShowCreateModal(false);
      resetForm();
      // Reload tasks
      const tasksRes = await api.get("/game/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasksRes.data.tasks || []);
      alert("Task updated successfully!");
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      await api.delete(`/game/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload tasks
      const tasksRes = await api.get("/game/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasksRes.data.tasks || []);
      alert("Task deleted successfully!");
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    const token = localStorage.getItem("admin_token");
    try {
      await api.patch(`/game/tasks/${id}/status`, {
        status: currentStatus === 1 ? 0 : 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload tasks
      const tasksRes = await api.get("/game/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      console.error("Failed to toggle task status:", err);
      alert("Failed to update task status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "ONE_TIME",
      coinReward: 100,
      icon: "",
    });
  };

  const getTaskTypeLabel = (type: GameTask["type"]) => {
    const labels = {
      ONE_TIME: "One Time",
      DAILY: "Daily",
      WEEKLY: "Weekly",
      REFERRAL: "Referral",
    };
    return labels[type] || type;
  };

  const getTaskTypeColor = (type: GameTask["type"]) => {
    const colors = {
      ONE_TIME: "bg-indigo-600/30 text-indigo-200",
      DAILY: "bg-green-600/30 text-green-200",
      WEEKLY: "bg-amber-600/30 text-amber-200",
      REFERRAL: "bg-purple-600/30 text-purple-200",
    };
    return colors[type] || "bg-slate-600/30 text-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target size={32} />
            <div>
              <h1 className="text-2xl font-bold">Game Tasks</h1>
              <p className="text-indigo-100">Manage gamification tasks and rewards</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
              setEditingTask(null);
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
          >
            <Plus size={20} />
            <span className="font-medium">Create New Task</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as GameTask["type"] | "ALL")}
              className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Types</option>
              <option value="ONE_TIME">One Time</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="REFERRAL">Referral</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))}
              className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-indigo-400" />
              <span className="text-slate-400 text-sm">Total Tasks</span>
            </div>
            <p className="text-3xl font-bold text-white">{tasks.length}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <span className="text-slate-400 text-sm">Active Tasks</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {tasks.filter((t) => t.status === 1).length}
            </p>
          </div>
          <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-8 h-8 text-amber-400" />
              <span className="text-slate-400 text-sm">Total Rewards</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {tasks.reduce((sum, t) => sum + t.coinReward, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-4 text-indigo-200 font-medium">ID</th>
                  <th className="p-4 text-indigo-200 font-medium">Name</th>
                  <th className="p-4 text-indigo-200 font-medium">Description</th>
                  <th className="p-4 text-indigo-200 font-medium">Type</th>
                  <th className="p-4 text-indigo-200 font-medium">Coin Reward</th>
                  <th className="p-4 text-indigo-200 font-medium">Status</th>
                  <th className="p-4 text-indigo-200 font-medium">Created</th>
                  <th className="p-4 text-indigo-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="p-4 text-slate-300 font-mono">{task.id}</td>
                      <td className="p-4 text-white font-medium">{task.name}</td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        {task.description}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(
                            task.type,
                          )}`}
                        >
                          {getTaskTypeLabel(task.type)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-amber-400 font-bold">
                          <Coins size={16} />
                          +{task.coinReward}
                        </span>
                      </td>
                      <td className="p-4">
                        {task.status === 1 ? (
                          <span className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 size={16} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-400">
                            <XCircle size={16} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(task.id, task.status)}
                            className={`p-2 rounded-lg transition-all ${
                              task.status === 1
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                            title={task.status === 1 ? "Deactivate" : "Activate"}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setFormData({
                                name: task.name,
                                description: task.description,
                                type: task.type,
                                coinReward: task.coinReward,
                                icon: task.icon || "",
                              });
                              setEditingTask(task);
                              setShowCreateModal(true);
                            }}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Target size={48} className="text-slate-600" />
                        <p className="text-slate-500 text-lg">No tasks found</p>
                        <p className="text-slate-600">
                          {searchTerm || filterType !== "ALL" || filterStatus !== "ALL"
                            ? "Try adjusting your filters"
                            : "Create your first task to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-slate-400 text-sm">
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} tasks
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  onClick={() => {
                    // Handle pagination
                  }}
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg">
                  {pagination.currentPage}
                </span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  onClick={() => {
                    // Handle pagination
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingTask ? handleUpdateTask() : handleCreateTask();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Enter task name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[100px]"
                  placeholder="Enter task description"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-indigo-200 mb-2">
                    Task Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as GameTask["type"] })}
                    className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="ONE_TIME">One Time</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="REFERRAL">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-indigo-200 mb-2">
                    Coin Reward
                  </label>
                  <input
                    type="number"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Enter coin reward"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-[#0f111a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Enter icon name (e.g., lucide Trophy)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all"
                >
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
