"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shows a search input inside the dropdown. Defaults to true. */
  isSearchable?: boolean;
  className?: string;
};

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isSearchable = true,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value) ?? null;

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !query.trim()) return options;
    const lowered = query.trim().toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowered),
    );
  }, [options, query, isSearchable]);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function toggleOpen() {
    setOpen((current) => {
      if (current) return false;
      setQuery("");
      return true;
    });
  }

  function handleSelect(option: DropdownOption) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      >
        <span className={selected ? "" : "text-zinc-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          {isSearchable && (
            <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2">
              <Search aria-hidden className="h-4 w-4 text-zinc-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none"
              />
            </div>
          )}

          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-center text-sm text-zinc-500">
                No results found.
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-zinc-50 ${
                        isSelected
                          ? "font-medium text-violet-700"
                          : "text-zinc-700"
                      }`}
                    >
                      {option.label}
                      {isSelected && (
                        <Check aria-hidden className="h-4 w-4 text-violet-600" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
