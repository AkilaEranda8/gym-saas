"use client";
import React from "react";
import { Plus, Package } from "lucide-react";
import { ProductDTO } from "@/hooks/useShop";
import StockBadge from "./StockBadge";

interface Props {
  product: ProductDTO;
  onAddToCart: (product: ProductDTO) => void;
  cartQty: number;
}

export default function ProductCard({ product, onAddToCart, cartQty }: Props) {
  const canAdd = !product.isOutOfStock && product.stockQty - cartQty > 0;

  return (
    <button
      onClick={() => canAdd && onAddToCart(product)}
      disabled={!canAdd}
      className={`relative flex flex-col bg-white rounded-xl border text-left w-full transition-all duration-150
        ${canAdd
          ? "border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
          : "border-slate-100 opacity-60 cursor-not-allowed"}`}
    >
      {/* Image */}
      <div className="w-full aspect-square bg-slate-100 rounded-t-xl overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
        )}
      </div>

      {/* Cart qty badge */}
      {cartQty > 0 && (
        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {cartQty}
        </span>
      )}

      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">{product.name}</p>
        {product.brand && <p className="text-xs text-slate-400">{product.brand}</p>}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-sm font-bold text-blue-700">{product.priceFormatted}</p>
          <StockBadge stockQty={product.stockQty} minStockQty={product.minStockQty}
            isLowStock={product.isLowStock} isOutOfStock={product.isOutOfStock} />
        </div>
      </div>

      {/* Add overlay */}
      {canAdd && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-600 bg-opacity-0 hover:bg-opacity-5 transition-all">
          <div className="opacity-0 group-hover:opacity-100">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      )}
    </button>
  );
}
