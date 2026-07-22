import type { ReactNode } from "react";

export type ComingSoonPanelProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export default function ComingSoonPanel({
  icon,
  title,
  description,
  className = "",
}: ComingSoonPanelProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center ${className}`}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-600">{description}</p>
    </div>
  );
}
