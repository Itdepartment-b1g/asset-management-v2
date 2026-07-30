"use client";

import {
  Building2,
  ClipboardCheck,
  MapPin,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import StatCard from "@/components/common/stat-card";

type CategoryStatId = "location" | "department" | "condition" | "legend";

type CategoryStatsProps = {
  /** Refetch totals when the active tab changes (e.g. after CRUD in a panel). */
  activeTab: string;
};

type StatConfig = {
  id: CategoryStatId;
  label: string;
  icon: LucideIcon;
  available: boolean;
};

const STATS: StatConfig[] = [
  { id: "location", label: "Locations", icon: MapPin, available: true },
  {
    id: "department",
    label: "Departments",
    icon: Building2,
    available: false,
  },
  {
    id: "condition",
    label: "Conditions",
    icon: ClipboardCheck,
    available: false,
  },
  { id: "legend", label: "Legend", icon: Palette, available: true },
];

type Totals = {
  location: number | null;
  legend: number | null;
};

async function fetchTotal(endpoint: string): Promise<number> {
  const response = await fetch(`${endpoint}?page=1&limit=1`, {
    credentials: "include",
  });
  const data = (await response.json()) as {
    meta?: { total?: number };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load count");
  }

  return data.meta?.total ?? 0;
}

export default function CategoryStats({ activeTab }: CategoryStatsProps) {
  const [totals, setTotals] = useState<Totals>({
    location: null,
    legend: null,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const baselineRef = useRef<Totals>({ location: null, legend: null });

  const loadTotals = useCallback(async () => {
    try {
      const [location, legend] = await Promise.all([
        fetchTotal("/api/location"),
        fetchTotal("/api/legend"),
      ]);
      setTotals({ location, legend });

      if (baselineRef.current.location === null) {
        baselineRef.current = { location, legend };
      }
    } catch {
      setTotals((current) =>
        current.location === null && current.legend === null
          ? { location: null, legend: null }
          : current,
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTotals();
  }, [loadTotals, activeTab]);

  useEffect(() => {
    function onFocus() {
      void loadTotals();
    }

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadTotals]);

  function valueFor(stat: StatConfig): string {
    if (!stat.available) return "0";

    const total =
      stat.id === "location"
        ? totals.location
        : stat.id === "legend"
          ? totals.legend
          : null;

    if (initialLoading && total === null) return "…";
    return total === null ? "—" : String(total);
  }

  function deltaFor(stat: StatConfig): number {
    if (!stat.available) return 0;

    const total =
      stat.id === "location"
        ? totals.location
        : stat.id === "legend"
          ? totals.legend
          : null;
    const baseline =
      stat.id === "location"
        ? baselineRef.current.location
        : stat.id === "legend"
          ? baselineRef.current.legend
          : null;

    if (total === null || baseline === null) return 0;
    return total - baseline;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STATS.map((stat) => (
        <StatCard
          key={stat.id}
          icon={stat.icon}
          label={stat.label}
          value={valueFor(stat)}
          delta={deltaFor(stat)}
        />
      ))}
    </div>
  );
}
