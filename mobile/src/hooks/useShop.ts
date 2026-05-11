import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

// ── Types ──────────────────────────────────────────────────────

export type OrderStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "BANK_TRANSFER" | "PAYHERE" | "EZ_CASH" | "M_CASH";

export interface ProductCategoryDTO {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  categoryName?: string;
  unit: string;
  priceLkr: number;
  priceFormatted: string;
  stockQty: number;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface OrderItemDTO {
  id: string;
  productName: string;
  quantity: number;
  unitPriceFormatted: string;
  totalFormatted: string;
}

export interface ShopOrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalLkr: number;
  totalFormatted: string;
  paymentMethod: PaymentMethod;
  items: OrderItemDTO[];
  itemCount: number;
  createdAt: string;
  refundReason?: string;
}

export interface MemberOrderHistoryDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalFormatted: string;
  paymentMethod: PaymentMethod;
  itemCount: number;
  itemsSummary: string;
  createdAt: string;
}

// ── Hooks ──────────────────────────────────────────────────────

export function useShopProducts(params?: { categoryId?: string; search?: string }) {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ isActive: "true", size: "100" });
      if (params?.categoryId) p.set("categoryId", params.categoryId);
      if (params?.search)     p.set("search", params.search);
      const { data } = await api.get<{ content: ProductDTO[] }>(`/shop/products?${p}`);
      setProducts(data.content ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.categoryId, params?.search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, refetch: fetch };
}

export function useShopCategories() {
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
  const [loading, setLoading]       = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ProductCategoryDTO[]>("/shop/products/categories?activeOnly=true");
      setCategories(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { categories, loading };
}

export function useMyOrders(memberId: string | null) {
  const [orders, setOrders]   = useState<MemberOrderHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!memberId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get<MemberOrderHistoryDTO[]>(
        `/shop/orders/member/${memberId}/history`
      );
      setOrders(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [memberId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { orders, loading, refetch: fetch };
}

export function useOrderDetail(orderId: string | null) {
  const [order, setOrder]     = useState<ShopOrderDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    api.get<ShopOrderDTO>(`/shop/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  return { order, loading };
}

export const STATUS_COLOR: Record<OrderStatus, string> = {
  COMPLETED: "#22c55e",
  PENDING:   "#f59e0b",
  CANCELLED: "#94a3b8",
  REFUNDED:  "#a855f7",
};
