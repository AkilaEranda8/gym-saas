'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NutritionPlan } from '@/hooks/useNutrition';

interface Props {
  open: boolean;
  plan: NutritionPlan | null;
  onClose: () => void;
  onAssign: (data: object) => Promise<void>;
}

export function AssignNutritionModal({ open, plan, onClose, onAssign }: Props) {
  const [memberId, setMemberId]   = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      const end   = new Date(Date.now() + (plan?.durationWeeks ?? 4) * 7 * 86400000).toISOString().split('T')[0];
      setStartDate(today); setEndDate(end);
      setMemberId(''); setNotes(''); setError(null);
    }
  }, [open, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      await onAssign({ memberId, planId: plan!.id, startDate, endDate: endDate || undefined, notes: notes || undefined });
      onClose();
    } catch (err: any) { setError(err.response?.data?.message ?? 'Failed to assign plan'); }
    finally { setSaving(false); }
  };

  if (!open || !plan) return null;

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-gray-900">Assign Nutrition Plan</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-3 bg-violet-50 text-sm text-violet-700 border-b border-violet-100">
          <span className="font-medium">{plan.name}</span> · {plan.caloriesPerDay} kcal/day
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member ID *</label>
            <input className={inp} value={memberId} onChange={e => setMemberId(e.target.value)} required
              placeholder="Paste member UUID" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="date" className={inp} value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" className={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-violet-600 rounded-xl text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Assigning…' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
