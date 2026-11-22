import { useCallback, useRef } from "react";
import { Check } from "lucide-react";
import { testimonials, type OrderProduct } from "@/content/content";
import { cn } from "@/lib/utils";
import Photo from "@/components/Photo";
import Seo from "@/components/Seo";
import BuyBox from "./BuyBox";
import NextSteps from "./NextSteps";
import OrderFaq from "./OrderFaq";
import { OrderProductContext } from "./OrderProductContext";
import PayAction from "./PayAction";
import { HowItWorks, Included } from "./ProgramDetails";
import { ReviewStrip, ReviewWall } from "./Reviews";
import StickyPayBar, { useStickyPayBar } from "./StickyPayBar";
import { useFocusHeading } from "@/components/thankyou/useFocusHeading";

/** Where a pay button sits on the page. Sent with the click event, nothing personal. */
export type PayPlacement = "card" | "sticky" | "bottom";

export interface OrderPageProps {
  product: OrderProduct;
  /** Where the pay buttons go. "" shows the "coming soon" state. */
  href: string;
  /** Subject of the "email me for a payment link" fallback. */
  mailSubject: string;
  /** The slim bar on top (the "you qualify" line), then the page h1. "" leaves it out. */
  banner?: string;
  /** Under the buy box pay button (the health review note). "" hides it. */
  reviewNote?: string;
  /** Called on a pay button click, with where it sits. */
  onPay?: (placement: PayPlacement) => void;
}

/**
 * An order page laid out like a product page. One price, one pay button.
 *
 * First screen: the photo and the buy box (name, review count, price, a
 * short description, the check mark lines, pay button), side by side on
 * desktop and stacked on phones. Below, full-width sections: three reviews,
 * what is included, how it works, what happens next, questions, the review
 * wall, one more pay button, the disclaimer. Phones also get a pay bar pinned
 * to the bottom whenever no pay button is on screen. Sections with no content
 * drop out.
 */
export default function OrderPage({
  product,
  href,
  mailSubject,
  banner = "",
  reviewNote = "",
  onPay,
}: OrderPageProps) {
  const { option, photo } = product;
  const payRef = useRef<HTMLDivElement>(null);
  const bottomPayRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const barVisible = useStickyPayBar([payRef, bottomPayRef]);
  // The page h1: the banner when it shows, else the product name.
  const headingRef = useFocusHeading();

  const trackPay = useCallback((placement: PayPlacement) => () => onPay?.(placement), [onPay]);

  const showReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView();
    reviewsRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <OrderProductContext.Provider value={product}>
      <Seo {...product.meta} />

      {/* A status line, not a hero: one slim bar above the product. */}
      {banner && (
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
              {banner}
            </h1>
          </div>
        </div>
      )}

      {/* The product: photo and buy box. Phones show the middle band of the photo. */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-5 md:px-8 lg:pb-16 lg:pt-10">
        <div className="mx-auto sm:max-w-xl lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-x-14 xl:gap-x-20">
          {photo.src && (
            <Photo
              src={photo.src}
              alt={photo.alt}
              width={photo.w}
              height={photo.h}
              ratio="4/5"
              priority
              className={cn(
                "mb-5 aspect-[3/2] max-[359px]:aspect-[2/1] lg:mb-0 lg:aspect-[4/5] lg:min-h-[26rem] lg:w-full",
                // Fits the first screen; the banner takes 3rem more.
                banner ? "lg:max-h-[calc(100dvh-11.5rem)]" : "lg:max-h-[calc(100dvh-8.5rem)]",
              )}
            />
          )}
          <BuyBox
            href={href}
            mailSubject={mailSubject}
            onPay={trackPay("card")}
            payRef={payRef}
            headingRef={banner ? undefined : headingRef}
            onShowReviews={testimonials.length > 0 ? showReviews : undefined}
            reviewNote={reviewNote}
          />
        </div>
      </div>

      <ReviewStrip items={product.testimonials} />
      <Included />
      <HowItWorks />
      <NextSteps />
      <OrderFaq />
      <ReviewWall sectionRef={reviewsRef} />

      {/* One more pay button for anyone who read to the end. */}
      <div className="border-t border-ink/10 px-5 py-12 text-center md:px-8 lg:py-16">
        <p className="mx-auto max-w-3xl font-display text-2xl font-medium leading-tight tracking-tight md:text-3xl">
          {product.name}
        </p>
        {option.priceDisplay && (
          <p className="mt-3 font-display text-4xl font-medium leading-none tabular-nums">
            {option.priceDisplay}
          </p>
        )}
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
      {product.disclaimer && (
        <p className="mx-auto max-w-3xl px-5 pb-10 text-center text-xs leading-relaxed text-umber md:px-8">
          {product.disclaimer}
        </p>
      )}

      <StickyPayBar
        visible={barVisible}
        option={option}
        href={href}
        mailSubject={mailSubject}
        onPay={trackPay("sticky")}
      />
    </OrderProductContext.Provider>
  );
}
