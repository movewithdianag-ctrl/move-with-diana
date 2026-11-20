import { bookingRoutes, program, type BookingPageKey } from "@/content/content";
import BookingEmbed from "@/components/BookingEmbed";
import Seo from "@/components/Seo";

/**
 * /book/intro-call, /book/assessment and /book/session: one standalone page
 * per calendar. Diana sends the link to an existing client and they book by
 * themselves.
 *
 * One card, in the look of the booking steps on the welcome page: a small
 * label, the heading, a sentence or two, the time zone line, then the
 * calendar with its "I can't find a time" email button. Nothing else.
 *
 * Copy comes from the `bookingPages` block of program.json; the calendar
 * links, the time zone line and the button labels from `booking`.
 * These pages are not part of the application flow: no progress steps, no
 * intake session needed, nobody is sent away, no analytics event. Kept out
 * of search results (noindex here, X-Robots-Tag in public/_headers).
 */

/** Which booking link each page shows. */
const URL_FOR_EVENT: Record<BookingPageKey, "callUrl" | "assessmentUrl" | "sessionUrl"> = {
  introCall: "callUrl",
  assessment: "assessmentUrl",
  session: "sessionUrl",
};

export default function BookEvent({ event }: { event: BookingPageKey }) {
  const { booking, bookingPages } = program;
  const page = bookingPages[event];
  const url = booking[URL_FOR_EVENT[event]];

  return (
    <>
      <Seo
        title={page.metaTitle}
        description={page.metaDescription}
        path={bookingRoutes[event]}
        noindex
      />

      <div className="mx-auto w-full max-w-4xl px-5 pb-14 pt-8 md:px-8 md:pb-20 md:pt-12">
        <section
          aria-labelledby="book-event-heading"
          className="overflow-hidden rounded-photo border border-ink/10 bg-white/70 shadow-sm"
        >
          <div className="p-5 md:p-7">
            {page.eyebrow && <p className="eyebrow mb-1.5">{page.eyebrow}</p>}
            <h1
              id="book-event-heading"
              className="font-display text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl"
            >
              {page.heading}
            </h1>
            {page.text && (
              <p className="measure mt-3 whitespace-pre-line leading-relaxed text-umber">
                {page.text}
              </p>
            )}
            {/* Only true once there is a calendar to show. */}
            {booking.detailsNote && url && (
              <p className="mt-2 text-sm leading-relaxed text-umber">{booking.detailsNote}</p>
            )}
          </div>
          {/* Keyed so moving between two booking pages starts a fresh calendar. */}
          <BookingEmbed
            key={event}
            url={url}
            title={page.calendarTitle}
            pendingNote={booking.pendingNote}
            fallbackSubject={page.cantFindSubject}
          />
        </section>
      </div>
    </>
  );
}
