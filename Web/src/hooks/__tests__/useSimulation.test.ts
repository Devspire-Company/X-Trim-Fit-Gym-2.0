import { describe, it, expect } from 'vitest';
import {
	calculateMonthlyRevenue,
	calculateAverageRevenuePerMember,
	calculateMembershipDistribution,
	filterMembers,
	getRecentMembers,
	calculateTotalWorkouts,
	calculateTotalWeightLost,
} from '../useSimulation';
import type { MockMember } from '@/lib/mock/data';

const mockMembers: MockMember[] = [
	{
		id: '1',
		name: 'John Doe',
		email: 'john@example.com',
		phone: '+1234567890',
		membership: 'Student',
		status: 'Active',
		joinDate: 'November 2024',
		avatar: 'JD',
		progress: { weightLost: 5, workoutsCompleted: 10 },
	},
	{
		id: '2',
		name: 'Jane Smith',
		email: 'jane@example.com',
		phone: '+1234567891',
		membership: 'PROMO Student',
		status: 'Active',
		joinDate: 'October 2024',
		avatar: 'JS',
		progress: { weightLost: 8, workoutsCompleted: 15 },
	},
	{
		id: '3',
		name: 'Bob Johnson',
		email: 'bob@example.com',
		phone: '+1234567892',
		membership: 'Non student',
		status: 'Inactive',
		joinDate: 'September 2024',
		avatar: 'BJ',
		progress: { weightLost: 0, workoutsCompleted: 0 },
	},
];

describe('useSimulation', () => {
	describe('calculateMonthlyRevenue', () => {
		it('should calculate total monthly revenue from active members', () => {
			const revenue = calculateMonthlyRevenue(mockMembers);
			// Student: 500, PROMO Student: 1200, Non student (inactive): 0
			expect(revenue).toBe(1700);
		});

		it('should return 0 for empty array', () => {
			expect(calculateMonthlyRevenue([])).toBe(0);
		});
	});

	describe('calculateAverageRevenuePerMember', () => {
		it('should calculate average revenue per active member', () => {
			const avg = calculateAverageRevenuePerMember(mockMembers);
			// 2 active members, total 1700, avg = 850
			expect(avg).toBe(850);
		});

		it('should return 0 when no active members', () => {
			const inactiveMembers = mockMembers.map((m) => ({ ...m, status: 'Inactive' as const }));
			expect(calculateAverageRevenuePerMember(inactiveMembers)).toBe(0);
		});
	});

	describe('calculateMembershipDistribution', () => {
		it('should calculate membership distribution correctly', () => {
			const distribution = calculateMembershipDistribution(mockMembers);
			expect(distribution.Student).toBe(1);
			expect(distribution['PROMO Student']).toBe(1);
			expect(distribution['Non student']).toBe(1);
			expect(distribution.percentages.Student).toBe(33);
			expect(distribution.percentages['PROMO Student']).toBe(33);
			expect(distribution.percentages['Non student']).toBe(33);
		});
	});

	describe('filterMembers', () => {
		it('should filter by search term', () => {
			// "john" alone matches both "John Doe" and "Bob Johnson"
			const filtered = filterMembers(mockMembers, 'john@', 'all', 'all');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('John Doe');
		});

		it('should filter by status', () => {
			const filtered = filterMembers(mockMembers, '', 'Active', 'all');
			expect(filtered).toHaveLength(2);
		});

		it('should filter by membership', () => {
			const filtered = filterMembers(mockMembers, '', 'all', 'Student');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].membership).toBe('Student');
		});

		it('should combine multiple filters', () => {
			const filtered = filterMembers(mockMembers, 'jane', 'Active', 'PROMO Student');
			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('Jane Smith');
		});
	});

	describe('getRecentMembers', () => {
		it('should return recent members sorted by join date', () => {
			const recent = getRecentMembers(mockMembers, 2);
			expect(recent).toHaveLength(2);
			expect(recent[0].joinDate).toBe('November 2024');
			expect(recent[1].joinDate).toBe('October 2024');
		});
	});

	describe('calculateTotalWorkouts', () => {
		it('should calculate total workouts', () => {
			const total = calculateTotalWorkouts(mockMembers);
			expect(total).toBe(25); // 10 + 15 + 0
		});
	});

	describe('calculateTotalWeightLost', () => {
		it('should calculate total weight lost', () => {
			const total = calculateTotalWeightLost(mockMembers);
			expect(total).toBe(13); // 5 + 8 + 0
		});
	});
});

