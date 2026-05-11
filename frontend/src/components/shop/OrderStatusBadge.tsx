"use client";
import React from "react";
import { OrderStatus, ORDER_STATUS_COLORS } from "@/hooks/useShop";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}
