import type { ComponentProps } from "react";
import { Check } from "@/components/icons";

/**
 * A checkbox that follows the design system.
 *
 * The native control is kept and restyled with `appearance-none` rather than
 * replaced by a div, so label association, keyboard handling and form
 * semantics all still come for free.
 *
 * Restyling is necessary because the project has no `@tailwindcss/forms`
 * plugin: utilities like `text-brand-600` or `border-slate-300` on a bare
 * checkbox do nothing at all, and the browser's own control shows through.
 */
/** `className` lands on the wrapper, not the input: callers pass positioning
 *  (`mt-0.5` to sit on a text baseline), and the tick is centred on the wrapper,
 *  so offsetting the input alone would leave the tick a pixel high. */
export function Checkbox({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <span className={`relative grid shrink-0 place-items-center ${className}`}>
      <input
        type="checkbox"
        {...props}
        className="peer h-[1.125rem] w-[1.125rem] cursor-pointer appearance-none rounded-[0.3125rem] border border-slate-300 bg-white transition-colors checked:border-brand-600 checked:bg-brand-600 hover:border-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {/* Drawn over the box rather than inside it, so the input stays the only
          focusable, hit-testable thing. */}
      <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
    </span>
  );
}
