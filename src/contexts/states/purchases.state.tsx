import { createContext, useCallback, useContext } from 'react';
import { useCachedFetch } from '../../hooks';
import { httpService } from '../../services';
import type { Purchase } from '../../types';

interface PurchasesContextType {
  purchases: Purchase[];
  loading: boolean;
  refreshPurchases: (forceRefresh?: boolean) => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export const PurchasesProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: Purchase[] }>({
      method: 'get',
      url: '/purchases',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch } = useCachedFetch<Purchase[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  const refreshPurchases = useCallback(
    async (forceRefresh = true) => {
      await fetch(forceRefresh);
    },
    [fetch],
  );

  return (
    <PurchasesContext.Provider
      value={{
        purchases: data ?? [],
        loading,
        refreshPurchases,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchasesContext);
  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchasesProvider');
  }
  return context;
};
