"use client";

import {
  Building2,
  ClipboardCheck,
  MapPin,
  Palette,
} from "lucide-react";
import { useState } from "react";

import Tabs from "@/components/common/tabs";

import ComingSoonPanel from "@/components/common/coming-soon-panel";
import CategoryStats from "./card-views/category-stats";
import LegendPanel from "./modules/legend-panel";
import LocationPanel from "./modules/location-panel";

export default function SuperAdminCategoriesList() {
  const [tab, setTab] = useState<string>("location");

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Categories</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add and maintain the lookup values used across the asset system.
        </p>
      </header>

      <CategoryStats activeTab={tab} />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "location",
            label: "Location",
            icon: <MapPin aria-hidden className="h-4 w-4" />,
            content: <LocationPanel />,
          },
          {
            id: "department",
            label: "Departments",
            icon: <Building2 aria-hidden className="h-4 w-4" />,
            content: (
              <ComingSoonPanel
                icon={<Building2 aria-hidden className="h-5 w-5" />}
                title="Departments coming soon"
                description="Department lookup values will live here so you can organize assets by team."
              />
            ),
          },
          {
            id: "condition",
            label: "Conditions",
            icon: <ClipboardCheck aria-hidden className="h-4 w-4" />,
            content: (
              <ComingSoonPanel
                icon={<ClipboardCheck aria-hidden className="h-5 w-5" />}
                title="Conditions coming soon"
                description="Condition lookup values will live here for tracking asset wear and status."
              />
            ),
          },
          {
            id: "legend",
            label: "Legend",
            icon: <Palette aria-hidden className="h-4 w-4" />,
            content: <LegendPanel />,
          },
        ]}
      />
    </div>
  );
}
