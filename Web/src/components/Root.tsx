import { Outlet } from 'react-router';
import { ClerkSessionSync } from '@/components/ClerkSessionSync';

export function Root() {
	return (
		<>
			<ClerkSessionSync />
			<Outlet />
		</>
	);
}
