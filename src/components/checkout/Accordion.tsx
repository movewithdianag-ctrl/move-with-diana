import { useId, useState, type ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

export interface AccordionItem {
  /** Stable React key, also used to mark which item is open. */
  key: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Heading level of each row, so the page outline stays in order. */
  headingTag?: "h2" | "h3";
  /** Items to show open on arrival. Default: everything closed. */
  defaultOpenKeys?: string[];
}

/**
 * Accordion for the order page. Same look as src/components/Faq.tsx (thin
 * rules, plus/minus, native buttons with aria-expanded / aria-controls).
 * Each row opens and closes on its own, so the rows that start open stay
 * readable while another one is opened. Rows with no title are skipped, so
 * an empty section in program.json simply drops out.
 */
export default function Accordion({
  items,
  headingTag: Heading = "h3",
  defaultOpenKeys = [],
}: AccordionProps) {
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);
  const baseId = useId();
  const rows = items.filter((item) => item.title.trim() !== "");

  if (rows.length === 0) return null;

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {rows.map((item, i) => {
        const open = openKeys.includes(item.key);
        const headerId = `${baseId}-h-${i}`;
        const panelId = `${baseId}-p-${i}`;
        return (
          <div key={item.key}>
            <Heading>
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() =>
                  setOpenKeys((keys) =>
                    open ? keys.filter((key) => key !== item.key) : [...keys, item.key],
                  )
                }
                className="group flex min-h-11 w-full items-start justify-between gap-6 py-5 text-left md:py-6"
              >
                <span className="font-display text-lg font-medium leading-snug tracking-tight">
                  {item.title}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 rounded-full border border-ink/15 p-1.5 text-ink/70 transition-colors group-hover:border-steel group-hover:text-steel"
                >
                  {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!open}
              className="pb-6"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
