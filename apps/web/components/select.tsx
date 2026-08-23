"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "@/components/icons";

export interface Option {
  value: string;
  label: string;
}

/**
 * A styled dropdown that replaces the native <select> so the open menu matches
 * the rest of the UI. Closes on outside-click or Escape. Optional `searchable`
 * adds a filter box (for long lists like the country picker), `name` renders a
 * hidden input so it submits inside a plain <form>, and `icon` mirrors our
 * inputs' leading icon.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
  placeholder = "Select",
  name,
  searchable = false,
  invalid = false,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
  name?: string;
  searchable?: boolean;
  invalid?: boolean;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white py-2.5 pr-3 text-sm text-navy-800 transition focus:outline-none focus:ring-2 focus:ring-brand-100 ${
          icon ? "pl-10" : "pl-3.5"
        } ${invalid ? "border-red-300" : "border-slate-200 hover:border-slate-300 focus:border-brand-500"}`}
      >
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <span className={`truncate ${selected ? "" : "text-slate-400"}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {searchable ? (
            <div className="border-b border-slate-100 p-2">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    pick(filtered[0].value);
                  }
                }}
                placeholder="Search…"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-navy-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          ) : null}
          <ul role="listbox" className="max-h-60 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-3 text-sm text-slate-400">No matches</li>
            ) : (
              filtered.map((o) => {
                const isSelected = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => pick(o.value)}
                      className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition ${
                        isSelected ? "bg-brand-50 font-semibold text-brand-700" : "text-navy-800 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
