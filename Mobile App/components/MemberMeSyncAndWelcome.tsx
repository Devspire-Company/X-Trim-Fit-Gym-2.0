import { PostOnboardingWelcomeModal } from '@/components/PostOnboardingWelcomeModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMeQuery } from '@/graphql/generated/types';
import { setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { memberHasActiveGymMembership } from '@/utils/memberMembership';
import { useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

const ME_POLL_MS = 30_000;

/**
 * Polls `me` while the member has no assigned membership so approval on the server
 * updates Redux. When `membershipId` appears, shows a one-time “Welcome aboard” modal
 * and full app access follows existing gates.
 */
export function MemberMeSyncAndWelcome() {
	const { user } = useAuth();
	const dispatch = useDispatch();
	const router = useRouter();
	const [showApprovedWelcome, setShowApprovedWelcome] = useState(false);
	const prevHasMembershipRef = useRef<boolean | null>(null);
	const seededRef = useRef(false);

	const hasMembership = memberHasActiveGymMembership(user);
	const skipMe = !user?.id || user.role !== 'member';

	useEffect(() => {
		if (skipMe) {
			seededRef.current = false;
			prevHasMembershipRef.current = null;
		}
	}, [skipMe]);

	const { data } = useMeQuery({
		skip: skipMe,
		fetchPolicy: 'cache-and-network',
		pollInterval: skipMe ? 0 : ME_POLL_MS,
		notifyOnNetworkStatusChange: true,
	});

	useLayoutEffect(() => {
		if (data?.me) {
			dispatch(setUser(convertGraphQLUser(data.me)));
		}
	}, [data, dispatch]);

	useEffect(() => {
		if (skipMe) return;

		if (!seededRef.current) {
			prevHasMembershipRef.current = hasMembership;
			seededRef.current = true;
			return;
		}

		const prev = prevHasMembershipRef.current;
		if (prev === false && hasMembership === true) {
			setShowApprovedWelcome(true);
		}
		prevHasMembershipRef.current = hasMembership;
	}, [skipMe, hasMembership]);

	const dismissWelcome = () => {
		setShowApprovedWelcome(false);
		router.replace('/(member)/dashboard');
	};

	if (skipMe) return null;

	return (
		<PostOnboardingWelcomeModal
			visible={showApprovedWelcome}
			onDismiss={dismissWelcome}
		/>
	);
}
