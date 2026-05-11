"use client";
import { useState } from "react";
import {
  useCreateTrainer, type CreateTrainerRequest,
  type TrainerSpecialty, type EmploymentType,
} from "@/hooks/useTrainers";
import { X, Plus } from "lucide-react";

const SPECIALTIES: TrainerSpecialty[] = [
  "YOGA","HIIT","ZUMBA","PILATES","BOXING","SPINNING",
  "STRENGTH","NUTRITION","CARDIO","CROSSFIT","REHABILITATION","PERSONAL_TRAINING","OTHER",
];

interface Props { onClose: () => void; onCreated: () => void; }

export default function AddTrainerModal({ onClose, onCreated }: Props) {
  const { create, loading, error } = useCreateTrainer();
  const [selectedSpecialties, setSelectedSpecialties] = useState<TrainerSpecialty[]>([]);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    bio: "", nic: "",
    experienceYears: 0,
    employmentType: "FULL_TIME" as EmploymentType,
    joinedDate: new Date().toISOString().slice(0, 10),
  });

  const toggleSpecialty = (s: TrainerSpecialty) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecialties.length === 0) return;
    const req: CreateTrainerRequest = {
      ...form,
      specialties: selectedSpecialties,
    };
    const result = await create(req);
    if (result) { onCreated(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h2 className="text-white font-semibold text-lg">Add Trainer</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Full Name *</label>
              <input
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Amal Perera"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Email *</label>
                <input
                  required type="email"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Phone *</label>
                <input
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Employment Type *</label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={form.employmentType}
                  onChange={e => setForm(p => ({ ...p, employmentType: e.target.value as EmploymentType }))}
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Experience (years)</label>
                <input
                  type="number" min={0} max={50}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={form.experienceYears}
                  onChange={e => setForm(p => ({ ...p, experienceYears: +e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">NIC</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={form.nic}
                  onChange={e => setForm(p => ({ ...p, nic: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Joined Date *</label>
                <input
                  type="date" required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  value={form.joinedDate}
                  onChange={e => setForm(p => ({ ...p, joinedDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Bio</label>
              <textarea
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Short description..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-2">
                Specialties * <span className="text-zinc-600">(select at least 1)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selectedSpecialties.includes(s)
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              {selectedSpecialties.length === 0 && (
                <p className="text-red-400 text-xs mt-1">Select at least one specialty</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedSpecialties.length === 0}
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Plus className="w-4 h-4" /> Add Trainer</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
