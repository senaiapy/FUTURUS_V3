"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Users,
  X,
  Info,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  clickUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${(session as any)?.accessToken}`,
    },
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [session, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications", {
        params: { page, limit: 20 },
        ...authHeaders,
      });
      setNotifications(response.data.data || response.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count", authHeaders);
      setUnreadCount(response.data.unreadCount || response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`, {}, authHeaders);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all", {}, authHeaders);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`, authHeaders);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "group_approved":
      case "group_result_approved":
        return <Check className="w-5 h-5 text-emerald-400" />;
      case "group_rejected":
      case "group_result_rejected":
        return <X className="w-5 h-5 text-red-400" />;
      case "group_invite":
        return <Users className="w-5 h-5 text-indigo-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("Agora");
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getNotificationLink = (notification: Notification) => {
    return notification.clickUrl || null;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("Notificações")}</h1>
          {unreadCount > 0 && (
            <p className="text-gray-400 text-sm">
              {unreadCount} {t("não lidas")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:text-white transition-colors"
            title={t("Atualizar")}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <CheckCheck className="w-4 h-4" />
              {t("Marcar todas como lidas")}
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t("Nenhuma notificação")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const content = (
              <div
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  notification.isRead
                    ? "bg-slate-800/30 border-slate-700"
                    : "bg-slate-800 border-indigo-500/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.isRead ? "bg-slate-700" : "bg-indigo-500/20"
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          notification.isRead ? "text-gray-400" : "text-white"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-emerald-400 transition-colors"
                      title={t("Marcar como lida")}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-red-400 transition-colors"
                    title={t("Excluir")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );

            return link ? (
              <Link key={notification.id} href={link} className="block">
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 text-gray-400 rounded-lg disabled:opacity-50 hover:text-white"
          >
            {t("Anterior")}
          </button>
          <span className="px-4 py-2 text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-800 text-gray-400 rounded-lg disabled:opacity-50 hover:text-white"
          >
            {t("Próxima")}
          </button>
        </div>
      )}
    </div>
  );
}
