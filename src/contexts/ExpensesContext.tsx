import { createContext, useCallback, useContext } from 'react';
import { useCachedFetch } from '../hooks';
import { httpService } from '../services';
import type { Expense } from '../types';

interface ExpensesContextType {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[] | null>>;
  loading: boolean;
  refreshExpenses: (forceRefresh?: boolean) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<Expense[]>({
      method: 'get',
      url: '/expenses',
    });
    return response.data;
  }, []);

  const { data, loading, fetch, setData } = useCachedFetch<Expense[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  const refreshExpenses = useCallback(
    async (forceRefresh = true) => {
      await fetch(forceRefresh);
    },
    [fetch],
  );

  return (
    <ExpensesContext.Provider
      value={{
        expenses: data ?? [],
        setExpenses: setData,
        loading,
        refreshExpenses,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
};
