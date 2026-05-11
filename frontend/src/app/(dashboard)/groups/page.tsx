"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users2, Plus, X, Save, Loader2,
  Search, UserPlus, UserMinus, Hash,
} from "lucide-react";
import Header from "@/components/Header";
import api from "@/lib/axios";
import {
  useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup,
  useGroupMembers, type MemberGroup, type GroupRequest,
} from "@/hooks/useGroups";
import { ClientSideTable } from "@/components/table/client-side-table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { TableActionsRow } from "@/components/table/table-actions-row";

const COLORS = [
  "#6366f1","#f59e0b","#22c55e","#3b82f6","#ef4444",
  "#a78bfa","#ec4899","#14b8a6","#f97316","#8b5cf6",
];

interface MemberOption { id: string; fullName: string; }


/* ── Group Form Modal ───────────────────────────────────────── */
function GroupFormModal({ initial, onClose, onSaved }: {
  initial?: MemberGroup | null; onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [name, setName]   = useState(initial?.name ?? "");
  const [desc, setDesc]   = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [err, setErr]     = useState<string | null>(null);

  const { create, loading: creating } = useCreateGroup(onSaved);
  const { update, loading: updating } = useUpdateGroup(onSaved);
  const saving = creating || updating;

  const submit = async () => {
    if (!name.trim()) { setErr("Name is required"); return; }
    const req: GroupRequest = { name: name.trim(), description: desc || undefined, color };
    try {
      if (isEdit) await update(initial!.id, req);
      else        await create(req);
    } catch { setErr("Failed to save group"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
          <h2 className="font-bold text-[#e2e8f0]">{isEdit ? "Edit Group" : "New Group"}</h2>
          <button onClick={onClose} className="p-1.5 text-[#475569] hover:text-[#e2e8f0]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-[#475569] mb-1 block">Group Name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]"
              placeholder="e.g. Morning Batch" />
          </div>
          <div>
            <label className="text-xs text-[#475569] mb-1 block">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] resize-none"
              placeholder="Optional description..." />
          </div>
          <div>
            <label className="text-xs text-[#475569] mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>
        <div className="p-5 border-t border-[#1e293b] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#475569] hover:text-[#e2e8f0]">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="px-5 py-2 text-sm font-medium bg-[#f59e0b] text-black rounded-lg hover:bg-[#fbbf24] disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm ─────────────────────────────────────────── */
function DeleteConfirm({ group, onClose, onDeleted }: { group: MemberGroup; onClose: () => void; onDeleted: () => void; }) {
  const { deleteGroup, loading } = useDeleteGroup(onDeleted);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-[#e2e8f0] mb-2">Delete Group?</h3>
        <p className="text-sm text-[#94a3b8] mb-6">
          "<span className="text-[#e2e8f0]">{group.name}</span>" will be removed.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#475569] hover:text-[#e2e8f0]">Cancel</button>
          <button onClick={() => deleteGroup(group.id)} disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-[#ef4444] text-white rounded-lg hover:bg-red-500 disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Manage Members Modal ───────────────────────────────────── */
function ManageMembersModal({ group, onClose }: { group: MemberGroup; onClose: () => void; }) {
  const { memberIds, loading, refetch } = useGroupMembers(group.id);
  const [allMembers, setAllMembers] = useState<MemberOption[]>([]);
  const [search, setSearch]         = useState("");
  const [adding, setAdding]         = useState(false);
  const [removing, setRemoving]     = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: { content: any[] } }>("/members?size=200")
      .then(r => setAllMembers((r.data.data?.content ?? []).map((m: any) => ({ id: m.id, fullName: m.fullName ?? `${m.firstName} ${m.lastName}` }))))
      .catch(() => {});
  }, []);

  const filteredAvailable = allMembers
    .filter(m => !memberIds.includes(m.id))
    .filter(m => m.fullName.toLowerCase().includes(search.toLowerCase()));

  const addMember = async (memberId: string) => {
    setAdding(true);
    try { await api.post(`/groups/${group.id}/members`, { memberId }); refetch(); }
    finally { setAdding(false); }
  };

  const removeMember = async (memberId: string) => {
    setRemoving(memberId);
    try { await api.delete(`/groups/${group.id}/members/${memberId}`); refetch(); }
    finally { setRemoving(null); }
  };

  const memberName = (id: string) => allMembers.find(m => m.id === id)?.fullName ?? id.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
          <div>
            <h2 className="font-bold text-[#e2e8f0]">Manage Members</h2>
            <p className="text-xs text-[#475569]">{group.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#475569] hover:text-[#e2e8f0]"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Current members */}
          <div>
            <h4 className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wide mb-2">Current Members ({memberIds.length})</h4>
            {loading ? <p className="text-xs text-[#475569]">Loading…</p> : memberIds.length === 0 ? (
              <p className="text-xs text-[#475569]">No members yet.</p>
            ) : (
              <div className="space-y-1.5">
                {memberIds.map(id => (
                  <div key={id} className="flex items-center justify-between bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2">
                    <span className="text-sm text-[#e2e8f0]">{memberName(id)}</span>
                    <button onClick={() => removeMember(id)} disabled={removing === id}
                      className="text-[#ef4444] hover:text-red-400 disabled:opacity-50">
                      {removing === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add members */}
          <div>
            <h4 className="text-xs font-semibold text-[#475569] uppercase tracking-wide mb-2">Add Member</h4>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search members…"
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg pl-8 pr-3 py-2 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]" />
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {filteredAvailable.slice(0, 20).map(m => (
                <div key={m.id} className="flex items-center justify-between bg-[#0a1020] border border-[#1e293b] rounded-lg px-3 py-2">
                  <span className="text-xs text-[#94a3b8]">{m.fullName}</span>
                  <button onClick={() => addMember(m.id)} disabled={adding}
                    className="text-[#22c55e] hover:text-green-400 disabled:opacity-50">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {filteredAvailable.length === 0 && <p className="text-xs text-[#475569]">No matching members.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────────── */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-[#e2e8f0]">{value}</div>
        <div className="text-xs text-[#475569]">{label}</div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function GroupsPage() {
  const { groups, loading, refetch } = useGroups();
  const [modal, setModal]     = useState<"create" | "edit" | "delete" | "members" | null>(null);
  const [selected, setSelected] = useState<MemberGroup | null>(null);

  const close = () => { setModal(null); setSelected(null); };
  const saved = () => { close(); refetch(); };

  const totalMembers = groups.reduce((s, g) => s + g.memberCount, 0);
  const avgPerGroup  = groups.length ? Math.round(totalMembers / groups.length) : 0;

  const columns: ColumnDef<MemberGroup>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.original.color }} />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => row.original.description
        ? <span className="text-sm text-gray-400">{row.original.description}</span>
        : <span className="text-sm text-gray-600">—</span>,
    },
    {
      accessorKey: "memberCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Members" />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Users2 className="w-3 h-3" />{row.original.memberCount}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => row.original.active
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Active</span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/30">Inactive</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <TableActionsRow
          editAction={{
            action: () => { setSelected(row.original); setModal("edit"); },
            tooltip: "Edit Group",
          }}
          deleteAction={{
            action: () => { setSelected(row.original); setModal("delete"); },
            tooltip: "Delete Group",
          }}
          customButtons={[{
            icon: <UserPlus className="w-4 h-4" />,
            toolTip: "Manage Members",
            function: () => { setSelected(row.original); setModal("members"); },
          }]}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#080d16]">
      <Header title="Groups" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={<Hash className="w-5 h-5" />}   label="Total Groups"      value={groups.length} color="#6366f1" />
          <StatCard icon={<Users2 className="w-5 h-5" />} label="Total Memberships" value={totalMembers}   color="#22c55e" />
          <StatCard icon={<Users2 className="w-5 h-5" />} label="Avg per Group"     value={avgPerGroup}    color="#f59e0b" />
        </div>

        {/* Table */}
        <ClientSideTable
          data={groups}
          columns={columns}
          pageCount={Math.ceil(groups.length / 20)}
          isLoading={loading}
          searchableColumns={[
            { id: "name",        title: "Name"        },
            { id: "description", title: "Description" },
          ]}
          filterableColumns={[
            {
              id: "active",
              title: "Status",
              options: [
                { label: "Active",   value: "true"  },
                { label: "Inactive", value: "false" },
              ],
            },
          ]}
          customButtons={[
            {
              text: "New Group",
              function: () => setModal("create"),
              icon: <Plus className="w-4 h-4" />,
            },
          ]}
        />
      </div>

      {(modal === "create" || modal === "edit") && (
        <GroupFormModal initial={modal === "edit" ? selected : null} onClose={close} onSaved={saved} />
      )}
      {modal === "delete" && selected && (
        <DeleteConfirm group={selected} onClose={close} onDeleted={saved} />
      )}
      {modal === "members" && selected && (
        <ManageMembersModal group={selected} onClose={close} />
      )}
    </div>
  );
}
