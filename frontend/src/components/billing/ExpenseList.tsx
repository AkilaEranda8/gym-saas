"use client";
import { useState } from "react";
import { ExpenseDTO, ExpenseCategoryDTO, useExpenses } from "@/hooks/useBilling";
import { Plus, Trash2, Receipt } from "lucide-react";

function fmt(lkr: number) {
  return "Rs. " + (lkr / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 });
}

interface Props {
  categories: ExpenseCategoryDTO[];
}

export default function ExpenseList({ categories }: Props) {
  const [from, setFrom]     = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [to, setTo]         = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "", amountLkr: "", expenseDate: new Date().toISOString().split("T")[0],
    categoryId: "", paidBy: "", notes: "",
  });

  const { expenses, loading, create, remove } = useExpenses({ from, to });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      description: form.description,
      amountLkr: Math.round(parseFloat(form.amountLkr) * 100),
      expenseDate: form.expenseDate,
      categoryId: form.categoryId || undefined,
      paidBy: form.paidBy || undefined,
      notes: form.notes || undefined,
    });
    setShowForm(false);
    setForm({ description: "", amountLkr: "", expenseDate: new Date().toISOString().split("T")[0], categoryId: "", paidBy: "", notes: "" });
  };

  const rows = expenses?.content ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-700">Expenses</h3>
          {expenses && <span className="text-xs text-slate-400">({expenses.totalElements})</span>}
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs" />
          <span className="text-slate-400 text-xs">–</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs" />
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
              <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (Rs.) *</label>
              <input required type="number" step="0.01" min="0" value={form.amountLkr}
                onChange={e => setForm(f => ({ ...f, amountLkr: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
              <input required type="date" value={form.expenseDate}
                onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Paid By</label>
              <input value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600">Add</button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-50">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No expenses for this period</div>
        ) : rows.map((e) => (
          <div key={e.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {e.categoryColor && (
                <span className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: e.categoryColor }} />
              )}
              <div>
                <div className="text-sm font-medium text-slate-700">{e.description}</div>
                <div className="text-xs text-slate-400">
                  {e.categoryName && <span className="mr-2">{e.categoryName}</span>}
                  {e.paidBy && <span>by {e.paidBy}</span>}
                  <span className="ml-2">{e.expenseDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">{fmt(e.amountLkr)}</span>
              <button onClick={() => { if (confirm("Delete expense?")) remove(e.id); }}
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
