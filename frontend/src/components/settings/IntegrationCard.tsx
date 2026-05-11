"use client";
import React, { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Play } from "lucide-react";
import { IntegrationDTO, useUpdateIntegration, useTestIntegration } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] font-mono placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors";

const PROVIDER_FIELDS: Record<string, { key: string; label: string; sensitive?: boolean; placeholder?: string }[]> = {
  PAYHERE: [
    { key: "merchantId", label: "Merchant ID", placeholder: "1234567" },
    { key: "merchantSecret", label: "Merchant Secret", sensitive: true, placeholder: "••••••••" },
    { key: "notifyUrl", label: "Notify URL", placeholder: "https://api.gym.lk/api/v1/billing/payhere/notify" },
  ],
  SENDGRID: [{ key: "apiKey", label: "API Key", sensitive: true, placeholder: "SG.••••••••" }, { key: "fromEmail", label: "From Email", placeholder: "noreply@gym.lk" }],
  DIALOG_SMS: [{ key: "apiKey", label: "API Key", sensitive: true, placeholder: "••••••••" }, { key: "senderId", label: "Sender ID", placeholder: "GYMAPP" }],
  DIALOG_WHATSAPP: [{ key: "apiKey", label: "API Key", sensitive: true, placeholder: "••••••••" }, { key: "senderNumber", label: "Sender Number", placeholder: "+94 77 ..." }],
  CLOUDFLARE_R2: [
    { key: "accountId", label: "Account ID", placeholder: "abc123..." },
    { key: "accessKeyId", label: "Access Key ID", placeholder: "••••••••" },
    { key: "secretAccessKey", label: "Secret Access Key", sensitive: true, placeholder: "••••••••" },
    { key: "bucketName", label: "Bucket Name", placeholder: "gym-uploads" },
    { key: "publicUrl", label: "Public URL", placeholder: "https://cdn.gym.lk" },
  ],
  GOOGLE_MAPS: [{ key: "apiKey", label: "API Key", sensitive: true, placeholder: "AIza••••••••" }],
  SENTRY: [{ key: "dsn", label: "DSN", placeholder: "https://...@sentry.io/..." }],
  STRIPE: [{ key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_..." }, { key: "secretKey", label: "Secret Key", sensitive: true, placeholder: "sk_live_..." }],
  TWILIO: [{ key: "accountSid", label: "Account SID", placeholder: "AC..." }, { key: "authToken", label: "Auth Token", sensitive: true, placeholder: "••••••••" }, { key: "fromNumber", label: "From Number", placeholder: "+1..." }],
  CUSTOM_WEBHOOK: [{ key: "webhookUrl", label: "Webhook URL", placeholder: "https://..." }, { key: "secret", label: "Webhook Secret", sensitive: true, placeholder: "••••••••" }],
};

interface Props { integration: IntegrationDTO; onUpdated: (i: IntegrationDTO) => void; }

export default function IntegrationCard({ integration: init, onUpdated }: Props) {
  const { mutate: update, saving } = useUpdateIntegration();
  const { mutate: test, testing } = useTestIntegration();
  const [expanded, setExpanded] = useState(false);
  const [integration, setIntegration] = useState(init);
  const [config, setConfig] = useState<Record<string, string>>(init.config ?? {});
  const [dirty, setDirty] = useState(false);

  const fields = PROVIDER_FIELDS[integration.provider] ?? [];

  const statusColor = {
    SUCCESS: "text-emerald-400",
    FAILED: "text-red-400",
    UNTESTED: "text-[#475569]",
  }[integration.lastTestStatus ?? "UNTESTED"];

  const handleToggle = async () => {
    try {
      const updated = await update(integration.provider, { isEnabled: !integration.isEnabled });
      if (updated) { setIntegration(updated); onUpdated(updated); toast.success(updated.isEnabled ? "Enabled" : "Disabled"); }
    } catch { toast.error("Failed to update"); }
  };

  const handleSave = async () => {
    try {
      const updated = await update(integration.provider, { config, testMode: integration.testMode });
      if (updated) { setIntegration(updated); onUpdated(updated); toast.success("Config saved"); setDirty(false); }
    } catch { toast.error("Failed to save config"); }
  };

  const handleTest = async () => {
    try {
      const result = await test(integration.provider);
      if (result) {
        toast[result.status === "SUCCESS" ? "success" : "error"](`${result.message} (${result.responseTimeMs}ms)`);
        setIntegration(p => ({ ...p, lastTestStatus: result.status, lastTestMessage: result.message }));
      }
    } catch { toast.error("Test failed"); }
  };

  return (
    <div className="border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-[#111827]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${integration.isEnabled ? "bg-emerald-400" : "bg-[#334155]"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e2e8f0]">{integration.providerLabel}</p>
            <p className={`text-xs ${statusColor} mt-0.5`}>
              {integration.lastTestStatus === "SUCCESS" ? "Connected" :
               integration.lastTestStatus === "FAILED" ? "Failed" : "Not tested"}
              {integration.isConfigured && " · Configured"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleTest} disabled={testing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#1e293b] text-[#94a3b8] hover:text-white hover:border-[#475569] transition-colors">
            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Test
          </button>
          <button onClick={handleToggle} disabled={saving}
            className={`relative w-10 h-5 rounded-full transition-colors ${integration.isEnabled ? "bg-[#f59e0b]" : "bg-[#1e293b]"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${integration.isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <button onClick={() => setExpanded(p => !p)} className="p-1 text-[#475569] hover:text-[#e2e8f0]">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-4 border-t border-[#1e293b] bg-[#0c1117] space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
              <input type="checkbox" checked={integration.testMode}
                onChange={e => setIntegration(p => ({ ...p, testMode: e.target.checked }))}
                className="rounded" />
              Sandbox / Test Mode
            </label>
          </div>
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-[#475569] mb-1">{f.label}</label>
              <input
                type={f.sensitive ? "password" : "text"}
                value={config[f.key] ?? ""}
                onChange={e => { setConfig(p => ({ ...p, [f.key]: e.target.value })); setDirty(true); }}
                className={inp}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          {fields.length === 0 && <p className="text-xs text-[#475569]">No configuration required.</p>}
          {fields.length > 0 && (
            <button onClick={handleSave} disabled={saving || !dirty}
              className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold mt-2 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Config
            </button>
          )}
        </div>
      )}
    </div>
  );
}
