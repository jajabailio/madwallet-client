import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

interface EmptyStateProps {
	message?: string;
	icon?: React.ReactNode;
}

const EmptyState = ({ message = 'No data available', icon }: EmptyStateProps) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				py: 8,
				px: 2,
			}}
		>
			{icon || <InboxOutlined sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />}
			<Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
				{message}
			</Typography>
		</Box>
	);
};

export default EmptyState;
