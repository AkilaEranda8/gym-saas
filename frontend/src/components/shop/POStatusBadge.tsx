"use client";
import React from "react";
import { PurchaseOrderStatus, PO_STATUS_COLORS } from "@/hooks/useShop";

export default function POStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PO_STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}
