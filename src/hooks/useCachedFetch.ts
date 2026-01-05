import { useCallback, useRef, useState } from 'react';

interface UseCachedFetchOptions<T> {
  fetchFn: () => Promise<T>;
  cacheTimeMinutes?: number;
}

interface UseCachedFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetchedAt: Date | null;
  fetch: (forceRefresh?: boolean) => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  isCacheStale: () => boolean;
}

/**
 * Custom hook for fetching data with time-based caching.
 * Only refetches if cache is stale (older than cacheTimeMinutes) or forceRefresh is true.
 *
 * @param options.fetchFn - Async function that returns the data
 * @param options.cacheTimeMinutes - Cache duration in minutes (default: 10)
 *
 * @example
 * const { data, loading, fetch, setData } = useCachedFetch({
 *   fetchFn: async () => {
 *     const response = await httpService<Category[]>({ method: 'get', url: '/categories' });
 *     return response.data;
 *   },
 *   cacheTimeMinutes: 10,
 * });
 */
export const useCachedFetch = <T>({
  fetchFn,
  cacheTimeMinutes = 10,
}: UseCachedFetchOptions<T>): UseCachedFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedAtRef = useRef<Date | null>(null);
  const isFetchingRef = useRef(false);

  const isCacheStale = useCallback(() => {
    if (!lastFetchedAtRef.current) return true;

    const now = new Date();
    const cacheAgeMs = now.getTime() - lastFetchedAtRef.current.getTime();
    const cacheAgeMinutes = cacheAgeMs / (1000 * 60);

    return cacheAgeMinutes >= cacheTimeMinutes;
  }, [cacheTimeMinutes]);

  const fetch = useCallback(
    async (forceRefresh = false) => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        return;
      }

      // Skip fetch if cache is fresh and not forcing refresh
      if (!forceRefresh && !isCacheStale() && data !== null) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        const result = await fetchFn();

        setData(result);
        lastFetchedAtRef.current = new Date();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        console.error('useCachedFetch error:', err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchFn, isCacheStale, data],
  );

  return {
    data,
    loading,
    error,
    lastFetchedAt: lastFetchedAtRef.current,
    fetch,
    setData,
    isCacheStale,
  };
};

export default useCachedFetch;
