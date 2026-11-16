import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { Mail } from "lucide-react";
import { mailtoHref, program, type CheckoutOption } from "@/content/content";
import { FUNNEL_HEADER_ID } from "@/components/FunnelHeader";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PayLink } from "./PayAction";

const orderPageCopy = program.checkout.orderPage;

/** Used only if the funnel header cannot be measured: its bar alone (h-14). */
const FUNNEL_HEADER_FALLBACK_PX = 56;

/**
 * True while no pay button of the page is on screen: neither the one in the
 * buy box nor the one at the end of the page. So on a phone the bar is there
 * from the first paint when the buy box button starts below the fold, steps
 * aside while a real pay button is in view, and is gone at the end of the
 * page, where the last pay button and the footer lines sit.
 *
 * A button hidden behind the sticky funnel header counts as out of view. That
 * header is taller with the steps trail on phones, so its height is measured,
 * and the observer is rebuilt when it changes. The first check runs before
 * paint, so the bar does not slide in a moment after the page appears.
 */
export function useStickyPayBar(payRefs: RefObject<HTMLElement>[]): boolean {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const targets = payRefs.flatMap((ref) => (ref.current ? [ref.current] : []));
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;

    const header = document.getElementById(FUNNEL_HEADER_ID);
    let observer: IntersectionObserver | null = null;
    let headerPx = -1;

    const check = () => {
      const anyOnScreen = targets.some((target) => {
        const rect = target.getBoundingClientRect();
        return rect.bottom > headerPx + 1 && rect.top < window.innerHeight;
      });
      setVisible(!anyOnScreen);
    };

    const observe = () => {
      const measured = Math.round(header?.getBoundingClientRect().height ?? 0);
      const next = measured || FUNNEL_HEADER_FALLBACK_PX;
      if (next === headerPx) return;
      headerPx = next;
      observer?.disconnect();
      observer = new IntersectionObserver(check, {
        rootMargin: `-${next}px 0px 0px 0px`,
        threshold: 0,
      });
      targets.forEach((target) => observer?.observe(target));
      check();
    };

    observe();
    const resize =
      header && typeof ResizeObserver !== "undefined" ? new ResizeObserver(observe) : null;
    if (header) resize?.observe(header);

    return () => {
      resize?.disconnect();
      observer?.disconnect();
    };
    // The refs are stable objects; the list is rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return visible;
}

export interface StickyPayBarProps {
  visible: boolean;
  option: CheckoutOption;
  /** Stripe link after withPrefill(). "" = not set up yet. */
  href: string;
  mailSubject: string;
  onPay: () => void;
}

/**
 * Phone-only bar pinned to the bottom of the screen: the program, the price
 * and one pay button. Hidden with `visibility` (not just moved off screen) so
 * it leaves the tab order and the accessibility tree while it is out of sight,
 * which also means there is only ever one pay button on screen at a time.
 * On desktop the pay button is on the first screen, so the bar never renders there.
 */
export default function StickyPayBar({ visible, option, href, mailSubject, onPay }: StickyPayBarProps) {
  const { checkout } = program;

  // No slide-in on arrival: the bar is simply there. It animates from then on.
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="region"
      aria-label={orderPageCopy.stickyBarLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-bone pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-[0_-8px_24px_-16px_rgba(40,32,24,0.35)] lg:hidden",
        animated && "transition-[transform,visibility] duration-300",
        visible ? "visible translate-y-0" : "invisible translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <p className="min-w-0 leading-tight">
          <span className="block truncate text-xs text-umber">{program.shortName}</span>
          <span className="block truncate text-sm font-semibold tabular-nums">{option.priceDisplay}</span>
        </p>

        {href ? (
          <PayLink
            href={href}
            label={option.buttonLabel}
            onPay={onPay}
            className="min-h-12 shrink-0 px-5 text-[0.9375rem]"
          />
        ) : (
          <a
            href={mailtoHref(mailSubject)}
            className={buttonClasses("ghost", "min-h-12 min-w-0 max-w-[60%] px-4 text-center leading-tight")}
          >
            <Mail aria-hidden="true" className="hidden h-4 w-4 shrink-0 min-[400px]:block" />
            {checkout.pendingStripeButtonLabel}
          </a>
        )}
      </div>
    </div>
  );
}
