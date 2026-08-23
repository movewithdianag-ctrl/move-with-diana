import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { faqs } from "@/content/content";

/**
 * Editorial FAQ accordion (modeled on the "ref-faq-style" brief: minimal,
 * generous padding, thin divider rules, plus/minus indicator, one item open
 * at a time). Native buttons + aria-expanded/aria-controls keep it fully
 * keyboard-accessible.
 */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {faqs.map((faq, i) => {
        const open = openIndex === i;
        const headerId = `${baseId}-faq-h-${i}`;
        const panelId = `${baseId}-faq-p-${i}`;
        return (
          <div key={faq.question}>
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left md:py-7"
              >
                <span className="font-display text-lg font-medium leading-snug tracking-tight md:text-xl">
                  {faq.question}
                </span>
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 rounded-full border border-ink/15 p-1.5 text-ink/70 transition-colors group-hover:border-steel group-hover:text-steel"
                >
                  {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!open}
              className="pb-7 pr-10"
            >
              <p className="measure leading-relaxed text-ink/80">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
