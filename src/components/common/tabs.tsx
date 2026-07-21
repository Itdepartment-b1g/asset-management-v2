"use client";

import type { ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function Tabs({
  items,
  value,
  onChange,
  className = "",
}: TabsProps) {
  const activeItem = items.find((item) => item.id === value) ?? items[0];

  if (!activeItem) return null;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Tabs"
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-violet-50 p-1.5"
      >
        {items.map((item) => {
          const isActive = item.id === activeItem.id;

          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(item.id)}
              className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-100 text-violet-500 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${activeItem.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeItem.id}`}
        className="mt-8"
      >
        {activeItem.content}
      </div>
    </div>
  );
}
