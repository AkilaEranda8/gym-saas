"use client";

import { useRouter } from "next/navigation";
import { type Member } from "@/hooks/useMembers";
import MemberAvatar from "./MemberAvatar";
import MemberStatusBadge from "./MemberStatusBadge";

interface Props {
  members: Member[];
  isLoading: boolean;
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ExpiryCell({ date }: { date?: string }) {
  if (!date) return <span className="text-[#475569]">—</span>;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  const color = days < 0 ? "#f87171" : days <= 7 ? "#f59e0b" : "#34d399";
  return (
    <div>
      <div className="text-[#e2e8f0] text-sm">{formatDate(date)}</div>
      {days <= 30 && (
        <div className="text-xs" style={{ color }}>
          {days < 0 ? "Expired" : `${days}d left`}
        </div>
      )}
    </div>
  );
}

export default function MemberTable({ members, isLoading }: Props) {
  const router = useRouter();

  if (isLoading) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e293b]">
            {["Member", "Phone", "Status", "Expiry", "Joined"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-[#1e293b]/50">
              {Array.from({ length: 5 }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 bg-[#111827] rounded animate-pulse" style={{ width: j === 0 ? "160px" : "80px" }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#475569]">
        <div className="text-5xl mb-4">👤</div>
        <p className="text-lg font-medium text-[#e2e8f0]">No members found</p>
        <p className="text-sm mt-1">Add a member to get started</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#1e293b]">
          {["Member", "Phone", "Status", "Expiry", "Joined"].map((h) => (
            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr
            key={m.id}
            onClick={() => router.push(`/members/${m.id}`)}
            className="border-b border-[#1e293b]/50 hover:bg-[#111827] transition-colors cursor-pointer group"
          >
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <MemberAvatar name={m.fullName} photoUrl={m.photoUrl} size="sm" />
                <div>
                  <div className="font-medium text-[#e2e8f0] group-hover:text-[#f59e0b] transition-colors">
                    {m.fullName}
                  </div>
                  <div className="text-xs text-[#475569]">{m.email}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[#475569]">{m.phone ?? "—"}</td>
            <td className="px-4 py-3"><MemberStatusBadge status={m.status} /></td>
            <td className="px-4 py-3"><ExpiryCell date={m.expiryDate} /></td>
            <td className="px-4 py-3 text-[#475569]">{formatDate(m.joinDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
