"use client";
import { type ReviewDTO } from "@/hooks/useTrainers";
import StarRating from "./StarRating";

export default function ReviewList({ reviews }: { reviews: ReviewDTO[] }) {
  if (reviews.length === 0) {
    return <p className="text-zinc-500 text-sm py-4 text-center">No reviews yet</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-sm font-medium">{r.reviewerName}</span>
            <span className="text-zinc-500 text-xs">
              {new Date(r.createdAt).toLocaleDateString("en-LK", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
          <StarRating rating={r.rating} size="sm" />
          {r.reviewText && (
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{r.reviewText}</p>
          )}
        </div>
      ))}
    </div>
  );
}
