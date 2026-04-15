"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/routing";
import { Bell, Check, CheckCheck, X, Users, AlertCircle, Info } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  imageUrl?: string;
  clickUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!session) return;
      try {
        const res = await api.get("/notifications/unread-count", {
          headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        });
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [session]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await api.get("/notifications?limit=10", {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setNotifications(res.data.data);
      setUnreadCount(res.data.meta.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id: number) => {
    if (!session) return;
    try {
      await api.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!session) return;
    try {
      await api.patch("/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "group_approved":
        return <Check className="w-4 h-4 text-emerald-400" />;
      case "group_rejected":
        return <X className="w-4 h-4 text-rose-400" />;
      case "group_invite":
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("Just now");
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 relative cursor-pointer hover:bg-blue-600/20 transition-all border border-blue-400/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white">{t("Notifications")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("Mark all read")}
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">{t("No notifications")}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                    !notification.isRead && "bg-blue-600/5"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  {notification.clickUrl ? (
                    <Link
                      href={notification.clickUrl}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <NotificationContent
                        notification={notification}
                        getNotificationIcon={getNotificationIcon}
                        formatTime={formatTime}
                      />
                    </Link>
                  ) : (
                    <NotificationContent
                      notification={notification}
                      getNotificationIcon={getNotificationIcon}
                      formatTime={formatTime}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/5">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium text-center block"
              >
                {t("View all notifications")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationContent({
  notification,
  getNotificationIcon,
  formatTime,
}: {
  notification: Notification;
  getNotificationIcon: (type: string) => React.ReactNode;
  formatTime: (dateStr: string) => string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate">
            {notification.title}
          </p>
          <span className="text-[10px] text-slate-500 flex-shrink-0">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
