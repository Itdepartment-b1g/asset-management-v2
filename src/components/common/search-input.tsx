"use client";

import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-10 pl-9 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-violet-600 disabled:opacity-50"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          disabled={disabled}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          onClick={() => onChange("")}
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
