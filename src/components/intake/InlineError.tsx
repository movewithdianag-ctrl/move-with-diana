import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A field's error line: icon plus words, never colour alone. It has no
 * role="alert" on purpose. The form keeps ONE polite live region (in
 * IntakeForm.tsx) that says how many answers need a look, so nothing is
 * announced twice.
 */
export default function InlineError({
  id,
  children,
  className,
}: {
  id?: string;
  children?: string;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p id={id} className={cn("mt-1.5 flex items-start gap-1.5 text-sm text-red-800", className)}>
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none" />
      <span>{children}</span>
    </p>
  );
}
