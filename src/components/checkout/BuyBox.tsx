import type { RefObject } from "react";
import { Check } from "lucide-react";
import { fillTokens, program, testimonials } from "@/content/content";
import PayAction from "./PayAction";
import Stars from "./Stars";

const orderPageCopy = program.checkout.orderPage;

export interface BuyBoxProps {
  /** Stripe link after withPrefill(). "" = not set up yet. */
  href: string;
  mailSubject: string;
  onPay: () => void;
  /** Wraps the pay button; the page watches it to know when to show the phone pay bar. */
  payRef: RefObject<HTMLDivElement>;
  /**
   * Pass it when the program name is the page h1; the page focuses it on
   * arrival. Leave out when the "you qualify" bar above is the h1: the name
   * is then an h2.
   */
  headingRef?: RefObject<HTMLHeadingElement>;
  /** Jumps to the review wall lower on the page. Leave out to hide the reviews line. */
  onShowReviews?: () => void;
  /** Shown under the pay button for someone marked "needs review". "" hides it. */
  reviewNote: string;
}

/**
 * The buy box, beside the photo on desktop and under it on phones: program
 * name, review count, price, the short list of what is included, and one
 * pay button. Nothing else goes in here.
 *
 * The stars come from the owner's Trustpilot rating (orderPage.starRating);
 * the count is the number of saved reviews.
 */
export default function BuyBox({
  href,
  mailSubject,
  onPay,
  payRef,
  headingRef,
  onShowReviews,
  reviewNote,
}: BuyBoxProps) {
  const option = program.checkout.payInFull;
  const reviewsLine =
    onShowReviews && testimonials.length > 0 && orderPageCopy.reviewsLine
      ? fillTokens(orderPageCopy.reviewsLine, { count: testimonials.length })
      : "";
  const Heading = headingRef ? "h1" : "h2";

  return (
    <div>
      <Heading
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className="font-display text-[1.625rem] font-medium leading-[1.15] tracking-tight focus:outline-none sm:text-3xl lg:text-[2.125rem]"
      >
        {program.name}
      </Heading>

      {reviewsLine && (
        <button
          type="button"
          onClick={onShowReviews}
          className="mt-1 inline-flex min-h-11 items-center gap-2 text-left text-sm font-medium text-steel underline decoration-steel/40 underline-offset-4 hover:decoration-steel"
        >
          <Stars />
          {reviewsLine}
        </button>
      )}

      <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-[2.75rem] font-medium leading-none tabular-nums lg:text-5xl">
          {option.priceDisplay}
        </span>
        {option.sublabel && <span className="text-sm text-umber">{option.sublabel}</span>}
      </p>

      {orderPageCopy.highlights.length > 0 && (
        <ul className="mt-5 space-y-2.5 rounded-photo border border-ink/15 p-4">
          {orderPageCopy.highlights.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-steel" />
              {line}
            </li>
          ))}
        </ul>
      )}

      <div ref={payRef} className="mt-5">
        <PayAction
          href={href}
          label={option.buttonLabel}
          mailSubject={mailSubject}
          onPay={onPay}
          note={reviewNote}
        />
      </div>
    </div>
  );
}
