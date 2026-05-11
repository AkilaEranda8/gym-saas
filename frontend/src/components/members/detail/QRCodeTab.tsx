"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import api from "@/lib/axios";

export default function QRCodeTab({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/members/${memberId}/qr`, { responseType: "blob" })
      .then((r) => setQrUrl(URL.createObjectURL(r.data)))
      .catch(() => setQrUrl(null))
      .finally(() => setLoading(false));
  }, [memberId]);

  function download() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `member-qr-${memberId}.png`;
    a.click();
  }

  function print() {
    if (!qrUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><body style="display:flex;flex-direction:column;align-items:center;padding:40px;font-family:sans-serif;background:#fff">
        <img src="${qrUrl}" style="width:300px;height:300px" />
        <h2 style="margin-top:16px;color:#111">${memberName}</h2>
        <p style="color:#555;font-family:monospace">${memberId}</p>
        <p style="color:#888;font-size:13px">Show this at the gym entrance</p>
      </body></html>
    `);
    win.print();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {loading ? (
          <div className="w-[300px] h-[300px] bg-gray-100 animate-pulse rounded-lg" />
        ) : qrUrl ? (
          <img src={qrUrl} alt="Member QR Code" className="w-[300px] h-[300px]" />
        ) : (
          <div className="w-[300px] h-[300px] flex items-center justify-center text-gray-400 text-sm">QR unavailable</div>
        )}
      </div>

      <div className="text-center">
        <div className="text-xl font-bold text-[#e2e8f0]">{memberName}</div>
        <div className="text-sm font-mono text-[#f59e0b] mt-1">{memberId}</div>
        <div className="text-xs text-[#475569] mt-2">Show this at the gym entrance</div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={download}
          disabled={!qrUrl}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1e293b] text-sm text-[#e2e8f0] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Download PNG
        </button>
        <button
          onClick={print}
          disabled={!qrUrl}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1e293b] text-sm text-[#e2e8f0] hover:border-[#60a5fa] hover:text-[#60a5fa] transition-colors disabled:opacity-40"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>
    </div>
  );
}
