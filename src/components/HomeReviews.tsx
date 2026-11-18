import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fillTokens, homeReviews, testimonials, type Testimonial } from "@/content/content";
import Stars from "@/components/checkout/Stars";

/** Real name and an initial monogram, as on the order page. */
function Attribution({ name }: { name: string }) {
  return (
    <figcaption className="mt-6 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone font-display text-sm font-semibold text-steel-deep"
      >
        {name.charAt(0)}
      </span>
      <span className="text-sm font-semibold">{name}</span>
    </figcaption>
  );
}

function SmallQuote({ t }: { t: Testimonial }) {
  return (
    <figure className="border-t border-ink/15 pt-6">
      <blockquote className="leading-relaxed text-ink/90">“{t.quote}”</blockquote>
      <Attribution name={t.name} />
    </figure>
  );
}

/**
 * The end of the home page: one review set large, two beside it, the star
 * rating with the review count, and a link to the Reviews page. Which
 * reviews show is set in home.json (reviews, names); with none, the section
 * drops out.
 */
export default function HomeReviews() {
  const [featured, ...rest] = homeReviews.items;
  if (!featured) return null;

  const countLine = homeReviews.countLine
    ? fillTokens(homeReviews.countLine, { count: testimonials.length })
    : "";

  return (
    <section aria-labelledby="home-reviews-heading" className="bg-plaster/60 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2
            id="home-reviews-heading"
            className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl"
          >
            {homeReviews.heading}
          </h2>
          {countLine && (
            <p className="flex items-center gap-3 text-sm text-umber">
              <Stars />
              <span>{countLine}</span>
            </p>
          )}
        </div>

        <div className="grid gap-12 md:grid-cols-12 md:gap-x-14">
          <figure className="md:col-span-7">
            <span
              aria-hidden="true"
              className="block font-display text-6xl leading-none text-steel/40 md:text-7xl"
            >
              “
            </span>
            <blockquote className="-mt-3 font-display text-2xl font-normal leading-snug tracking-tight md:text-[1.75rem] md:leading-snug">
              {featured.quote}
            </blockquote>
            <Attribution name={featured.name} />
          </figure>

          {rest.length > 0 && (
            <div className="flex flex-col gap-10 md:col-span-5">
              {rest.map((t) => (
                <SmallQuote key={t.name} t={t} />
              ))}
            </div>
          )}
        </div>

        {homeReviews.linkLabel && (
          <div className="mt-12 border-t border-ink/15 pt-8 md:mt-16">
            <Link
              to="/reviews"
              className="group inline-flex min-h-11 items-center gap-2 font-semibold text-steel underline decoration-steel/40 underline-offset-4 hover:decoration-steel"
            >
              {homeReviews.linkLabel}
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
