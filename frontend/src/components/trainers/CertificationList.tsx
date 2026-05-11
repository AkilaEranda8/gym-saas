"use client";
import { type CertificationDTO } from "@/hooks/useTrainers";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function CertificationList({ certs }: { certs: CertificationDTO[] }) {
  if (certs.length === 0) {
    return (
      <p className="text-zinc-500 text-sm py-4 text-center">No certifications added</p>
    );
  }

  return (
    <div className="space-y-2">
      {certs.map(c => {
        const expired  = c.isExpired;
        const expiring = !expired && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30;
        return (
          <div
            key={c.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              expired
                ? "border-red-800/50 bg-red-900/10"
                : expiring
                ? "border-yellow-800/50 bg-yellow-900/10"
                : "border-zinc-800 bg-zinc-800/30"
            }`}
          >
            <div className="mt-0.5">
              {c.isVerified
                ? <ShieldCheck className="w-4 h-4 text-green-400" />
                : expired
                ? <AlertTriangle className="w-4 h-4 text-red-400" />
                : expiring
                ? <Clock className="w-4 h-4 text-yellow-400" />
                : <ShieldCheck className="w-4 h-4 text-zinc-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white text-sm font-medium">{c.name}</p>
                {c.isVerified && (
                  <span className="text-xs text-green-400 flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              {c.issuingBody && <p className="text-zinc-400 text-xs">{c.issuingBody}</p>}
              <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                {c.issuedDate && <span>Issued: {c.issuedDate}</span>}
                {c.expiryDate && (
                  <span className={expired ? "text-red-400" : expiring ? "text-yellow-400" : ""}>
                    {expired
                      ? `Expired ${Math.abs(c.daysUntilExpiry)}d ago`
                      : `Expires: ${c.expiryDate} (${c.daysUntilExpiry}d)`}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
