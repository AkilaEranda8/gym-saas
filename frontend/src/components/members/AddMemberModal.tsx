"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createMember } from "@/hooks/useMembers";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const PLANS = [
  { value: "STANDARD", label: "Standard", price: "Rs. 3,500/mo", color: "#475569" },
  { value: "PREMIUM",  label: "Premium",  price: "Rs. 6,500/mo", color: "#f59e0b" },
  { value: "ELITE",    label: "Elite",    price: "Rs. 12,000/mo", color: "#a855f7" },
];

export default function AddMemberModal({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [plan, setPlan]     = useState("STANDARD");
  const [form, setForm]     = useState({
    firstName: "", lastName: "", email: "", phone: "", nic: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim())     e.email     = "Required";
    if (!form.phone.trim())     e.phone     = "Required";
    else if (!/^07[0-9]{8}$/.test(form.phone)) e.phone = "Format: 07XXXXXXXX";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createMember({ ...form, plan });
      toast.success("Member added successfully!");
      onCreated();
      onClose();
      setForm({ firstName: "", lastName: "", email: "", phone: "", nic: "", notes: "" });
      setPlan("STANDARD");
      setErrors({});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to add member";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#1e293b]">
          <h2 className="text-lg font-semibold text-[#e2e8f0]">Add New Member</h2>
          <button onClick={onClose} className="text-[#475569] hover:text-[#e2e8f0] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs text-[#475569] mb-1 capitalize">
                  {field === "firstName" ? "First Name" : "Last Name"} *
                </label>
                <input
                  className={`w-full bg-[#111827] border rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none transition-colors ${errors[field] ? "border-[#f87171]" : "border-[#1e293b] focus:border-[#f59e0b]"}`}
                  value={form[field]}
                  onChange={(e) => { setForm((p) => ({ ...p, [field]: e.target.value })); setErrors((p) => ({ ...p, [field]: "" })); }}
                />
                {errors[field] && <p className="text-xs text-[#f87171] mt-0.5">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-[#475569] mb-1">Email *</label>
            <input
              type="email"
              className={`w-full bg-[#111827] border rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none transition-colors ${errors.email ? "border-[#f87171]" : "border-[#1e293b] focus:border-[#f59e0b]"}`}
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); }}
            />
            {errors.email && <p className="text-xs text-[#f87171] mt-0.5">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#475569] mb-1">Phone * (07XXXXXXXX)</label>
              <input
                className={`w-full bg-[#111827] border rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none transition-colors ${errors.phone ? "border-[#f87171]" : "border-[#1e293b] focus:border-[#f59e0b]"}`}
                value={form.phone}
                onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: "" })); }}
              />
              {errors.phone && <p className="text-xs text-[#f87171] mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#475569] mb-1">NIC (optional)</label>
              <input
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] transition-colors"
                value={form.nic}
                onChange={(e) => setForm((p) => ({ ...p, nic: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#475569] mb-2">Membership Plan *</label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlan(p.value)}
                  className="border rounded-xl p-3 text-center transition-all"
                  style={{
                    borderColor: plan === p.value ? p.color : "#1e293b",
                    background: plan === p.value ? p.color + "18" : "#111827",
                  }}
                >
                  <div className="font-semibold text-sm" style={{ color: p.color }}>{p.label}</div>
                  <div className="text-xs text-[#475569] mt-0.5">{p.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#475569] mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] transition-colors resize-none"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#1e293b] rounded-lg text-sm text-[#475569] hover:text-[#e2e8f0] hover:border-[#475569] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              style={{ background: "#f59e0b" }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
