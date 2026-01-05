import { createContext, useCallback, useContext, useEffect } from 'react';
import { useCachedFetch } from '../hooks';
import { httpService } from '../services';
import type { Category } from '../types';

interface CategoriesContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[] | null>>;
  loading: boolean;
  refreshCategories: (forceRefresh?: boolean) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchFn = useCallback(async () => {
    const response = await httpService<{ data: Category[] }>({
      method: 'get',
      url: '/categories',
    });
    return response.data.data;
  }, []);

  const { data, loading, fetch, setData } = useCachedFetch<Category[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refreshCategories = useCallback(
    async (forceRefresh = true) => {
      await fetch(forceRefresh);
    },
    [fetch],
  );

  return (
    <CategoriesContext.Provider
      value={{
        categories: data ?? [],
        setCategories: setData,
        loading,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
