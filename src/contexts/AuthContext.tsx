import { createContext, useContext, useEffect, useState } from 'react';
import { httpService } from '../services';
import type { User, AuthResponse, LoginCredentials, SignupData } from '../types';

interface AuthContextType {
	user: User | null;
	token: string | null;
	loading: boolean;
	login: (credentials: LoginCredentials) => Promise<User>;
	signup: (data: SignupData) => Promise<User>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mad-wallet-token';
const USER_KEY = 'mad-wallet-user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load token and user from localStorage on mount
	useEffect(() => {
		const storedToken = localStorage.getItem(TOKEN_KEY);
		const storedUser = localStorage.getItem(USER_KEY);

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
		}

		setLoading(false);
	}, []);

	// Login function
	const login = async (credentials: LoginCredentials) => {
		const response = await httpService<{ data: AuthResponse }>({
			method: 'post',
			url: '/auth/login',
			data: credentials,
		});

		const { user, token } = response.data.data;

		// Store in state
		setUser(user);
		setToken(token);

		// Store in localStorage
		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(USER_KEY, JSON.stringify(user));

		return user;
	};

	// Signup function
	const signup = async (data: SignupData) => {
		const response = await httpService<{ data: AuthResponse }>({
			method: 'post',
			url: '/auth/signup',
			data,
		});

		const { user, token } = response.data.data;

		// Store in state
		setUser(user);
		setToken(token);

		// Store in localStorage
		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(USER_KEY, JSON.stringify(user));

		return user;
	};

	// Logout function
	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
	};

	const isAuthenticated = !!user && !!token;

	return (
		<AuthContext.Provider
			value={{ user, token, loading, login, signup, logout, isAuthenticated }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
