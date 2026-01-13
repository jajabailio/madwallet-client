import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { SIDEBAR_WIDTH, styles } from './Navigation.styles';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Expenses', path: '/expenses', icon: <ReceiptIcon /> },
  { label: 'Categories', path: '/categories', icon: <CategoryIcon /> },
  { label: 'Payment Methods', path: '/payment-methods', icon: <CreditCardIcon /> },
  { label: 'Purchases', path: '/purchases', icon: <ShoppingCartIcon /> },
  { label: 'Recurring Bills', path: '/recurring-bills', icon: <EventRepeatIcon /> },
  { label: 'Statuses', path: '/statuses', icon: <AssignmentIcon /> },
  { label: 'Wallets', path: '/wallets', icon: <AccountBalanceWalletIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

interface NavigationProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Navigation = ({ mobileOpen, onMobileClose }: NavigationProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const drawerContent = (
    <Box sx={styles.drawerContent}>
      {!isDesktop && (
        <>
          <Box sx={styles.brandSection}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Mad Wallet
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      <List sx={styles.navList}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={currentPath === item.path}
              onClick={!isDesktop ? onMobileClose : undefined}
              sx={styles.navItem}
            >
              <ListItemIcon sx={styles.navIcon}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isDesktop && (
        <Drawer variant="permanent" sx={styles.permanentDrawer}>
          {drawerContent}
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={styles.temporaryDrawer}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export { SIDEBAR_WIDTH };
export default Navigation;
