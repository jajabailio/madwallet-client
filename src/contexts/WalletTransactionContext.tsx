import { createContext, useContext, useEffect, useState } from 'react';
import type { WalletTransaction } from '../types';
import { httpService } from '../services';

interface WalletTransactionContextType {
	transactions: WalletTransaction[];
	setTransactions: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
	loading: boolean;
	refreshTransactions: () => Promise<void>;
}

const WalletTransactionContext = createContext<WalletTransactionContextType | undefined>(
	undefined,
);

export const WalletTransactionProvider = ({ children }: { children: React.ReactNode }) => {
	const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchTransactions = async () => {
		try {
			setLoading(true);
			const response = await httpService<{ data: WalletTransaction[] }>({
				method: 'get',
				url: '/wallet-transactions',
			});
			setTransactions(response.data.data);
		} catch (error) {
			console.error('Failed to fetch transactions:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	const refreshTransactions = async () => {
		await fetchTransactions();
	};

	return (
		<WalletTransactionContext.Provider
			value={{ transactions, setTransactions, loading, refreshTransactions }}
		>
			{children}
		</WalletTransactionContext.Provider>
	);
};

export const useWalletTransactions = () => {
	const context = useContext(WalletTransactionContext);
	if (context === undefined) {
		throw new Error('useWalletTransactions must be used within a WalletTransactionProvider');
	}
	return context;
};
