import { createContext, useContext, useEffect, useState } from 'react';
import { httpService } from '../services';
import type { Status } from '../types';

interface StatusesContextType {
  statuses: Status[];
  loading: boolean;
  refreshStatuses: () => Promise<void>;
}

const StatusesContext = createContext<StatusesContextType | undefined>(undefined);

export const StatusesProvider = ({ children }: { children: React.ReactNode }) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await httpService<{ data: Status[] }>({
        method: 'get',
        url: '/statuses',
      });
      setStatuses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const refreshStatuses = async () => {
    await fetchStatuses();
  };

  return (
    <StatusesContext.Provider value={{ statuses, loading, refreshStatuses }}>
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
