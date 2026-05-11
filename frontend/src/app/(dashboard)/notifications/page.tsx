"use client";
import React, { useState } from "react";
import { Bell, CheckCheck, Send, Radio, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import {
  useNotifications, useMarkRead, useMarkAllRead,
  useSendNotification, useBroadcastNotification,
  NotificationType, NotificationDTO, NOTIFICATION_COLORS,
} from "@/hooks/useNotifications";
import toast from "react-hot-toast";

const TYPES: NotificationType[] = ["INFO", "WARNING", "ALERT", "REMINDER", "SUCCESS"];

function SendModal({ open, onClose, onSent }: { open: boolean; onClose: () => void; onSent: () => void }) {
  const { send, loading: sl } = useSendNotification();
  const { broadcast, loading: bl } = useBroadcastNotification();
  const [mode, setMode]       = useState<"single" | "broadcast">("broadcast");
  const [userId, setUserId]   = useState("");
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [type, setType]       = useState<NotificationType>("INFO");

  if (!open) return null;

  const loading = sl || bl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) { toast.error("Title and message are required."); return; }
    if (mode === "broadcast") {
      const ok = await broadcast({ title, message, type });
      if (ok) { toast.success("Broadcast queued."); onSent(); onClose(); setTitle(""); setMessage(""); }
      else toast.error("Broadcast failed.");
    } else {
      if (!userId) { toast.error("User ID is required for targeted send."); return; }
      const result = await send({ userId, title, message, type });
      if (result) { toast.success("Notification sent."); onSent(); onClose(); setTitle(""); setMessage(""); setUserId(""); }
      else toast.error("Send failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Send Notification</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2">
            {(["broadcast", "single"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors
                  ${mode === m ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {m === "broadcast" ? "📢 Broadcast All" : "🎯 Send to User"}
              </button>
            ))}
          </div>
          {mode === "single" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">User ID (Keycloak)</label>
              <input value={userId} onChange={(e) => setUserId(e.target.value)} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user-uuid..." />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Message *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Notification message..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {mode === "broadcast" ? "Broadcast" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationRow({ n, onRead }: { n: NotificationDTO; onRead: (id: string) => void }) {
  const { bg, icon } = NOTIFICATION_COLORS[n.type];
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${n.read ? "bg-white border-slate-100 opacity-70" : "bg-blue-50/40 border-blue-100"}`}>
      <div className={`text-lg mt-0.5 px-2 py-1 rounded-lg ${bg} flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold ${n.read ? "text-slate-600" : "text-slate-800"}`}>{n.title}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bg}`}>{n.type}</span>
          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
        <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
      </div>
      {!n.read && (
        <button onClick={() => onRead(n.id)}
          className="flex-shrink-0 px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
          Mark read
        </button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [notifPage, setNotifPage] = useState(0);
  const [sendOpen, setSendOpen]   = useState(false);

  const { notifications, totalPages, totalElements, loading, refetch } = useNotifications(notifPage);
  const { mark }    = useMarkRead();
  const { markAll } = useMarkAllRead();

  const handleMarkRead = async (id: string) => {
    await mark(id);
    refetch();
  };

  const handleMarkAll = async () => {
    await markAll();
    toast.success("All marked as read.");
    refetch();
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Notifications" />

      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
              <p className="text-xs text-slate-400">{totalElements} total · {unread} unread</p>
            </div>
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button onClick={handleMarkAll}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 bg-white">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
            <button onClick={() => setSendOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold">
              <Radio className="w-4 h-4" /> Send / Broadcast
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Bell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow key={n.id} n={n} onRead={handleMarkRead} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setNotifPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                  ${notifPage === i ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <SendModal open={sendOpen} onClose={() => setSendOpen(false)} onSent={refetch} />
    </div>
  );
}
