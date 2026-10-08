import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense, type ReactNode } from 'react';
import { Root } from '@/components/Root';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const LoginPage = lazy(() => import('@/pages/Login').then((m) => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('@/pages/SignUp').then((m) => ({ default: m.SignUpPage })));
const DashboardPage = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const MembersPage = lazy(() => import('@/pages/Members').then((m) => ({ default: m.MembersPage })));
const CoachesPage = lazy(() => import('@/pages/Coaches').then((m) => ({ default: m.CoachesPage })));
const MembershipsPage = lazy(() => import('@/pages/Memberships').then((m) => ({ default: m.MembershipsPage })));
const ReportsPage = lazy(() => import('@/pages/Reports').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.SettingsPage })));
const AttendancePage = lazy(() => import('@/pages/Attendance').then((m) => ({ default: m.AttendancePage })));
const SubscriptionRequestsPage = lazy(() => import('@/pages/SubscriptionRequests').then((m) => ({ default: m.SubscriptionRequestsPage })));
const EquipmentPage = lazy(() => import('@/pages/Equipment').then((m) => ({ default: m.EquipmentPage })));
const WalkInAttendancePage = lazy(() => import('@/pages/WalkInAttendance').then((m) => ({ default: m.WalkInAttendancePage })));

function deferred(page: ReactNode) {
	return <Suspense fallback={<div className="p-6 text-[var(--text-secondary)]">Loading…</div>}>{page}</Suspense>;
}

export const router = createBrowserRouter([
	{
		element: <Root />,
		children: [
			{
				path: '/login/*',
				element: deferred(<LoginPage />),
			},
			{
				path: '/sign-up/*',
				element: deferred(<SignUpPage />),
			},
			{
				path: '/',
				element: (
					<ProtectedRoute>
						<AdminLayout />
					</ProtectedRoute>
				),
				errorElement: <div>Error occurred</div>,
				children: [
					{
						index: true,
						element: <Navigate to="/dashboard" replace />,
					},
					{
						path: 'dashboard',
						element: deferred(<DashboardPage />),
					},
					{
						path: 'members',
						element: deferred(<MembersPage />),
					},
					{
						path: 'coaches',
						element: deferred(<CoachesPage />),
					},
					{
						path: 'memberships',
						element: deferred(<MembershipsPage />),
					},
					{
						path: 'reports',
						element: deferred(<ReportsPage />),
					},
					{
						path: 'settings',
						element: deferred(<SettingsPage />),
					},
					{
						path: 'attendance',
						element: deferred(<AttendancePage />),
					},
					{
						path: 'walk-in-attendance',
						element: deferred(<WalkInAttendancePage />),
					},
					{
						path: 'subscription-requests',
						element: deferred(<SubscriptionRequestsPage />),
					},
					{
						path: 'equipment',
						element: deferred(<EquipmentPage />),
					},
				],
			},
		],
	},
]);
