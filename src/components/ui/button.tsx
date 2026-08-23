import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "ghost" | "light";

/**
 * shadcn-style button classes, shared between <Button> and the many places a
 * react-router <Link> needs to look identical to a button.
 */
export function buttonClasses(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-60",
    variant === "primary" && "bg-steel text-bone hover:bg-steel-deep",
    variant === "ghost" &&
      "border border-ink/25 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/5",
    variant === "light" && "bg-bone text-ink hover:bg-plaster",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClasses(variant, className)} {...props} />
  ),
);
Button.displayName = "Button";

export default Button;
