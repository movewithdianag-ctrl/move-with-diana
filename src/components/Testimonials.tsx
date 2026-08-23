import { useEffect, useRef, useState } from "react";
import { testimonials, testimonialsSection, type Testimonial } from "@/content/content";
import { cn } from "@/lib/utils";

const TRUNCATE_WORDS = 40;

/**
 * Credibility styling (§4.1): real full names, an initial monogram instead
 * of stock avatars, no fake star ratings. Long quotes truncate at ~40 words
 * with an inline "Read more" expander.
 */
function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const words = t.quote.split(/\s+/);
  const isLong = words.length > TRUNCATE_WORDS;
  const shown = expanded || !isLong ? t.quote : words.slice(0, TRUNCATE_WORDS).join(" ") + "…";

  return (
    <figure className="flex h-full flex-col rounded-photo border border-ink/10 bg-white/70 p-6 shadow-sm">
      <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-ink/90">
        “{shown}”
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="ml-2 inline font-semibold text-steel underline decoration-steel/40 underline-offset-2 hover:decoration-steel"
          >
            {expanded ? testimonialsSection.readLess : testimonialsSection.readMore}
          </button>
        )}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-plaster font-display text-sm font-semibold text-steel-deep"
        >
          {t.name.charAt(0)}
        </span>
        <span className="text-sm font-semibold">{t.name}</span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Track which slide is centered, to light the matching dot.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const slideWidth = track.scrollWidth / testimonials.length;
      setActive(Math.round(track.scrollLeft / slideWidth));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slideWidth = track.scrollWidth / testimonials.length;
    track.scrollTo({ left: slideWidth * i, behavior: "smooth" });
  };

  return (
    <div>
      {/* Mobile: swipeable snap carousel with dots */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          className="carousel-track -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2"
          role="region"
          aria-label="Client testimonials"
          tabIndex={0}
        >
          {testimonials.map((t) => (
            <div key={t.name} className="carousel-slide w-[85%] shrink-0">
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to testimonial from ${t.name}`}
              aria-current={active === i || undefined}
              className={cn(
                "h-2 rounded-full transition-all",
                // Inactive dots use full umber — ink/20 fell below the 3:1
                // non-text contrast minimum on the plaster section ground.
                active === i ? "w-5 bg-steel" : "w-2 bg-umber",
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 3-column masonry via CSS columns */}
      <div className="hidden gap-6 md:block md:columns-3">
        {testimonials.map((t) => (
          <div key={t.name} className="mb-6 break-inside-avoid">
            <TestimonialCard t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
