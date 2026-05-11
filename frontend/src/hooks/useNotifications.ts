"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────

export type NotificationType = "INFO" | "WARNING" | "ALERT" | "REMINDER" | "SUCCESS";

export interface NotificationDTO {
  id: string;
  gymId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const NOTIFICATION_COLORS: Record<NotificationType, { bg: string; icon: string }> = {
  INFO:     { bg: "bg-blue-100 text-blue-700",   icon: "ℹ️" },
  WARNING:  { bg: "bg-amber-100 text-amber-700", icon: "⚠️" },
  ALERT:    { bg: "bg-red-100 text-red-700",     icon: "🚨" },
  REMINDER: { bg: "bg-purple-100 text-purple-700", icon: "🔔" },
  SUCCESS:  { bg: "bg-emerald-100 text-emerald-700", icon: "✅" },
};

interface PageResponse<T> { content: T[]; totalPages: number; totalElements: number; }

// ── Hooks ──────────────────────────────────────────────────────

export function useNotifications(page = 0) {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [totalPages, setTotalPages]        = useState(0);
  const [totalElements, setTotalElements]  = useState(0);
  const [loading, setLoading]              = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: PageResponse<NotificationDTO> }>(
        `/notifications?page=${page}&size=20`
      );
      setNotifications(data.data.content);
      setTotalPages(data.data.totalPages);
      setTotalElements(data.data.totalElements);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);
  return { notifications, totalPages, totalElements, loading, refetch: fetch };
}

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: number }>("/notifications/unread-count");
      setCount(data.data ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { count, refetch: fetch };
}

export function useMarkRead() {
  const [loading, setLoading] = useState(false);
  const mark = async (id: string) => {
    setLoading(true);
    try {
      await api.patch(`/notifications/${id}/read`);
      return true;
    } catch { return false; } finally { setLoading(false); }
  };
  return { mark, loading };
}

export function useMarkAllRead() {
  const [loading, setLoading] = useState(false);
  const markAll = async () => {
    setLoading(true);
    try {
      await api.patch("/notifications/read-all");
      return true;
    } catch { return false; } finally { setLoading(false); }
  };
  return { markAll, loading };
}

export function useSendNotification() {
  const [loading, setLoading] = useState(false);
  const send = async (req: {
    userId: string; title: string; message: string;
    type?: NotificationType; actionUrl?: string;
  }) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: NotificationDTO }>("/notifications/send", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { send, loading };
}

export function useBroadcastNotification() {
  const [loading, setLoading] = useState(false);
  const broadcast = async (req: { title: string; message: string; type?: NotificationType }) => {
    setLoading(true);
    try {
      await api.post("/notifications/broadcast", req);
      return true;
    } catch { return false; } finally { setLoading(false); }
  };
  return { broadcast, loading };
}
