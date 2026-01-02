import { Tab, Tabs, Box, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Expenses', path: '/expenses' },
    { label: 'Categories', path: '/categories' },
    { label: 'Payment Methods', path: '/payment-methods' },
    { label: 'Purchases', path: '/purchases' },
    { label: 'Statuses', path: '/statuses' },
    { label: 'Wallets', path: '/wallets' },
  ];

  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
        }}
      >
        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setMobileMenuOpen(true)}
          sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}
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
      </Box>

      {/* Mobile Drawer Menu */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="h6">Mad Wallet</Typography>
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
