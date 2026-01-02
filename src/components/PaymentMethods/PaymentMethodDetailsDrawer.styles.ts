import type { SxProps, Theme } from '@mui/material';

export const styles = {
	drawer: {
		width: { xs: '100vw', sm: 600 },
		p: { xs: 2, sm: 3 },
		maxHeight: '100vh',
		overflowY: 'auto',
	} as SxProps<Theme>,

	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: 3,
	} as SxProps<Theme>,

	divider: {
		mb: 3,
	} as SxProps<Theme>,

	summaryCardsGrid: {
		display: 'grid',
		gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
		gap: 2,
		mb: 3,
	} as SxProps<Theme>,

	summaryCard: {
		p: 2,
		borderRadius: 1,
		border: '1px solid',
	} as SxProps<Theme>,

	summaryCardLabel: {
		fontSize: '0.75rem',
		fontWeight: 500,
		mb: 0.5,
	} as SxProps<Theme>,

	summaryCardValue: {
		fontSize: '1.5rem',
		fontWeight: 'bold',
	} as SxProps<Theme>,

	summaryCardCount: {
		fontSize: '0.875rem',
		mt: 0.5,
	} as SxProps<Theme>,

	filtersSection: {
		mb: 3,
		p: 2,
		bgcolor: 'background.default',
		borderRadius: 1,
	} as SxProps<Theme>,

	monthGroup: {
		mb: 3,
	} as SxProps<Theme>,

	monthHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: 1,
		pb: 1,
		borderBottom: '2px solid',
		borderColor: 'divider',
	} as SxProps<Theme>,

	monthTitle: {
		fontWeight: 'bold',
		fontSize: '1.1rem',
	} as SxProps<Theme>,

	monthSummary: {
		display: 'flex',
		gap: 2,
		fontSize: '0.875rem',
	} as SxProps<Theme>,

	expensesList: {
		bgcolor: 'background.paper',
		borderRadius: 1,
		p: 0,
	} as SxProps<Theme>,

	expenseItem: {
		borderBottom: '1px solid',
		borderColor: 'divider',
		'&:last-child': { borderBottom: 'none' },
		py: 1.5,
	} as SxProps<Theme>,

	expensePrimary: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	} as SxProps<Theme>,

	expenseAmount: {
		fontWeight: 'bold',
	} as SxProps<Theme>,

	expenseSecondary: {
		display: 'flex',
		gap: 1,
		alignItems: 'center',
		mt: 0.5,
		flexWrap: 'wrap',
	} as SxProps<Theme>,

	overdueIndicator: {
		bgcolor: 'error.main',
		color: 'error.contrastText',
		height: 20,
		fontSize: '0.7rem',
		fontWeight: 'bold',
	} as SxProps<Theme>,

	emptyState: {
		textAlign: 'center',
		py: 8,
		color: 'text.secondary',
	} as SxProps<Theme>,
};
