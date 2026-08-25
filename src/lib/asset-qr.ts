/** Payload encoded in an asset QR — the unique asset code name. */
export function assetQrPayload(code_name: string) {
  return code_name.trim();
}

export function assetQrDownloadFilename(code_name: string) {
  const safe = code_name.trim().replace(/[^\w.-]+/g, "_") || "asset";
  return `${safe}.png`;
}

export function downloadAssetQrPng(
  canvas: HTMLCanvasElement,
  code_name: string,
) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = assetQrDownloadFilename(code_name);
  link.click();
}
