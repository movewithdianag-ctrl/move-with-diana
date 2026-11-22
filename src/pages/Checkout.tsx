import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fillTokens, funnelRoutes, program, programProduct } from "@/content/content";
import { readIntakeSession, readOrderArrival, trackFunnelEvent, withPrefill } from "@/lib/intake";
import OrderPage, { type PayPlacement } from "@/components/checkout/OrderPage";

/**
 * The 8-Week Pilates Program order page at /pilates-program. One price, one
 * pay button. Anyone who wants to pay over time picks that on the Stripe
 * page, where the payment provider offers it; this site never runs a plan
 * itself. The layout itself is OrderPage, shared with the offer pages.
 *
 * Two ways in (readOrderArrival). A direct visitor sees the page as it is,
 * with the program name as the h1. Someone who just qualified on /apply gets
 * one slim "you qualify" bar on top, which is then the h1.
 *
 * The pay button links straight to the Stripe Payment Link (same tab).
 * While that link is "" in program.json the button shows a
 * disabled "coming soon" state with ways to reach Diana, so the page can be
 * reviewed before Stripe is connected and goes live by pasting in one URL.
 */
export default function Checkout() {
  // Read once: the intake result saved by /apply (null for a direct visitor).
  const [session] = useState(() => readIntakeSession());
  const { search } = useLocation();
  const arrival = useMemo(() => readOrderArrival(session, search), [session, search]);
  const { checkout } = program;
  const option = checkout.payInFull;

  // Someone who told us they are not cleared for exercise is never offered a
  // pay button: they go back to the kind "not yet" page.
  // The owner's ?preview links always show the page and are never counted.
  const isPreview = new URLSearchParams(search).has("preview");
  const notCleared = !isPreview && session?.outcome === "not_cleared";

  // Email prefill + opaque lead id + utm tags for Stripe. "" while the link is not set.
  const liveHref = useMemo(
    () => withPrefill(option.stripeUrl, session),
    [option.stripeUrl, session],
  );
  // ?preview=...&pay=1 shows the pay buttons as they look once the Stripe link
  // is pasted in. The stand-in link goes nowhere.
  const payPreview = isPreview && new URLSearchParams(search).has("pay");
  const href = liveHref || (payPreview ? "#pay-preview" : "");
  const mailSubject = `${program.shortName}: ${option.label}`;

  // One view per visit.
  useEffect(() => {
    if (!notCleared && !isPreview) trackFunnelEvent("checkout_view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackPay = useCallback(
    (placement: PayPlacement) => {
      if (!isPreview) trackFunnelEvent("checkout_click", { placement });
    },
    [isPreview],
  );

  if (notCleared) return <Navigate to={funnelRoutes.notYet} replace />;

  // The no-name line also covers a with-name line left empty in the CMS.
  const qualifiedHeading =
    (arrival.firstName && checkout.qualified.heading
      ? fillTokens(checkout.qualified.heading, { firstName: arrival.firstName })
      : "") || checkout.qualified.headingNoName;

  return (
    <OrderPage
      product={programProduct}
      href={href}
      mailSubject={mailSubject}
      banner={arrival.fromForm ? qualifiedHeading : ""}
      reviewNote={arrival.fromForm && arrival.needsReview ? checkout.qualified.reviewNote : ""}
      onPay={trackPay}
    />
  );
}
