import { useMemo } from 'react';
import { mockMembers, mockCoaches, mockMembershipPlans, type MockMember } from '@/lib/mock/data';

/**
 * Calculate total monthly revenue from all active memberships
 */
export function calculateMonthlyRevenue(members: MockMember[]): number {
	return members.reduce((total, member) => {
		const plan = mockMembershipPlans[member.membership];
		if (plan && member.status === 'Active') {
			return total + plan.price;
		}
		return total;
	}, 0);
}

/**
 * Calculate average revenue per member
 */
export function calculateAverageRevenuePerMember(members: MockMember[]): number {
	const totalRevenue = calculateMonthlyRevenue(members);
	const activeMembers = members.filter((m) => m.status === 'Active').length;
	return activeMembers > 0 ? Math.round(totalRevenue / activeMembers) : 0;
}

/**
 * Calculate membership distribution percentages
 */
export function calculateMembershipDistribution(members: MockMember[]) {
	const total = members.length;
	const distribution = {
		Student: members.filter((m) => m.membership === 'Student').length,
		'PROMO Student': members.filter((m) => m.membership === 'PROMO Student').length,
		'Non student': members.filter((m) => m.membership === 'Non student').length,
	};

	return {
		...distribution,
		percentages: {
			Student: total > 0 ? Math.round((distribution.Student / total) * 100) : 0,
			'PROMO Student': total > 0 ? Math.round((distribution['PROMO Student'] / total) * 100) : 0,
			'Non student': total > 0 ? Math.round((distribution['Non student'] / total) * 100) : 0,
		},
	};
}

/**
 * Filter members by search term, status, and membership
 */
export function filterMembers(
	members: MockMember[],
	searchTerm: string,
	statusFilter: string,
	membershipFilter: string
): MockMember[] {
	return members.filter((member) => {
		const matchesSearch =
			!searchTerm ||
			member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.phone.includes(searchTerm);
		const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
		const matchesMembership = membershipFilter === 'all' || member.membership === membershipFilter;
		return matchesSearch && matchesStatus && matchesMembership;
	});
}

/**
 * Get recent members sorted by join date
 */
export function getRecentMembers(members: MockMember[], limit: number = 3): MockMember[] {
	const dateOrder: Record<string, number> = {
		'November 2024': 3,
		'October 2024': 2,
		'September 2024': 1,
		'June 2024': 0,
	};

	return [...members]
		.sort((a, b) => {
			return (dateOrder[b.joinDate] || 0) - (dateOrder[a.joinDate] || 0);
		})
		.slice(0, limit);
}

/**
 * Calculate total workouts completed
 */
export function calculateTotalWorkouts(members: MockMember[]): number {
	return members.reduce((total, member) => total + member.progress.workoutsCompleted, 0);
}

/**
 * Calculate total weight lost
 */
export function calculateTotalWeightLost(members: MockMember[]): number {
	return members.reduce((total, member) => total + member.progress.weightLost, 0);
}

/**
 * Hook to use dashboard statistics
 */
export function useDashboardStats() {
	const members = Object.values(mockMembers);
	const coaches = Object.values(mockCoaches);

	return useMemo(() => {
		const monthlyRevenue = calculateMonthlyRevenue(members);
		const avgRevenue = calculateAverageRevenuePerMember(members);
		const distribution = calculateMembershipDistribution(members);
		const totalWorkouts = calculateTotalWorkouts(members);
		const totalWeightLost = calculateTotalWeightLost(members);
		const newMembersThisMonth = members.filter((m) => m.joinDate === 'November 2024').length;

		return {
			totalMembers: members.length,
			totalCoaches: coaches.length,
			monthlyRevenue,
			avgRevenue,
			activeSubscriptions: members.filter((m) => m.status === 'Active').length,
			membershipDistribution: distribution,
			totalWorkouts,
			totalWeightLost,
			newMembersThisMonth,
		};
	}, [members, coaches]);
}

