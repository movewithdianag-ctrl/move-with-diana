import { funnelMeta } from "@/content/content";
import Seo from "@/components/Seo";
import IntakeForm from "@/components/intake/IntakeForm";
import "@/components/intake/intake.css";

/**
 * /apply: the 8-Week Pilates Program application form, one scrolling page.
 *
 * Everything on screen is drawn from src/content/intake.json (questions,
 * options, labels, error messages). The form itself lives in
 * src/components/intake/, starting at IntakeForm.tsx.
 *
 * Search engines: the page follows funnelMeta.apply.noindex (set in
 * src/content/content.ts).
 */
export default function Apply() {
  return (
    <>
      <Seo {...funnelMeta.apply} />
      <IntakeForm />
    </>
  );
}
