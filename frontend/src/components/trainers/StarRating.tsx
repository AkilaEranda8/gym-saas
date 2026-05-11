"use client";

export default function StarRating({
  rating, max = 5, size = "sm",
}: { rating: number; max?: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl" };
  return (
    <span className={`inline-flex gap-0.5 ${sizes[size]}`} title={`${rating} / ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-yellow-400" : "text-zinc-600"}>
          ★
        </span>
      ))}
    </span>
  );
}
