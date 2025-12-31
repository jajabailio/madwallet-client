import { createContext, useContext, useEffect, useState } from 'react';
import { httpService } from '../services';
import type { Purchase } from '../types';

interface PurchasesContextType {
  purchases: Purchase[];
  loading: boolean;
  refreshPurchases: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

export const PurchasesProvider = ({ children }: { children: React.ReactNode }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await httpService<{ data: Purchase[] }>({
        method: 'get',
        url: '/purchases',
      });
      setPurchases(response.data.data);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const refreshPurchases = async () => {
    await fetchPurchases();
  };

  return (
    <PurchasesContext.Provider value={{ purchases, loading, refreshPurchases }}>
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
