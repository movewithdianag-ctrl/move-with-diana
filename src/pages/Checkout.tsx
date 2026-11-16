import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import {
  fillTokens,
  funnelMeta,
  funnelRoutes,
  program,
  programTestimonials,
  testimonials,
} from "@/content/content";
import { readIntakeSession, readOrderArrival, trackFunnelEvent, withPrefill } from "@/lib/intake";
import { cn } from "@/lib/utils";
import Photo from "@/components/Photo";
import Seo from "@/components/Seo";
import BuyBox from "@/components/checkout/BuyBox";
import NextSteps from "@/components/checkout/NextSteps";
import OrderFaq from "@/components/checkout/OrderFaq";
import PayAction from "@/components/checkout/PayAction";
import { HowItWorks, Included } from "@/components/checkout/ProgramDetails";
import { ReviewStrip, ReviewWall } from "@/components/checkout/Reviews";
import StickyPayBar, { useStickyPayBar } from "@/components/checkout/StickyPayBar";
import { useFocusHeading } from "@/components/thankyou/useFocusHeading";

const orderPageCopy = program.checkout.orderPage;

/** Where a pay button sits on the page. Sent with the click event, nothing personal. */
type PayPlacement = "card" | "sticky" | "bottom";

/**
 * The 8-Week Pilates Program order page at /pilates-program, laid out like a product
 * page. One price, one pay button. Anyone who wants to pay over time picks
 * that on the Stripe page, where the payment provider offers it; this site
 * never runs a plan itself.
 *
 * First screen: the photo and the buy box (name, review count, price, what
 * is included in short, pay button), side by side on desktop and stacked on
 * phones. Below, full-width sections: three reviews, what is included, how
 * the 8 weeks work, what happens next, questions, the review wall, one more
 * pay button, the disclaimer. Phones also get a pay bar pinned to the bottom
 * whenever no pay button is on screen.
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
  const liveHref = useMemo(() => withPrefill(option.stripeUrl, session), [option.stripeUrl, session]);
  // ?preview=...&pay=1 shows the pay buttons as they look once the Stripe link
  // is pasted in. The stand-in link goes nowhere.
  const payPreview = isPreview && new URLSearchParams(search).has("pay");
  const href = liveHref || (payPreview ? "#pay-preview" : "");
  const mailSubject = `${program.shortName}: ${option.label}`;

  const payRef = useRef<HTMLDivElement>(null);
  const bottomPayRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const barVisible = useStickyPayBar([payRef, bottomPayRef]);
  // The page h1: the "you qualify" line when it shows, else the program name.
  const headingRef = useFocusHeading();

  // One view per visit.
  useEffect(() => {
    if (!notCleared && !isPreview) trackFunnelEvent("checkout_view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackPay = useCallback(
    (placement: PayPlacement) => () => {
      if (!isPreview) trackFunnelEvent("checkout_click", { placement });
    },
    [isPreview],
  );

  const showReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView();
    reviewsRef.current?.focus({ preventScroll: true });
  }, []);

  if (notCleared) return <Navigate to={funnelRoutes.notYet} replace />;

  // The no-name line also covers a with-name line left empty in the CMS.
  const qualifiedHeading =
    (arrival.firstName && checkout.qualified.heading
      ? fillTokens(checkout.qualified.heading, { firstName: arrival.firstName })
      : "") || checkout.qualified.headingNoName;
  const showQualified = arrival.fromForm;

  return (
    <>
      <Seo {...funnelMeta.checkout} />

      {/* A status line, not a hero: one slim bar above the product. */}
      {showQualified && (
        <div className="border-b border-ink/10 bg-plaster/70">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2.5 px-5 py-2.5 md:px-8 lg:justify-center">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-steel text-bone"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-base font-medium leading-snug tracking-tight focus:outline-none sm:text-lg"
            >
              {qualifiedHeading}
            </h1>
          </div>
        </div>
      )}

      {/* The product: photo and buy box. Phones show the middle band of the photo. */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-5 md:px-8 lg:pb-16 lg:pt-10">
        <div className="mx-auto sm:max-w-xl lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-x-14 xl:gap-x-20">
          {orderPageCopy.photo.src && (
            <Photo
              src={orderPageCopy.photo.src}
              alt={orderPageCopy.photo.alt}
              width={orderPageCopy.photo.w}
              height={orderPageCopy.photo.h}
              ratio="4/5"
              priority
              className={cn(
                "mb-5 aspect-[3/2] max-[359px]:aspect-[2/1] lg:mb-0 lg:aspect-[4/5] lg:min-h-[26rem] lg:w-full",
                // Fits the first screen; the "you qualify" bar takes 3rem more.
                showQualified
                  ? "lg:max-h-[calc(100dvh-11.5rem)]"
                  : "lg:max-h-[calc(100dvh-8.5rem)]",
              )}
            />
          )}
          <BuyBox
            href={href}
            mailSubject={mailSubject}
            onPay={trackPay("card")}
            payRef={payRef}
            headingRef={showQualified ? undefined : headingRef}
            onShowReviews={testimonials.length > 0 ? showReviews : undefined}
            reviewNote={arrival.fromForm && arrival.needsReview ? checkout.qualified.reviewNote : ""}
          />
        </div>
      </div>

      <ReviewStrip items={programTestimonials} />
      <Included />
      <HowItWorks />
      <NextSteps />
      <OrderFaq />
      <ReviewWall sectionRef={reviewsRef} />

      {/* One more pay button for anyone who read to the end. */}
      <div className="border-t border-ink/10 px-5 py-12 text-center md:px-8 lg:py-16">
        <p className="mx-auto max-w-3xl font-display text-2xl font-medium leading-tight tracking-tight md:text-3xl">
          {program.name}
        </p>
        <p className="mt-3 font-display text-4xl font-medium leading-none tabular-nums">
          {option.priceDisplay}
        </p>
        <div ref={bottomPayRef} className="mx-auto mt-6 max-w-sm">
          <PayAction
            href={href}
            label={option.buttonLabel}
            mailSubject={mailSubject}
            onPay={trackPay("bottom")}
            compact
          />
        </div>
      </div>

      {/* Room for the phone pay bar is added under the footer (FunnelFooter), not here. */}
      {program.disclaimer && (
        <p className="mx-auto max-w-3xl px-5 pb-10 text-center text-xs leading-relaxed text-umber md:px-8">
          {program.disclaimer}
        </p>
      )}

      <StickyPayBar
        visible={barVisible}
        option={option}
        href={href}
        mailSubject={mailSubject}
        onPay={trackPay("sticky")}
      />
    </>
  );
}
