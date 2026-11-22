import { useLocation } from "react-router-dom";
import { footer, funnelRouteKey, isOfferPath, program } from "@/content/content";
import { cn } from "@/lib/utils";

/**
 * One quiet line for the funnel routes: copyright and the "exercise, not
 * medical care" disclaimer. No links, no newsletter.
 *
 * On the order pages (the program's and the offer pages) a pay bar is pinned to the bottom of phone screens
 * (StickyPayBar), so the footer carries extra bottom padding there. That
 * keeps these lines readable above the bar at the very end of the page.
 * The order page ends with its own, longer disclaimer, so the short one is
 * left out there.
 */
export default function FunnelFooter() {
  const { chrome } = program;
  const { pathname } = useLocation();
  const isOrderPage = funnelRouteKey(pathname) === "checkout" || isOfferPath(pathname);
  const parts = [
    footer.smallPrint,
    isOrderPage ? "" : chrome.footerDisclaimer,
  ].filter((part) => part.trim() !== "");

  return (
    <footer className="border-t border-ink/10 bg-bone">
      <ul
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-6 text-xs leading-relaxed text-umber sm:flex-row sm:flex-wrap sm:gap-x-6 md:px-8",
          isOrderPage && "pb-24 lg:pb-6",
        )}
      >
        {parts.map((part) => (
          <li key={part}>{part}</li>
        ))}
      </ul>
    </footer>
  );
}
