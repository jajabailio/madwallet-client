import type { ReactNode } from 'react';

// Import all providers from state files
import { AuthProvider } from './states/auth.state';
import { CategoriesProvider } from './states/categories.state';
import { DashboardProvider } from './states/dashboard.state';
import { ExpensesProvider } from './states/expenses.state';
import { PaymentMethodsProvider } from './states/paymentMethods.state';
import { PurchasesProvider } from './states/purchases.state';
import { StatusesProvider } from './states/statuses.state';
import { ThemeProvider } from './states/theme.state';
import { WalletProvider } from './states/wallets.state';
import { WalletTransactionProvider } from './states/walletTransactions.state';

interface ProviderProps {
  children: ReactNode;
}

/**
 * Core providers that wrap the entire app (including unauthenticated routes)
 * - Theme: Provides MUI theme and dark mode toggle
 * - Auth: Provides user state, login/logout actions
 */
export const CoreProvider = ({ children }: ProviderProps) => {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};

/**
 * Data providers that only wrap authenticated routes
 * These require authentication and should be inside ProtectedRoute
 */
export const DataProvider = ({ children }: ProviderProps) => {
  return (
    <CategoriesProvider>
      <StatusesProvider>
        <PaymentMethodsProvider>
          <WalletProvider>
            <ExpensesProvider>
              <PurchasesProvider>
                <WalletTransactionProvider>
                  <DashboardProvider>{children}</DashboardProvider>
                </WalletTransactionProvider>
              </PurchasesProvider>
            </ExpensesProvider>
          </WalletProvider>
        </PaymentMethodsProvider>
      </StatusesProvider>
    </CategoriesProvider>
  );
};

/**
 * Full AppProvider - combines Core and Data providers
 * Use this when you want everything in one wrapper (for simplicity)
 * Note: Data providers should still be used only for authenticated routes
 */
export const AppProvider = ({ children }: ProviderProps) => {
  return (
    <CoreProvider>
      <DataProvider>{children}</DataProvider>
    </CoreProvider>
  );
};
