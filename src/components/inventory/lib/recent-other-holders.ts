const STORAGE_KEY = "asset-mgmt:recent-other-holders";
const MAX_RECENT = 8;

export function getRecentOtherHolders(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim().length > 0,
    );
  } catch {
    return [];
  }
}

export function recordRecentOtherHolder(name: string): void {
  if (typeof window === "undefined") return;

  const trimmed = name.trim();
  if (!trimmed) return;

  const current = getRecentOtherHolders().filter(
    (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
  );
  const next = [trimmed, ...current].slice(0, MAX_RECENT);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
