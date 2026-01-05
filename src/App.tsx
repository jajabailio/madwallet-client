// Main App component - entry point for Mad Wallet
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CategoryManager from './components/Categories/CategoryManager';
import Navigation, { SIDEBAR_WIDTH } from './components/common/Navigation';
import SummaryBar from './components/common/SummaryBar';
import ExpenseManager from './components/Expenses/ExpenseManager';
import PaymentMethodManager from './components/PaymentMethods/PaymentMethodManager';
import PurchaseManager from './components/Purchases/PurchaseManager';
import RecurringBillManager from './components/RecurringBills/RecurringBillManager';
import StatusManager from './components/Statuses/StatusManager';
import WalletManager from './components/Wallets/WalletManager';
import { CoreProvider, DataProvider, useTheme as useAppTheme, useAuth } from './contexts';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

interface AppHeaderProps {
  onMobileMenuOpen: () => void;
}

const AppHeader = ({ onMobileMenuOpen }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {!isDesktop && (
          <IconButton
            color="inherit"
            aria-label="open navigation"
            edge="start"
            onClick={onMobileMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Mad Wallet
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          </Tooltip>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const AuthenticatedLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileOpen = () => setMobileOpen(true);
  const handleMobileClose = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <AppHeader onMobileMenuOpen={handleMobileOpen} />

        <Toolbar />

        <Container maxWidth="lg" sx={{ py: 3 }}>
          <SummaryBar />

          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpenseManager />} />
            <Route path="/categories" element={<CategoryManager />} />
            <Route path="/payment-methods" element={<PaymentMethodManager />} />
            <Route path="/purchases" element={<PurchaseManager />} />
            <Route path="/recurring-bills" element={<RecurringBillManager />} />
            <Route path="/statuses" element={<StatusManager />} />
            <Route path="/wallets" element={<WalletManager />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <CoreProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <AuthenticatedLayout />
                </DataProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CoreProvider>
  );
};

export default App;
