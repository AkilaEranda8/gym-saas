"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateCategory } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props { open: boolean; onClose: () => void; onCreated: () => void; }

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#64748b"];
const ICONS  = ["🏋️","🥤","💊","🍎","👕","🎒","🔧","📦"];

export default function CreateCategoryModal({ open, onClose, onCreated }: Props) {
  const { create, loading } = useCreateCategory();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await create({ name, description: desc || undefined, icon, color });
    if (result) {
      toast.success(`Category "${result.name}" created!`);
      onCreated();
      onClose();
      setName(""); setDesc("");
    } else {
      toast.error("Failed to create category.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">New Category</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category name" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className={`w-9 h-9 text-lg rounded-lg flex items-center justify-center transition-colors
                    ${icon === ic ? "bg-blue-100 ring-2 ring-blue-500" : "bg-slate-100 hover:bg-slate-200"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
            <span className="text-xl">{icon}</span>
            <span className="font-medium text-sm" style={{ color }}>{name || "Category Name"}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
