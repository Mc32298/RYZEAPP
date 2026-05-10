import { useState, useEffect, useCallback } from "react";

export interface UseSessionLockParams {
  sessionLock: boolean;
}

export function useSessionLock(params: UseSessionLockParams): {
  isSessionLocked: boolean;
  unlock: () => void;
} {
  const { sessionLock } = params;
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  useEffect(() => {
    if (!sessionLock) {
      setIsSessionLocked(false);
      return;
    }

    let timeoutId: number | undefined;
    let throttleTimer: number | undefined;

    const resetLockTimer = () => {
      if (throttleTimer) return;

      throttleTimer = window.setTimeout(() => {
        throttleTimer = undefined;
      }, 1000);

      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsSessionLocked(true), 45_000);
    };

    const handleBlur = () => setIsSessionLocked(true);

    resetLockTimer();
    window.addEventListener("mousemove", resetLockTimer);
    window.addEventListener("mousedown", resetLockTimer);
    window.addEventListener("keydown", resetLockTimer);
    window.addEventListener("touchstart", resetLockTimer);
    window.addEventListener("blur", handleBlur);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (throttleTimer !== undefined) {
        window.clearTimeout(throttleTimer);
      }
      window.removeEventListener("mousemove", resetLockTimer);
      window.removeEventListener("mousedown", resetLockTimer);
      window.removeEventListener("keydown", resetLockTimer);
      window.removeEventListener("touchstart", resetLockTimer);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sessionLock]);

  const unlock = useCallback(() => setIsSessionLocked(false), []);
  return { isSessionLocked, unlock };
}
