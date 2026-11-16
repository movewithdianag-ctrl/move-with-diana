import { program } from "@/content/content";
import OrderSection from "./OrderSection";

/**
 * "What happens next" on the order page: what follows the payment, as a
 * 1-2-3 row on desktop and a numbered list on phones. Copy comes from
 * program.json (checkout.next); with no steps the whole block drops out.
 */
export default function NextSteps() {
  const { heading, steps } = program.checkout.next;
  if (steps.length === 0) return null;

  return (
    <OrderSection heading={heading}>
      <ol className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3 md:gap-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 md:flex-col md:items-center md:text-center">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-steel font-display text-lg text-bone"
            >
              {i + 1}
            </span>
            <div className="pt-1.5 md:pt-0">
              <h3 className="font-sans font-semibold leading-snug">{step.title}</h3>
              {step.detail && (
                <p className="mt-1 text-sm leading-relaxed text-umber">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </OrderSection>
  );
}
