import FixedView from '@/components/FixedView';
import { useAuth } from '@/contexts/AuthContext';
import { useMeQuery } from '@/graphql/generated/types';
import { clearUser, setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { storage } from '@/utils/storage';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function Index() {
	const dispatch = useDispatch();
	const reduxUser = useSelector((s: { user: { user: unknown } }) => s.user.user) as
		| import('@/graphql/generated/types').User
		| null;
	const { onboardingStatus } = useAuth();
	const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();

	const needMe = clerkLoaded && isSignedIn && !reduxUser;
	const { data, loading, error } = useMeQuery({
		skip: !needMe,
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		if (data?.me) {
			dispatch(setUser(convertGraphQLUser(data.me)));
		}
	}, [data, dispatch]);

	useEffect(() => {
		if (!clerkLoaded) return;
		if (!isSignedIn && reduxUser) {
			dispatch(clearUser());
			void storage.removeItem('auth_token');
		}
	}, [clerkLoaded, isSignedIn, reduxUser, dispatch]);

	if (!clerkLoaded) {
		return (
			<FixedView className='flex-1 bg-bg-darker'>
				<View className='flex-1 justify-center items-center'>
					<ActivityIndicator size='large' />
					<Text className='mt-2.5 text-base text-text-secondary'>Loading...</Text>
				</View>
			</FixedView>
		);
	}

	if (!isSignedIn) {
		return <Redirect href='/(auth)/login' />;
	}

	if (isSignedIn && !reduxUser) {
		if (loading || (needMe && data === undefined)) {
			return (
				<FixedView className='flex-1 bg-bg-darker'>
					<View className='flex-1 justify-center items-center'>
						<ActivityIndicator size='large' />
						<Text className='mt-2.5 text-base text-text-secondary'>
							Syncing your account…
						</Text>
					</View>
				</FixedView>
			);
		}
		if (error) {
			return (
				<FixedView className='flex-1 bg-bg-darker'>
					<View className='flex-1 justify-center items-center px-6'>
						<Text className='text-base text-red-400 text-center'>
							{error.message || 'Could not load your profile.'}
						</Text>
					</View>
				</FixedView>
			);
		}
		if (data?.me == null) {
			return <Redirect href='/(auth)/complete-registration' />;
		}
		return (
			<FixedView className='flex-1 bg-bg-darker'>
				<View className='flex-1 justify-center items-center'>
					<ActivityIndicator size='large' />
				</View>
			</FixedView>
		);
	}

	if (reduxUser?.role === 'coach') {
		return <Redirect href='/(coach)/dashboard' />;
	}
	if (reduxUser?.role === 'member') {
		if (onboardingStatus !== 'completed') {
			return <Redirect href='/(auth)/(onboarding)/first' />;
		}
		return <Redirect href='/(member)/dashboard' />;
	}

	return <Redirect href='/(auth)/login' />;
}
