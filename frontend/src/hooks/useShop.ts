"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Enums / literal types ──────────────────────────────────────

export type ProductUnit =
  | "UNIT" | "KG" | "GRAM" | "LITRE" | "ML" | "PIECE" | "BOX" | "BOTTLE" | "SACHET" | "PAIR";

export type StockMovementType = "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN" | "WRITE_OFF" | "TRANSFER";

export type OrderStatus = "COMPLETED" | "PENDING" | "CANCELLED" | "REFUNDED";

export type ShopPaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export type PaymentMethod =
  | "CASH" | "CARD" | "ONLINE" | "BANK_TRANSFER" | "PAYHERE" | "EZ_CASH" | "M_CASH";

export type PurchaseOrderStatus = "PENDING" | "ORDERED" | "RECEIVED" | "CANCELLED";

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100 text-amber-700",
  CANCELLED: "bg-slate-100 text-slate-500",
  REFUNDED:  "bg-purple-100 text-purple-700",
};

export const PO_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  ORDERED:   "bg-blue-100 text-blue-700",
  RECEIVED:  "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

// ── DTO types ──────────────────────────────────────────────────

export interface ProductCategoryDTO {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductDTO {
  id: string;
  gymId: string;
  branchId?: string;
  categoryId?: string;
  categoryName?: string;
  name: string;
  description?: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  unit: ProductUnit;
  priceLkr: number;
  priceFormatted: string;
  costPriceLkr?: number;
  stockQty: number;
  minStockQty: number;
  maxStockQty?: number;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  unitPriceLkr: number;
  unitPriceFormatted: string;
  quantity: number;
  discountLkr: number;
  totalLkr: number;
  totalFormatted: string;
}

export interface ShopOrderDTO {
  id: string;
  gymId: string;
  branchId?: string;
  memberId?: string;
  memberName?: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalLkr: number;
  discountLkr: number;
  taxLkr: number;
  totalLkr: number;
  totalFormatted: string;
  paymentMethod: PaymentMethod;
  paymentStatus: ShopPaymentStatus;
  discountCode?: string;
  notes?: string;
  receiptUrl?: string;
  createdBy?: string;
  refundReason?: string;
  refundedAt?: string;
  items: OrderItemDTO[];
  createdAt: string;
}

export interface StockMovementDTO {
  id: string;
  gymId: string;
  productId: string;
  productName: string;
  movementType: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export interface POItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCostLkr: number;
  totalCostLkr: number;
}

export interface PurchaseOrderDTO {
  id: string;
  gymId: string;
  poNumber: string;
  supplierName?: string;
  supplierPhone?: string;
  status: PurchaseOrderStatus;
  totalLkr: number;
  totalFormatted: string;
  notes?: string;
  orderedAt: string;
  receivedAt?: string;
  items: POItemDTO[];
}

export interface ShopSummaryDTO {
  totalRevenueLkr: number;
  totalRevenueFormatted: string;
  totalOrders: number;
  averageOrderLkr: number;
  averageOrderFormatted: string;
  totalProductsSold: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingPOCount: number;
  periodFrom: string;
  periodTo: string;
}

export interface TopProductDTO {
  productId: string;
  productName: string;
  categoryName?: string;
  qtySold: number;
  revenueLkr: number;
  revenueFormatted: string;
}

export interface DailySalesDTO {
  date: string;
  orderCount: number;
  revenueLkr: number;
  revenueFormatted: string;
  itemsSold: number;
}

export interface LowStockAlertDTO {
  productId: string;
  productName: string;
  categoryName?: string;
  currentStock: number;
  minStockQty: number;
  sku?: string;
}

export interface MemberOrderHistoryDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalLkr: number;
  totalFormatted: string;
  paymentMethod: PaymentMethod;
  itemCount: number;
  itemsSummary: string;
  createdAt: string;
}

// ── Cart types ─────────────────────────────────────────────────

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

// ── Request types ──────────────────────────────────────────────

export interface CreateProductRequest {
  name: string;
  description?: string;
  brand?: string;
  categoryId: string;
  sku?: string;
  barcode?: string;
  unit?: ProductUnit;
  priceLkr: number;
  costPriceLkr?: number;
  stockQty?: number;
  minStockQty?: number;
  maxStockQty?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  branchId?: string;
  imageUrl?: string;
}

export interface UpdateStockRequest {
  quantity: number;
  movementType: StockMovementType;
  notes?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  memberId?: string;
  items: OrderItemRequest[];
  paymentMethod: PaymentMethod;
  discountCode?: string;
  notes?: string;
}

export interface RefundOrderRequest {
  reason: string;
}

export interface POItemRequest {
  productId: string;
  quantityOrdered: number;
  unitCostLkr: number;
}

export interface CreatePurchaseOrderRequest {
  supplierName?: string;
  supplierPhone?: string;
  notes?: string;
  branchId?: string;
  items: POItemRequest[];
}

export interface ReceiveItemRequest {
  poItemId: string;
  quantityReceived: number;
}

export interface ReceivePurchaseOrderRequest {
  items: ReceiveItemRequest[];
  notes?: string;
}

// ── Page types ─────────────────────────────────────────────────

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Hooks ──────────────────────────────────────────────────────

export function useProductCategories(activeOnly = true) {
  const [categories, setCategories] = useState<ProductCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ProductCategoryDTO[]>(
        `/shop/products/categories?activeOnly=${activeOnly}`
      );
      setCategories(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [activeOnly]);

  useEffect(() => { fetch(); }, [fetch]);
  return { categories, loading, refetch: fetch };
}

export function useProducts(params?: {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
  page?: number;
  size?: number;
}) {
  const [data, setData] = useState<PageResponse<ProductDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (params?.categoryId) p.set("categoryId", params.categoryId);
      if (params?.search)     p.set("search", params.search);
      if (params?.isActive !== undefined) p.set("isActive", String(params.isActive));
      if (params?.lowStockOnly) p.set("lowStockOnly", "true");
      p.set("page", String(params?.page ?? 0));
      p.set("size", String(params?.size ?? 50));
      const res = await api.get<PageResponse<ProductDTO>>(`/shop/products?${p}`);
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products: data?.content ?? [], total: data?.totalElements ?? 0, loading, refetch: fetch };
}

export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockAlertDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<LowStockAlertDTO[]>("/shop/products/low-stock");
      setAlerts(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { alerts, loading, refetch: fetch };
}

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const create = async (req: CreateProductRequest): Promise<ProductDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<ProductDTO>("/shop/products", req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const update = async (id: string, req: Partial<CreateProductRequest>): Promise<ProductDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.put<ProductDTO>(`/shop/products/${id}`, req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { update, loading };
}

export function useAdjustStock() {
  const [loading, setLoading] = useState(false);
  const adjust = async (id: string, req: UpdateStockRequest): Promise<ProductDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<ProductDTO>(`/shop/products/${id}/stock`, req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { adjust, loading };
}

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const remove = async (id: string): Promise<boolean> => {
    setLoading(true);
    try { await api.delete(`/shop/products/${id}`); return true; }
    catch { return false; } finally { setLoading(false); }
  };
  return { remove, loading };
}

export function useCreateCategory() {
  const [loading, setLoading] = useState(false);
  const create = async (req: CreateCategoryRequest): Promise<ProductCategoryDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<ProductCategoryDTO>("/shop/products/categories", req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const createOrder = async (req: CreateOrderRequest): Promise<ShopOrderDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<ShopOrderDTO>("/shop/orders", req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { createOrder, loading };
}

export function useShopOrders(params?: {
  memberId?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}) {
  const [data, setData] = useState<PageResponse<ShopOrderDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (params?.memberId) p.set("memberId", params.memberId);
      if (params?.status)   p.set("status", params.status);
      if (params?.from)     p.set("from", params.from);
      if (params?.to)       p.set("to", params.to);
      p.set("page", String(params?.page ?? 0));
      p.set("size", String(params?.size ?? 20));
      const res = await api.get<PageResponse<ShopOrderDTO>>(`/shop/orders?${p}`);
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { orders: data?.content ?? [], total: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0, loading, refetch: fetch };
}

export function useRefundOrder() {
  const [loading, setLoading] = useState(false);
  const refund = async (id: string, reason: string): Promise<ShopOrderDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<ShopOrderDTO>(`/shop/orders/${id}/refund`, { reason });
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { refund, loading };
}

export function useShopSummary() {
  const [summary, setSummary] = useState<ShopSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ShopSummaryDTO>("/shop/analytics/summary");
      setSummary(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { summary, loading, refetch: fetch };
}

export function useTopProducts(days = 30, limit = 10) {
  const [products, setProducts] = useState<TopProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<TopProductDTO[]>(
        `/shop/analytics/top-products?days=${days}&limit=${limit}`
      );
      setProducts(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [days, limit]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading };
}

export function useDailySales(days = 30) {
  const [sales, setSales] = useState<DailySalesDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<DailySalesDTO[]>(`/shop/analytics/daily-sales?days=${days}`);
      setSales(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [days]);

  useEffect(() => { fetch(); }, [fetch]);
  return { sales, loading };
}

export function usePurchaseOrders(page = 0, size = 20) {
  const [data, setData] = useState<PageResponse<PurchaseOrderDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<PurchaseOrderDTO>>(
        `/shop/purchase-orders?page=${page}&size=${size}`
      );
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { orders: data?.content ?? [], total: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0, loading, refetch: fetch };
}

export function useCreatePurchaseOrder() {
  const [loading, setLoading] = useState(false);
  const create = async (req: CreatePurchaseOrderRequest): Promise<PurchaseOrderDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<PurchaseOrderDTO>("/shop/purchase-orders", req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

export function useReceivePurchaseOrder() {
  const [loading, setLoading] = useState(false);
  const receive = async (id: string, req: ReceivePurchaseOrderRequest): Promise<PurchaseOrderDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<PurchaseOrderDTO>(`/shop/purchase-orders/${id}/receive`, req);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { receive, loading };
}

export function useCancelPurchaseOrder() {
  const [loading, setLoading] = useState(false);
  const cancel = async (id: string): Promise<PurchaseOrderDTO | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<PurchaseOrderDTO>(`/shop/purchase-orders/${id}/cancel`);
      return data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { cancel, loading };
}

// ── Cart utilities ─────────────────────────────────────────────

export function calcCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.product.priceLkr * c.quantity, 0);
}

export function fmtLkr(cents: number): string {
  return `Rs. ${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
