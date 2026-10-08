import React, { createContext, useContext, ReactNode, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/userSlice';
import { storage } from '@/utils/storage';
import { User } from '@/graphql/generated/types';
import { useAuth as useClerkAuth, useClerk } from '@clerk/clerk-expo';

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	onboardingStatus: 'completed' | 'incomplete';
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const { signOut } = useClerk();
	const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
	const user = useAppSelector((state) => state.user.user);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (clerkLoaded && !isSignedIn && user) {
			dispatch(clearUser());
		}
	}, [clerkLoaded, isSignedIn, user, dispatch]);

	const onboardingStatus = useMemo<'completed' | 'incomplete'>(() => {
		if (!user) return 'incomplete';
		if (user.role === 'coach') return 'completed';
		if (user.role === 'member') {
			const hasEnteredDetails =
				user.membershipDetails?.hasEnteredDetails ?? false;
			return hasEnteredDetails ? 'completed' : 'incomplete';
		}
		return 'incomplete';
	}, [user]);

	const logout = async () => {
		try {
			await signOut();
		} catch {
			// still clear local state
		}
		await storage.removeItem('auth_token');
		await storage.removeItem('user_walkin');
		dispatch(clearUser());
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!user && clerkLoaded && !!isSignedIn,
				isLoading: !clerkLoaded,
				user,
				onboardingStatus,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

AuthProvider.displayName = 'AuthProvider';

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export type { UserRole, User } from '@/store/slices/userSlice';
