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
  Users,
} from "lucide-react";

interface GameTask {
  id: number;
  name: string;
  description: string;
  type: string;
  coinReward: number;
  status: number;
  createdAt: string;
}

interface GameStats {
  totalTasks: number;
  totalCoinsDistributed: number;
  totalTasksCompleted: number;
  activeUsers: number;
}

export default function GameManagement() {
  const router = useRouter();
  const [tasks, setTasks] = useState<GameTask[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<GameTask | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "ONE_TIME",
    coinReward: 100,
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchGameData = async () => {
      try {
        // Fetch game statistics
        const statsRes = await api.get("/game/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);

        // Fetch tasks
        const tasksRes = await api.get("/game/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasksRes.data.tasks || []);
      } catch (err) {
        console.error("Failed to fetch game data:", err);
        // Fallback demo data
        setStats({
          totalTasks: 3,
          totalCoinsDistributed: 5000,
          totalTasksCompleted: 120,
          activeUsers: 15,
        });
        setTasks([
          {
            id: 1,
            name: "Complete Profile",
            description: "Fill in your profile information to get started",
            type: "ONE_TIME",
            coinReward: 100,
            status: 1,
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Make First Trade",
            description: "Complete your first prediction market trade",
            type: "ONE_TIME",
            coinReward: 200,
            status: 1,
            createdAt: new Date().toISOString(),
          },
          {
            id: 3,
            name: "Refer a Friend",
            description: "Invite a friend using your referral code",
            type: "REFERRAL",
            coinReward: 500,
            status: 1,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [router]);

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
      resetForm();
      // Reload tasks
      const tasksRes = await api.get("/game/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasksRes.data.tasks || []);
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
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "ONE_TIME",
      coinReward: 100,
    });
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
            <Trophy size={32} />
            <div>
              <h1 className="text-2xl font-bold">Game Management</h1>
              <p className="text-indigo-100">Manage tasks, referrals, and gamification features</p>
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Trophy size={24} className="text-white" />
                </div>
                <span className="text-indigo-100 text-sm">Total Tasks</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalTasks}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Coins size={24} className="text-white" />
                </div>
                <span className="text-purple-100 text-sm">Coins Distributed</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalCoinsDistributed}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <span className="text-green-100 text-sm">Tasks Completed</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalTasksCompleted}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users size={24} className="text-white" />
                </div>
                <span className="text-orange-100 text-sm">Active Users</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.activeUsers}</p>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-[#1a1f2e] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target size={24} className="text-indigo-400" />
              Game Tasks
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="p-4 text-indigo-200 font-medium">ID</th>
                  <th className="p-4 text-indigo-200 font-medium">Name</th>
                  <th className="p-4 text-indigo-200 font-medium">Type</th>
                  <th className="p-4 text-indigo-200 font-medium">Coin Reward</th>
                  <th className="p-4 text-indigo-200 font-medium">Status</th>
                  <th className="p-4 text-indigo-200 font-medium">Created</th>
                  <th className="p-4 text-indigo-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-4 text-slate-300">{task.id}</td>
                    <td className="p-4 text-white font-medium">{task.name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-indigo-600/30 text-indigo-200 rounded-full text-sm">
                        {task.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-green-400 font-bold">
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
                          onClick={() => {
                            setFormData({
                              name: task.name,
                              description: task.description,
                              type: task.type,
                              coinReward: task.coinReward,
                            });
                            setEditingTask(task);
                            setShowCreateModal(true);
                          }}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-all"
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
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-2">
                  Task Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
