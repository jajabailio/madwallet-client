import { Tab, Tabs, Box, Button, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
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
      <Tabs value={currentPath} aria-label="navigation tabs">
        <Tab label="Expenses" value="/expenses" component={Link} to="/expenses" />
        <Tab label="Categories" value="/categories" component={Link} to="/categories" />
        <Tab label="Payment Methods" value="/payment-methods" component={Link} to="/payment-methods" />
        <Tab label="Purchases" value="/purchases" component={Link} to="/purchases" />
        <Tab label="Statuses" value="/statuses" component={Link} to="/statuses" />
      </Tabs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {user?.firstName} {user?.lastName}
        </Typography>
        <Button variant="outlined" size="small" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Navigation;
