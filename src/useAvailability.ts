import { useCallback, useEffect, useState } from 'react';
import { loadUnavailable } from './availability';

type AvailabilityState = {
  unavailable: Set<string>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useAvailability(): AvailabilityState {
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await loadUnavailable();
      setUnavailable(next);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Availability is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15_000);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  return { unavailable, loading, error, refresh };
}
