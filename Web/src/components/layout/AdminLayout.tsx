import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useClerk } from '@clerk/clerk-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useState, useRef, useEffect } from 'react';
import {
	Home,
	Users,
	UserCog,
	CreditCard,
	BarChart3,
	Settings,
	ChevronDown,
	LogOut,
	X,
	Fingerprint,
	Clock,
	Dumbbell,
	UserRound,
} from 'lucide-react';
import { SubscriptionRequestNotification } from '../SubscriptionRequestNotification';
import { SystemNotificationBell } from '../SystemNotificationBell';

const navItems = [
	{ path: '/dashboard', label: 'Dashboard', icon: Home },
	{ path: '/members', label: 'Member Management', icon: Users },
	{ path: '/coaches', label: 'Coach Management', icon: UserCog },
	{ path: '/memberships', label: 'Membership Management', icon: CreditCard },
	{ path: '/subscription-requests', label: 'Subscription Requests', icon: Clock },
	{ path: '/equipment', label: 'Equipment', icon: Dumbbell },
	{ path: '/attendance', label: 'Attendance Logs', icon: Fingerprint },
	{ path: '/walk-in-attendance', label: 'Walk-in Attendance', icon: UserRound },
	{ path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
];

export function AdminLayout() {
	const location = useLocation();
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
	const [logoutModalOpen, setLogoutModalOpen] = useState(false);
	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const [expandedSidebarWidth, setExpandedSidebarWidth] = useState(268); // Default width
	const sidebarRef = useRef<HTMLElement>(null);
	const navigate = useNavigate();
	const { signOut } = useClerk();

	const handleLogout = async () => {
		await signOut();
		dispatch(logout());
		setLogoutModalOpen(false);
		navigate('/login');
	};

	// Calculate sidebar width based on longest menu item text
	useEffect(() => {
		// Create a temporary element to measure text width accurately
		const tempElement = document.createElement('span');
		tempElement.style.visibility = 'hidden';
		tempElement.style.position = 'absolute';
		tempElement.style.fontSize = '14px';
		tempElement.style.fontWeight = '500';
		tempElement.style.fontFamily =
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
		tempElement.style.whiteSpace = 'nowrap';
		document.body.appendChild(tempElement);

		// Find the longest label width
		let maxWidth = 0;
		navItems.forEach((item) => {
			tempElement.textContent = item.label;
			const width = tempElement.offsetWidth;
			if (width > maxWidth) {
				maxWidth = width;
			}
		});

		// Clean up
		document.body.removeChild(tempElement);

		// Calculate total width: icon (20px) + gap (12px) + text width + padding (48px total) + extra space (24px)
		const iconWidth = 20; // w-5 icon = 20px
		const gap = 12; // gap between icon and text
		const padding = 48; // 1.2rem left + 1.2rem right = 24px each = 48px total
		const extraSpace = 24; // buffer for safety and spacing

		const calculatedWidth = iconWidth + gap + maxWidth + padding + extraSpace;

		// Set width with minimum of 240px and round up to nearest 10 for clean numbers
		setExpandedSidebarWidth(Math.max(240, Math.ceil(calculatedWidth / 10) * 10));
	}, []);

	const isActive = (path: string) => location.pathname === path;

	// Sidebar hover behavior - expand on hover, collapse on leave
	useEffect(() => {
		const sidebar = sidebarRef.current;
		if (!sidebar) return;

		const handleMouseEnter = (e: MouseEvent) => {
			e.stopPropagation();
			setSidebarExpanded(true);
		};

		const handleMouseLeave = (e: MouseEvent) => {
			e.stopPropagation();
			setSidebarExpanded(false);
		};

		// Use mouseenter/mouseleave for better hover detection
		sidebar.addEventListener('mouseenter', handleMouseEnter);
		sidebar.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			sidebar.removeEventListener('mouseenter', handleMouseEnter);
			sidebar.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, []);

	return (
		<div
			className={`admin-shell min-h-screen ${sidebarExpanded ? 'sidebar-expanded' : ''}`}
			style={
				{
					'--sidebar-width': sidebarExpanded ? `${expandedSidebarWidth}px` : '76px',
					'--sidebar-expanded-width': `${expandedSidebarWidth}px`,
				} as React.CSSProperties
			}
		>
			{/* Top Navbar */}
			<nav className="top-navbar fixed top-0 left-0 right-0 z-50">
				<div className="flex items-center justify-between h-full px-6 md:px-8">
					<div className="logo flex items-center gap-3 h-10">
						<img
							src="/logo.png"
							alt="X-TRIM FIT GYM"
							className="h-full w-auto object-contain cursor-pointer"
							onClick={() => navigate('/dashboard')}
						/>
						<span className="brand-division hidden sm:block">Operations</span>
					</div>
					<div className="nav-right flex items-center gap-4">
						<SystemNotificationBell />
						<div className="relative">
							<button
								onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
								className="user-profile flex items-center gap-3 px-2 py-2"
							>
								<div className="user-avatar w-9 h-9 flex items-center justify-center font-bold text-sm">
									{user?.firstName?.[0] || 'A'}
									{user?.lastName?.[0] || 'D'}
								</div>
								<div className="user-info text-left hidden md:block">
									<h4 className="text-sm font-semibold text-[var(--text-primary)]">
										{user?.firstName} {user?.lastName}
									</h4>
									<p className="text-xs text-[var(--text-secondary)]">System Administrator</p>
								</div>
								<ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
							</button>
							{profileDropdownOpen && (
								<div className="dropdown-menu absolute right-0 top-full mt-2 w-56 bg-[var(--bg-darker)] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] py-2 opacity-100 visible transform-none">
									<Link
										to="/settings"
										className="dropdown-item flex items-center gap-3 px-5 py-3 text-[var(--text-secondary)] text-sm hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--primary-yellow)] hover:pl-6"
										onClick={() => setProfileDropdownOpen(false)}
									>
										<Settings className="w-5 h-5" />
										<span>Settings</span>
									</Link>
									<div className="dropdown-divider h-px bg-[rgba(255,255,255,0.08)] my-1" />
									<button
										onClick={() => {
											setLogoutModalOpen(true);
											setProfileDropdownOpen(false);
										}}
										className="dropdown-item w-full flex items-center gap-3 px-5 py-3 text-[var(--text-secondary)] text-sm hover:bg-[rgba(255,255,255,0.05)] hover:text-[#EF4444] hover:pl-6"
									>
										<LogOut className="w-5 h-5" />
										<span>Logout</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Sidebar */}
			<aside
				ref={sidebarRef}
				className={`sidebar ${sidebarExpanded ? 'expanded' : ''}`}
				style={
					{
						width: sidebarExpanded ? `${expandedSidebarWidth}px` : '76px',
					} as React.CSSProperties
				}
			>
				<nav>
					<ul className="sidebar-menu">
						{navItems.map((item) => {
							const Icon = item.icon;
							return (
								<li key={item.path}>
									<Link
										to={item.path}
										className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
									>
										<Icon className="w-5 h-5" />
										<span>{item.label}</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			{/* Main Content */}
			<main className="main-content">
				<div key={location.pathname} className="page-transition">
					<Outlet />
				</div>
			</main>

			{/* Logout Modal */}
			<div
				className={`modal-overlay ${logoutModalOpen ? 'active' : ''}`}
				onClick={() => setLogoutModalOpen(false)}
			>
				<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
					<div className="modal-body">
						<div className="modal-logout-icon">
							<LogOut className="w-10 h-10" />
						</div>
						<h3 className="modal-logout-title">Are you sure you want to logout?</h3>
						<p className="modal-logout-text">
							You'll need to log in again to access your admin account.
						</p>
						<div className="modal-logout-actions">
							<button
								type="button"
								className="btn-secondary"
								onClick={() => setLogoutModalOpen(false)}
							>
								<X className="w-4 h-4" />
								Cancel
							</button>
							<button type="button" className="btn-primary" onClick={handleLogout}>
								<LogOut className="w-4 h-4" />
								Yes, Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Click outside to close dropdown */}
			{profileDropdownOpen && (
				<div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
			)}

			{/* Subscription Request Notification */}
			<SubscriptionRequestNotification />
		</div>
	);
}
