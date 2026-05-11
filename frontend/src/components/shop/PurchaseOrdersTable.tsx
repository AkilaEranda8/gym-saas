"use client";
import React from "react";
import { Eye, XCircle, Package } from "lucide-react";
import { PurchaseOrderDTO } from "@/hooks/useShop";
import POStatusBadge from "./POStatusBadge";

interface Props {
  orders: PurchaseOrderDTO[];
  loading: boolean;
  onView: (po: PurchaseOrderDTO) => void;
  onReceive: (po: PurchaseOrderDTO) => void;
  onCancel: (po: PurchaseOrderDTO) => void;
}

export default function PurchaseOrdersTable({ orders, loading, onView, onReceive, onCancel }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Package className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No purchase orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">PO #</th>
            <th className="text-left px-4 py-3">Supplier</th>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-center px-4 py-3">Items</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Total</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((po) => (
            <tr key={po.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{po.poNumber}</td>
              <td className="px-4 py-3 text-slate-700">{po.supplierName ?? "—"}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {new Date(po.orderedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-center text-slate-600">{po.items.length}</td>
              <td className="px-4 py-3 text-center">
                <POStatusBadge status={po.status} />
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">{po.totalFormatted}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onView(po)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  {(po.status === "PENDING" || po.status === "ORDERED") && (
                    <>
                      <button onClick={() => onReceive(po)}
                        className="px-2 py-1 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                        Receive
                      </button>
                      <button onClick={() => onCancel(po)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
