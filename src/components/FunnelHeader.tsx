import { Link, useLocation } from "react-router-dom";
import { funnelRouteKey, program, site } from "@/content/content";
import { readIntakeSession, readOrderArrival } from "@/lib/intake";
import FunnelSteps from "@/components/FunnelSteps";

/** id of the header itself, for code that needs its real height (the phone pay bar). */
export const FUNNEL_HEADER_ID = "funnel-header";

/**
 * Distraction-free header for the four 8-Week Pilates Program funnel routes: the
 * wordmark (links home) and nothing else in the bar. No site nav, nothing to
 * click away to.
 *
 * Under the bar sits FunnelSteps, the small "Apply > Reserve > Book" trail.
 * The standalone booking pages (/book/...) use this header too. They are not
 * funnel routes, so `route` is null there and the trail stays hidden. The
 * order page hides it too for a direct visitor, who never saw the form: the
 * trail shows there only for someone who just qualified (or the preview of it).
 *
 * Unlike the main Header this one is sticky, not fixed, so funnel pages need
 * NO top padding to clear it. The bar is 56px tall (h-14). On phones the
 * steps trail, when shown, adds one thin row below it (about 79px in total); from md up
 * the trail sits inside the bar and the header stays 56px. Solid background,
 * no backdrop blur, so it stays cheap on older phones.
 */
export default function FunnelHeader() {
  const { pathname, search } = useLocation();
  const route = funnelRouteKey(pathname);
  const trailRoute =
    route === "checkout" &&
    !readOrderArrival(readIntakeSession(), search).fromForm
      ? null
      : route;
  const { chrome } = program;

  return (
    <header
      id={FUNNEL_HEADER_ID}
      className="sticky top-0 z-40 border-b border-ink/10 bg-bone"
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-5 md:px-8">
        <Link
          to="/"
          aria-label={chrome.homeLabel}
          className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap font-display text-lg font-semibold tracking-tight"
        >
          {site.name}
        </Link>
      </div>
      <FunnelSteps route={trailRoute} />
    </header>
  );
}
