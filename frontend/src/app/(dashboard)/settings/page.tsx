"use client";
import React, { useState } from "react";
import {
  Building2, MapPin, Share2, Palette, Image, Link2,
  Plug, DollarSign, Clock, CalendarDays, Flag, Bell,
  ShieldCheck, Settings, Loader2, ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import {
  useFullSettings, GymSettingsDTO, FullSettingsDTO,
} from "@/hooks/useSettings";

import GymInfoForm from "@/components/settings/GymInfoForm";
import AddressForm from "@/components/settings/AddressForm";
import SocialLinksForm from "@/components/settings/SocialLinksForm";
import ThemeCustomizer from "@/components/settings/ThemeCustomizer";
import LogoUploader from "@/components/settings/LogoUploader";
import LocalizationForm from "@/components/settings/LocalizationForm";
import InvoiceSettingsForm from "@/components/settings/InvoiceSettingsForm";
import IntegrationCard from "@/components/settings/IntegrationCard";
import MembershipPlanEditor from "@/components/settings/MembershipPlanEditor";
import OperatingHoursEditor from "@/components/settings/OperatingHoursEditor";
import HolidayManager from "@/components/settings/HolidayManager";
import FeatureFlagsPanel from "@/components/settings/FeatureFlagsPanel";
import NotificationsPanel from "@/components/settings/NotificationsPanel";
import SecurityPanel from "@/components/settings/SecurityPanel";
import SettingSection from "@/components/settings/SettingSection";
import { useSecuritySummary } from "@/hooks/useSettings";

// ── Nav config ─────────────────────────────────────────────────────────────

type NavId =
  | "profile" | "address" | "social" | "appearance"
  | "localization" | "invoice" | "integrations"
  | "plans" | "hours" | "holidays"
  | "features" | "notifications" | "security";

interface NavItem { id: NavId; label: string; icon: React.ReactNode; }

const NAV: NavItem[] = [
  { id: "profile",      label: "Gym Profile",       icon: <Building2 className="w-4 h-4" /> },
  { id: "address",      label: "Address",            icon: <MapPin className="w-4 h-4" /> },
  { id: "social",       label: "Social Links",       icon: <Share2 className="w-4 h-4" /> },
  { id: "appearance",   label: "Theme & Branding",   icon: <Palette className="w-4 h-4" /> },
  { id: "localization", label: "Localization",       icon: <Link2 className="w-4 h-4" /> },
  { id: "invoice",      label: "Invoice Settings",   icon: <DollarSign className="w-4 h-4" /> },
  { id: "integrations", label: "Integrations",       icon: <Plug className="w-4 h-4" /> },
  { id: "plans",        label: "Membership Plans",   icon: <Flag className="w-4 h-4" /> },
  { id: "hours",        label: "Operating Hours",    icon: <Clock className="w-4 h-4" /> },
  { id: "holidays",     label: "Holidays",           icon: <CalendarDays className="w-4 h-4" /> },
  { id: "features",     label: "Feature Flags",      icon: <Settings className="w-4 h-4" /> },
  { id: "notifications",label: "Notifications",      icon: <Bell className="w-4 h-4" /> },
  { id: "security",     label: "Security",           icon: <ShieldCheck className="w-4 h-4" /> },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<NavId>("profile");
  const { data: full, loading, error, refetch } = useFullSettings();
  const { data: secSummary } = useSecuritySummary();
  const [gymSettings, setGymSettings] = useState<GymSettingsDTO | null>(null);
  const [fullData, setFullData] = useState<FullSettingsDTO | null>(null);

  React.useEffect(() => {
    if (full) { setFullData(full); setGymSettings(full.gymSettings); }
  }, [full]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header title="Settings" />
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#f59e0b]" />
      </div>
    </div>
  );

  if (error || !fullData || !gymSettings) return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header title="Settings" />
      <div className="text-center py-20 text-[#475569]">Failed to load settings</div>
    </div>
  );

  const notifCategory = fullData.byCategory.find(c => c.category === "NOTIFICATIONS");

  const renderContent = () => {
    switch (active) {
      case "profile":
        return (
          <SettingSection title="Gym Profile" description="Basic information about your gym">
            <div className="mb-6">
              <p className="text-xs font-medium text-[#475569] mb-3">Logo & Cover Image</p>
              <LogoUploader
                logoUrl={gymSettings.logoUrl}
                coverImageUrl={gymSettings.coverImageUrl}
                onUploaded={(url, type) => setGymSettings(p => p ? { ...p, [type === "logo" ? "logoUrl" : "coverImageUrl"]: url } : p)}
              />
            </div>
            <GymInfoForm settings={gymSettings} onSaved={setGymSettings} />
          </SettingSection>
        );
      case "address":
        return (
          <SettingSection title="Address & Location" description="Physical address and business registration">
            <AddressForm settings={gymSettings} onSaved={setGymSettings} />
          </SettingSection>
        );
      case "social":
        return (
          <SettingSection title="Social Media Links" description="Connect your social media profiles">
            <SocialLinksForm settings={gymSettings} onSaved={setGymSettings} />
          </SettingSection>
        );
      case "appearance":
        return (
          <SettingSection title="Theme & Branding" description="Customise your gym colours and branding">
            <ThemeCustomizer settings={gymSettings} onSaved={setGymSettings} />
          </SettingSection>
        );
      case "localization":
        return (
          <SettingSection title="Localization" description="Timezone, currency and date preferences">
            <LocalizationForm settings={gymSettings} onSaved={setGymSettings} />
          </SettingSection>
        );
      case "invoice":
        return (
          <SettingSection title="Invoice Settings" description="Invoice numbering and footer content">
            <InvoiceSettingsForm settings={gymSettings} onSaved={setGymSettings} />
          </SettingSection>
        );
      case "integrations":
        return (
          <SettingSection title="Integrations" description="Connect third-party payment, SMS and storage providers">
            <div className="space-y-3">
              {fullData.integrations.map(i => (
                <IntegrationCard key={i.id} integration={i}
                  onUpdated={upd => setFullData(p => p ? { ...p, integrations: p.integrations.map(x => x.id === upd.id ? upd : x) } : p)} />
              ))}
            </div>
          </SettingSection>
        );
      case "plans":
        return (
          <SettingSection title="Membership Plans" description="Configure pricing, features and limits for each plan">
            <div className="space-y-4">
              {fullData.membershipPlans.map(pl => (
                <MembershipPlanEditor key={pl.id} plan={pl}
                  onUpdated={upd => setFullData(p => p ? { ...p, membershipPlans: p.membershipPlans.map(x => x.id === upd.id ? upd : x) } : p)} />
              ))}
            </div>
          </SettingSection>
        );
      case "hours":
        return (
          <SettingSection title="Operating Hours" description="Set your gym's weekly opening hours">
            <OperatingHoursEditor hours={fullData.operatingHours}
              onUpdated={upd => setFullData(p => p ? { ...p, operatingHours: upd } : p)} />
          </SettingSection>
        );
      case "holidays":
        return (
          <SettingSection title="Holidays & Closures" description="Manage public holidays and special closure dates">
            <HolidayManager holidays={fullData.upcomingHolidays} onChanged={refetch} />
          </SettingSection>
        );
      case "features":
        return (
          <SettingSection title="Feature Flags" description="Enable or disable features for your gym">
            <FeatureFlagsPanel features={fullData.features}
              onUpdated={upd => setFullData(p => p ? { ...p, features: upd } : p)} />
          </SettingSection>
        );
      case "notifications":
        return (
          <SettingSection title="Notification Settings" description="Control which channels and timing for alerts">
            <NotificationsPanel categoryData={notifCategory} onUpdated={refetch} />
          </SettingSection>
        );
      case "security":
        return (
          <SettingSection title="Security & Audit" description="Login history, IP restrictions and audit settings">
            <SecurityPanel audit={fullData.auditSettings} summary={secSummary ?? null} onUpdated={refetch} />
          </SettingSection>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header title="Settings" />
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <nav className="space-y-0.5">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setActive(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  active === n.id
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] font-semibold"
                    : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#111827]"
                }`}>
                {n.icon}
                <span className="flex-1">{n.label}</span>
                {active === n.id && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
