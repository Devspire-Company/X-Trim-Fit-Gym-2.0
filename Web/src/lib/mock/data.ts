// Mock data converted from Admin folder
export interface MockMember {
	id: string;
	name: string;
	email: string;
	phone: string;
	membership: string;
	status: 'Active' | 'Inactive' | 'Suspended';
	joinDate: string;
	avatar: string;
	dob?: string;
	gender?: string;
	address?: string;
	emergencyContact?: string;
	progress: {
		weightLost: number;
		workoutsCompleted: number;
	};
}

export interface MockCoach {
	id: string;
	name: string;
	email: string;
	phone: string;
	specialization: string;
	yearsExperience: string;
	status: 'Active' | 'Inactive';
	avatar: string;
	totalClients: number;
	rating: number;
}

export interface MockMembershipPlan {
	id: string;
	name: string;
	price: number;
	count: number;
	description: string;
	status: 'Active' | 'Inactive' | 'Coming Soon';
	duration: 'Monthly' | 'Quarterly' | 'Yearly';
	features: string[];
}

export const mockMembers: Record<string, MockMember> = {
	'ashley-quicho': {
		id: 'ashley-quicho',
		name: 'Ashley Quicho',
		email: 'ashley.quicho@email.com',
		phone: '+63 912 345 6789',
		membership: 'PROMO Student',
		status: 'Active',
		joinDate: 'October 2024',
		avatar: 'AQ',
		dob: '1995-01-15',
		gender: 'Female',
		address: '123 Main Street, Quezon City, Metro Manila',
		emergencyContact: 'Maria Quicho - +63 912 345 6788',
		progress: {
			weightLost: 12,
			workoutsCompleted: 18,
		},
	},
	'john-dela-cruz': {
		id: 'john-dela-cruz',
		name: 'John Dela Cruz',
		email: 'john.delacruz@email.com',
		phone: '+63 912 345 6790',
		membership: 'PROMO Student',
		status: 'Active',
		joinDate: 'September 2024',
		avatar: 'JD',
		dob: '1992-03-22',
		gender: 'Male',
		address: '456 Oak Avenue, Makati City, Metro Manila',
		emergencyContact: 'Juan Dela Cruz - +63 912 345 6791',
		progress: {
			weightLost: 8,
			workoutsCompleted: 15,
		},
	},
	'maria-santos': {
		id: 'maria-santos',
		name: 'Maria Santos',
		email: 'maria.santos@email.com',
		phone: '+63 912 345 6792',
		membership: 'PROMO Student',
		status: 'Active',
		joinDate: 'November 2024',
		avatar: 'MS',
		dob: '1998-06-10',
		gender: 'Female',
		address: '789 Pine Road, Taguig City, Metro Manila',
		emergencyContact: 'Pedro Santos - +63 912 345 6793',
		progress: {
			weightLost: 5,
			workoutsCompleted: 10,
		},
	},
	'robert-lim': {
		id: 'robert-lim',
		name: 'Robert Lim',
		email: 'robert.lim@email.com',
		phone: '+63 912 345 6794',
		membership: 'Student',
		status: 'Active',
		joinDate: 'June 2024',
		avatar: 'RL',
		dob: '1990-08-05',
		gender: 'Male',
		address: '321 Elm Street, Pasig City, Metro Manila',
		emergencyContact: 'Rosa Lim - +63 912 345 6795',
		progress: {
			weightLost: 0,
			workoutsCompleted: 0,
		},
	},
};

export const mockCoaches: Record<string, MockCoach> = {
	'mike-rodriguez': {
		id: 'mike-rodriguez',
		name: 'Mike Rodriguez',
		email: 'mike.rodriguez@xtrimfitness.com',
		phone: '+63 912 345 6777',
		specialization: 'Strength & Conditioning',
		yearsExperience: '10+',
		status: 'Active',
		avatar: 'MR',
		totalClients: 24,
		rating: 4.9,
	},
	'sarah-chen': {
		id: 'sarah-chen',
		name: 'Sarah Chen',
		email: 'sarah.chen@xtrimfitness.com',
		phone: '+63 912 345 6778',
		specialization: 'Fitness & Nutrition',
		yearsExperience: '8',
		status: 'Active',
		avatar: 'SC',
		totalClients: 18,
		rating: 4.8,
	},
	'james-wilson': {
		id: 'james-wilson',
		name: 'James Wilson',
		email: 'james.wilson@xtrimfitness.com',
		phone: '+63 912 345 6779',
		specialization: 'HIIT & Cardio',
		yearsExperience: '12',
		status: 'Active',
		avatar: 'JW',
		totalClients: 22,
		rating: 4.9,
	},
	'maria-garcia': {
		id: 'maria-garcia',
		name: 'Maria Garcia',
		email: 'maria.garcia@xtrimfitness.com',
		phone: '+63 912 345 6780',
		specialization: 'Body Transformation',
		yearsExperience: '9',
		status: 'Active',
		avatar: 'MG',
		totalClients: 20,
		rating: 5.0,
	},
};

export const mockMembershipPlans: Record<string, MockMembershipPlan> = {
	Student: {
		id: 'Student',
		name: 'Student',
		price: 500,
		count: 1,
		description: 'Perfect for students with valid student ID',
		status: 'Active',
		duration: 'Monthly',
		features: [
			'Gym access (6am-10pm)',
			'Basic equipment access',
			'Locker facilities',
			'2 group classes/month',
		],
	},
	'PROMO Student': {
		id: 'PROMO Student',
		name: 'PROMO Student',
		price: 1200,
		count: 3,
		description: 'Special 3-month promo for students - Best value!',
		status: 'Active',
		duration: 'Quarterly',
		features: [
			'Gym access (6am-10pm)',
			'All equipment access',
			'Locker facilities',
			'Unlimited group classes',
			'Custom workout plans',
			'Valid for 3 months',
		],
	},
	'Non student': {
		id: 'Non student',
		name: 'Non student',
		price: 1300,
		count: 0,
		description: '3-month membership for non-students',
		status: 'Active',
		duration: 'Quarterly',
		features: [
			'Gym access (6am-10pm)',
			'All equipment access',
			'Locker facilities',
			'Unlimited group classes',
			'Custom workout plans',
			'Valid for 3 months',
		],
	},
};

