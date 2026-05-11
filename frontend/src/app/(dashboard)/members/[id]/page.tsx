"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMember } from "@/hooks/useMembers";
import MemberHeader from "@/components/members/detail/MemberHeader";
import ProfileTab    from "@/components/members/detail/ProfileTab";
import BodyMetricsTab from "@/components/members/detail/BodyMetricsTab";
import AttendanceTab from "@/components/members/detail/AttendanceTab";
import QRCodeTab     from "@/components/members/detail/QRCodeTab";
import PaymentsTab   from "@/components/members/detail/PaymentsTab";
import WorkoutTab    from "@/components/members/detail/WorkoutTab";
import DeleteMemberDialog from "@/components/members/DeleteMemberDialog";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "profile",    label: "Profile" },
  { id: "payments",   label: "Payments" },
  { id: "body",       label: "Body Metrics" },
  { id: "workout",    label: "Workout" },
  { id: "qr",        label: "QR Code" },
  { id: "attendance", label: "Attendance" },
];

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#0f172a] border-b border-[#1e293b] px-6 py-5">
        <div className="h-4 bg-[#1e293b] rounded w-24 mb-4" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#1e293b] rounded-full" />
          <div className="space-y-2">
            <div className="h-6 bg-[#1e293b] rounded w-48" />
            <div className="h-4 bg-[#1e293b] rounded w-32" />
          </div>
        </div>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-[#111827] border border-[#1e293b] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function MemberDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const router      = useRouter();
  const { member, isLoading, error } = useMember(id);
  const [tab, setTab]         = useState("profile");
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-[#080d16]"><Skeleton /></div>;

  if (error || !member) {
    return (
      <div className="min-h-screen bg-[#080d16] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-[#e2e8f0]">Member Not Found</h2>
          <p className="text-[#475569] mt-2">{error ?? "This member does not exist."}</p>
          <button
            onClick={() => router.push("/members")}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "#f59e0b" }}
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d16]">
      <MemberHeader
        member={member}
        onEdit={() => {}}
        onDelete={() => setShowDelete(true)}
      />

      {/* Tabs */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] px-6">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#f59e0b] text-[#f59e0b]"
                  : "border-transparent text-[#475569] hover:text-[#e2e8f0]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {tab === "profile"    && <ProfileTab member={member} />}
        {tab === "payments"   && <PaymentsTab memberId={member.id} />}
        {tab === "body"       && <BodyMetricsTab memberId={member.id} />}
        {tab === "workout"    && <WorkoutTab member={member} />}
        {tab === "qr"         && <QRCodeTab memberId={member.id} memberName={member.fullName} />}
        {tab === "attendance" && <AttendanceTab memberId={member.id} />}
      </div>

      <DeleteMemberDialog
        open={showDelete}
        memberId={member.id}
        memberName={member.fullName}
        onClose={() => setShowDelete(false)}
        onDeleted={() => router.push("/members")}
      />
    </div>
  );
}
