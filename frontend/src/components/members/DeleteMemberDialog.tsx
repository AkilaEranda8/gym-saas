"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteMember } from "@/hooks/useMembers";
import toast from "react-hot-toast";

interface Props {
  open:      boolean;
  memberId:  string;
  memberName: string;
  onClose:   () => void;
  onDeleted: () => void;
}

export default function DeleteMemberDialog({ open, memberId, memberName, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handle() {
    setLoading(true);
    try {
      await deleteMember(memberId);
      toast.success("Member deleted");
      onDeleted();
      onClose();
    } catch {
      toast.error("Failed to delete member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#f87171]/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#f87171]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#e2e8f0]">Delete Member</h3>
            <p className="text-xs text-[#475569] mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-[#94a3b8] mb-6">
          Are you sure you want to delete <span className="font-semibold text-[#e2e8f0]">{memberName}</span>?
          Their data will be soft-deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#1e293b] rounded-lg text-sm text-[#475569] hover:text-[#e2e8f0] transition-colors">
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#f87171] hover:bg-[#ef4444] flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
