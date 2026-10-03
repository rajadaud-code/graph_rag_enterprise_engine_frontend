/**
 * Guest Session Management Utility
 * Handles generation, cookie persistence, and localStorage synchronization
 * for unauthenticated guest chat sessions.
 */

const GUEST_SESSION_KEY = 'guest_session_id';
const COOKIE_MAX_AGE_DAYS = 30;

/**
 * Generate a unique guest session ID.
 * Format: guest_sess_<base36_timestamp>_<random_hex>
 */
export function generateGuestSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).substring(2, 14);

  return `guest_sess_${timestamp}_${randomPart}`;
}

/**
 * Set a cookie in the browser.
 */
export function setGuestCookie(name: string, value: string, days = COOKIE_MAX_AGE_DAYS): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Read a cookie by name from document.cookie.
 */
export function getGuestCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const encodedName = encodeURIComponent(name);
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === encodedName && val) {
      return decodeURIComponent(val);
    }
  }
  return null;
}

/**
 * Delete a cookie.
 */
export function deleteGuestCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

/**
 * Get existing guest session ID or return null.
 * Checks localStorage first, then fallback to cookies.
 */
export function getExistingGuestSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Try localStorage
  try {
    const localId = localStorage.getItem(GUEST_SESSION_KEY);
    if (localId && localId.trim()) return localId.trim();
  } catch {
    // Ignore localStorage restrictions
  }

  // 2. Try Cookies
  const cookieId = getGuestCookie(GUEST_SESSION_KEY);
  if (cookieId && cookieId.trim()) {
    // Synchronize to localStorage
    try {
      localStorage.setItem(GUEST_SESSION_KEY, cookieId.trim());
    } catch {}
    return cookieId.trim();
  }

  return null;
}

/**
 * Initialize or retrieve a guest session ID.
 * If one already exists, returns it; otherwise generates, stores, and returns a new one.
 */
export function getOrCreateGuestSessionId(): string {
  const existing = getExistingGuestSessionId();
  if (existing) return existing;

  const newId = generateGuestSessionId();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GUEST_SESSION_KEY, newId);
    } catch {}
    setGuestCookie(GUEST_SESSION_KEY, newId);
  }

  return newId;
}

/**
 * Clear the current guest session from localStorage and cookies.
 */
export function clearGuestSessionId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
  } catch {}
  deleteGuestCookie(GUEST_SESSION_KEY);
}

/**
 * Reset the guest session: clears the old session and generates a fresh one.
 * Used during logout so unauthenticated users can continue chatting freshly.
 */
export function resetGuestSessionId(): string {
  clearGuestSessionId();
  return getOrCreateGuestSessionId();
}
