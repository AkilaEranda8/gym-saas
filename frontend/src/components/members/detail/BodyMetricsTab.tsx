"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { type BodyMetric, useMemberBodyMetrics } from "@/hooks/useMembers";
import toast from "react-hot-toast";

function MetricCard({ label, value, unit, color }: { label: string; value?: number; unit: string; color: string }) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
      <div className="text-xs text-[#475569] mb-1">{label}</div>
      {value != null ? (
        <div className="text-2xl font-bold" style={{ color }}>
          {value.toFixed(1)}<span className="text-sm font-normal text-[#475569] ml-1">{unit}</span>
        </div>
      ) : (
        <div className="text-[#475569]">—</div>
      )}
    </div>
  );
}

function AddMetricForm({ memberId, onAdded }: { memberId: string; onAdded: () => void }) {
  const { addMetric } = useMemberBodyMetrics(memberId);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ weightKg: "", heightCm: "", bodyFatPct: "", muscleMassKg: "", notes: "" });

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!f.weightKg) { toast.error("Weight is required"); return; }
    setSaving(true);
    try {
      await addMetric({
        weightKg:     parseFloat(f.weightKg),
        heightCm:     f.heightCm ? parseFloat(f.heightCm) : null,
        bodyFatPct:   f.bodyFatPct ? parseFloat(f.bodyFatPct) : null,
        muscleMassKg: f.muscleMassKg ? parseFloat(f.muscleMassKg) : null,
        notes:        f.notes || null,
      });
      toast.success("Measurement added!");
      onAdded();
    } catch {
      toast.error("Failed to save measurement");
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] transition-colors";

  return (
    <form onSubmit={submit} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">Add Measurement</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-[#475569] block mb-1">Weight (kg) *</label>
          <input type="number" step="0.1" placeholder="70.0" className={input}
            value={f.weightKg} onChange={(e) => setF((p) => ({ ...p, weightKg: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-[#475569] block mb-1">Height (cm)</label>
          <input type="number" step="0.1" placeholder="175" className={input}
            value={f.heightCm} onChange={(e) => setF((p) => ({ ...p, heightCm: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-[#475569] block mb-1">Body Fat (%)</label>
          <input type="number" step="0.1" placeholder="18.5" className={input}
            value={f.bodyFatPct} onChange={(e) => setF((p) => ({ ...p, bodyFatPct: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs text-[#475569] block mb-1">Muscle Mass (kg)</label>
          <input type="number" step="0.1" placeholder="55" className={input}
            value={f.muscleMassKg} onChange={(e) => setF((p) => ({ ...p, muscleMassKg: e.target.value }))} />
        </div>
      </div>
      <textarea rows={2} placeholder="Notes…" className={`${input} resize-none mb-3`}
        value={f.notes} onChange={(e) => setF((p) => ({ ...p, notes: e.target.value }))} />
      <button type="submit" disabled={saving}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: "#f59e0b" }}>
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Measurement
      </button>
    </form>
  );
}

export default function BodyMetricsTab({ memberId }: { memberId: string }) {
  const { metrics, isLoading, refetch } = useMemberBodyMetrics(memberId);
  const [showForm, setShowForm] = useState(false);

  const latest = metrics[0];
  const chartData = [...metrics].reverse().map((m) => ({
    date: new Date(m.recordedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    weight: m.weightKg,
    bf: m.bodyFatPct,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e2e8f0]">Body Metrics</h3>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Measurement
        </button>
      </div>

      {showForm && (
        <AddMetricForm memberId={memberId} onAdded={() => { refetch(); setShowForm(false); }} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Weight" value={latest?.weightKg} unit="kg" color="#60a5fa" />
        <MetricCard label="BMI" value={latest?.bmi} unit=""
          color={latest?.bmiStatusColor ?? "#34d399"} />
        <MetricCard label="Body Fat" value={latest?.bodyFatPct} unit="%" color="#f59e0b" />
        <MetricCard label="Muscle Mass" value={latest?.muscleMassKg} unit="kg" color="#a855f7" />
      </div>

      {latest?.bmiStatus && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: latest.bmiStatusColor }} />
          <span className="text-sm text-[#e2e8f0]">BMI Status: <strong>{latest.bmiStatus}</strong></span>
        </div>
      )}

      {chartData.length > 1 && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <h4 className="text-xs text-[#475569] mb-4">Weight Trend (Last {chartData.length} records)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#f59e0b" }}
              />
              <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading && <div className="text-center text-[#475569] py-8">Loading metrics…</div>}
      {!isLoading && metrics.length === 0 && !showForm && (
        <div className="text-center text-[#475569] py-8">No measurements recorded yet.</div>
      )}
    </div>
  );
}
