import { Tab, Tabs, Box, Button, Typography, IconButton, Tooltip, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth, useTheme } from '../../contexts';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Expenses', path: '/expenses' },
    { label: 'Categories', path: '/categories' },
    { label: 'Payment Methods', path: '/payment-methods' },
    { label: 'Purchases', path: '/purchases' },
    { label: 'Statuses', path: '/statuses' },
  ];

  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setMobileMenuOpen(true)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop Tabs */}
        <Tabs
          value={currentPath}
          aria-label="navigation tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {navItems.map((item) => (
            <Tab key={item.path} label={item.label} value={item.path} component={Link} to={item.path} />
          ))}
        </Tabs>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, pr: { xs: 1, sm: 2 } }}>
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

      {/* Mobile Drawer Menu */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="h6">Mad Wallet</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={currentPath === item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
