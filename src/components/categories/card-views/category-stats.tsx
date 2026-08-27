"use client";

import {
  Building2,
  ClipboardCheck,
  MapPin,
  Palette,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import StatCard from "@/components/common/stat-card";

type CategoryStatId =
  | "location"
  | "holder"
  | "department"
  | "condition"
  | "legend";

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
  { id: "holder", label: "Shared Pools", icon: UsersRound, available: true },
  {
    id: "department",
    label: "Departments",
    icon: Building2,
    available: true,
  },
  {
    id: "condition",
    label: "Conditions",
    icon: ClipboardCheck,
    available: true,
  },
  { id: "legend", label: "Legend", icon: Palette, available: true },
];

type Totals = {
  location: number | null;
  holder: number | null;
  department: number | null;
  legend: number | null;
  condition: number | null;
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
    holder: null,
    department: null,
    condition: null,
    legend: null,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const baselineRef = useRef<Totals>({
    location: null,
    holder: null,
    department: null,
    condition: null,
    legend: null,
  });

  const loadTotals = useCallback(async () => {
    try {
      const [location, holder, department, legend, condition] =
        await Promise.all([
          fetchTotal("/api/location"),
          fetchTotal("/api/holder"),
          fetchTotal("/api/department"),
          fetchTotal("/api/legend"),
          fetchTotal("/api/condition"),
        ]);
      setTotals({ location, holder, department, legend, condition });

      if (baselineRef.current.location === null) {
        baselineRef.current = {
          location,
          holder,
          department,
          legend,
          condition,
        };
      }
    } catch {
      setTotals({
        location: null,
        holder: null,
        department: null,
        legend: null,
        condition: null,
      });
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

  function totalFor(id: CategoryStatId): number | null {
    return totals[id];
  }

  function baselineFor(id: CategoryStatId): number | null {
    return baselineRef.current[id];
  }

  function valueFor(stat: StatConfig): string {
    if (!stat.available) return "0";
    const total = totalFor(stat.id);
    if (initialLoading && total === null) return "…";
    return total === null ? "—" : String(total);
  }

  function deltaFor(stat: StatConfig): number {
    if (!stat.available) return 0;
    const total = totalFor(stat.id);
    const baseline = baselineFor(stat.id);
    if (total === null || baseline === null) return 0;
    return total - baseline;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
