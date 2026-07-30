"use client";

import type { ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
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
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1.5"
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
              className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-zinc-900 shadow-sm [&_svg]:text-violet-700"
                  : "text-zinc-500 hover:text-zinc-800 [&_svg]:text-zinc-400 hover:[&_svg]:text-zinc-600"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${activeItem.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeItem.id}`}
        className="mt-5"
      >
        {activeItem.content}
      </div>
    </div>
  );
}
