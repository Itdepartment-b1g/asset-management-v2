"use client";

import {
  Building2,
  ClipboardCheck,
  MapPin,
  Palette,
} from "lucide-react";
import { useState } from "react";

import Tabs from "@/components/common/tabs";

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

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "location",
            label: "Location",
            icon: <MapPin aria-hidden className="h-4 w-4 text-violet-700" />,
            content: <LocationPanel />,
          },
          {
            id: "department",
            label: "Departments",
            icon: (
              <Building2 aria-hidden className="h-4 w-4 text-violet-700" />
            ),
            content: null,
          },
          {
            id: "condition",
            label: "Conditions",
            icon: (
              <ClipboardCheck aria-hidden className="h-4 w-4 text-violet-700" />
            ),
            content: null,
          },
          {
            id: "legend",
            label: "Legend",
            icon: <Palette aria-hidden className="h-4 w-4 text-violet-700" />,
            content: <LegendPanel />,
          },
        ]}
      />
    </div>
  );
}
