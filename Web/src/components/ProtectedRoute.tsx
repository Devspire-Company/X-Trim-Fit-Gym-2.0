import { Navigate, useLocation } from 'react-router';
import { useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, type User } from '@/store/slices/authSlice';
import { RoleType } from '@/graphql/generated/graphql';
import { setAdminPortalAuthNotice } from '@/lib/adminPortalAuthNotice';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
	children: ReactNode;
}

type NonAdminRole = Exclude<User['role'], 'admin'>;

/** Clears Clerk + app state when a non-admin session reaches a protected route (defensive). */
function WrongRoleRedirect({ role }: { role: NonAdminRole }) {
	const { signOut } = useClerk();
	const dispatch = useAppDispatch();
	const [done, setDone] = useState(false);

	useEffect(() => {
		setAdminPortalAuthNotice({
			code: role === 'coach' ? 'WRONG_ROLE_COACH' : 'WRONG_ROLE_MEMBER',
		});
		dispatch(logout());
		void signOut().finally(() => setDone(true));
	}, [role, signOut, dispatch]);

	if (!done) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-darker)]">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-yellow)]" />
			</div>
		);
	}

	return <Navigate to="/login" replace />;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isLoaded, isSignedIn } = useClerkAuth();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const user = useAppSelector((state) => state.auth.user);
	const location = useLocation();

	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-darker)]">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-yellow)]" />
			</div>
		);
	}

	if (!isSignedIn) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (!isAuthenticated || !user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-darker)]">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-yellow)]" />
			</div>
		);
	}

	if (user.role !== RoleType.Admin) {
		return <WrongRoleRedirect role={user.role} />;
	}

	return <>{children}</>;
}
