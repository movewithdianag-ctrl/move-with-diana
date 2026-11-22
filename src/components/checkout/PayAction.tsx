import { useEffect, useId, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Clock, Loader2, Mail } from "lucide-react";
import { mailtoHref, program } from "@/content/content";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const orderPageCopy = program.checkout.orderPage;

/** How long the "opening" state may last before the button resets itself. */
const BUSY_RESET_MS = 8000;

export interface PayLinkProps {
  /** Stripe Payment Link, already passed through withPrefill(). Never "". */
  href: string;
  /** Button text, e.g. "Start Program". */
  label: string;
  /** Fires once per click of the live pay link (analytics only). */
  onPay: () => void;
  className?: string;
}

/**
 * The live pay link, shared by the pay buttons and the phone pay bar. It is a
 * real link to Stripe Checkout (same tab). After the first tap it shows an
 * "opening" state and ignores further taps, so a slow connection cannot
 * fire the click twice. The state clears when the link changes, when the
 * visitor comes back with the Back button, or after a few seconds.
 */
export function PayLink({ href, label, onPay, className }: PayLinkProps) {
  const [busy, setBusy] = useState(false);

  // A different link (new prefill): start fresh.
  useEffect(() => setBusy(false), [href]);

  // Back from Stripe: the browser may restore this page from its cache with
  // the busy state still set.
  useEffect(() => {
    const reset = () => setBusy(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setBusy(false), BUSY_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [busy]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (busy) {
      e.preventDefault();
      return;
    }
    onPay();
    // Opening in a new tab or window leaves this page as it is. A link on
    // this site (the contact page, before Stripe is set) is not checkout.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || href.startsWith("/")) return;
    setBusy(true);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-busy={busy || undefined}
      className={buttonClasses("primary", cn(busy && "opacity-80", className))}
    >
      {busy && (
        <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />
      )}
      {busy ? orderPageCopy.payBusyLabel : label}
    </a>
  );
}

export interface PayActionProps {
  /** Stripe Payment Link, already passed through withPrefill(). "" = not set up yet. */
  href: string;
  /** Button text, e.g. "Start Program". */
  label: string;
  /** Subject line for the "email me for a payment link" fallback. */
  mailSubject: string;
  /** Fires on click of the live pay link (analytics only). */
  onPay: () => void;
  /** Small text directly under the button (the health review note). "" hides it. */
  note?: string;
  /** End of page: while the link is missing, only the button and the email link. */
  compact?: boolean;
  className?: string;
}

/**
 * The full-width pay button of the order page (buy box and end of page).
 *
 *  • href set → a real link to Stripe Checkout, same tab.
 *  • href ""  → the same button in a clearly disabled "payment link coming
 *    soon" state, the pendingStripeNote, and two ways to reach Diana instead
 *    (email, or the contact page for phones with no mail app set up).
 *
 * The page goes live by pasting the Payment Link into program.json; nothing
 * here needs to change.
 */
export default function PayAction({
  href,
  label,
  mailSubject,
  onPay,
  note,
  compact,
  className,
}: PayActionProps) {
  const noteId = useId();
  const { checkout } = program;

  const noteLine = note ? <p className="text-sm leading-relaxed text-umber">{note}</p> : null;

  if (href) {
    return (
      <div className={cn("space-y-3", className)}>
        <PayLink
          href={href}
          label={label}
          onPay={onPay}
          className="min-h-14 w-full px-5 text-center text-base"
        />
        {noteLine}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* aria-disabled (not disabled) keeps the button reachable by keyboard
          and screen reader, so the explanation below is actually announced. */}
      <button
        type="button"
        aria-disabled="true"
        aria-describedby={compact ? undefined : noteId}
        onClick={(e) => e.preventDefault()}
        className="inline-flex min-h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-dashed border-ink/30 bg-plaster/70 px-5 text-center text-base font-semibold leading-snug text-umber"
      >
        <Clock aria-hidden="true" className="h-4 w-4 shrink-0" />
        {orderPageCopy.pendingButtonLabel}
      </button>

      {noteLine}

      {!compact && (
        <p id={noteId} className="text-sm leading-relaxed text-umber">
          {checkout.pendingStripeNote}
        </p>
      )}

      <a
        href={mailtoHref(mailSubject)}
        className={buttonClasses("ghost", "min-h-11 w-full px-5 text-center")}
      >
        <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
        {checkout.pendingStripeButtonLabel}
      </a>

      {!compact && (
        <p className="text-center">
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center text-sm text-steel underline decoration-steel/40 underline-offset-4 hover:decoration-steel"
          >
            {orderPageCopy.pendingContactLabel}
          </Link>
        </p>
      )}
    </div>
  );
}
