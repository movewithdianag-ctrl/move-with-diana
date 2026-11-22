import { useOrderProduct } from "./OrderProductContext";
import OrderSection from "./OrderSection";

/**
 * "What's included" on the order page: every item open, numbered, in one
 * column to read top to bottom.
 * Copy comes from the page's content file; with no items the section drops out.
 */
export function Included() {
  const product = useOrderProduct();
  if (product.included.length === 0) return null;

  return (
    <OrderSection heading={product.includedHeading}>
      <ol className="mx-auto max-w-3xl divide-y divide-ink/10">
        {product.included.map((item, i) => (
          <li key={item.title} className="flex items-baseline gap-3 py-5 first:pt-0 last:pb-0">
            <span
              aria-hidden="true"
              className="w-5 shrink-0 font-display text-lg font-medium leading-snug text-steel"
            >
              {i + 1}.
            </span>
            <div>
              <h3 className="font-sans font-semibold leading-snug">{item.title}</h3>
              {item.detail && (
                <p className="mt-1 text-sm leading-relaxed text-umber">{item.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </OrderSection>
  );
}

/**
 * "How the 8 weeks work": the stages in order, side by side on desktop. The
 * titles in program.json already name the weeks, so there are no numerals.
 */
export function HowItWorks() {
  const product = useOrderProduct();
  if (product.howItWorks.length === 0) return null;

  return (
    <OrderSection heading={product.howItWorksHeading} band>
      <ol className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {product.howItWorks.map((step) => (
          <li key={step.title} className="border-t-2 border-steel/50 pt-4">
            <h3 className="font-sans font-semibold leading-snug">{step.title}</h3>
            {step.detail && (
              <p className="mt-1.5 text-sm leading-relaxed text-umber">{step.detail}</p>
            )}
          </li>
        ))}
      </ol>
    </OrderSection>
  );
}
