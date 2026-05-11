"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateLocker, useUpdateLocker, type LockerDTO, type LockerSize, type LockerStatus } from "@/hooks/useLockers";
import toast from "react-hot-toast";

interface Props {
  locker?: LockerDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

const SIZES: LockerSize[] = ["SMALL", "MEDIUM", "LARGE"];

export default function AddLockerModal({ locker, onClose, onSaved }: Props) {
  const { create, loading: creating } = useCreateLocker();
  const { update, loading: updating } = useUpdateLocker();
  const isEdit = !!locker;
  const loading = creating || updating;

  const [lockerNumber, setLockerNumber] = useState("");
  const [size, setSize]                 = useState<LockerSize>("MEDIUM");
  const [monthlyRate, setMonthlyRate]   = useState("");
  const [status, setStatus]             = useState<LockerStatus>("AVAILABLE");

  useEffect(() => {
    if (locker) {
      setLockerNumber(locker.lockerNumber);
      setSize(locker.size);
      setMonthlyRate(String(locker.monthlyRate));
      setStatus(locker.status);
    }
  }, [locker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockerNumber.trim()) { toast.error("Locker number is required"); return; }
    if (!monthlyRate || isNaN(Number(monthlyRate))) { toast.error("Valid monthly rate required"); return; }

    let result;
    if (isEdit) {
      result = await update(locker!.id, { lockerNumber, size, monthlyRate: parseFloat(monthlyRate), status });
    } else {
      result = await create({ lockerNumber, size, monthlyRate: parseFloat(monthlyRate) });
    }

    if (result) {
      toast.success(isEdit ? "Locker updated" : "Locker created");
      onSaved(); onClose();
    } else {
      toast.error(isEdit ? "Failed to update locker" : "Failed to create locker");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{isEdit ? "Edit Locker" : "Add Locker"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Locker Number *</label>
            <input
              value={lockerNumber} onChange={e => setLockerNumber(e.target.value)}
              placeholder="e.g. L-001"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Size</label>
              <select value={size} onChange={e => setSize(e.target.value as LockerSize)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Rate (Rs.)</label>
              <input
                type="number" min="0" step="0.01"
                value={monthlyRate} onChange={e => setMonthlyRate(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as LockerStatus)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-600 rounded-xl text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Locker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
