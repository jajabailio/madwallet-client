import { createContext, useCallback, useContext, useEffect } from 'react';
import { useCachedFetch } from '../hooks';
import { httpService } from '../services';
import type { WalletTransaction } from '../types';

interface WalletTransactionContextType {
  transactions: WalletTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<WalletTransaction[] | null>>;
  loading: boolean;
  refreshTransactions: (forceRefresh?: boolean) => Promise<void>;
}

const WalletTransactionContext = createContext<WalletTransactionContextType | undefined>(undefined);

export const WalletTransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: WalletTransaction[] }>({
      method: 'get',
      url: '/wallet-transactions',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch, setData } = useCachedFetch<WalletTransaction[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshTransactions = async (forceRefresh = true) => {
    await fetch(forceRefresh);
  };

  return (
    <WalletTransactionContext.Provider
      value={{
        transactions: data ?? [],
        setTransactions: setData,
        loading,
        refreshTransactions,
      }}
    >
      {children}
    </WalletTransactionContext.Provider>
  );
};

export const useWalletTransactions = () => {
  const context = useContext(WalletTransactionContext);
  if (context === undefined) {
    throw new Error('useWalletTransactions must be used within a WalletTransactionProvider');
  }
  return context;
};
