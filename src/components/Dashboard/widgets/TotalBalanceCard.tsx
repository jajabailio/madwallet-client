import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils';

interface TotalBalanceCardProps {
  balanceCents: number;
  previousBalanceCents?: number;
}

const TotalBalanceCard = ({ balanceCents, previousBalanceCents }: TotalBalanceCardProps) => {
  const hasTrend = previousBalanceCents !== undefined;
  const trendUp = hasTrend && balanceCents > previousBalanceCents;
  const trendDown = hasTrend && balanceCents < previousBalanceCents;
  const trendAmount = hasTrend ? Math.abs(balanceCents - previousBalanceCents) : 0;

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
          <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
            Total Cash
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {formatCurrency(balanceCents)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trendUp && (
            <>
              <TrendingUpIcon sx={{ fontSize: 20, color: '#4ade80' }} />
              <Typography variant="body2" sx={{ color: '#4ade80' }}>
                +{formatCurrency(trendAmount)} from last month
              </Typography>
            </>
          )}
          {trendDown && (
            <>
              <TrendingDownIcon sx={{ fontSize: 20, color: '#fca5a5' }} />
              <Typography variant="body2" sx={{ color: '#fca5a5' }}>
                -{formatCurrency(trendAmount)} from last month
              </Typography>
            </>
          )}
          {!hasTrend && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Combined from all active wallets
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalBalanceCard;
