import { createContext, useContext, useEffect, useState } from 'react';
import { httpService } from '../services';
import type { Wallet } from '../types';

interface WalletContextType {
  wallets: Wallet[];
  setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
  loading: boolean;
  refreshWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await httpService<{ data: Wallet[] }>({
        method: 'get',
        url: '/wallets',
      });
      setWallets(response.data.data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const refreshWallets = async () => {
    await fetchWallets();
  };

  return (
    <WalletContext.Provider value={{ wallets, setWallets, loading, refreshWallets }}>
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
