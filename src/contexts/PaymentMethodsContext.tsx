import { createContext, useContext, useEffect, useState } from 'react';
import { httpService } from '../services';
import type { PaymentMethod } from '../types';

interface PaymentMethodsContextType {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  refreshPaymentMethods: () => Promise<void>;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

export const PaymentMethodsProvider = ({ children }: { children: React.ReactNode }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await httpService<{ data: PaymentMethod[] }>({
        method: 'get',
        url: '/payment-methods',
      });
      setPaymentMethods(response.data.data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const refreshPaymentMethods = async () => {
    await fetchPaymentMethods();
  };

  return (
    <PaymentMethodsContext.Provider value={{ paymentMethods, loading, refreshPaymentMethods }}>
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
