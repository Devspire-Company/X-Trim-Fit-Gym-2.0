import { useAuth, useClerk } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApolloClient } from '@apollo/client';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { User } from '@/store/slices/authSlice';
import { MeDocument, RoleType } from '@/graphql/generated/graphql';
import { registerClerkTokenGetter } from '@/lib/clerkTokenBridge';
import { setAdminPortalAuthNotice } from '@/lib/adminPortalAuthNotice';

function mapMeToUser(u: NonNullable<import('@/graphql/generated/graphql').MeQuery['me']>): User {
	return {
		id: u.id,
		firstName: u.firstName,
		middleName: u.middleName ?? undefined,
		lastName: u.lastName,
		email: u.email,
		role: u.role,
		phoneNumber: u.phoneNumber ?? undefined,
		dateOfBirth: u.dateOfBirth ?? undefined,
		gender: u.gender,
	};
}

/** Don't sync Mongo admin / signOut during Clerk email/OAuth steps — avoids extra verification emails & broken sign-up. */
function isClerkAuthRoute(pathname: string) {
	return (
		pathname === '/login' ||
		pathname.startsWith('/login/') ||
		pathname === '/sign-up' ||
		pathname.startsWith('/sign-up/')
	);
}

export function ClerkSessionSync() {
	const location = useLocation();
	const navigate = useNavigate();
	const onAuthPage = isClerkAuthRoute(location.pathname);
	const { isLoaded, isSignedIn, getToken, sessionId } = useAuth();
	const { signOut } = useClerk();
	const client = useApolloClient();
	const dispatch = useAppDispatch();
	const syncRunId = useRef(0);

	useEffect(() => {
		registerClerkTokenGetter(() => getToken());
	}, [getToken]);

	useEffect(() => {
		if (!isLoaded) return;

		if (!isSignedIn) {
			dispatch(logout());
			return;
		}

		// Let Clerk finish sign-in/sign-up + email verification without calling our API or signOut()
		if (onAuthPage) {
			return;
		}

		const id = ++syncRunId.current;

		const run = async () => {
			const token = await getToken();
			if (!token) {
				dispatch(logout());
				return;
			}

			try {
				const { data } = await client.query({
					query: MeDocument,
					fetchPolicy: 'network-only',
				});
				if (id !== syncRunId.current) return;

				const me = data?.me;
				if (!me) {
					setAdminPortalAuthNotice({ code: 'NO_STAFF_ACCOUNT' });
					await signOut();
					dispatch(logout());
					dispatch(
						addToast({
							type: 'error',
							message:
								'No administrator profile for this email yet. Ask an owner to add your admin account in Settings.',
						})
					);
					navigate('/login', { replace: true });
					return;
				}

				if (me.role !== RoleType.Admin) {
					setAdminPortalAuthNotice({
						code: me.role === RoleType.Coach ? 'WRONG_ROLE_COACH' : 'WRONG_ROLE_MEMBER',
					});
					await signOut();
					dispatch(logout());
					dispatch(
						addToast({
							type: 'error',
							message:
								me.role === RoleType.Coach
									? 'Coach accounts cannot use the admin web app. Use the coach mobile app.'
									: 'Member accounts cannot use the admin web app. Use the member mobile app.',
						})
					);
					navigate('/login', { replace: true });
					return;
				}

				dispatch(
					setCredentials({
						user: mapMeToUser(me),
					})
				);
			} catch {
				if (id !== syncRunId.current) return;
				setAdminPortalAuthNotice({ code: 'SESSION_ERROR' });
				await signOut();
				dispatch(logout());
				dispatch(
					addToast({
						type: 'error',
						message: 'Could not verify your session with the server.',
					})
				);
				navigate('/login', { replace: true });
			}
		};

		void run();
	}, [isLoaded, isSignedIn, sessionId, onAuthPage, getToken, client, dispatch, signOut, navigate]);

	return null;
}
