"use client";
import { useState } from "react";
import { DiscountDTO, DiscountType, useDiscounts } from "@/hooks/useBilling";
import { Plus, Tag, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";

function fmtValue(d: DiscountDTO) {
  return d.discountType === "PERCENTAGE" ? `${d.discountValue}%` : `Rs. ${(d.discountValue / 100).toFixed(2)}`;
}

export default function DiscountManager() {
  const { discounts, loading, create, toggle, remove } = useDiscounts();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discountType: "PERCENTAGE" as DiscountType,
    discountValue: "", maxUses: "", validFrom: "", validUntil: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      code: form.code, description: form.description || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      validFrom: form.validFrom, validUntil: form.validUntil || undefined,
    });
    setShowForm(false);
    setForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", maxUses: "", validFrom: "", validUntil: "" });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-700">Discounts</h3>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Discount
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="SUMMER20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
              <select required value={form.discountType}
                onChange={e => setForm(f => ({ ...f, discountType: e.target.value as DiscountType }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed (Rs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Value *</label>
              <input required type="number" step="0.01" min="0" value={form.discountValue}
                onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Max Uses</label>
              <input type="number" min="1" value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Unlimited" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valid From *</label>
              <input required type="date" value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valid Until</label>
              <input type="date" value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Create
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-50">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No discounts created</div>
        ) : discounts.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-700">{d.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                d.isActive && !d.isExpired ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                {d.isExpired ? "Expired" : d.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-xs text-slate-500">{fmtValue(d)}</span>
              <span className="text-xs text-slate-400">{d.usedCount}{d.maxUses ? `/${d.maxUses}` : ""} uses</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(d.id)} className="text-slate-400 hover:text-emerald-600 transition-colors">
                {d.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => { if (confirm("Delete discount?")) remove(d.id); }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
