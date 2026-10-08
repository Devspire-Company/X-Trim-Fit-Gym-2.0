/** Builds tabular sections for the analytics PDF export. */

export type AnalyticsExportSection = {
	title: string;
	head: string[];
	rows: (string | number)[][];
};

export type AnalyticsExportContext = {
	data: any;
	analytics: any;
	analyticsRangeData: any;
	members: any[];
	membershipTypes: Record<string, number>;
	coaches: any[];
	totalMembers: number;
	activeMembers: number;
	totalRevenue: number;
	membershipSubscriptionRevenue: number;
	walkInRevenueTotal: number;
	activeSubscriptions: number;
	newSubscriptions: number;
	canceledSubscriptions: number;
	expiredSubscriptions: number;
	avgRevenuePerMember: number;
	subscriptionRetentionRate: string;
	removedMembershipPlans?: Array<{
		planName: string;
		planPrice: number;
		planDurationType: string;
		reason: string;
		removedAt: string;
		removedBy: string;
	}>;
};

function formatDate(dateString: string | null | undefined): string {
	if (!dateString) return 'N/A';
	try {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return String(dateString);
	}
}

function calculateAge(dob: string | null | undefined): string {
	if (!dob) return 'N/A';
	try {
		const birthDate = new Date(dob);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age.toString();
	} catch {
		return 'N/A';
	}
}

function formatDurationLabel(durationType: string | null | undefined): string {
	switch ((durationType || '').toUpperCase()) {
		case 'MONTHLY':
			return 'month';
		case 'QUARTERLY':
			return 'quarter';
		case 'YEARLY':
			return 'year';
		case 'DAILY':
			return 'day pass';
		case 'MINUTES':
			return 'minute promo';
		default:
			return durationType || 'N/A';
	}
}

export function collectAnalyticsExportSections(ctx: AnalyticsExportContext): AnalyticsExportSection[] {
	const {
		data,
		analytics,
		analyticsRangeData,
		members,
		membershipTypes,
		coaches,
		totalMembers,
		activeMembers,
		totalRevenue,
		membershipSubscriptionRevenue,
		walkInRevenueTotal,
		activeSubscriptions,
		newSubscriptions,
		canceledSubscriptions,
		expiredSubscriptions,
		avgRevenuePerMember,
		subscriptionRetentionRate,
		removedMembershipPlans = [],
	} = ctx;

	const sections: AnalyticsExportSection[] = [];

	sections.push({
		title: 'SUMMARY STATISTICS',
		head: ['Metric', 'Value'],
		rows: [
			['Total Revenue', `₱${totalRevenue.toLocaleString()}`],
			['Membership Subscription Revenue', `₱${membershipSubscriptionRevenue.toLocaleString()}`],
			['Walk-in Fees (time-in)', `₱${walkInRevenueTotal.toLocaleString()}`],
			['Total Members', totalMembers],
			['Active Members', activeMembers],
			['Inactive Members', totalMembers - activeMembers],
			['Total Coaches', coaches.length],
			['Active Subscriptions', activeSubscriptions],
			['New Subscriptions', newSubscriptions],
			['Canceled Subscriptions', canceledSubscriptions],
			['Expired Subscriptions', expiredSubscriptions],
			[
				'Average Subscription Revenue per Active Member',
				`₱${avgRevenuePerMember.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
			],
			['Subscription Retention Rate', `${subscriptionRetentionRate}%`],
			[
				'Total Monthly Recurring Revenue',
				`₱${(activeMembers * avgRevenuePerMember).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
			],
			[
				'Member to Coach Ratio',
				coaches.length > 0 ? (totalMembers / coaches.length).toFixed(2) : 'N/A',
			],
		],
	});

	const memberRows: (string | number)[][] = [];
	(data?.members || []).forEach((m: any) => {
		const membershipTransaction = m.currentMembership;
		const isActive = membershipTransaction?.status === 'ACTIVE';
		const membershipDetails = m.membershipDetails || {};
		const coachesCount = membershipDetails.coachesIds?.length || 0;

		memberRows.push([
			m.id,
			m.attendanceId || 'N/A',
			m.firstName || '',
			m.middleName || '',
			m.lastName || '',
			`${m.firstName || ''} ${m.middleName || ''} ${m.lastName || ''}`.trim(),
			m.email || 'N/A',
			m.phoneNumber || 'N/A',
			m.dateOfBirth ? formatDate(m.dateOfBirth) : 'N/A',
			calculateAge(m.dateOfBirth),
			m.gender || 'N/A',
			isActive ? 'Active' : 'Inactive',
			isActive ? membershipTransaction?.membership?.name || 'No Plan' : 'No Plan',
			isActive
				? `₱${(membershipTransaction?.membership?.monthlyPrice || 0).toLocaleString()}`
				: 'N/A',
			membershipTransaction?.startedAt ? formatDate(membershipTransaction.startedAt) : 'N/A',
			membershipTransaction?.expiresAt ? formatDate(membershipTransaction.expiresAt) : 'N/A',
			membershipTransaction?.status || 'N/A',
			membershipTransaction?.priceAtPurchase
				? `₱${membershipTransaction.priceAtPurchase.toLocaleString()}`
				: 'N/A',
			formatDate(m.createdAt),
			m.heardFrom || 'N/A',
			membershipDetails.physiqueGoalType || 'N/A',
			membershipDetails.fitnessGoal || 'N/A',
			membershipDetails.workOutTime || 'N/A',
			membershipDetails.hasEnteredDetails ? 'Yes' : 'No',
			coachesCount.toString(),
		]);
	});
	sections.push({
		title: 'DETAILED MEMBER INFORMATION',
		head: [
			'ID',
			'Attendance ID',
			'First Name',
			'Middle Name',
			'Last Name',
			'Full Name',
			'Email',
			'Phone Number',
			'Date of Birth',
			'Age',
			'Gender',
			'Status',
			'Membership Plan',
			'Monthly Price',
			'Subscription Start Date',
			'Subscription End Date',
			'Subscription Status',
			'Price at Purchase',
			'Join Date',
			'Heard From',
			'Physique Goal',
			'Fitness Goal',
			'Workout Time',
			'Has Entered Details',
			'Assigned Coaches Count',
		],
		rows: memberRows,
	});

	const coachRows: (string | number)[][] = [];
	(data?.coaches || []).forEach((c: any) => {
		const coachDetails = c.coachDetails || {};
		const specializations = coachDetails.specialization || [];

		coachRows.push([
			c.id,
			c.firstName || '',
			c.middleName || '',
			c.lastName || '',
			`${c.firstName || ''} ${c.middleName || ''} ${c.lastName || ''}`.trim(),
			c.email || 'N/A',
			c.phoneNumber || 'N/A',
			c.dateOfBirth ? formatDate(c.dateOfBirth) : 'N/A',
			calculateAge(c.dateOfBirth),
			c.gender || 'N/A',
			specializations[0] || 'General Fitness',
			specializations.join('; ') || 'N/A',
			formatDate(c.createdAt),
			c.heardFrom || 'N/A',
		]);
	});
	sections.push({
		title: 'DETAILED COACH INFORMATION',
		head: [
			'ID',
			'First Name',
			'Middle Name',
			'Last Name',
			'Full Name',
			'Email',
			'Phone Number',
			'Date of Birth',
			'Age',
			'Gender',
			'Specialization',
			'All Specializations',
			'Join Date',
			'Heard From',
		],
		rows: coachRows,
	});

	const transactionRows: (string | number)[][] = [];
	(data?.members || []).forEach((m: any) => {
		const membershipTransaction = m.currentMembership;
		if (membershipTransaction) {
			const startDate = membershipTransaction.startedAt
				? new Date(membershipTransaction.startedAt)
				: null;
			const endDate = membershipTransaction.expiresAt
				? new Date(membershipTransaction.expiresAt)
				: null;
			const now = new Date();

			let daysActive = 'N/A';
			let daysRemaining = 'N/A';

			if (startDate) {
				const diffTime = now.getTime() - startDate.getTime();
				daysActive = Math.floor(diffTime / (1000 * 60 * 60 * 24)).toString();
			}

			if (endDate && membershipTransaction.status === 'ACTIVE') {
				const diffTime = endDate.getTime() - now.getTime();
				daysRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24)).toString();
			}

			transactionRows.push([
				membershipTransaction.id || 'N/A',
				m.id,
				`${m.firstName || ''} ${m.lastName || ''}`.trim(),
				membershipTransaction.membershipId || 'N/A',
				membershipTransaction.membership?.name || 'N/A',
				membershipTransaction.priceAtPurchase
					? `₱${membershipTransaction.priceAtPurchase.toLocaleString()}`
					: 'N/A',
				formatDate(membershipTransaction.startedAt),
				formatDate(membershipTransaction.expiresAt),
				membershipTransaction.status || 'N/A',
				formatDate(membershipTransaction.createdAt),
				daysActive,
				daysRemaining,
			]);
		}
	});
	sections.push({
		title: 'MEMBERSHIP TRANSACTION DETAILS',
		head: [
			'Transaction ID',
			'Member ID',
			'Member Name',
			'Membership Plan ID',
			'Membership Plan Name',
			'Price at Purchase',
			'Start Date',
			'End Date',
			'Status',
			'Created At',
			'Days Active',
			'Days Remaining',
		],
		rows: transactionRows,
	});

	if (analytics?.revenueByMembership && analytics.revenueByMembership.length > 0) {
		const totalRevenueForCalc = analytics.revenueByMembership.reduce(
			(sum: number, item: any) => sum + item.revenue,
			0,
		);
		const revMemRows = analytics.revenueByMembership.map((item: any) => {
			const avgRevenue = item.count > 0 ? item.revenue / item.count : 0;
			const percentage =
				totalRevenueForCalc > 0
					? ((item.revenue / totalRevenueForCalc) * 100).toFixed(2)
					: '0.00';
			const mrr = item.count * avgRevenue;
			return [
				item.membershipName,
				`₱${item.revenue.toLocaleString()}`,
				item.count,
				`₱${avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
				`${percentage}%`,
				`₱${mrr.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
			];
		});
		sections.push({
			title: 'REVENUE BY MEMBERSHIP TYPE (DETAILED)',
			head: [
				'Membership Plan',
				'Total Revenue',
				'Active Subscriptions',
				'Average Revenue per Subscription',
				'Percentage of Total Revenue',
				'Monthly Recurring Revenue',
			],
			rows: revMemRows,
		});
	}

	if (analytics?.revenueByPeriod && analytics.revenueByPeriod.length > 0) {
		const totalPeriodRevenue = analytics.revenueByPeriod.reduce(
			(sum: number, item: any) => sum + item.revenue,
			0,
		);
		let previousRevenue = 0;
		const periodRows = analytics.revenueByPeriod.map((item: any, index: number) => {
			const w = item.walkInRevenue ?? 0;
			const sub = Math.max(0, (item.revenue ?? 0) - w);
			const percentage =
				totalPeriodRevenue > 0 ? ((item.revenue / totalPeriodRevenue) * 100).toFixed(2) : '0.00';
			let growthRate = 'N/A';

			if (index > 0 && previousRevenue > 0) {
				const growth = ((item.revenue - previousRevenue) / previousRevenue) * 100;
				growthRate = `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
			}
			previousRevenue = item.revenue;
			return [
				item.period,
				`₱${item.revenue.toLocaleString()}`,
				`₱${sub.toLocaleString()}`,
				`₱${w.toLocaleString()}`,
				item.walkInCount ?? 0,
				`${percentage}%`,
				growthRate,
			];
		});
		sections.push({
			title: 'REVENUE BY PERIOD (DETAILED)',
			head: [
				'Period',
				'Day total',
				'Membership (day)',
				'Walk-in (day)',
				'Walk-in count',
				'% of period total',
				'Growth (day total)',
			],
			rows: periodRows,
		});
	}

	const distRows: (string | number)[][] = [];
	const activeMembersWithPlan = members.filter((m: any) => m.status === 'Active').length;
	const inactiveByPlan: { [key: string]: number } = {};
	members.forEach((m: any) => {
		if (m.status === 'Inactive') {
			inactiveByPlan[m.membership] = (inactiveByPlan[m.membership] || 0) + 1;
		}
	});

	Object.entries(membershipTypes).forEach(([plan]: [string, unknown]) => {
		const activeCount = members.filter((m: any) => m.membership === plan && m.status === 'Active').length;
		const inactiveCount = inactiveByPlan[plan] || 0;
		const totalCount = activeCount + inactiveCount;
		const activePercentage =
			activeMembersWithPlan > 0 ? ((activeCount / activeMembersWithPlan) * 100).toFixed(2) : '0.00';
		const totalPercentage =
			totalMembers > 0 ? ((totalCount / totalMembers) * 100).toFixed(2) : '0.00';

		distRows.push([
			plan,
			activeCount,
			inactiveCount,
			totalCount,
			`${activePercentage}%`,
			`${totalPercentage}%`,
		]);
	});
	sections.push({
		title: 'MEMBERSHIP DISTRIBUTION (DETAILED)',
		head: [
			'Membership Plan',
			'Active Member Count',
			'Inactive Member Count',
			'Total Member Count',
			'Percentage of Active Members',
			'Percentage of Total Members',
		],
		rows: distRows,
	});

	if (analyticsRangeData?.getAnalyticsRange && analyticsRangeData.getAnalyticsRange.length > 0) {
		const rangeData = analyticsRangeData.getAnalyticsRange.slice(-30);
		let cumulativeRevenue = 0;
		let previousRevenue = 0;
		const revenueArray: number[] = [];
		const trendRows = rangeData.map((item: any, index: number) => {
			const revenue = item.totalRevenue || 0;
			cumulativeRevenue += revenue;
			revenueArray.push(revenue);

			let dailyGrowth = 'N/A';
			if (index > 0 && previousRevenue > 0) {
				const growth = ((revenue - previousRevenue) / previousRevenue) * 100;
				dailyGrowth = `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
			}

			let sevenDayAvg = 'N/A';
			if (index >= 6) {
				const last7Days = revenueArray.slice(-7);
				const avg = last7Days.reduce((a, b) => a + b, 0) / 7;
				sevenDayAvg = `₱${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
			}

			const thirtyDayAvg =
				revenueArray.length > 0
					? `₱${(revenueArray.reduce((a, b) => a + b, 0) / revenueArray.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
					: 'N/A';

			previousRevenue = revenue;
			return [
				formatDate(item.date),
				`₱${revenue.toLocaleString()}`,
				dailyGrowth,
				sevenDayAvg,
				thirtyDayAvg,
				`₱${cumulativeRevenue.toLocaleString()}`,
			];
		});
		sections.push({
			title: 'REVENUE TRENDS (LAST 30 DAYS - DETAILED)',
			head: ['Date', 'Total Revenue', 'Daily Growth', '7-Day Average', '30-Day Average', 'Cumulative Revenue'],
			rows: trendRows,
		});
	}

	const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let cumulativeTotal = 0;
	let previousCount = 0;
	const growthRows: (string | number)[][] = [];

	for (let i = 5; i >= 0; i--) {
		const date = new Date();
		date.setMonth(date.getMonth() - i);
		const month = date.getMonth();
		const year = date.getFullYear();
		const monthName = monthAbbr[month];

		const newMembers = (data?.members || []).filter((m: any) => {
			const joinDate = new Date(m.createdAt || m.joinDate);
			return joinDate.getMonth() === month && joinDate.getFullYear() === year;
		});

		const activeInMonth = newMembers.filter((m: any) => {
			const membershipTransaction = m.currentMembership;
			return membershipTransaction?.status === 'ACTIVE';
		}).length;

		const inactiveInMonth = newMembers.length - activeInMonth;
		cumulativeTotal += newMembers.length;

		let growthRate = 'N/A';
		if (i < 5 && previousCount > 0) {
			const growth = ((newMembers.length - previousCount) / previousCount) * 100;
			growthRate = `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
		}

		growthRows.push([
			monthName,
			year.toString(),
			newMembers.length,
			activeInMonth,
			inactiveInMonth,
			growthRate,
			cumulativeTotal,
		]);

		previousCount = newMembers.length;
	}
	sections.push({
		title: 'MEMBER GROWTH (LAST 6 MONTHS - DETAILED)',
		head: ['Month', 'Year', 'New Members', 'Active Members', 'Inactive Members', 'Growth Rate', 'Cumulative Total'],
		rows: growthRows,
	});

	const totalSubscriptions =
		activeSubscriptions + newSubscriptions + canceledSubscriptions + expiredSubscriptions;
	const statusData = [
		{ status: 'Active', count: activeSubscriptions, revenue: totalRevenue },
		{ status: 'New', count: newSubscriptions, revenue: 0 },
		{ status: 'Canceled', count: canceledSubscriptions, revenue: 0 },
		{ status: 'Expired', count: expiredSubscriptions, revenue: 0 },
	];
	const subRows = statusData.map((item) => {
		const percentage =
			totalSubscriptions > 0 ? ((item.count / totalSubscriptions) * 100).toFixed(2) : '0.00';
		const avgRevenue = item.count > 0 ? item.revenue / item.count : 0;
		return [
			item.status,
			item.count,
			`${percentage}%`,
			item.revenue > 0 ? `₱${item.revenue.toLocaleString()}` : 'N/A',
			item.revenue > 0
				? `₱${avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
				: 'N/A',
		];
	});
	sections.push({
		title: 'SUBSCRIPTION STATUS BREAKDOWN',
		head: ['Status', 'Count', 'Percentage', 'Total Revenue', 'Average Revenue per Subscription'],
		rows: subRows,
	});

	const genderCounts: { [key: string]: number } = {};
	(data?.members || []).forEach((m: any) => {
		const gender = m.gender || 'Not Specified';
		genderCounts[gender] = (genderCounts[gender] || 0) + 1;
	});
	const genderRows = Object.entries(genderCounts).map(([gender, count]) => {
		const percentage = totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(2) : '0.00';
		return [gender, count, `${percentage}%`];
	});
	sections.push({
		title: 'DEMOGRAPHIC ANALYSIS — GENDER DISTRIBUTION',
		head: ['Gender', 'Count', 'Percentage'],
		rows: genderRows,
	});

	const ageGroups: { [key: string]: number } = {
		'18-25': 0,
		'26-35': 0,
		'36-45': 0,
		'46-55': 0,
		'56+': 0,
		'Not Specified': 0,
	};

	(data?.members || []).forEach((m: any) => {
		if (m.dateOfBirth) {
			const age = parseInt(calculateAge(m.dateOfBirth), 10);
			if (isNaN(age)) {
				ageGroups['Not Specified']++;
			} else if (age >= 18 && age <= 25) {
				ageGroups['18-25']++;
			} else if (age >= 26 && age <= 35) {
				ageGroups['26-35']++;
			} else if (age >= 36 && age <= 45) {
				ageGroups['36-45']++;
			} else if (age >= 46 && age <= 55) {
				ageGroups['46-55']++;
			} else if (age >= 56) {
				ageGroups['56+']++;
			} else {
				ageGroups['Not Specified']++;
			}
		} else {
			ageGroups['Not Specified']++;
		}
	});

	const ageRows = Object.entries(ageGroups).map(([group, count]) => {
		const percentage = totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(2) : '0.00';
		return [group, count, `${percentage}%`];
	});
	sections.push({
		title: 'DEMOGRAPHIC ANALYSIS — AGE GROUPS',
		head: ['Age Group', 'Count', 'Percentage'],
		rows: ageRows,
	});

	const referralSources: { [key: string]: number } = {};
	(data?.members || []).forEach((m: any) => {
		const source = m.heardFrom || 'Not Specified';
		referralSources[source] = (referralSources[source] || 0) + 1;
	});
	const refRows = Object.entries(referralSources).map(([source, count]) => {
		const percentage = totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(2) : '0.00';
		return [source, count, `${percentage}%`];
	});
	sections.push({
		title: 'DEMOGRAPHIC ANALYSIS — REFERRAL SOURCES',
		head: ['Source', 'Count', 'Percentage'],
		rows: refRows,
	});

	const specializationCounts: { [key: string]: number } = {};
	(data?.coaches || []).forEach((c: any) => {
		const specializations = c.coachDetails?.specialization || [];
		if (specializations.length === 0) {
			specializationCounts['General Fitness'] = (specializationCounts['General Fitness'] || 0) + 1;
		} else {
			specializations.forEach((spec: string) => {
				specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
			});
		}
	});

	const totalSpecializations = Object.values(specializationCounts).reduce((a, b) => a + b, 0);
	const specRows = Object.entries(specializationCounts).map(([spec, count]) => {
		const percentage =
			totalSpecializations > 0 ? ((count / totalSpecializations) * 100).toFixed(2) : '0.00';
		return [spec, count, `${percentage}%`];
	});
	sections.push({
		title: 'COACH SPECIALIZATION ANALYSIS',
		head: ['Specialization', 'Count', 'Percentage'],
		rows: specRows,
	});

	const fitnessGoals: { [key: string]: number } = {};
	(data?.members || []).forEach((m: any) => {
		const goal = m.membershipDetails?.fitnessGoal || 'Not Specified';
		fitnessGoals[goal] = (fitnessGoals[goal] || 0) + 1;
	});
	const goalRows = Object.entries(fitnessGoals).map(([goal, count]) => {
		const percentage = totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(2) : '0.00';
		return [goal, count, `${percentage}%`];
	});
	sections.push({
		title: 'FITNESS GOALS ANALYSIS',
		head: ['Fitness Goal', 'Count', 'Percentage'],
		rows: goalRows,
	});

	const dailyRange = analyticsRangeData?.getAnalyticsRange ?? [];
	const lastDaily = dailyRange.length > 0 ? dailyRange[dailyRange.length - 1]?.date : undefined;

	sections.push({
		title: 'EXPORT METADATA',
		head: ['Field', 'Value'],
		rows: [
			[
				'Export Date',
				new Date().toLocaleString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					timeZoneName: 'short',
				}),
			],
			['Generated By', 'X-TRIM FIT GYM Analytics System'],
			[
				'Total Records Exported',
				`${totalMembers} Members, ${coaches.length} Coaches, ${dailyRange.length} Daily Records`,
			],
			[
				'Data Range',
				`From ${formatDate(dailyRange[0]?.date || new Date().toISOString())} to ${formatDate(lastDaily || new Date().toISOString())}`,
			],
		],
	});

	sections.push({
		title: 'REMOVED MEMBERSHIP PLANS',
		head: ['Removed At', 'Plan Name', 'Price', 'Duration', 'Reason', 'Removed By'],
		rows:
			removedMembershipPlans.length > 0
				? removedMembershipPlans.map((item) => [
						formatDate(item.removedAt),
						item.planName || 'N/A',
						`₱${Number(item.planPrice || 0).toLocaleString()}`,
						formatDurationLabel(item.planDurationType),
						item.reason || 'N/A',
						item.removedBy || 'N/A',
				  ])
				: [['N/A', 'No removed plans yet', 'N/A', 'N/A', 'N/A', 'N/A']],
	});

	return sections;
}
