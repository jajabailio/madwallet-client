import { Container, Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryManager from './components/Categories/CategoryManager';
import Navigation from './components/common/Navigation';
import SummaryBar from './components/common/SummaryBar';
import ExpenseManager from './components/Expenses/ExpenseManager';
import PaymentMethodManager from './components/PaymentMethods/PaymentMethodManager';
import PurchaseManager from './components/Purchases/PurchaseManager';
import StatusManager from './components/Statuses/StatusManager';
import WalletManager from './components/Wallets/WalletManager';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import {
  AuthProvider,
  CategoriesProvider,
  DashboardProvider,
  PaymentMethodsProvider,
  PurchasesProvider,
  StatusesProvider,
  ThemeProvider,
  WalletProvider,
  WalletTransactionProvider,
  useAuth,
  useTheme,
} from './contexts';

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', boxShadow: 1, mb: 3 }}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Mad Wallet
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>
            <Typography variant="body2" color="textSecondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Button variant="outlined" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <CategoriesProvider>
                  <PaymentMethodsProvider>
                    <PurchasesProvider>
                      <StatusesProvider>
                        <WalletProvider>
                          <WalletTransactionProvider>
                            <DashboardProvider>
                              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                                <AppHeader />

                                <Container maxWidth="lg" sx={{ mb: 3 }}>
                                  <SummaryBar />
                                </Container>

                                <Container maxWidth="lg" sx={{ py: 2 }}>
                                  <Navigation />

                                <Routes>
                                  <Route path="/expenses" element={<ExpenseManager />} />
                                  <Route path="/categories" element={<CategoryManager />} />
                                  <Route path="/payment-methods" element={<PaymentMethodManager />} />
                                  <Route path="/purchases" element={<PurchaseManager />} />
                                  <Route path="/statuses" element={<StatusManager />} />
                                  <Route path="/wallets" element={<WalletManager />} />
                                  <Route path="/" element={<Navigate to="/expenses" replace />} />
                                </Routes>
                              </Container>
                            </Box>
                            </DashboardProvider>
                          </WalletTransactionProvider>
                        </WalletProvider>
                      </StatusesProvider>
                    </PurchasesProvider>
                  </PaymentMethodsProvider>
                </CategoriesProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
