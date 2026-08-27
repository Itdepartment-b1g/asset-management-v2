"use client";

import { Download, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

import {
  assetQrPayload,
  downloadAssetQrPng,
} from "@/lib/asset-qr";

type AssetQrDialogProps = {
  asset_name: string;
  code_name: string;
  onClose: () => void;
};

const QR_SIZE = 220;

export default function AssetQrDialog({
  asset_name,
  code_name,
  onClose,
}: AssetQrDialogProps) {
  const canvas_wrap_ref = useRef<HTMLDivElement>(null);
  const payload = assetQrPayload(code_name);

  function handle_download() {
    const canvas = canvas_wrap_ref.current?.querySelector("canvas");
    if (!canvas) return;
    downloadAssetQrPng(canvas, code_name);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Asset QR code"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">Asset QR code</h3>
          <button
            type="button"
            aria-label="Close"
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            onClick={onClose}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-zinc-900">{asset_name}</p>
          <p className="mt-1 font-mono text-xs text-zinc-600">{code_name}</p>
        </div>

        <div
          ref={canvas_wrap_ref}
          className="mt-5 flex justify-center rounded-lg border border-zinc-200 bg-white p-4"
        >
          <QRCodeCanvas
            value={payload}
            size={QR_SIZE}
            level="M"
            marginSize={2}
          />
        </div>

        <p className="mt-3 text-center text-xs text-zinc-500">
          Encodes the asset code name for labels and future scanning.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-800"
            onClick={handle_download}
          >
            <Download aria-hidden className="h-4 w-4" />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
