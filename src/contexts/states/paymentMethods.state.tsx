import { createContext, useCallback, useContext, useEffect } from 'react';
import { useCachedFetch } from '../../hooks';
import { httpService } from '../../services';
import type { PaymentMethod } from '../../types';

interface PaymentMethodsContextType {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  refreshPaymentMethods: (forceRefresh?: boolean) => Promise<void>;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

export const PaymentMethodsProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: PaymentMethod[] }>({
      method: 'get',
      url: '/payment-methods',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch } = useCachedFetch<PaymentMethod[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshPaymentMethods = useCallback(
    async (forceRefresh = true) => {
      await fetch(forceRefresh);
    },
    [fetch],
  );

  return (
    <PaymentMethodsContext.Provider
      value={{
        paymentMethods: data ?? [],
        loading,
        refreshPaymentMethods,
      }}
    >
      {children}
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (context === undefined) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  }
  return context;
};
