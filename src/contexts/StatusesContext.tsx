import { createContext, useCallback, useContext, useEffect } from 'react';
import { useCachedFetch } from '../hooks';
import { httpService } from '../services';
import type { Status } from '../types';

interface StatusesContextType {
  statuses: Status[];
  loading: boolean;
  refreshStatuses: (forceRefresh?: boolean) => Promise<void>;
}

const StatusesContext = createContext<StatusesContextType | undefined>(undefined);

export const StatusesProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: Status[] }>({
      method: 'get',
      url: '/statuses',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch } = useCachedFetch<Status[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshStatuses = useCallback(
    async (forceRefresh = true) => {
      await fetch(forceRefresh);
    },
    [fetch],
  );

  return (
    <StatusesContext.Provider
      value={{
        statuses: data ?? [],
        loading,
        refreshStatuses,
      }}
    >
      {children}
    </StatusesContext.Provider>
  );
};

export const useStatuses = () => {
  const context = useContext(StatusesContext);
  if (context === undefined) {
    throw new Error('useStatuses must be used within a StatusesProvider');
  }
  return context;
};
