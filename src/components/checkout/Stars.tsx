import { Star } from "lucide-react";
import { fillTokens, program } from "@/content/content";
import { cn } from "@/lib/utils";

const orderPageCopy = program.checkout.orderPage;

/**
 * The star rating shown with the reviews. The number is the owner's, from
 * Trustpilot (program.json, checkout.orderPage.starRating); 0 renders nothing.
 */
export default function Stars({ className }: { className?: string }) {
  const rating = orderPageCopy.starRating;
  if (rating <= 0) return null;

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5", className)}>
      <span className="sr-only">{fillTokens(orderPageCopy.starsLabel, { rating })}</span>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("h-4 w-4", i < rating ? "fill-trustpilot text-trustpilot" : "text-ink/25")}
        />
      ))}
    </span>
  );
}
