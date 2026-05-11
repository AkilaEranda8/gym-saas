"use client";

import { Calendar, Shield, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { type MemberDetail } from "@/hooks/useMembers";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1e293b] last:border-0">
      <div className="text-[#475569] mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-[#475569]">{label}</div>
        <div className="text-sm text-[#e2e8f0] mt-0.5">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function fmt(d?: string) {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function daysLeft(d?: string) {
  if (!d) return null;
  const n = Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
  if (n < 0) return <span className="text-[#f87171] text-xs">Expired {Math.abs(n)} days ago</span>;
  return <span className={`text-xs ${n <= 7 ? "text-[#f59e0b]" : "text-[#34d399]"}`}>{n} days remaining</span>;
}

export default function ProfileTab({ member }: { member: MemberDetail }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">Membership Details</h3>
        <Row icon={<Calendar className="w-4 h-4" />} label="Joined" value={fmt(member.joinDate)} />
        <Row icon={<Shield className="w-4 h-4" />}   label="Status" value={member.status} />
        <Row icon={<CreditCard className="w-4 h-4" />} label="Member ID" value={member.id} />
        <div className="flex items-start gap-3 py-3 border-b border-[#1e293b]">
          <Calendar className="w-4 h-4 text-[#475569] mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-[#475569]">Expiry Date</div>
            <div className="text-sm text-[#e2e8f0] mt-0.5">{fmt(member.expiryDate) ?? "—"}</div>
            {daysLeft(member.expiryDate)}
          </div>
        </div>
        {member.notes && (
          <div className="pt-3">
            <div className="text-xs text-[#475569] mb-1">Notes</div>
            <p className="text-sm text-[#94a3b8]">{member.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-3">Personal Information</h3>
        <Row icon={<Mail className="w-4 h-4" />}    label="Email"       value={member.email} />
        <Row icon={<Phone className="w-4 h-4" />}   label="Phone"       value={member.phone} />
        <Row icon={<Shield className="w-4 h-4" />}  label="NIC"         value={member.nic} />
        <Row icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={fmt(member.dateOfBirth)} />
        <Row icon={<Shield className="w-4 h-4" />}  label="Gender"      value={member.gender} />
        <Row icon={<MapPin className="w-4 h-4" />}  label="Address"     value={member.address} />
      </div>
    </div>
  );
}
