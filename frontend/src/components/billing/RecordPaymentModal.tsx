"use client";
import { useState } from "react";
import { RecordPaymentRequest, PaymentType, PaymentMethod, useRecordPayment } from "@/hooks/useBilling";
import { X, Plus, Trash2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_TYPES: PaymentType[] = ["MEMBERSHIP", "PT_SESSION", "SHOP_PURCHASE", "LOCKER", "CLASS_BOOKING", "OTHER"];
const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "CARD", "ONLINE", "BANK_TRANSFER", "PAYHERE", "EZ_CASH", "M_CASH"];

export default function RecordPaymentModal({ onClose, onSuccess }: Props) {
  const { record, loading, error } = useRecordPayment();
  const [memberId, setMemberId]           = useState("");
  const [paymentType, setPaymentType]     = useState<PaymentType>("MEMBERSHIP");
  const [amountLkr, setAmountLkr]         = useState("");
  const [method, setMethod]               = useState<PaymentMethod>("CASH");
  const [discountCode, setDiscountCode]   = useState("");
  const [referenceNo, setReferenceNo]     = useState("");
  const [description, setDescription]     = useState("");
  const [notes, setNotes]                 = useState("");
  const [dueDate, setDueDate]             = useState("");
  const [generateInvoice, setGenerate]    = useState(true);
  const [items, setItems]                 = useState<{ description: string; quantity: number; unitPriceLkr: number }[]>([]);

  const addItem = () => setItems(prev => [...prev, { description: "", quantity: 1, unitPriceLkr: 0 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, val: string | number) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const req: RecordPaymentRequest = {
      memberId, paymentType,
      amountLkr: Math.round(parseFloat(amountLkr) * 100),
      method, generateInvoice,
      discountCode: discountCode || undefined,
      referenceNo: referenceNo || undefined,
      description: description || undefined,
      notes: notes || undefined,
      dueDate: dueDate || undefined,
      items: items.length > 0 ? items.map(it => ({ ...it, unitPriceLkr: Math.round(it.unitPriceLkr * 100) })) : undefined,
    };
    const result = await record(req);
    if (result) { onSuccess(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Member ID *</label>
              <input required value={memberId} onChange={e => setMemberId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="UUID of member" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Payment Type *</label>
              <select required value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method *</label>
              <select required value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (Rs.) *</label>
              <input required type="number" step="0.01" min="0" value={amountLkr}
                onChange={e => setAmountLkr(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discount Code</label>
              <input value={discountCode} onChange={e => setDiscountCode(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Optional" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reference No.</label>
              <input value={referenceNo} onChange={e => setReferenceNo(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Line Items (optional)</span>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="Description" value={it.description}
                  onChange={e => updateItem(i, "description", e.target.value)}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                <input type="number" min="1" value={it.quantity}
                  onChange={e => updateItem(i, "quantity", Number(e.target.value))}
                  className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                <input type="number" step="0.01" placeholder="Unit Rs." value={it.unitPriceLkr}
                  onChange={e => updateItem(i, "unitPriceLkr", Number(e.target.value))}
                  className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                <button type="button" onClick={() => removeItem(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={generateInvoice} onChange={e => setGenerate(e.target.checked)}
              className="rounded text-emerald-500" />
            Generate invoice automatically
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {loading ? "Recording…" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
