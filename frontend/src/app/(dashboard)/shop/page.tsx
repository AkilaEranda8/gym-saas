"use client";
import React, { useState, useCallback } from "react";
import { ShoppingBag, Package, ClipboardList, BarChart2, Plus, Search, RefreshCw, Truck } from "lucide-react";
import Header from "@/components/Header";
import {
  useProductCategories, useProducts, useLowStockAlerts,
  useShopOrders, usePurchaseOrders, useShopSummary,
  useTopProducts, useDailySales, useDeleteProduct, useCancelPurchaseOrder,
  CartItem, ProductDTO, ShopOrderDTO, PurchaseOrderDTO, OrderStatus,
} from "@/hooks/useShop";
import ShopStatsCards from "@/components/shop/ShopStatsCards";
import ProductCard from "@/components/shop/ProductCard";
import ProductTable from "@/components/shop/ProductTable";
import CartPanel from "@/components/shop/CartPanel";
import OrdersTable from "@/components/shop/OrdersTable";
import LowStockTable from "@/components/shop/LowStockTable";
import PurchaseOrdersTable from "@/components/shop/PurchaseOrdersTable";
import SalesChart from "@/components/shop/SalesChart";
import TopProductsChart from "@/components/shop/TopProductsChart";
import AddProductModal from "@/components/shop/AddProductModal";
import StockAdjustModal from "@/components/shop/StockAdjustModal";
import OrderDetailModal from "@/components/shop/OrderDetailModal";
import RefundModal from "@/components/shop/RefundModal";
import CreateCategoryModal from "@/components/shop/CreateCategoryModal";
import CreatePOModal from "@/components/shop/CreatePOModal";
import ReceivePOModal from "@/components/shop/ReceivePOModal";
import toast from "react-hot-toast";

type Tab = "pos" | "products" | "orders" | "purchase" | "analytics";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "pos",      label: "POS",            icon: <ShoppingBag className="w-4 h-4" /> },
  { key: "products", label: "Products",        icon: <Package className="w-4 h-4" /> },
  { key: "orders",   label: "Orders",          icon: <ClipboardList className="w-4 h-4" /> },
  { key: "purchase", label: "Purchase Orders", icon: <Truck className="w-4 h-4" /> },
  { key: "analytics",label: "Analytics",       icon: <BarChart2 className="w-4 h-4" /> },
];

export default function ShopPage() {
  const [tab, setTab] = useState<Tab>("pos");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // POS filters
  const [posCategory, setPosCategory] = useState<string>("");
  const [posSearch, setPosSearch] = useState("");

  // Products tab filters
  const [prodSearch, setProdSearch] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodActive, setProdActive] = useState<boolean | undefined>(true);

  // Orders tab filters
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "">("");
  const [orderPage, setOrderPage] = useState(0);

  // Purchase orders
  const [poPage, setPoPage] = useState(0);

  // Modal state
  const [addProductOpen, setAddProductOpen]   = useState(false);
  const [editProduct, setEditProduct]         = useState<ProductDTO | null>(null);
  const [stockProduct, setStockProduct]       = useState<ProductDTO | null>(null);
  const [viewOrder, setViewOrder]             = useState<ShopOrderDTO | null>(null);
  const [refundOrder, setRefundOrder]         = useState<ShopOrderDTO | null>(null);
  const [addCatOpen, setAddCatOpen]           = useState(false);
  const [createPOOpen, setCreatePOOpen]       = useState(false);
  const [receivePO, setReceivePO]             = useState<PurchaseOrderDTO | null>(null);

  // Data hooks
  const { categories, refetch: refetchCats } = useProductCategories();
  const { products: posProducts, loading: posLoading, refetch: refetchPOS } = useProducts(
    { categoryId: posCategory || undefined, search: posSearch || undefined, isActive: true, size: 100 }
  );
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts(
    { categoryId: prodCategory || undefined, search: prodSearch || undefined, isActive: prodActive, size: 100 }
  );
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useLowStockAlerts();
  const { orders, loading: ordersLoading, totalPages: orderPages, refetch: refetchOrders } = useShopOrders(
    { status: orderStatus || undefined, page: orderPage }
  );
  const { orders: purchaseOrders, loading: poLoading, refetch: refetchPO } = usePurchaseOrders(poPage);
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useShopSummary();
  const { sales, loading: salesLoading } = useDailySales(30);
  const { products: topProducts, loading: topLoading } = useTopProducts(30, 10);
  const { remove } = useDeleteProduct();
  const { cancel } = useCancelPurchaseOrder();

  // Cart actions
  const addToCart = useCallback((product: ProductDTO) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) return prev;
        return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.product.id !== productId));
    } else {
      setCart((prev) => prev.map((c) => c.product.id === productId ? { ...c, quantity: qty } : c));
    }
  }, []);

  const handleDeleteProduct = async (p: ProductDTO) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const ok = await remove(p.id);
    if (ok) { toast.success("Product deleted."); refetchProducts(); refetchPOS(); }
    else toast.error("Delete failed.");
  };

  const handleCancelPO = async (po: PurchaseOrderDTO) => {
    if (!confirm(`Cancel PO #${po.poNumber}?`)) return;
    const result = await cancel(po.id);
    if (result) { toast.success("PO cancelled."); refetchPO(); }
    else toast.error("Cancel failed.");
  };

  const cartQtyFor = (productId: string) =>
    cart.find((c) => c.product.id === productId)?.quantity ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Shop & POS" />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <ShopStatsCards summary={summary} loading={summaryLoading} />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── POS Tab ─────────────────────────────────────────── */}
        {tab === "pos" && (
          <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
            {/* Product grid */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Filters */}
              <div className="flex gap-3 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={posSearch} onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <select value={posCategory} onChange={(e) => setPosCategory(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All categories</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto">
                {posLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : posProducts.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    No products found
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {posProducts.map((p) => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart}
                        cartQty={cartQtyFor(p.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="w-80 flex-shrink-0">
              <CartPanel
                cart={cart}
                onUpdateQty={updateQty}
                onRemove={(id) => setCart((prev) => prev.filter((c) => c.product.id !== id))}
                onClear={() => setCart([])}
                onOrderComplete={() => { refetchPOS(); refetchOrders(); refetchSummary(); }}
              />
            </div>
          </div>
        )}

        {/* ── Products Tab ─────────────────────────────────────── */}
        {tab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={prodSearch} onChange={(e) => setProdSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-56" />
                </div>
                <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                  <option value="">All categories</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={prodActive === undefined ? "" : String(prodActive)}
                  onChange={(e) => setProdActive(e.target.value === "" ? undefined : e.target.value === "true")}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                  <option value="">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddCatOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors bg-white">
                  <Plus className="w-4 h-4" /> Category
                </button>
                <button onClick={() => setAddProductOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {/* Low stock alerts */}
            {alerts.length > 0 && (
              <LowStockTable alerts={alerts} loading={alertsLoading} />
            )}

            <ProductTable
              products={products}
              loading={productsLoading}
              onEdit={setEditProduct}
              onDelete={handleDeleteProduct}
              onAdjustStock={setStockProduct}
            />
          </div>
        )}

        {/* ── Orders Tab ──────────────────────────────────────── */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Sales Orders</h2>
              <button onClick={refetchOrders}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 bg-white">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
            <OrdersTable
              orders={orders}
              loading={ordersLoading}
              statusFilter={orderStatus}
              onStatusFilter={(s) => { setOrderStatus(s); setOrderPage(0); }}
              onView={setViewOrder}
            />
            {orderPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: orderPages }).map((_, i) => (
                  <button key={i} onClick={() => setOrderPage(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${orderPage === i ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Purchase Orders Tab ─────────────────────────────── */}
        {tab === "purchase" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Purchase Orders</h2>
              <button onClick={() => setCreatePOOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> New PO
              </button>
            </div>
            <PurchaseOrdersTable
              orders={purchaseOrders}
              loading={poLoading}
              onView={() => {}}
              onReceive={setReceivePO}
              onCancel={handleCancelPO}
            />
          </div>
        )}

        {/* ── Analytics Tab ───────────────────────────────────── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Daily Revenue (30 days)</h3>
                <SalesChart sales={sales} loading={salesLoading} />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Products by Revenue</h3>
                <TopProductsChart products={topProducts} loading={topLoading} />
              </div>
            </div>

            {/* Top products table */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Selling Products</h3>
              {topLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg" />))}</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-slate-500 bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-2">#</th>
                      <th className="text-left px-4 py-2">Product</th>
                      <th className="text-left px-4 py-2">Category</th>
                      <th className="text-right px-4 py-2">Units Sold</th>
                      <th className="text-right px-4 py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.map((p, i) => (
                      <tr key={p.productId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{p.productName}</td>
                        <td className="px-4 py-3 text-slate-500">{p.categoryName ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{p.qtySold}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">{p.revenueFormatted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <LowStockTable alerts={alerts} loading={alertsLoading} />
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <AddProductModal
        open={addProductOpen}
        categories={categories}
        onClose={() => setAddProductOpen(false)}
        onCreated={() => { refetchProducts(); refetchPOS(); }}
      />
      <StockAdjustModal
        product={stockProduct}
        onClose={() => setStockProduct(null)}
        onDone={() => { refetchProducts(); refetchPOS(); refetchAlerts(); }}
      />
      <OrderDetailModal
        order={viewOrder}
        onClose={() => setViewOrder(null)}
        onRefund={(o) => { setViewOrder(null); setRefundOrder(o); }}
      />
      <RefundModal
        order={refundOrder}
        onClose={() => setRefundOrder(null)}
        onRefunded={() => { refetchOrders(); refetchSummary(); }}
      />
      <CreateCategoryModal
        open={addCatOpen}
        onClose={() => setAddCatOpen(false)}
        onCreated={refetchCats}
      />
      <CreatePOModal
        open={createPOOpen}
        products={products}
        onClose={() => setCreatePOOpen(false)}
        onCreated={refetchPO}
      />
      <ReceivePOModal
        po={receivePO}
        onClose={() => setReceivePO(null)}
        onReceived={() => { refetchPO(); refetchProducts(); refetchPOS(); refetchAlerts(); }}
      />
    </div>
  );
}
