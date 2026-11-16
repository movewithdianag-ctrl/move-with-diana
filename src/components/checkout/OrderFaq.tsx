import { ArrowUpRight } from "lucide-react";
import { mailtoHref, program } from "@/content/content";
import Accordion, { type AccordionItem } from "./Accordion";
import OrderSection from "./OrderSection";

/**
 * The questions on the order page, one row each, closed on arrival. The
 * last row is the way forward for someone not ready to pay: a short call
 * when the call calendar is set (program.json, booking.callUrl), otherwise
 * an email to Diana.
 */
export default function OrderFaq() {
  const { checkout, booking, chrome } = program;
  const rows: AccordionItem[] = program.faq.map((item) => ({
    key: item.q,
    title: item.q,
    content: <p className="measure leading-relaxed text-umber">{item.a}</p>,
  }));

  const hasCall = Boolean(booking.callUrl);
  const notReadyLabel = (hasCall && checkout.notReadyCallLabel) || checkout.notReadyLabel;
  const notReadyText = (hasCall && checkout.notReadyCallText) || checkout.notReadyText;
  if (checkout.notReadyQuestion && notReadyLabel) {
    rows.push({
      key: "not-ready",
      title: checkout.notReadyQuestion,
      content: (
        <>
          {notReadyText && <p className="measure leading-relaxed text-umber">{notReadyText}</p>}
          <a
            href={hasCall ? booking.callUrl : mailtoHref(chrome.questionsSubject)}
            {...(hasCall ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-steel underline decoration-steel/40 underline-offset-4 hover:decoration-steel"
          >
            {notReadyLabel}
            {hasCall && <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />}
          </a>
        </>
      ),
    });
  }

  if (rows.length === 0) return null;

  return (
    <OrderSection heading={program.faqHeading} band>
      <div className="mx-auto max-w-3xl">
        <Accordion items={rows} />
      </div>
    </OrderSection>
  );
}
