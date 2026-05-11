"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { Plus, Filter, Search, BarChart3, List, Tag, Receipt, CreditCard } from "lucide-react";

import {
  usePayments, usePaymentDetail, useBillingSummary,
  useMonthlyRevenue, useRevenueByType, useExpenseCategories,
  PaymentDTO, PaymentStatus, PaymentType, PaymentMethod,
} from "@/hooks/useBilling";

import BillingStatsCards  from "@/components/billing/BillingStatsCards";
import PaymentsTable      from "@/components/billing/PaymentsTable";
import PaymentDetailModal from "@/components/billing/PaymentDetailModal";
import RecordPaymentModal from "@/components/billing/RecordPaymentModal";
import RefundModal        from "@/components/billing/RefundModal";
import RevenueChart       from "@/components/billing/RevenueChart";
import RevenueByTypeChart from "@/components/billing/RevenueByTypeChart";
import DiscountManager    from "@/components/billing/DiscountManager";
import ExpenseList        from "@/components/billing/ExpenseList";
import PaginationBar      from "@/components/billing/PaginationBar";

type Tab = "payments" | "analytics" | "discounts" | "expenses";

const today = new Date().toISOString().split("T")[0];
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

export default function BillingPage() {
  const [tab, setTab]   = useState<Tab>("payments");
  const [page, setPage] = useState(0);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [typeFilter, setType]       = useState("");
  const [methodFilter, setMethod]   = useState("");

  const [viewPayment, setViewPayment]     = useState<PaymentDTO | null>(null);
  const [refundPayment, setRefundPayment] = useState<PaymentDTO | null>(null);
  const [showRecord, setShowRecord]       = useState(false);

  const { payments, loading: paymentsLoading, refetch }         = usePayments({ status: statusFilter || undefined, type: typeFilter || undefined, method: methodFilter || undefined, page, size: 20 });
  const { payment: detail, loading: detailLoading }             = usePaymentDetail(viewPayment?.id ?? null);
  const { summary, loading: summaryLoading }                    = useBillingSummary(monthStart, today);
  const { data: monthlyRevenue, loading: chartLoading }         = useMonthlyRevenue(12);
  const { data: revenueByType, loading: typeLoading }           = useRevenueByType(monthStart, today);
  const { categories }                                          = useExpenseCategories();

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "payments",   label: "Payments",   icon: CreditCard },
    { key: "analytics",  label: "Analytics",  icon: BarChart3  },
    { key: "discounts",  label: "Discounts",  icon: Tag        },
    { key: "expenses",   label: "Expenses",   icon: Receipt    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Billing & Payments" />

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <BillingStatsCards summary={summary} loading={summaryLoading} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex gap-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tab === key
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {tab === "payments" && (
              <button onClick={() => setShowRecord(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            )}
          </div>

          <div className="p-4">
            {tab === "payments" && (
              <>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search by member or payment #…"
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  </div>
                  <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(0); }}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="">All Status</option>
                    {(["PAID","PENDING","FAILED","REFUNDED","CANCELLED"] as PaymentStatus[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select value={typeFilter} onChange={e => { setType(e.target.value); setPage(0); }}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="">All Types</option>
                    {(["MEMBERSHIP","PT_SESSION","SHOP_PURCHASE","LOCKER","CLASS_BOOKING","OTHER"] as PaymentType[]).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select value={methodFilter} onChange={e => { setMethod(e.target.value); setPage(0); }}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="">All Methods</option>
                    {(["CASH","CARD","ONLINE","BANK_TRANSFER","PAYHERE","EZ_CASH","M_CASH"] as PaymentMethod[]).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <PaymentsTable
                  payments={(payments?.content ?? []).filter(p =>
                    !search || p.memberName?.toLowerCase().includes(search.toLowerCase()) ||
                    p.paymentNumber.toLowerCase().includes(search.toLowerCase())
                  )}
                  onView={p => setViewPayment(p)}
                />

                {payments && payments.totalPages > 1 && (
                  <PaginationBar
                    page={payments.number}
                    totalPages={payments.totalPages}
                    totalElements={payments.totalElements}
                    size={20}
                    onPage={setPage}
                  />
                )}
              </>
            )}

            {tab === "analytics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                <div className="lg:col-span-2">
                  <RevenueChart data={monthlyRevenue} loading={chartLoading} />
                </div>
                <RevenueByTypeChart data={revenueByType} loading={typeLoading} />
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Period Summary</h3>
                  {summary && (
                    <div className="space-y-2 text-sm">
                      {[
                        ["Total Revenue", `Rs. ${(summary.paidLkr / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`],
                        ["Total Transactions", summary.totalTransactions],
                        ["Paid", `${summary.paidCount} (Rs. ${(summary.paidLkr / 100).toLocaleString()})`],
                        ["Pending", `${summary.pendingCount}`],
                        ["Failed", `${summary.failedCount}`],
                        ["Refunded", `${summary.refundedCount}`],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between">
                          <span className="text-slate-500">{k}</span>
                          <span className="font-medium text-slate-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "discounts" && <DiscountManager />}

            {tab === "expenses" && <ExpenseList categories={categories} />}
          </div>
        </div>
      </div>

      {showRecord && (
        <RecordPaymentModal onClose={() => setShowRecord(false)} onSuccess={() => refetch()} />
      )}

      {viewPayment && detail && !detailLoading && (
        <PaymentDetailModal payment={detail} onClose={() => setViewPayment(null)} />
      )}

      {refundPayment && (
        <RefundModal
          payment={refundPayment}
          onClose={() => setRefundPayment(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
