import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { fillTokens, homeReviews, testimonials } from "@/content/content";
import Stars from "@/components/checkout/Stars";
import Testimonials from "@/components/Testimonials";

/**
 * The end of the home page: the star rating with the review count, the same
 * review cards as the Reviews page, and a link to that page. Which reviews
 * show is set in home.json (reviews, names); with none, the section drops out.
 */
export default function HomeReviews() {
  if (homeReviews.items.length === 0) return null;

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

        <Testimonials items={homeReviews.items} even />

        {homeReviews.linkLabel && (
          <div className="mt-6 border-t border-ink/15 pt-8 md:mt-10">
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
