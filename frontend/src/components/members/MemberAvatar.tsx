"use client";

const PLAN_BORDER: Record<string, string> = {
  STANDARD: "#475569",
  PREMIUM:  "#f59e0b",
  ELITE:    "#a855f7",
};

const SIZES: Record<string, { outer: string; text: string }> = {
  sm: { outer: "w-8 h-8",  text: "text-xs" },
  md: { outer: "w-11 h-11", text: "text-sm" },
  lg: { outer: "w-16 h-16", text: "text-xl" },
};

interface Props {
  name: string;
  photoUrl?: string;
  plan?: string;
  size?: "sm" | "md" | "lg";
}

export default function MemberAvatar({ name, photoUrl, plan, size = "md" }: Props) {
  const s      = SIZES[size];
  const border = plan ? PLAN_BORDER[plan] ?? "#475569" : "#1e293b";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${s.outer} rounded-full border-2 flex items-center justify-center shrink-0 overflow-hidden`}
      style={{ borderColor: border, background: "#111827" }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={`${s.text} font-bold text-[#e2e8f0]`}>{initials}</span>
      )}
    </div>
  );
}
