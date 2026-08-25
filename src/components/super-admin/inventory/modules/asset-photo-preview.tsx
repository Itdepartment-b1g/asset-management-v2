"use client";

import { Download, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { AssetPhotoMeta } from "../table-views/asset-table-view";

type AssetPhotoPreviewProps = {
  label: string;
  photo: AssetPhotoMeta;
};

function photo_url(id: string, download = false) {
  const params = new URLSearchParams({ id });
  if (download) {
    params.set("download", "1");
  }
  return `/api/asset-photo?${params.toString()}`;
}

export default function AssetPhotoPreview({
  label,
  photo,
}: AssetPhotoPreviewProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = photo_url(photo.id);

  useEffect(() => {
    if (!open) return;

    function handle_escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handle_escape);
    return () => document.removeEventListener("keydown", handle_escape);
  }, [open]);

  async function download_photo() {
    setDownloading(true);
    setError(null);
    try {
      const response = await fetch(photo_url(photo.id, true), {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to download photo");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = photo.file_name || `${photo.kind}-photo`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to download photo");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <button
        type="button"
        className="mt-2 block rounded-md border border-zinc-200 bg-white p-1 transition hover:border-violet-300"
        onClick={() => setOpen(true)}
        aria-label={`View full ${label.toLowerCase()}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={photo.file_name}
          className="h-32 w-auto object-contain"
        />
      </button>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          onClick={() => setOpen(true)}
        >
          <Maximize2 aria-hidden className="h-3.5 w-3.5" />
          View full
        </button>
        <button
          type="button"
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          onClick={() => void download_photo()}
        >
          <Download aria-hidden className="h-3.5 w-3.5" />
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={`${label} full view`}
              onClick={() => setOpen(false)}
            >
              <div
                className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-lg"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {label}
                    </h3>
                    <p className="truncate text-xs text-zinc-500">
                      {photo.file_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={downloading}
                      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                      onClick={() => void download_photo()}
                    >
                      <Download aria-hidden className="h-3.5 w-3.5" />
                      {downloading ? "Downloading..." : "Download"}
                    </button>
                    <button
                      type="button"
                      aria-label="Close"
                      className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      onClick={() => setOpen(false)}
                    >
                      <X aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-zinc-100 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={photo.file_name}
                    className="max-h-[75vh] max-w-full object-contain"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
