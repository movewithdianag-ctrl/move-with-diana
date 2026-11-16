import { ChevronRight } from "lucide-react";
import { program, type FunnelRouteKey } from "@/content/content";
import { cn } from "@/lib/utils";

type Stage = "apply" | "reserve" | "book";

/**
 * Which stage each funnel route belongs to. null hides the trail: the
 * "not yet" page offers no payment or booking, so it shows no path to them.
 */
const STAGE_FOR_ROUTE: Record<FunnelRouteKey, Stage | null> = {
  apply: "apply",
  notYet: null,
  checkout: "reserve",
  welcome: "book",
};

/**
 * The quiet "Apply > Reserve > Book" trail in the funnel header. It only
 * shows where the visitor is; the stages are never links, so nobody can
 * wander back out of a payment or skip ahead to booking.
 *
 * Rendered by FunnelHeader inside the sticky header block. On phones it is
 * one thin row under the bar (about 22px taller in total); from md up it
 * sits centred inside the 56px bar and adds no height at all.
 *
 * Labels come from the `chrome` block of program.json.
 */
export default function FunnelSteps({ route }: { route: FunnelRouteKey | null }) {
  const current = route ? STAGE_FOR_ROUTE[route] : null;
  if (!current) return null;

  const { chrome } = program;
  const stages: { key: Stage; label: string }[] = [
    { key: "apply", label: chrome.stepApply },
    { key: "reserve", label: chrome.stepReserve },
    { key: "book", label: chrome.stepBook },
  ];

  return (
    <nav
      aria-label={chrome.stepsLabel}
      className="mx-auto -mt-1.5 flex h-7 w-full max-w-6xl items-center px-5 md:absolute md:left-1/2 md:top-0 md:mt-0 md:h-14 md:w-auto md:-translate-x-1/2 md:px-0"
    >
      <ol className="flex items-center gap-1.5 text-xs leading-none text-umber">
        {stages.map((stage, i) => {
          const isCurrent = stage.key === current;
          return (
            <li
              key={stage.key}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap",
                isCurrent && "font-semibold text-ink",
              )}
            >
              {i > 0 && <ChevronRight aria-hidden="true" className="h-3 w-3 text-ink/30" />}
              {/* The list already announces the position, so the numeral is decorative. */}
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
                  isCurrent ? "bg-steel text-bone" : "border border-ink/25",
                )}
              >
                {i + 1}
              </span>
              {stage.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
