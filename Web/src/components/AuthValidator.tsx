import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

/**
 * Component that validates user role on app initialization
 * Ensures only admin users can remain authenticated
 * Note: This component runs outside Router context, so we use window.location for navigation
 */
export function AuthValidator({ children }: { children: React.ReactNode }) {
	const user = useAppSelector((state) => state.auth.user);
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const dispatch = useAppDispatch();

	useEffect(() => {
		// If user is authenticated but not an admin, log them out
		if (isAuthenticated && user && user.role !== 'admin') {
			dispatch(logout());
			// Use window.location since we're outside Router context
			window.location.href = '/login';
		}
	}, [isAuthenticated, user, dispatch]);

	return <>{children}</>;
}

