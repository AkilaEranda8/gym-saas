"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { UserPlus, Users, TrendingUp, Clock, AlertTriangle, Download } from "lucide-react";
import Header from "@/components/Header";
import { useMembers, useMemberStats, deleteMember, type Member } from "@/hooks/useMembers";
import AddMemberModal from "@/components/members/AddMemberModal";
import api from "@/lib/axios";
import { ClientSideTable } from "@/components/table/client-side-table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { TableActionsRow } from "@/components/table/table-actions-row";

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value?: number; color: string }) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#e2e8f0]">{value ?? "—"}</div>
        <div className="text-xs text-[#475569]">{label}</div>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  EXPIRING:  "bg-amber-500/10 text-amber-400 border-amber-500/30",
  EXPIRED:   "bg-red-500/10 text-red-400 border-red-500/30",
  SUSPENDED: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  INACTIVE:  "bg-gray-500/10 text-gray-400 border-gray-500/30",
};

export default function MembersPage() {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading, refetch } = useMembers({ page: 0, size: 500 });
  const { stats } = useMemberStats();

  const members = data?.content ?? [];

  function exportCsv() {
    api.get("/members/export", { responseType: "blob" }).then((r) => {
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url; a.download = "members.csv"; a.click();
    });
  }

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[row.original.status] ?? ""}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "joinDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ row }) => new Date(row.original.joinDate).toLocaleDateString(),
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
      cell: ({ row }) => row.original.expiryDate ? new Date(row.original.expiryDate).toLocaleDateString() : "—",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <TableActionsRow
          showAction={{ action: () => router.push(`/members/${row.original.id}`), tooltip: "View" }}
          deleteAction={{
            action: async () => {
              if (confirm(`Delete ${row.original.fullName}?`)) {
                await deleteMember(row.original.id);
                refetch();
              }
            },
            tooltip: "Delete",
          }}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d16]">
      <Header title="Members" />
      <div className="p-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Users className="w-5 h-5" />}         label="Total Members"      value={stats?.totalMembers}     color="#a855f7" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />}    label="Active"             value={stats?.activeMembers}    color="#34d399" />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Expiring This Week" value={stats?.expiringThisWeek} color="#f59e0b" />
          <StatCard icon={<Clock className="w-5 h-5" />}         label="Checked In Today"   value={stats?.checkedInToday}   color="#60a5fa" />
        </div>

        {/* Table */}
        <ClientSideTable
          data={members}
          columns={columns}
          pageCount={Math.ceil(members.length / 20)}
          isLoading={isLoading}
          searchableColumns={[
            { id: "fullName", title: "Name"  },
            { id: "email",    title: "Email" },
            { id: "phone",    title: "Phone" },
          ]}
          filterableColumns={[
            {
              id: "status",
              title: "Status",
              options: [
                { label: "Active",    value: "ACTIVE"    },
                { label: "Expiring",  value: "EXPIRING"  },
                { label: "Expired",   value: "EXPIRED"   },
                { label: "Suspended", value: "SUSPENDED" },
                { label: "Inactive",  value: "INACTIVE"  },
              ],
            },
          ]}
          customButtons={[
            {
              text: "Export",
              function: exportCsv,
              icon: <Download className="w-4 h-4" />,
            },
            {
              text: "Add Member",
              function: () => setShowAdd(true),
              icon: <UserPlus className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      <AddMemberModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={refetch} />
    </div>
  );
}
