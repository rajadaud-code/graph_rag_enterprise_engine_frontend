'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getOrCreateGuestSessionId,
  getExistingGuestSessionId,
  resetGuestSessionId,
  clearGuestSessionId,
} from '@/lib/guestSession';
import { migrateGuestSession, MigrateSessionResponse } from '@/lib/api';

export interface UseChatSessionReturn {
  /**
   * The effective session ID for chat queries:
   * Returns guest_session_id when unauthenticated, or user's active session ID when authenticated.
   */
  activeSessionId: string;

  /**
   * Temporary guest session ID (if one exists).
   */
  guestSessionId: string | null;

  /**
   * Whether the user is currently authenticated.
   */
  isAuthenticated: boolean;

  /**
   * Migration state when transferring guest chat to authenticated user.
   */
  isMigrating: boolean;
  migrationStatus: MigrateSessionResponse | null;

  /**
   * Trigger migration manually or after login.
   */
  migrateCurrentGuestSession: (authToken?: string) => Promise<MigrateSessionResponse>;

  /**
   * Set active authenticated session ID (e.g. from history list).
   */
  setActiveSessionId: (sessionId: string) => void;

  /**
   * Clean logout: clears auth session and resets local guest session with a fresh ID.
   */
  handleLogout: () => Promise<void>;

  /**
   * Start a fresh guest session without logging in.
   */
  startNewGuestSession: () => string;
}

export function useChatSession(): UseChatSessionReturn {
  const { user, token, isAuthenticated, logout } = useAuth();

  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionIdState] = useState<string>('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrateSessionResponse | null>(null);

  // Prevent duplicate migrations for the same session
  const migratedSessionRef = useRef<string | null>(null);

  // Initialize guest session on mount if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const gid = getOrCreateGuestSessionId();
      setGuestSessionId(gid);
      setActiveSessionIdState((prev) => (prev ? prev : gid));
    } else {
      // If already authenticated, check for pending guest session to migrate
      const pendingGid = getExistingGuestSessionId();
      setGuestSessionId(pendingGid);
      if (!activeSessionId) {
        setActiveSessionIdState(`sess_${Date.now()}`);
      }
    }
  }, [isAuthenticated, activeSessionId]);

  /**
   * Migrate guest chat history to backend account.
   */
  const migrateCurrentGuestSession = useCallback(
    async (authToken?: string): Promise<MigrateSessionResponse> => {
      const effectiveToken = authToken || token;
      const currentGuestId = guestSessionId || getExistingGuestSessionId();

      if (!currentGuestId) {
        return { success: true, message: 'No guest session to migrate.' };
      }

      if (!effectiveToken) {
        return { success: false, message: 'Authentication token required for migration.' };
      }

      // Avoid re-migrating the same session
      if (migratedSessionRef.current === currentGuestId) {
        return { success: true, message: 'Session already migrated.' };
      }

      setIsMigrating(true);
      try {
        const result = await migrateGuestSession(currentGuestId, effectiveToken);
        setMigrationStatus(result);

        if (result.success) {
          migratedSessionRef.current = currentGuestId;
          // Clean up guest session from cookies and localStorage
          clearGuestSessionId();
          setGuestSessionId(null);

          // Update active session to the newly migrated or backend-assigned session ID
          if (result.session_id) {
            setActiveSessionIdState(result.session_id);
          }
        }

        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Migration failed.';
        const failedResult: MigrateSessionResponse = { success: false, message: msg };
        setMigrationStatus(failedResult);
        return failedResult;
      } finally {
        setIsMigrating(false);
      }
    },
    [guestSessionId, token]
  );

  /**
   * Automatically migrate when unauthenticated user logs in with an existing guest session.
   */
  useEffect(() => {
    if (isAuthenticated && token && guestSessionId && migratedSessionRef.current !== guestSessionId) {
      migrateCurrentGuestSession(token);
    }
  }, [isAuthenticated, token, guestSessionId, migrateCurrentGuestSession]);

  /**
   * Clean logout:
   * 1. Clears NextAuth / AuthContext session tokens
   * 2. Resets the local guest session ID with a brand new ID
   * 3. Sets active session to the fresh guest session
   */
  const handleLogout = useCallback(async () => {
    // 1. Clear auth session
    logout();

    // 2. Generate a clean guest session for new interactions
    const freshGuestId = resetGuestSessionId();
    setGuestSessionId(freshGuestId);
    setActiveSessionIdState(freshGuestId);
    setMigrationStatus(null);
    migratedSessionRef.current = null;
  }, [logout]);

  /**
   * Start a brand new guest session explicitly
   */
  const startNewGuestSession = useCallback((): string => {
    const freshId = resetGuestSessionId();
    setGuestSessionId(freshId);
    setActiveSessionIdState(freshId);
    return freshId;
  }, []);

  const setActiveSessionId = useCallback((sessionId: string) => {
    setActiveSessionIdState(sessionId);
  }, []);

  return {
    activeSessionId: activeSessionId || guestSessionId || 'sess_default',
    guestSessionId,
    isAuthenticated,
    isMigrating,
    migrationStatus,
    migrateCurrentGuestSession,
    setActiveSessionId,
    handleLogout,
    startNewGuestSession,
  };
}
