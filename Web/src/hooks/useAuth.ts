import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';

/** Clerk-based session; legacy GraphQL login removed from the admin web app. */
export function useAuth() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { signOut } = useClerk();

	const logout = async () => {
		await signOut();
		dispatch(logoutAction());
		navigate('/login');
	};

	return {
		logout,
		loginLoading: false,
	};
}
