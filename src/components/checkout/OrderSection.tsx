import type { ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

export interface OrderSectionProps {
  /** The one centered heading of the section. "" leaves it out. */
  heading?: string;
  /** Soft plaster band behind the section, to set it apart from its neighbors. */
  band?: boolean;
  /** For a section the page jumps to (the review wall). */
  sectionRef?: RefObject<HTMLElement>;
  children: ReactNode;
}

/** One full-width section of the order page: a centered heading, then its content. */
export default function OrderSection({ heading, band, sectionRef, children }: OrderSectionProps) {
  return (
    <section
      ref={sectionRef}
      tabIndex={sectionRef ? -1 : undefined}
      className={cn(
        "py-12 focus:outline-none lg:py-16",
        // Lands below the sticky funnel header, steps trail included.
        sectionRef && "scroll-mt-20",
        band && "bg-plaster/50",
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        {heading && (
          <h2 className="mb-8 text-center font-display text-2xl font-medium leading-tight tracking-tight md:text-3xl lg:mb-10">
            {heading}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
