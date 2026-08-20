"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "@/components/icons";

export interface Option {
  value: string;
  label: string;
}

/**
 * A styled dropdown that replaces the native <select> so the open menu matches
 * the rest of the UI (native option lists are OS-rendered and can't be themed).
 * Closes on outside-click or Escape; the trigger keeps the same look as our
 * inputs. For very long lists a searchable variant would be better — this suits
 * the short-to-medium menus it's used for.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
  placeholder = "Select",
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-3 text-sm text-navy-800 transition hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        <span className={`truncate ${selected ? "" : "text-slate-400"}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full min-w-[10rem] overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition ${
                    isSelected ? "bg-brand-50 font-semibold text-brand-700" : "text-navy-800 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
