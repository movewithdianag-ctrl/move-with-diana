import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { offers } from "@/content/content";
import { SKOOL_COMMUNITY_URL } from "@/lib/config";
import Photo from "@/components/Photo";

/**
 * Heading-less offers carousel on the home page (per the owner's reference
 * build): full-frame photo cards with the offer title, one-liner, and an
 * explicit link-styled CTA. The whole card — image and text — clicks through
 * to the contact form with that offer preselected (the community card goes
 * straight to Skool once SKOOL_COMMUNITY_URL is configured).
 */
export default function OffersCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : track.clientWidth / 3;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: step * direction, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section aria-label="Offers" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="mb-5 hidden justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous offers"
            className="rounded-full border border-ink/15 p-2.5 text-ink/70 transition-colors hover:border-steel hover:text-steel"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next offers"
            className="rounded-full border border-ink/15 p-2.5 text-ink/70 transition-colors hover:border-steel hover:text-steel"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div
          ref={trackRef}
          className="carousel-track -mx-5 flex snap-x gap-6 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0"
        >
          {offers.map((offer) => {
            const cta = offer.ctas[0];
            const external = cta.slug === "community" && SKOOL_COMMUNITY_URL;
            const cardBody = (
              <>
                <Photo
                  src={offer.image.src}
                  alt={offer.image.alt}
                  ratio="natural"
                  width={offer.image.w}
                  height={offer.image.h}
                />
                <h2 className="mt-4 font-display text-sm font-semibold uppercase tracking-eyebrow transition-colors group-hover:text-steel">
                  {offer.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-umber">{offer.oneLiner}</p>
                {/* Explicit link-styled CTA so clickability is obvious;
                    mt-auto pins it to the card bottom so all CTAs align
                    across the row regardless of how the text above wraps. */}
                <span className="mt-auto inline-flex items-center gap-1.5 self-start pt-3 text-sm font-semibold text-steel underline decoration-steel/40 underline-offset-4 transition-colors group-hover:decoration-steel">
                  {cta.label}
                  {external ? (
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  ) : (
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  )}
                </span>
              </>
            );
            const cardClass =
              "carousel-slide group flex w-[80%] shrink-0 flex-col sm:w-[46%] lg:w-[31%]";

            return external ? (
              <a
                key={offer.id}
                data-card
                href={SKOOL_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                {cardBody}
              </a>
            ) : (
              <Link key={offer.id} data-card to={`/contact?interest=${cta.slug}`} className={cardClass}>
                {cardBody}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
