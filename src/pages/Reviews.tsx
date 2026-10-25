import { meta, reviewsPage, testimonials, testimonialsSection } from "@/content/content";
import Seo from "@/components/Seo";
import Section from "@/components/Section";
import Testimonials from "@/components/Testimonials";
import TrustpilotWidget from "@/components/TrustpilotWidget";
import { buttonClasses } from "@/components/ui/button";

/**
 * Reviews: a live Trustpilot TrustBox that auto-populates as clients leave
 * reviews, plus an optional section re-using the saved client testimonials
 * (off by default — toggled in the CMS on the Reviews page). Until the
 * Trustpilot value codes are set in the CMS, a friendly placeholder line
 * shows instead of a broken embed.
 */
export default function Reviews() {
  const tp = reviewsPage.trustpilot;
  const tpReady = Boolean(tp.businessUnitId && tp.templateId);

  return (
    <>
      <Seo title={meta.reviews.title} description={meta.reviews.description} path="/reviews" />

      <Section
        eyebrow={reviewsPage.eyebrow}
        heading={reviewsPage.heading}
        subline={reviewsPage.intro}
        headingLevel="h1"
        className="pt-24 md:pt-32"
      >
        {tpReady ? (
          <TrustpilotWidget
            businessUnitId={tp.businessUnitId}
            templateId={tp.templateId}
            locale={tp.locale}
            theme={tp.theme}
            heightPx={tp.heightPx}
            profileUrl={tp.profileUrl}
          />
        ) : (
          reviewsPage.comingSoon && (
            <p className="measure leading-relaxed text-umber">{reviewsPage.comingSoon}</p>
          )
        )}

        {tp.reviewUrl && (
          <div className="mt-10">
            <a
              href={tp.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary", "px-6 py-3")}
            >
              {tp.reviewButtonLabel}
            </a>
          </div>
        )}
      </Section>

      {reviewsPage.showSavedTestimonials && testimonials.length > 0 && (
        <Section
          eyebrow={testimonialsSection.eyebrow}
          heading={testimonialsSection.heading}
          tone="plaster"
        >
          <Testimonials />
        </Section>
      )}
    </>
  );
}
