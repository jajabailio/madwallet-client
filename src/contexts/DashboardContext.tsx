import { createContext, useCallback, useContext, useEffect } from 'react';
import { useCachedFetch } from '../hooks';
import { httpService } from '../services';
import type { DashboardSummary } from '../types';

interface DashboardContextType {
  summary: DashboardSummary | null;
  loading: boolean;
  refreshSummary: (forceRefresh?: boolean) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: DashboardSummary }>({
      method: 'get',
      url: '/dashboard/summary',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch } = useCachedFetch<DashboardSummary>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshSummary = async (forceRefresh = true) => {
    await fetch(forceRefresh);
  };

  return (
    <DashboardContext.Provider
      value={{
        summary: data,
        loading,
        refreshSummary,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
