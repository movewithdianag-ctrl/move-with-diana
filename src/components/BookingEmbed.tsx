import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, CalendarClock, Mail } from "lucide-react";
import { program, site } from "@/content/content";
import { EMAIL_RE, readIntakeSession } from "@/lib/intake";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Inline booking calendar for the numbered step cards on the welcome page
 * and for the standalone /book/... pages (pages/BookEvent.tsx).
 * It is drawn edge to edge (top and bottom rules only): the card around it
 * supplies the outer border and rounded corners, so the calendar keeps as
 * much width as possible on a phone.
 *
 *  • url ""            → a calm placeholder panel showing `pendingNote`
 *  • Cal.com link      → Cal.com's official inline embed script, loaded once
 *                        for the whole page, one namespace per calendar so
 *                        several calendars can share a page. The script sizes
 *                        the frame to its content, so nothing scrolls inside.
 *                        If the script cannot load (blocked, offline) we fall
 *                        back to a plain iframe of the same booking page.
 *  • any other https   → a plain iframe (Zcal and Calendly get their embed
 *                        query params; everything else is framed as is).
 *
 * Nothing loads until the panel is near the viewport, a skeleton holds the
 * space meanwhile, and the "open in a new tab" link is always there for
 * anyone whose browser blocks the frame.
 *
 * Under a live calendar sits the "I can't find a time that works" button
 * (when `fallbackSubject` is passed). It opens an email to Diana with the
 * subject and a short body already written, asking for the days and times
 * that suit. Copy: program.json → booking.cantFind*.
 *
 * Privacy: when the person applied in this tab, their first name and email
 * are handed to the Cal.com inline embed, so the booking form does not ask
 * again for what they already gave (see the rule in lib/intake.ts). This is
 * the only place they go: the embed script passes them to Cal.com's own
 * booking frame, the form the person is about to type those same two details
 * into, and they can still change them there. They are never added to the
 * "open in a new tab" link, to the plain iframe fallback, to an analytics
 * event or to this site's address. Health answers are never passed at all.
 * With no application on file nothing is prefilled and the form is empty.
 *
 * Setup guide for the booking tool: docs/SCHEDULING-SETUP.md.
 */
export interface BookingEmbedProps {
  /** Cal.com event link, e.g. program.booking.assessmentUrl (welcome page, /book/assessment). "" = not set up yet. */
  url: string;
  /** Accessible name for the embedded calendar. */
  title: string;
  /** Shown instead of the calendar while `url` is empty. */
  pendingNote: string;
  /** Reserved height in px so the page does not jump while the calendar loads. */
  minHeight?: number;
  /** Subject line of the "I can't find a time" email. Omit to hide the button. */
  fallbackSubject?: string;
}

const CAL_ORIGIN = "https://app.cal.com";
const CAL_SCRIPT_SRC = `${CAL_ORIGIN}/embed/embed.js`;
const CAL_HOSTS = new Set(["cal.com", "www.cal.com", "app.cal.com"]);
/** Start loading this far before the panel scrolls into view. */
const LAZY_ROOT_MARGIN = "400px 0px";
/** Never leave the skeleton up longer than this, whatever the provider does. */
const SKELETON_TIMEOUT_MS = 9000;
/** A plain iframe cannot resize itself, so it gets at least this much room. */
const PLAIN_IFRAME_MIN_HEIGHT = 700;

type Target =
  | { kind: "empty" }
  | { kind: "cal"; href: string; calLink: string; config: Record<string, string>; iframeSrc: string }
  | { kind: "iframe"; href: string; iframeSrc: string };

/** Work out how a booking link should be embedded. Anything not https is treated as empty. */
function resolveTarget(raw: string): Target {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "empty" };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { kind: "empty" };
  }
  if (parsed.protocol !== "https:") return { kind: "empty" };

  const host = parsed.hostname.toLowerCase();

  if (CAL_HOSTS.has(host)) {
    const calLink = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (calLink) {
      const config: Record<string, string> = { layout: "month_view", theme: "light" };
      parsed.searchParams.forEach((value, key) => {
        config[key] = value;
      });
      const fallback = new URL(`https://cal.com/${calLink}`);
      Object.entries({ ...config, embed: "true" }).forEach(([key, value]) =>
        fallback.searchParams.set(key, value),
      );
      return { kind: "cal", href: trimmed, calLink, config, iframeSrc: fallback.toString() };
    }
  }

  const framed = new URL(parsed.toString());
  if (host === "zcal.co" || host.endsWith(".zcal.co")) {
    framed.searchParams.set("embed", "1");
    framed.searchParams.set("embedType", "iframe");
  } else if (host === "calendly.com" || host.endsWith(".calendly.com")) {
    framed.searchParams.set("embed_type", "Inline");
    framed.searchParams.set("embed_domain", window.location.hostname);
    framed.searchParams.set("hide_gdpr_banner", "1");
  }
  return { kind: "iframe", href: trimmed, iframeSrc: framed.toString() };
}

/** Longest first name handed to the booking form. */
const PREFILL_NAME_MAX = 80;

/**
 * Name and email for the Cal.com inline embed, from the application sent in
 * this tab. {} when there is none. A value that does not look right is left
 * out, so the person simply types it themselves.
 */
function calPrefill(): Record<string, string> {
  const session = readIntakeSession();
  if (!session) return {};
  const prefill: Record<string, string> = {};
  // eslint-disable-next-line no-control-regex
  const name = session.firstName.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (name && name.length <= PREFILL_NAME_MAX) prefill.name = name;
  const email = session.email.trim();
  if (EMAIL_RE.test(email)) prefill.email = email;
  return prefill;
}

/* ───────────────────────── Cal.com embed loader ─────────────────────────── */

type CalApi = {
  (...args: unknown[]): void;
  q?: unknown[];
  ns?: Record<string, CalApi>;
  loaded?: boolean;
};

type CalWindow = Window & { Cal?: CalApi };

/**
 * Cal.com's own loader snippet (Event types > Embed > Inline), written out
 * readably. It defines window.Cal as a queueing stub and injects embed.js
 * the first time it is called; later calls reuse the same script.
 */
function ensureCal(): CalApi {
  const w = window as CalWindow;
  if (!w.Cal) {
    const push = (api: CalApi, args: unknown) => {
      (api.q = api.q || []).push(args);
    };
    const cal: CalApi = function (...args: unknown[]) {
      // The real embed.js reads these queues as `arguments` objects.
      // eslint-disable-next-line prefer-rest-params
      const ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        const script = document.createElement("script");
        script.src = CAL_SCRIPT_SRC;
        script.async = true;
        script.addEventListener("error", () => {
          window.dispatchEvent(new Event(CAL_SCRIPT_ERROR_EVENT));
        });
        document.head.appendChild(script);
        cal.loaded = true;
      }
      if (args[0] === "init") {
        const api: CalApi = function () {
          // eslint-disable-next-line prefer-rest-params
          push(api, arguments);
        };
        const namespace = args[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns = cal.ns || {};
          cal.ns[namespace] = cal.ns[namespace] || api;
          push(cal.ns[namespace], ar);
          push(cal, ["initNamespace", namespace]);
        } else {
          push(cal, ar);
        }
        return;
      }
      push(cal, ar);
    };
    w.Cal = cal;
  }
  return w.Cal;
}

const CAL_SCRIPT_ERROR_EVENT = "mwd-cal-script-error";
let calScriptFailed = false;

/**
 * mailto: link to Diana with a subject and a prefilled body. Mail apps expect
 * CRLF line breaks, and the body ends on a blank line so the visitor can
 * start typing their days and times straight away.
 */
function cantFindHref(subject: string, body: string): string {
  const params = [`subject=${encodeURIComponent(subject.trim())}`];
  const text = body.trim();
  if (text) params.push(`body=${encodeURIComponent(`${text}\n\n`.replace(/\r?\n/g, "\r\n"))}`);
  return `mailto:${site.email}?${params.join("&")}`;
}

/* ─────────────────────────────── Component ──────────────────────────────── */

type Status = "idle" | "loading" | "ready";

export default function BookingEmbed({
  url,
  title,
  pendingNote,
  minHeight = 640,
  fallbackSubject = "",
}: BookingEmbedProps) {
  const { openLinkLabel, loadingLabel, cantFindLabel, cantFindBody } = program.booking;
  const target = resolveTarget(url);
  const targetKey = target.kind === "empty" ? "" : `${target.kind}:${target.iframeSrc}`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const calHostRef = useRef<HTMLDivElement>(null);
  const startedFor = useRef("");
  const reactId = useId();

  const [inView, setInView] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [scriptFailed, setScriptFailed] = useState(calScriptFailed);

  const mode: "empty" | "cal" | "iframe" =
    target.kind === "cal" && scriptFailed ? "iframe" : target.kind;

  // Lazy load: wait until the panel is close to the viewport.
  useEffect(() => {
    if (!targetKey) return;
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: LAZY_ROOT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetKey]);

  // The skeleton shows from the moment loading starts.
  useEffect(() => {
    if (inView && targetKey) setStatus((current) => (current === "idle" ? "loading" : current));
  }, [inView, targetKey]);

  // Safety net: reveal whatever has loaded after a while, so the skeleton
  // can never hide a calendar that is in fact usable.
  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => setStatus("ready"), SKELETON_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  // If embed.js cannot be fetched, every Cal embed on the page falls back.
  useEffect(() => {
    const onError = () => {
      calScriptFailed = true;
      setScriptFailed(true);
      setStatus((current) => (current === "ready" ? "loading" : current));
    };
    window.addEventListener(CAL_SCRIPT_ERROR_EVENT, onError);
    return () => window.removeEventListener(CAL_SCRIPT_ERROR_EVENT, onError);
  }, []);

  // Cal.com inline embed. Runs once per booking link (the ref guard also
  // keeps React StrictMode's double effect from adding a second frame).
  useEffect(() => {
    if (!inView || mode !== "cal" || target.kind !== "cal") return;
    const host = calHostRef.current;
    if (!host || startedFor.current === targetKey) return;
    startedFor.current = targetKey;
    host.replaceChildren();

    try {
      const slug = target.calLink.split("/").pop() ?? "";
      const namespace = `mwd${slug}${reactId}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 48);
      const Cal = ensureCal();
      Cal("init", namespace, { origin: CAL_ORIGIN });
      const api = Cal.ns?.[namespace];
      if (!api) throw new Error("Cal namespace missing");
      // Prefill is merged here only: target.config also feeds the plain
      // iframe fallback, which must stay free of personal details.
      api("inline", {
        elementOrSelector: host,
        calLink: target.calLink,
        config: { ...target.config, ...calPrefill() },
      });
      api("ui", { hideEventTypeDetails: false, layout: "month_view" });
      api("on", {
        action: "linkReady",
        callback: () => setStatus("ready"),
      });
      api("on", { action: "linkFailed", callback: () => setScriptFailed(true) });
    } catch {
      setScriptFailed(true);
    }
    // No cleanup on purpose: the frame belongs to the host node, and tearing
    // it down on the StrictMode remount would leave an empty panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, mode, targetKey]);

  // Give the frame that the Cal.com script creates a real accessible name.
  useEffect(() => {
    const host = calHostRef.current;
    if (mode !== "cal" || !host) return;
    const nameFrames = () => {
      host.querySelectorAll("iframe").forEach((frame) => {
        if (frame.getAttribute("title") !== title) frame.setAttribute("title", title);
      });
    };
    nameFrames();
    const observer = new MutationObserver(nameFrames);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mode, title]);

  if (target.kind === "empty") {
    return (
      <div className="flex items-start gap-4 border-t border-dashed border-ink/20 bg-plaster/60 p-5 md:p-7">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bone text-steel">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="measure leading-relaxed text-umber">{pendingNote}</p>
      </div>
    );
  }

  const loading = status !== "ready";
  const plainHeight = Math.max(minHeight, PLAIN_IFRAME_MIN_HEIGHT);

  return (
    <div ref={wrapperRef}>
      <div
        role="group"
        aria-label={title}
        aria-busy={loading}
        className="relative overflow-hidden border-y border-ink/10 bg-white"
        style={{ minHeight: mode === "iframe" ? plainHeight : loading ? minHeight : undefined }}
      >
        {mode === "cal" && (
          <div
            ref={calHostRef}
            className={cn("w-full transition-opacity duration-300", loading && "opacity-0")}
          />
        )}

        {mode === "iframe" && inView && (
          <iframe
            src={target.iframeSrc}
            title={title}
            loading="lazy"
            onLoad={() => setStatus("ready")}
            className={cn(
              "block w-full border-0 transition-opacity duration-300",
              loading && "opacity-0",
            )}
            style={{ height: plainHeight }}
          />
        )}

        {loading && (
          <div
            role="status"
            className="absolute inset-0 flex flex-col gap-5 bg-plaster/70 p-6 md:p-8"
          >
            <p className="text-sm text-umber">{loadingLabel}</p>
            <div aria-hidden="true" className="flex flex-1 animate-pulse flex-col gap-5 motion-reduce:animate-none">
              <div className="h-5 w-2/5 rounded-full bg-ink/10" />
              <div className="grid flex-1 grid-cols-7 content-start gap-2">
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-ink/[0.07]" />
                ))}
              </div>
              <div className="h-11 w-full rounded-full bg-ink/10" />
            </div>
          </div>
        )}
      </div>

      {/* Ways out when the calendar does not work for someone. */}
      <div className="flex flex-col gap-x-6 gap-y-2 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:px-7">
        {fallbackSubject.trim() && (
          <a
            href={cantFindHref(fallbackSubject, cantFindBody)}
            className={buttonClasses("ghost", "min-h-11 w-full sm:w-auto")}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {cantFindLabel}
          </a>
        )}
        <a
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-steel underline underline-offset-4 hover:text-steel-deep max-sm:justify-center"
        >
          {openLinkLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
