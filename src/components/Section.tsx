import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  heading?: string;
  subline?: string;
  children: ReactNode;
  className?: string;
  /** Center the eyebrow/heading block. */
  center?: boolean;
  /** Alternate plaster surface instead of the bone page ground. */
  tone?: "bone" | "plaster";
  /** "h1" when the Section heading is the page's main heading (e.g. Contact). */
  headingLevel?: "h1" | "h2";
}

/** Consistent section shell: spacing, container, eyebrow + display heading. */
export default function Section({
  id,
  eyebrow,
  heading,
  subline,
  children,
  className,
  center = false,
  tone = "bone",
  headingLevel = "h2",
}: SectionProps) {
  const Heading = headingLevel;
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", tone === "plaster" && "bg-plaster/60", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        {(eyebrow || heading) && (
          <div className={cn("mb-10 md:mb-14", center && "text-center")}>
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {heading && (
              <Heading className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">
                {heading}
              </Heading>
            )}
            {subline && (
              <p className={cn("mt-4 max-w-xl text-umber", center && "mx-auto")}>{subline}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
