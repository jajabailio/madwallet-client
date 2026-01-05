import { createContext, useContext, useEffect, useState } from 'react';
import { httpService } from '../services';
import type { DashboardSummary } from '../types';

interface DashboardContextType {
  summary: DashboardSummary | null;
  loading: boolean;
  refreshSummary: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await httpService<{ data: DashboardSummary }>({
        method: 'get',
        url: '/dashboard/summary',
      });
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const refreshSummary = async () => {
    await fetchSummary();
  };

  return (
    <DashboardContext.Provider value={{ summary, loading, refreshSummary }}>
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
