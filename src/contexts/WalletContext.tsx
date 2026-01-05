import { createContext, useCallback, useContext, useEffect } from 'react';
import { useCachedFetch } from '../hooks';
import { httpService } from '../services';
import type { Wallet } from '../types';

interface WalletContextType {
  wallets: Wallet[];
  setWallets: React.Dispatch<React.SetStateAction<Wallet[] | null>>;
  loading: boolean;
  refreshWallets: (forceRefresh?: boolean) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: Wallet[] }>({
      method: 'get',
      url: '/wallets',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch, setData } = useCachedFetch<Wallet[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshWallets = async (forceRefresh = true) => {
    await fetch(forceRefresh);
  };

  return (
    <WalletContext.Provider
      value={{
        wallets: data ?? [],
        setWallets: setData,
        loading,
        refreshWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallets = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletProvider');
  }
  return context;
};
