import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  program,
  reviewsPage,
  testimonials,
  testimonialsSection,
  type Testimonial,
} from "@/content/content";
import { buttonClasses } from "@/components/ui/button";
import OrderSection from "./OrderSection";
import { useOrderProduct } from "./OrderProductContext";
import Stars from "./Stars";

const orderPageCopy = program.checkout.orderPage;

/** Reviews in the short strip near the top of the page. */
const STRIP_COUNT = 3;
/** Reviews the wall shows before "Show more reviews". */
const WALL_FIRST = 6;
/** Longer quotes on the wall fold at this many words. */
const TRUNCATE_WORDS = 40;

const cardClasses = "flex h-full flex-col rounded-photo border border-ink/10 bg-white/70 p-5 shadow-sm";

/** Real name and an initial monogram. */
function ReviewName({ name }: { name: string }) {
  return (
    <figcaption className="mt-4 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plaster font-display text-sm font-semibold text-steel-deep"
      >
        {name.charAt(0)}
      </span>
      <span className="text-sm font-semibold">{name}</span>
    </figcaption>
  );
}

/** The three short review cards right under the product block. */
export function ReviewStrip({ items }: { items: Testimonial[] }) {
  const { testimonialsHeading } = useOrderProduct();
  const shown = items.slice(0, STRIP_COUNT);
  if (shown.length === 0) return null;

  return (
    <OrderSection heading={testimonialsHeading} band>
      <ul className="grid gap-5 md:grid-cols-3">
        {shown.map((t) => (
          <li key={t.name}>
            <figure className={cardClasses}>
              <Stars className="mb-3" />
              <blockquote className="line-clamp-5 flex-1 text-[0.95rem] leading-relaxed text-ink/90">
                “{t.quote}”
              </blockquote>
              <ReviewName name={t.name} />
            </figure>
          </li>
        ))}
      </ul>
    </OrderSection>
  );
}

/** One review on the wall. Long quotes fold, with a "Read more" button on its own line. */
function WallCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const words = t.quote.split(/\s+/);
  const isLong = words.length > TRUNCATE_WORDS;
  const shown = expanded || !isLong ? t.quote : `${words.slice(0, TRUNCATE_WORDS).join(" ")}…`;

  return (
    <figure className={cardClasses}>
      <Stars className="mb-3" />
      <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-ink/90">
        “{shown}”
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="-mb-2 mt-1 flex min-h-11 items-center font-semibold text-steel underline decoration-steel/40 underline-offset-2 hover:decoration-steel"
          >
            {expanded ? testimonialsSection.readLess : testimonialsSection.readMore}
          </button>
        )}
      </blockquote>
      <ReviewName name={t.name} />
    </figure>
  );
}

/**
 * The review wall near the end of the order page: every saved testimonial,
 * six first, the rest behind one button, then the link to Trustpilot. The
 * three from the strip are here too, in full.
 */
export function ReviewWall({
  sectionRef,
}: {
  /** The buy box jumps here from its review count. */
  sectionRef: RefObject<HTMLElement>;
}) {
  const [showAll, setShowAll] = useState(false);
  const firstNewRef = useRef<HTMLLIElement>(null);
  const items = testimonials;
  const trustpilotUrl = reviewsPage.trustpilot.profileUrl;

  // The button is gone once pressed, so focus moves to the first new review.
  useEffect(() => {
    if (showAll) firstNewRef.current?.focus({ preventScroll: true });
  }, [showAll]);

  if (items.length === 0) return null;
  const shown = showAll ? items : items.slice(0, WALL_FIRST);

  return (
    <OrderSection heading={reviewsPage.heading} sectionRef={sectionRef}>
      <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t, i) => (
          <li
            key={t.name}
            ref={i === WALL_FIRST ? firstNewRef : undefined}
            tabIndex={i === WALL_FIRST ? -1 : undefined}
            className="focus:outline-none"
          >
            <WallCard t={t} />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-2">
        {!showAll && items.length > WALL_FIRST && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={buttonClasses("ghost", "min-h-12 px-7")}
          >
            {orderPageCopy.showMoreReviewsLabel}
          </button>
        )}
        {trustpilotUrl && orderPageCopy.reviewsLinkLabel && (
          <a
            href={trustpilotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-steel underline decoration-steel/40 underline-offset-4 hover:decoration-steel"
          >
            {orderPageCopy.reviewsLinkLabel}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </a>
        )}
      </div>
    </OrderSection>
  );
}
