"use client";

export default function PaymentsTab({ memberId }: { memberId: string }) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-8 text-center text-[#475569]">
      <div className="text-4xl mb-3">💳</div>
      <p className="font-medium text-[#e2e8f0]">Payment History</p>
      <p className="text-sm mt-1">Billing module integration coming soon.</p>
    </div>
  );
}
