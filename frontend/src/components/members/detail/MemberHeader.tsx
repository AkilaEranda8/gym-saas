"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Edit, Trash2, MessageCircle } from "lucide-react";
import { type MemberDetail } from "@/hooks/useMembers";
import MemberAvatar from "../MemberAvatar";
import MemberStatusBadge from "../MemberStatusBadge";

interface Props {
  member:    MemberDetail;
  onEdit:    () => void;
  onDelete:  () => void;
}

export default function MemberHeader({ member, onEdit, onDelete }: Props) {
  const router = useRouter();
  return (
    <div className="bg-[#0f172a] border-b border-[#1e293b] px-6 py-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#475569] hover:text-[#e2e8f0] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Members
      </button>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <MemberAvatar name={member.fullName} photoUrl={member.photoUrl} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-[#e2e8f0]">{member.fullName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <MemberStatusBadge status={member.status} />
              {member.phone && (
                <span className="flex items-center gap-1 text-xs text-[#475569]">
                  <Phone className="w-3 h-3" /> {member.phone}
                </span>
              )}
              <span className="text-xs text-[#475569]">{member.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {member.phone && (
            <a
              href={`https://wa.me/${member.phone.replace(/^0/, "94")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#34d399] border border-[#34d399]/30 hover:bg-[#34d399]/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#60a5fa] border border-[#60a5fa]/30 hover:bg-[#60a5fa]/10 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#f87171] border border-[#f87171]/30 hover:bg-[#f87171]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
