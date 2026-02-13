export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    if (!("localStorage" in window)) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    if (!("localStorage" in window)) return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeRemoveItem(key: string) {
  try {
    if (typeof window === "undefined") return;
    if (!("localStorage" in window)) return;
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function safeClear() {
  try {
    if (typeof window === "undefined") return;
    if (!("localStorage" in window)) return;
    window.localStorage.clear();
  } catch {
    // ignore
  }
}
