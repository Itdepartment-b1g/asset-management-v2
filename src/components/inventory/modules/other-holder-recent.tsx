"use client";

import { useEffect, useMemo, useState } from "react";

import { getRecentOtherHolders } from "../lib/recent-other-holders";

type HolderOption = {
  id: string;
  name: string;
};

type OtherHolderRecentProps = {
  holders: HolderOption[];
  onSelect: (name: string) => void;
  disabled?: boolean;
};

function build_suggestions(holders: HolderOption[], recent: string[]): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const name of recent) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(name);
  }

  for (const holder of holders) {
    const key = holder.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(holder.name);
  }

  return suggestions;
}

export default function OtherHolderRecent({
  holders,
  onSelect,
  disabled = false,
}: OtherHolderRecentProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentOtherHolders());
  }, []);

  const suggestions = useMemo(
    () => build_suggestions(holders, recent),
    [holders, recent],
  );

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        LAST USE OTHER
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((name) => (
          <button
            key={name}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(name)}
            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 disabled:opacity-50"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
