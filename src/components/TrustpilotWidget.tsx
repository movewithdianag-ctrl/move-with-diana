import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void };
  }
}

interface TrustpilotWidgetProps {
  businessUnitId: string;
  templateId: string;
  locale: string;
  theme: string;
  heightPx: number;
  /** The business's public Trustpilot page — the fallback link while the box loads. */
  profileUrl: string;
}

/**
 * Trustpilot "TrustBox" embed. Loads Trustpilot's bootstrap script once per
 * session and hydrates the widget div on mount — required in an SPA, where
 * the script's own DOM scan has already run by the time this page renders.
 * Reviews are pulled live from Trustpilot; nothing on the site needs editing
 * when a new review arrives.
 */
export default function TrustpilotWidget({
  businessUnitId,
  templateId,
  locale,
  theme,
  heightPx,
  profileUrl,
}: TrustpilotWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hydrate = () => window.Trustpilot?.loadFromElement(el, true);
    if (window.Trustpilot) {
      hydrate();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      // A failed load would leave a dead tag that blocks retries for the
      // whole SPA session — drop it so the next mount recreates and retries.
      script.addEventListener("error", () => script?.remove(), { once: true });
      document.head.appendChild(script);
    }
    script.addEventListener("load", hydrate);
    return () => script?.removeEventListener("load", hydrate);
  }, [businessUnitId, templateId]);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale={locale}
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-style-height={`${heightPx}px`}
      data-style-width="100%"
      data-theme={theme}
    >
      <a
        href={profileUrl || "https://www.trustpilot.com"}
        target="_blank"
        rel="noopener noreferrer"
      >
        Trustpilot
      </a>
    </div>
  );
}
