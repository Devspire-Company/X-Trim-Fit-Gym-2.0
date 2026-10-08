import { PremiumLoadingContent } from '@/components/AuthProcessingScreen';
import FixedView from '@/components/FixedView';
import TabHeader from '@/components/TabHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberMembershipModal } from '@/contexts/MemberMembershipModalContext';
import { memberHasActiveGymMembership } from '@/utils/memberMembership';
import { buildExerciseImageUrl } from '@/lib/exercise-service';
import { GetSessionLogsQuery } from '@/graphql/generated/types';
import { GET_SESSION_LOGS_QUERY } from '@/graphql/queries';
import { formatTimeTo12Hour } from '@/utils/time-utils';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
	Dimensions,
	Image,
	Modal,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface WorkoutExercise {
	id: string;
	name: string;
	bodyPart: string;
	target: string;
	equipment?: string;
	gifUrl?: string;
	sets: number;
	reps: number;
}

const MemberSessionLogs = () => {
	const { user } = useAuth();
	const router = useRouter();
	const { openMembershipRequired } = useMemberMembershipModal();
	const hasMembership = memberHasActiveGymMembership(user);

	useFocusEffect(
		useCallback(() => {
			if (!hasMembership) {
				openMembershipRequired();
				router.replace('/(member)/workouts');
			}
		}, [hasMembership, openMembershipRequired, router])
	);

	const [refreshing, setRefreshing] = useState(false);
	const [selectedLog, setSelectedLog] = useState<any>(null);
	const [showImagesModal, setShowImagesModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	// Parse workoutType JSON string to get exercises
	const parseWorkoutExercises = useCallback((workoutType: string | null | undefined): WorkoutExercise[] => {
		if (!workoutType) return [];
		try {
			const parsed = JSON.parse(workoutType);
			if (Array.isArray(parsed)) {
				return parsed.map((w: any) => ({
					id: String(w.id || ''),
					name: String(w.name || ''),
					bodyPart: String(w.bodyPart || ''),
					target: String(w.target || ''),
					equipment: w.equipment ? String(w.equipment) : undefined,
					gifUrl: w.gifUrl ? String(w.gifUrl) : undefined,
					sets: typeof w.sets === 'number' ? w.sets : parseInt(String(w.sets || '0'), 10) || 0,
					reps: typeof w.reps === 'number' ? w.reps : parseInt(String(w.reps || '0'), 10) || 0,
				}));
			}
			return [];
		} catch {
			return [];
		}
	}, []);

	const { data, refetch, loading } = useQuery<GetSessionLogsQuery>(
		GET_SESSION_LOGS_QUERY,
		{
			variables: { clientId: user?.id || '' },
			fetchPolicy: 'cache-and-network',
			skip: !user?.id,
		}
	);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			if (user?.id) {
				await refetch();
			}
		} finally {
			setRefreshing(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const formatDateHeader = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		}
		if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		}
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});
	};

	// Group session logs by date
	const groupedLogs = useMemo(() => {
		const sessionLogs = data?.getSessionLogs || [];
		const groups: Record<string, any[]> = {};

		sessionLogs.forEach((log: any) => {
			const dateKey = log.session?.date
				? new Date(log.session.date).toDateString()
				: log.completedAt
					? new Date(log.completedAt).toDateString()
					: 'Unknown';

			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(log);
		});

		// Sort dates in descending order (most recent first)
		const sortedDates = Object.keys(groups).sort((a, b) => {
			return new Date(b).getTime() - new Date(a).getTime();
		});

		// Sort logs within each date group by completedAt (most recent first)
		sortedDates.forEach((date) => {
			groups[date].sort((a, b) => {
				const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
				const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
				return dateB - dateA;
			});
		});

		return { groups, sortedDates };
	}, [data?.getSessionLogs]);

	if (!hasMembership) {
		return (
			<FixedView className='flex-1 bg-bg-darker'>
				<TabHeader showCoachIcon={false} />
			</FixedView>
		);
	}

	return (
		<FixedView className='flex-1 bg-bg-darker'>
			<TabHeader showCoachIcon={false} />
			<ScrollView
				className='flex-1'
				contentContainerClassName='p-5'
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor='#F9C513'
					/>
				}
			>
				<View className='mb-6'>
					<Text className='text-3xl font-bold text-text-primary'>
						Session Logs
					</Text>
					<Text className='text-text-secondary mt-1'>
						Your completed workout sessions
					</Text>
				</View>
				{loading ? (
					<PremiumLoadingContent embedded message='Please wait..' />
				) : !data?.getSessionLogs || data.getSessionLogs.length === 0 ? (
					<View
						className='bg-bg-primary rounded-xl p-6 items-center border border-[#F9C513]'
						style={{ borderWidth: 0.5 }}
					>
						<Ionicons name='document-text-outline' size={48} color='#8E8E93' />
						<Text className='text-text-secondary mt-4 text-center text-base'>
							No session logs yet
						</Text>
						<Text className='text-text-secondary mt-2 text-center text-sm'>
							Your completed sessions will appear here
						</Text>
					</View>
				) : (
					<View>
						{groupedLogs.sortedDates.map((dateKey) => (
							<View key={dateKey} className='mb-6'>
								<View className='mb-3'>
									<Text className='text-xl font-bold text-text-primary'>
										{formatDateHeader(dateKey)}
									</Text>
									<View className='h-0.5 bg-[#F9C513] mt-1' />
								</View>
								{groupedLogs.groups[dateKey].map((item: any) => (
									<TouchableOpacity
										key={item.id}
										onPress={() => {
											setSelectedLog(item);
											setShowDetailsModal(true);
										}}
										className='bg-bg-primary rounded-xl p-4 mb-3 border border-[#F9C513]'
										style={{ borderWidth: 0.5 }}
									>
										<View className='flex-row'>
											<View
												className='bg-bg-darker rounded-lg py-3 px-3 mr-3 items-center justify-center border border-[#F9C513]'
												style={{
													borderWidth: 0.5,
													alignSelf: 'stretch',
													flexShrink: 0,
													minWidth: 88,
												}}
											>
												{item.session?.startTime ? (
													<Text className='text-[#F9C513] font-bold text-lg text-center'>
														{formatTimeTo12Hour(item.session.startTime)}
													</Text>
												) : null}
											</View>
											<View className='flex-1' style={{ minWidth: 0 }}>
												<Text className='text-text-secondary text-xs font-medium mb-1'>
													{item.session?.date
														? formatDate(item.session.date)
														: 'N/A'}
												</Text>
												<Text className='text-text-primary font-semibold text-base mb-2'>
													{item.session?.name || 'Session'}
												</Text>
												<View className='flex-row items-center mb-1'>
													<Ionicons
														name='checkmark-circle'
														size={14}
														color='#4CAF50'
													/>
													<Text className='text-text-secondary text-sm ml-1'>
														Completed
													</Text>
												</View>
												{item.session?.coach && (
													<View className='flex-row items-center mb-1'>
														<Ionicons name='person' size={14} color='#8E8E93' />
														<Text className='text-text-secondary text-sm ml-1'>
															Coach: {item.session.coach.firstName}{' '}
															{item.session.coach.lastName}
														</Text>
													</View>
												)}
												{item.session?.gymArea && (
													<View className='flex-row items-center mb-1'>
														<Ionicons
															name='location'
															size={14}
															color='#8E8E93'
														/>
														<Text className='text-text-secondary text-sm ml-1'>
															{item.session.gymArea}
														</Text>
													</View>
												)}
												{item.weight && (
													<View className='flex-row items-center mt-1'>
														<Ionicons name='scale' size={14} color='#8E8E93' />
														<Text className='text-text-secondary text-sm ml-1'>
															Weight: {item.weight} kg
														</Text>
													</View>
												)}
												{(() => {
													const exercises = parseWorkoutExercises(item.session?.workoutType);
													if (exercises.length > 0) {
														return (
															<View className='flex-row items-center mt-2'>
																<Ionicons name='barbell' size={14} color='#F9C513' />
																<Text className='text-[#F9C513] text-xs ml-1'>
																	{exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
																</Text>
															</View>
														);
													}
													return null;
												})()}
												{item.progressImages && (
													<View className='flex-row items-center mt-2'>
														<Ionicons name='images' size={14} color='#F9C513' />
														<Text className='text-[#F9C513] text-xs ml-1'>
															4 Progress Photos
														</Text>
													</View>
												)}
											</View>
										</View>
									</TouchableOpacity>
								))}
							</View>
						))}
					</View>
				)}
			</ScrollView>

			{/* Session Details Modal */}
			<Modal
				visible={showDetailsModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowDetailsModal(false);
					setSelectedLog(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<View className='flex-1'>
									<Text className='text-2xl font-bold text-text-primary'>
										Session Details
									</Text>
									{selectedLog?.session && (
										<Text className='text-text-secondary text-sm mt-1'>
											{selectedLog.session.name}
										</Text>
									)}
								</View>
								<TouchableOpacity
									onPress={() => {
										setShowDetailsModal(false);
										setSelectedLog(null);
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{selectedLog && (
								<View>
									{/* Session Information */}
									<View className='mb-6'>
										<Text className='text-lg font-semibold text-text-primary mb-3'>
											Session Information
										</Text>
										<View
											className='bg-bg-darker rounded-xl p-4 border border-[#F9C513]'
											style={{ borderWidth: 0.5 }}
										>
											{selectedLog.session?.date && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Date
													</Text>
													<Text className='text-text-primary font-semibold'>
														{formatDate(selectedLog.session.date)}
													</Text>
												</View>
											)}
											{selectedLog.session?.startTime && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Time
													</Text>
													<Text className='text-text-primary font-semibold'>
														{formatTimeTo12Hour(selectedLog.session.startTime)}
														{selectedLog.session.endTime &&
															` - ${formatTimeTo12Hour(selectedLog.session.endTime)}`}
													</Text>
												</View>
											)}
											{selectedLog.session?.gymArea && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Gym Area
													</Text>
													<Text className='text-text-primary font-semibold'>
														{selectedLog.session.gymArea}
													</Text>
												</View>
											)}
											{selectedLog.session?.coach && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Coach
													</Text>
													<Text className='text-text-primary font-semibold'>
														{selectedLog.session.coach.firstName}{' '}
														{selectedLog.session.coach.lastName}
													</Text>
												</View>
											)}
											{selectedLog.session?.goal && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Goal
													</Text>
													<Text className='text-text-primary font-semibold'>
														{selectedLog.session.goal.title}
													</Text>
												</View>
											)}
											{selectedLog.session?.note && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Session Note
													</Text>
													<Text className='text-text-primary'>
														{selectedLog.session.note}
													</Text>
												</View>
											)}
										</View>
									</View>

									{/* Progress Data */}
									<View className='mb-6'>
										<Text className='text-lg font-semibold text-text-primary mb-3'>
											Progress Data
										</Text>
										<View
											className='bg-bg-darker rounded-xl p-4 border border-[#F9C513]'
											style={{ borderWidth: 0.5 }}
										>
											{selectedLog.weight && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Weight
													</Text>
													<Text className='text-text-primary font-semibold text-lg'>
														{selectedLog.weight} kg
													</Text>
												</View>
											)}
											{selectedLog.completedAt && (
												<View className='mb-3'>
													<Text className='text-text-secondary text-xs mb-1'>
														Completed At
													</Text>
													<Text className='text-text-primary font-semibold'>
														{formatDate(selectedLog.completedAt)}{' '}
														{new Date(
															selectedLog.completedAt
														).toLocaleTimeString('en-US', {
															hour: 'numeric',
															minute: '2-digit',
														})}
													</Text>
												</View>
											)}
											{selectedLog.notes && (
												<View>
													<Text className='text-text-secondary text-xs mb-1'>
														Notes
													</Text>
													<Text className='text-text-primary'>
														{selectedLog.notes}
													</Text>
												</View>
											)}
										</View>
									</View>

									{/* Workout Exercises */}
									{(() => {
										const exercises = parseWorkoutExercises(selectedLog.session?.workoutType);
										if (exercises.length === 0) return null;
										
										return (
											<View className='mb-6'>
												<Text className='text-lg font-semibold text-text-primary mb-3'>
													Workout Exercises
												</Text>
												<View className='space-y-3'>
													{exercises.map((exercise, index) => {
														const imageUrl = buildExerciseImageUrl(exercise.id);
														return (
															<View
																key={`${exercise.id}-${index}`}
																className='bg-bg-darker rounded-xl p-4 border border-[#F9C513]'
																style={{ borderWidth: 0.5 }}
															>
																<View className='flex-row'>
																	{imageUrl && (
																		<View className='mr-3'>
																			<ExpoImage
																				source={{ uri: imageUrl }}
																				style={{
																					width: 80,
																					height: 80,
																					borderRadius: 8,
																					borderWidth: 0.5,
																					borderColor: '#F9C513',
																				}}
																				contentFit='cover'
																			/>
																		</View>
																	)}
																	<View className='flex-1'>
																		<Text className='text-text-primary font-semibold text-base mb-1'>
																			{exercise.name}
																		</Text>
																		<View className='flex-row items-center mb-1'>
																			<Ionicons
																				name='body'
																				size={14}
																				color='#8E8E93'
																			/>
																			<Text className='text-text-secondary text-xs ml-1'>
																				{exercise.bodyPart}
																			</Text>
																		</View>
																		{exercise.target && (
																			<View className='flex-row items-center mb-1'>
																				<Ionicons
																					name='locate-outline'
																					size={14}
																					color='#8E8E93'
																				/>
																				<Text className='text-text-secondary text-xs ml-1'>
																					{exercise.target}
																				</Text>
																			</View>
																		)}
																		{exercise.equipment && (
																			<View className='flex-row items-center mb-2'>
																				<Ionicons
																					name='construct'
																					size={14}
																					color='#8E8E93'
																				/>
																				<Text className='text-text-secondary text-xs ml-1'>
																					{exercise.equipment}
																				</Text>
																			</View>
																		)}
																		<View className='flex-row items-center'>
																			<View className='bg-[#F9C513] px-2 py-1 rounded mr-2'>
																				<Text className='text-bg-darker font-semibold text-xs'>
																					{exercise.sets} Sets
																				</Text>
																			</View>
																			<View className='bg-[#F9C513] px-2 py-1 rounded'>
																				<Text className='text-bg-darker font-semibold text-xs'>
																					{exercise.reps} Reps
																				</Text>
																			</View>
																		</View>
																	</View>
																</View>
															</View>
														);
													})}
												</View>
											</View>
										);
									})()}

									{/* Progress Images */}
									{selectedLog.progressImages && (
										<View className='mb-6'>
											<Text className='text-lg font-semibold text-text-primary mb-3'>
												Progress Photos
											</Text>
											<TouchableOpacity
												onPress={() => {
													setShowDetailsModal(false);
													setShowImagesModal(true);
												}}
												className='p-4 bg-bg-darker rounded-xl border border-[#F9C513]'
												style={{ borderWidth: 0.5 }}
											>
												<View className='flex-row items-center justify-between'>
													<View className='flex-row items-center'>
														<Ionicons name='images' size={24} color='#F9C513' />
														<Text className='text-text-primary font-semibold ml-3'>
															View All Progress Photos
														</Text>
													</View>
													<Ionicons
														name='chevron-forward'
														size={20}
														color='#8E8E93'
													/>
												</View>
											</TouchableOpacity>
										</View>
									)}
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Progress Images Modal */}
			<Modal
				visible={showImagesModal}
				animationType='slide'
				transparent
				onRequestClose={() => {
					setShowImagesModal(false);
					setSelectedLog(null);
				}}
			>
				<View className='flex-1 bg-bg-darker justify-end'>
					<View
						className='bg-bg-primary rounded-t-3xl p-6 max-h-[90%] border-t border-[#F9C513]'
						style={{ borderTopWidth: 0.5 }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className='flex-row justify-between items-center mb-6'>
								<View className='flex-1'>
									<Text className='text-2xl font-bold text-text-primary'>
										Progress Photos
									</Text>
									{selectedLog?.session && (
										<Text className='text-text-secondary text-sm mt-1'>
											{selectedLog.session.name} -{' '}
											{formatDate(selectedLog.session.date)}
										</Text>
									)}
								</View>
								<TouchableOpacity
									onPress={() => {
										setShowImagesModal(false);
										setSelectedLog(null);
									}}
								>
									<Ionicons name='close' size={28} color='#8E8E93' />
								</TouchableOpacity>
							</View>

							{selectedLog?.progressImages && (
								<View>
									{selectedLog.progressImages.front && (
										<View className='mb-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Front
											</Text>
											<Image
												source={{ uri: selectedLog.progressImages.front }}
												style={{
													width: '100%',
													height: width * 0.8,
													borderRadius: 12,
													borderWidth: 0.5,
													borderColor: '#F9C513',
												}}
												resizeMode='cover'
											/>
										</View>
									)}
									{selectedLog.progressImages.rightSide && (
										<View className='mb-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Right Side
											</Text>
											<Image
												source={{ uri: selectedLog.progressImages.rightSide }}
												style={{
													width: '100%',
													height: width * 0.8,
													borderRadius: 12,
													borderWidth: 0.5,
													borderColor: '#F9C513',
												}}
												resizeMode='cover'
											/>
										</View>
									)}
									{selectedLog.progressImages.leftSide && (
										<View className='mb-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Left Side
											</Text>
											<Image
												source={{ uri: selectedLog.progressImages.leftSide }}
												style={{
													width: '100%',
													height: width * 0.8,
													borderRadius: 12,
													borderWidth: 0.5,
													borderColor: '#F9C513',
												}}
												resizeMode='cover'
											/>
										</View>
									)}
									{selectedLog.progressImages.back && (
										<View className='mb-4'>
											<Text className='text-text-primary font-semibold mb-2'>
												Back
											</Text>
											<Image
												source={{ uri: selectedLog.progressImages.back }}
												style={{
													width: '100%',
													height: width * 0.8,
													borderRadius: 12,
													borderWidth: 0.5,
													borderColor: '#F9C513',
												}}
												resizeMode='cover'
											/>
										</View>
									)}
								</View>
							)}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</FixedView>
	);
};

export default MemberSessionLogs;
