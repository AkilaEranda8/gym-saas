"use client";
import React from "react";

interface Props {
  stockQty: number;
  minStockQty: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export default function StockBadge({ stockQty, isLowStock, isOutOfStock }: Props) {
  if (isOutOfStock) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Out of Stock
      </span>
    );
  }
  if (isLowStock) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Low ({stockQty})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {stockQty}
    </span>
  );
}
