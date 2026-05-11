"use client";
import React from "react";
import { X, Download } from "lucide-react";
import { ShopOrderDTO, fmtLkr } from "@/hooks/useShop";
import OrderStatusBadge from "./OrderStatusBadge";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Props {
  order: ShopOrderDTO | null;
  onClose: () => void;
  onRefund: (order: ShopOrderDTO) => void;
}

export default function OrderDetailModal({ order, onClose, onRefund }: Props) {
  if (!order) return null;

  const handleDownloadReceipt = async () => {
    try {
      const res = await api.get(`/shop/orders/${order.id}/receipt`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download receipt.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Order #{order.orderNumber}</h2>
            <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadReceipt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> Receipt
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {order.paymentMethod}
            </span>
            {order.memberName && (
              <span className="text-xs text-slate-500">👤 {order.memberName}</span>
            )}
            {order.createdBy && (
              <span className="text-xs text-slate-500">Cashier: {order.createdBy}</span>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Items</h3>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-slate-500">Product</th>
                    <th className="text-center px-3 py-2 text-xs text-slate-500">Qty</th>
                    <th className="text-right px-3 py-2 text-xs text-slate-500">Price</th>
                    <th className="text-right px-3 py-2 text-xs text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-slate-800">{item.productName}</p>
                        {item.productSku && <p className="text-xs text-slate-400">{item.productSku}</p>}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600">{item.unitPriceFormatted}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{item.totalFormatted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>{fmtLkr(order.subtotalLkr)}</span>
            </div>
            {order.discountLkr > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Discount {order.discountCode && `(${order.discountCode})`}</span>
                <span className="text-red-500">- {fmtLkr(order.discountLkr)}</span>
              </div>
            )}
            {order.taxLkr > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax</span><span>{fmtLkr(order.taxLkr)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-100 pt-2">
              <span>Total</span><span>{order.totalFormatted}</span>
            </div>
          </div>

          {/* Refund info */}
          {order.status === "REFUNDED" && order.refundReason && (
            <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700">
              <p className="font-semibold mb-1">Refund Reason</p>
              <p>{order.refundReason}</p>
            </div>
          )}

          {/* Actions */}
          {order.status === "COMPLETED" && (
            <button onClick={() => onRefund(order)}
              className="w-full py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
              Issue Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
