import Checkbox from '@/components/Checkbox';
import ConfirmModal from '@/components/ConfirmModal';
import FixedView from '@/components/FixedView';
import GradientButton from '@/components/GradientButton';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { normalizePhysiqueGoalTypeForApi } from '@/constants/onboarding-options';
import { UPDATE_USER_MUTATION } from '@/graphql/mutations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { convertGraphQLUser } from '@/utils/graphql-utils';
import { storage } from '@/utils/storage';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Note: UpdateUserMutation types may need to be regenerated
// Using any for now until GraphQL codegen is run
type UpdateUserMutation = any;
type UpdateUserMutationVariables = any;

const Fourth = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const user = useAppSelector((state) => state.user.user);
	const { data, clearData } = useOnboarding();

	const [agreedToTermsAndConditions, setAgreedToTermsAndConditions] = useState(
		data.agreedToTermsAndConditions || false
	);
	const [showTermsModal, setShowTermsModal] = useState(false);
	const [alertModal, setAlertModal] = useState<{
		visible: boolean;
		title: string;
		message: string;
		variant: 'danger' | 'neutral' | 'success' | 'warning';
	}>({ visible: false, title: '', message: '', variant: 'neutral' });
	const [updateUser, { loading }] = useMutation<
		UpdateUserMutation,
		UpdateUserMutationVariables
	>(UPDATE_USER_MUTATION, {
		onCompleted: (mutationData) => {
			const intent = data.membershipIntent;
			const updatedUser = convertGraphQLUser(mutationData.updateUser);
			dispatch(setUser(updatedUser));
			clearData();
			const welcome =
				intent === 'skip'
					? 'limited'
					: intent === 'avail_counter'
						? 'counter'
						: 'active';
			// sana naman wag kana magloko
			// sana naman wag kana magloko
			void storage.setItem('onboarding_welcome', welcome);
			// sana naman wag kana magloko
		},
		onError: (error) => {
			setAlertModal({
				visible: true,
				title: 'Error',
				message: error.message || 'Failed to complete onboarding. Please try again.',
				variant: 'danger',
			});
		},
	});

	const handleComplete = async () => {
		if (!agreedToTermsAndConditions) {
			setAlertModal({
				visible: true,
				title: 'Required Agreement',
				message: 'Please agree to the terms and conditions to continue.',
				variant: 'warning',
			});
			return;
		}

		if (!user?.id) {
			setAlertModal({
				visible: true,
				title: 'Error',
				message: 'User not found. Please try signing up again.',
				variant: 'danger',
			});
			return;
		}

		// Update user with onboarding data and set hasEnteredDetails to true
		try {
			await updateUser({
				variables: {
					id: user.id,
					input: {
						phoneNumber: data.phoneNumber,
						dateOfBirth: data.dateOfBirth?.toISOString(),
						gender: data.gender,
						agreedToTermsAndConditions,
						membershipDetails: {
							physiqueGoalType: normalizePhysiqueGoalTypeForApi(
								data.physiqueGoalType
							),
							fitnessGoal: data.fitnessGoal || [],
							workOutTime: data.workOutTime || [],
							hasEnteredDetails: true,
						},
					},
				},
			});
		} catch {
			// Error is handled in onError callback
		}
	};

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<ScrollView
				contentContainerClassName='flex-grow px-5 py-8'
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				<Text className='text-text-secondary text-sm mb-4'>Step 4 of 4</Text>
				<Text className='text-3xl font-bold mb-2 text-text-primary'>
					Terms & Conditions
				</Text>
				<Text className='text-base text-text-secondary mb-8'>
					Please review and agree to our terms
				</Text>

				<View className='gap-6' pointerEvents={loading ? 'none' : 'auto'}>
					<Checkbox
						label={
							<Text className='text-text-primary text-base'>
								I agree to the{' '}
								<Text
									className='text-[#F9C513] underline'
									onPress={() => !loading && setShowTermsModal(true)}
								>
									Terms and Conditions
								</Text>
							</Text>
						}
						checked={agreedToTermsAndConditions}
						onChange={setAgreedToTermsAndConditions}
						disabled={loading}
					/>

					<View className='flex-row gap-3 mt-4'>
						<GradientButton
							onPress={() => router.back()}
							className='flex-1'
							variant='secondary'
							disabled={loading}
						>
							Back
						</GradientButton>
						<GradientButton
							onPress={handleComplete}
							loading={loading}
							className='flex-1'
							disabled={loading}
						>
							{loading ? 'Loading...' : 'Complete'}
						</GradientButton>
					</View>
				</View>
			</ScrollView>

			{/* Terms and Conditions Modal */}
			<Modal
				visible={showTermsModal}
				animationType='slide'
				transparent={false}
				onRequestClose={() => setShowTermsModal(false)}
			>
				<View className='flex-1 bg-bg-darker'>
					{/* Header */}
					<View className='bg-bg-primary border-b border-bg-darker/30 px-5 py-4 flex-row items-center justify-between'>
						<View className='flex-row items-center'>
							<View className='bg-[#F9C513]/20 rounded-full p-2 border-2 border-[#F9C513]/30 mr-3'>
								<Ionicons name='document-text' size={24} color='#F9C513' />
							</View>
							<Text className='text-2xl font-bold text-text-primary'>
								Terms & Conditions
							</Text>
						</View>
						<TouchableOpacity
							onPress={() => setShowTermsModal(false)}
							className='bg-bg-darker rounded-full p-2'
						>
							<Ionicons name='close' size={24} color='#F9C513' />
						</TouchableOpacity>
					</View>

					{/* Content */}
					<ScrollView
						className='flex-1'
						contentContainerClassName='p-5'
						showsVerticalScrollIndicator={true}
					>
						<View>
							{/* 1. Membership Eligibility */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									1. Membership Eligibility
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									Participants must be 18 years old and above. Anyone below 18 must present{' '}
									<Text className='font-semibold text-text-primary'>
										written parental or guardian consent
									</Text>{' '}
									before using the facilities.
								</Text>
							</View>

							{/* 2. Health and Safety */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									2. Health and Safety
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									Members must ensure they are physically fit before joining any gym activity. The gym is not responsible for injuries resulting from improper equipment use or failure to follow instructions.
								</Text>
							</View>

							{/* 3. Conduct and Behavior */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									3. Conduct and Behavior
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									Members must behave respectfully toward staff and other users. Harassment, threats, or destructive behavior may result in suspension or termination of membership.
								</Text>
							</View>

							{/* 4. Equipment Use */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									4. Equipment Use
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									All equipment must be used properly and returned after use. Members must report any damaged or malfunctioning equipment.
								</Text>
							</View>

							{/* 5. Personal Belongings */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									5. Personal Belongings
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									The gym is not liable for lost, stolen, or damaged personal items. Members are encouraged to use lockers for safekeeping.
								</Text>
							</View>

							{/* 6. Cleanliness and Hygiene */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									6. Cleanliness and Hygiene
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									Members must wipe down equipment after use and dispose of trash properly. Proper gym attire and footwear are required.
								</Text>
							</View>

							{/* 7. Payments and Membership */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									7. Payments and Membership
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									All membership fees are non-refundable unless otherwise stated. Failure to settle payments may result in restricted access or account freeze.
								</Text>
							</View>

							{/* 8. Class and Facility Rules */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									8. Class and Facility Rules
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									Members must follow schedules, class rules, and staff instructions to ensure safety and order.
								</Text>
							</View>

							{/* 9. Liability Waiver */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-6'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									9. Liability Waiver
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									By accessing the gym, members acknowledge that physical activity carries risks and agree that the gym is not liable for injuries or health issues that occur while using the facility.
								</Text>
							</View>

							{/* 10. Changes to Terms */}
							<View className='bg-bg-primary rounded-xl p-4 border border-[#F9C513]/20 mb-4'>
								<Text className='text-[#F9C513] font-bold text-lg mb-2'>
									10. Changes to Terms
								</Text>
								<Text className='text-text-secondary text-sm leading-5'>
									The gym reserves the right to modify these Terms and Conditions at any time. Members will be informed of significant updates.
								</Text>
							</View>
						</View>
					</ScrollView>

					{/* Footer */}
					<View className='bg-bg-primary border-t border-bg-darker/30 px-5 py-4'>
						<GradientButton
							onPress={() => setShowTermsModal(false)}
							style={{ height: 56 }}
						>
							I Understand
						</GradientButton>
					</View>
				</View>
			</Modal>

			<ConfirmModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant as any}
				confirmLabel="OK"
				onConfirm={() => setAlertModal((p) => ({ ...p, visible: false }))}
				onCancel={() => setAlertModal((p) => ({ ...p, visible: false }))}
				hideCancel
			/>
		</FixedView>
	);
};

export default Fourth;
