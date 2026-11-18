import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FunnelHeader from "./components/FunnelHeader";
import FunnelFooter from "./components/FunnelFooter";
import ScrollManager from "./components/ScrollManager";
import Home from "./pages/Home";
import About from "./pages/About";
import Offers from "./pages/Offers";
import Reviews from "./pages/Reviews";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Apply from "./pages/Apply";
import ApplyNotYet from "./pages/ApplyNotYet";
import Checkout from "./pages/Checkout";
import ProgramWelcome from "./pages/ProgramWelcome";
import BookEvent from "./pages/BookEvent";
import {
  bookingRoutes,
  funnelRoutes,
  isSlimChromePath,
} from "./content/content";
import { captureAttribution } from "./lib/intake";
import { cn } from "./lib/utils";

/**
 * Old addresses that now live on the order page: the program's first name,
 * the second payment choice, and the "you're a fit" page that used to sit
 * between the form and the order page. Kept so saved links still land.
 */
const LEGACY_ORDER_PATHS = ["/strong-and-safe", "/strong-and-safe/payment-plan", "/apply/approved"];
/** The welcome page under the program's first name. */
const LEGACY_WELCOME_PATH = "/strong-and-safe/welcome";

/** Sends an old address to its new page, keeping the query string (email prefill, utm tags). */
function LegacyRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={{ pathname: to, search, hash }} replace />;
}

export default function App() {
  const { pathname } = useLocation();
  // The four 8-Week Pilates Program funnel routes are distraction-free: a slim header
  // and a one-line footer instead of the full site nav and footer. The three
  // standalone booking pages share that chrome, without the progress steps.
  const legacyPath = pathname.replace(/\/+$/, "");
  const funnel =
    isSlimChromePath(pathname) ||
    LEGACY_ORDER_PATHS.includes(legacyPath) ||
    legacyPath === LEGACY_WELCOME_PATH;

  // Remember where this visitor came from (UTM tags, referrer) on the first
  // page they land on, so it survives the walk to the intake form.
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <div className={cn("flex flex-col", funnel ? "min-h-dvh" : "min-h-screen")}>
      <ScrollManager />
      {/* Skip link for keyboard users — first focusable element on the page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-bone"
      >
        Skip to content
      </a>
      {funnel ? <FunnelHeader /> : <Header />}
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
          {/* 8-Week Pilates Program funnel (not linked from the site nav) */}
          <Route path={funnelRoutes.apply} element={<Apply />} />
          <Route path={funnelRoutes.notYet} element={<ApplyNotYet />} />
          <Route path={funnelRoutes.checkout} element={<Checkout />} />
          {LEGACY_ORDER_PATHS.map((path) => (
            <Route key={path} path={path} element={<LegacyRedirect to={funnelRoutes.checkout} />} />
          ))}
          <Route
            path={LEGACY_WELCOME_PATH}
            element={<LegacyRedirect to={funnelRoutes.welcome} />}
          />
          <Route path={funnelRoutes.welcome} element={<ProgramWelcome />} />
          {/* Standalone booking pages: one calendar each, sent as a direct link */}
          <Route path={bookingRoutes.introCall} element={<BookEvent event="introCall" />} />
          <Route path={bookingRoutes.assessment} element={<BookEvent event="assessment" />} />
          <Route path={bookingRoutes.session} element={<BookEvent event="session" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {funnel ? <FunnelFooter /> : <Footer />}
    </div>
  );
}
