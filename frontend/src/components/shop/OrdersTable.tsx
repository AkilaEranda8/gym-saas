"use client";
import React from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { ShopOrderDTO, OrderStatus } from "@/hooks/useShop";
import OrderStatusBadge from "./OrderStatusBadge";

interface Props {
  orders: ShopOrderDTO[];
  loading: boolean;
  onView: (order: ShopOrderDTO) => void;
  statusFilter: OrderStatus | "";
  onStatusFilter: (s: OrderStatus | "") => void;
}

const STATUSES: (OrderStatus | "")[] = ["", "COMPLETED", "PENDING", "REFUNDED", "CANCELLED"];

export default function OrdersTable({ orders, loading, onView, statusFilter, onStatusFilter }: Props) {
  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => onStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ShoppingBag className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Order #</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{o.memberName ?? "Walk-in"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{o.totalFormatted}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onView(o)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
