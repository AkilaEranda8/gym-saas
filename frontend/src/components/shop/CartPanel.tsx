"use client";
import React, { useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Loader2 } from "lucide-react";
import { CartItem, PaymentMethod, fmtLkr, calcCartTotal, useCreateOrder, ProductDTO } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props {
  cart: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onOrderComplete: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "CARD", "ONLINE", "BANK_TRANSFER"];

export default function CartPanel({ cart, onUpdateQty, onRemove, onClear, onOrderComplete }: Props) {
  const { createOrder, loading } = useCreateOrder();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");

  const subtotal = calcCartTotal(cart);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const order = await createOrder({
      items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
      paymentMethod,
      notes: notes || undefined,
    });
    if (order) {
      toast.success(`Order #${order.orderNumber} created!`);
      onClear();
      onOrderComplete();
      setNotes("");
    } else {
      toast.error("Failed to create order. Check stock availability.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-slate-800">Cart</span>
          {cart.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {cart.reduce((s, c) => s + c.quantity, 0)}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-xs text-red-500 hover:text-red-700">
            Clear all
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-12">
            <ShoppingCart className="w-10 h-10 mb-2" />
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Click a product to add it</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {cart.map((item) => (
              <li key={item.product.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">{item.product.priceFormatted} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stockQty}
                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="ml-1 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-bold text-slate-800">{fmtLkr(subtotal)}</span>
          </div>

          {/* Payment method */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m.replace("_", " ")}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Checkout · {fmtLkr(subtotal)}
          </button>
        </div>
      )}
    </div>
  );
}
