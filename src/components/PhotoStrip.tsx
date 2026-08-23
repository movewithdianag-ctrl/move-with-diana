import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PhotoStripProps {
  images: { src: string; alt: string; w?: number; h?: number }[];
}

/**
 * Full-width photo band (per the owner's Paradigm Studio reference): photos
 * stand shoulder to shoulder at a shared height, each at its natural width —
 * no cropping — with flush square edges and small prev/next arrows tucked
 * under the left corner. Swipes with scroll-snap on touch.
 *
 * Uses plain <img> tags on purpose: this band renders natural-proportion
 * images at a fixed height, which the shared Photo frame (fixed aspect,
 * rounded) is deliberately not for.
 */
export default function PhotoStrip({ images }: PhotoStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: track.clientWidth * 0.6 * direction,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <section aria-label="Photo gallery" className="pb-16 pt-4 md:pb-24">
      <div
        ref={trackRef}
        className="carousel-track flex snap-x gap-1 overflow-x-auto bg-plaster"
      >
        {images.map((image, i) => (
          <img
            key={`${image.src}-${i}`}
            src={image.src}
            alt={image.alt}
            width={image.w}
            height={image.h}
            loading="lazy"
            decoding="async"
            className="carousel-slide h-[320px] w-auto shrink-0 object-cover md:h-[460px]"
          />
        ))}
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous photos"
            className="rounded-full border border-ink/15 p-3.5 text-ink/70 transition-colors hover:border-steel hover:text-steel"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next photos"
            className="rounded-full border border-ink/15 p-3.5 text-ink/70 transition-colors hover:border-steel hover:text-steel"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
