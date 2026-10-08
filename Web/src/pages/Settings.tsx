import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
	User,
	Sliders,
	Bell,
	Shield,
	Key,
	History,
	LogOut,
	Pencil,
	X,
	UserPlus,
	Eye,
	EyeOff,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout, updateUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useMutation, useQuery } from '@apollo/client';
import {
	UPDATE_USER,
	CREATE_USER,
	DELETE_USER,
	GET_USERS,
	GET_USER,
} from '@/graphql/operations';
import { RoleType } from '@/graphql/generated/graphql';

export function SettingsPage() {
	useEffect(() => {
		document.title = 'Settings - X-TRIM FIT GYM';
	}, []);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { signOut } = useClerk();
	const { user } = useAppSelector((state) => state.auth);
	const [activeSection, setActiveSection] = useState('account');
	const [editMode, setEditMode] = useState<Record<string, boolean>>({});
	const [logoutModalOpen, setLogoutModalOpen] = useState(false);

	const handleLogout = async () => {
		await signOut();
		dispatch(logout());
		setLogoutModalOpen(false);
		navigate('/login');
	};

	const sections = [
		{ id: 'account', label: 'Account Information', icon: User },
		{ id: 'preferences', label: 'System Preferences', icon: Sliders },
		{ id: 'notifications', label: 'Notification Settings', icon: Bell },
		{ id: 'security', label: 'Account Security', icon: Shield },
		// { id: 'admin', label: 'Admin Accounts', icon: UserPlus },
		// { id: 'manageData', label: 'Manage Data', icon: Database },
	];

	const toggleEditMode = (section: string) => {
		setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	const cancelEdit = (section: string) => {
		setEditMode((prev) => ({ ...prev, [section]: false }));
	};

	const saveChanges = (section: string) => {
		// Handle save logic here
		setEditMode((prev) => ({ ...prev, [section]: false }));
	};

	return (
		<div className="settings-layout flex min-h-[calc(100vh-80px)]">
			{/* Sidebar */}
			<aside className="settings-sidebar w-80 bg-[var(--card-bg)] border-r border-[var(--card-border)] py-10 flex flex-col sticky top-20 h-[calc(100vh-80px)] overflow-y-auto backdrop-blur-md">
				<div className="profile-section px-8 pb-8 border-b border-[var(--card-border)] mb-6 text-center">
					<div className="profile-picture-wrapper relative inline-block mb-4">
						<div className="profile-picture w-25 h-25 rounded-full bg-gradient-to-br from-[var(--primary-yellow)] to-[#E6B800] flex items-center justify-center text-3xl font-semibold text-[#1a1a1a] mx-auto">
							{user?.firstName?.[0] || 'A'}
							{user?.lastName?.[0] || 'D'}
						</div>
						<button
							className="edit-profile-pic absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary-yellow)] border-[3px] border-[var(--bg-dark)] flex items-center justify-center text-[#1a1a1a] text-sm transition-[var(--transition)] hover:bg-[#E6B800] hover:scale-110"
							title="Edit Profile Picture"
						>
							<Pencil className="w-3.5 h-3.5" />
						</button>
					</div>
					<h3 className="profile-name text-xl font-semibold text-[var(--text-primary)] mb-1 font-['Poppins']">
						{user?.firstName} {user?.lastName}
					</h3>
					<p className="profile-role text-sm text-[var(--text-secondary)]">System Administrator</p>
				</div>
				<nav className="settings-nav flex flex-col px-4">
					{sections.map((section) => {
						const Icon = section.icon;
						return (
							<button
								key={section.id}
								onClick={() => setActiveSection(section.id)}
								className={`nav-link flex items-center gap-3 px-5 py-3.5 rounded-[10px] text-[var(--text-secondary)] text-[0.95rem] font-medium transition-[var(--transition)] ${
									activeSection === section.id
										? 'active bg-[var(--primary-yellow)] text-[#1a1a1a] font-semibold'
										: 'hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]'
								}`}
							>
								<Icon className="w-5 h-5" />
								<span>{section.label}</span>
							</button>
						);
					})}
					<div className="nav-divider h-px bg-[var(--card-border)] my-2 mx-5" />
					<button
						onClick={() => setLogoutModalOpen(true)}
						className="nav-link logout-link flex items-center gap-3 px-5 py-3.5 rounded-[10px] text-[var(--text-secondary)] text-[0.95rem] font-medium transition-[var(--transition)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
					>
						<LogOut className="w-5 h-5" />
						<span>Log Out</span>
					</button>
				</nav>
			</aside>

			{/* Main Content Area */}
			<div className="settings-main-content flex-1 py-10 px-12 overflow-y-auto">
				<div className="settings-container max-w-[900px] w-full">
					{activeSection === 'account' && (
						<AccountSection
							editMode={editMode.account}
							onToggleEdit={() => toggleEditMode('account')}
							onCancel={() => cancelEdit('account')}
							onSave={() => saveChanges('account')}
						/>
					)}
					{activeSection === 'preferences' && <PreferencesSection />}
					{activeSection === 'notifications' && (
						<NotificationsSection
							editMode={editMode.notifications}
							onToggleEdit={() => toggleEditMode('notifications')}
							onCancel={() => cancelEdit('notifications')}
							onSave={() => saveChanges('notifications')}
						/>
					)}
					{activeSection === 'security' && <SecuritySection />}
					{activeSection === 'admin' && <AdminAccountsSection />}
					{activeSection === 'manageData' && <ManageDataSection />}
				</div>
			</div>

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
		</div>
	);
}

function AccountSection({
	editMode,
	onToggleEdit,
	onCancel,
	onSave,
}: {
	editMode?: boolean;
	onToggleEdit: () => void;
	onCancel: () => void;
	onSave: () => void;
}) {
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const [firstName, setFirstName] = useState(user?.firstName || '');
	const [lastName, setLastName] = useState(user?.lastName || '');
	const [updateUserMutation] = useMutation(UPDATE_USER);

	useEffect(() => {
		if (user) {
			setFirstName(user.firstName || '');
			setLastName(user.lastName || '');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

	const handleCancel = () => {
		setFirstName(user?.firstName || '');
		setLastName(user?.lastName || '');
		onCancel();
	};

	const handleSave = async () => {
		if (!user?.id) return;

		try {
			const result = await updateUserMutation({
				variables: {
					id: user.id,
					input: {
						firstName,
						lastName,
					},
				},
			});

			if (result.data?.updateUser) {
				const updatedUser = result.data.updateUser;
				dispatch(updateUser({
					...updatedUser,
					middleName: updatedUser.middleName ?? undefined,
					phoneNumber: updatedUser.phoneNumber ?? undefined,
					dateOfBirth: updatedUser.dateOfBirth ?? undefined,
				}));
				dispatch(addToast({ type: 'success', message: 'Account information updated successfully!' }));
				onSave();
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to update account information';
			dispatch(addToast({ type: 'error', message }));
		}
	};

	return (
		<div className="settings-section bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
			<div className="section-header-modern flex items-center justify-between mb-8 pb-6 border-b border-[var(--card-border)]">
				<h2 className="section-title text-[1.75rem] font-semibold text-[var(--text-primary)] font-['Poppins'] m-0">
					Account Information
				</h2>
				<button
					onClick={onToggleEdit}
					className={`btn-edit-modern flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] text-[var(--text-secondary)] text-sm font-medium transition-[var(--transition)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(249,197,19,0.3)] hover:text-[var(--primary-yellow)] ${editMode ? 'editing' : ''}`}
				>
					<Pencil className="w-4 h-4" />
					Edit
				</button>
			</div>
			<div className="section-content flex flex-col gap-6">
				<div className="form-grid grid grid-cols-2 gap-6 mb-6">
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							First Name
						</label>
						<div className="input-wrapper relative">
							<input
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								readOnly={!editMode}
								className={`w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] ${
									editMode ? 'edit-mode' : 'read-only'
								} focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]`}
							/>
						</div>
					</div>
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Last Name
						</label>
						<div className="input-wrapper relative">
							<input
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								readOnly={!editMode}
								className={`w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] ${
									editMode ? 'edit-mode' : 'read-only'
								} focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]`}
							/>
						</div>
					</div>
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Email Address
						</label>
						<div className="input-wrapper relative">
							<input
								type="email"
								value={user?.email || ''}
								disabled
								className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] opacity-60 cursor-not-allowed"
							/>
						</div>
						<p className="text-xs text-[var(--text-secondary)] mt-1">Email cannot be changed</p>
					</div>
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Role
						</label>
						<div className="input-wrapper relative">
							<input
								type="text"
								value="System Administrator"
								disabled
								className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] opacity-60 cursor-not-allowed"
							/>
						</div>
					</div>
				</div>
				<div
					className={`form-actions flex gap-4 justify-end mt-8 pt-6 border-t border-[var(--card-border)] ${editMode ? '' : 'hidden'}`}
				>
					<button
						type="button"
						onClick={handleCancel}
						className="btn-discard px-6 py-3 bg-transparent text-[var(--primary-yellow)] border border-[var(--primary-yellow)] rounded-lg font-medium text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[var(--primary-yellow)] hover:text-[#1a1a1a]"
					>
						Discard Changes
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="btn-save px-6 py-3 bg-[var(--primary-yellow)] text-[#1a1a1a] border-none rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)]"
					>
						Save Changes
					</button>
				</div>
			</div>
		</div>
	);
}

function PreferencesSection() {
	const dispatch = useAppDispatch();
	const handleEditClick = () => {
		dispatch(addToast({ type: 'info', message: 'System preferences editing is currently not available.' }));
	};

	return (
		<div className="settings-section bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
			<div className="section-header-modern flex items-center justify-between mb-8 pb-6 border-b border-[var(--card-border)]">
				<h2 className="section-title text-[1.75rem] font-semibold text-[var(--text-primary)] font-['Poppins'] m-0">
					System Preferences
				</h2>
				<button
					onClick={handleEditClick}
					className="btn-edit-modern flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] text-[var(--text-secondary)] text-sm font-medium transition-[var(--transition)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(249,197,19,0.3)] hover:text-[var(--primary-yellow)]"
				>
					<Pencil className="w-4 h-4" />
					Edit
				</button>
			</div>
			<div className="section-content flex flex-col gap-6">
				<div className="form-grid grid grid-cols-2 gap-6 mb-6">
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Timezone
						</label>
						<div className="input-wrapper relative">
							<select
								disabled
								className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] opacity-60 cursor-not-allowed"
							>
								<option>Asia/Manila (GMT+8)</option>
								<option>UTC (GMT+0)</option>
								<option>America/New_York (GMT-5)</option>
								<option>Europe/London (GMT+0)</option>
							</select>
						</div>
					</div>
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Date Format
						</label>
						<div className="input-wrapper relative">
							<select
								disabled
								className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] opacity-60 cursor-not-allowed"
							>
								<option>MM/DD/YYYY</option>
								<option>DD/MM/YYYY</option>
								<option>YYYY-MM-DD</option>
							</select>
						</div>
					</div>
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Language
						</label>
						<div className="input-wrapper relative">
							<select
								disabled
								className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] opacity-60 cursor-not-allowed"
							>
								<option>English</option>
								<option>Filipino</option>
							</select>
						</div>
					</div>
					<div className="form-group flex flex-col gap-2">
						<label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
							Currency
						</label>
						<div className="input-wrapper relative">
							<select
								disabled
								className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] opacity-60 cursor-not-allowed"
							>
								<option>Philippine Peso (₱)</option>
								<option>US Dollar ($)</option>
								<option>Euro (€)</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function NotificationsSection({
	editMode,
	onToggleEdit,
	onCancel,
	onSave,
}: {
	editMode?: boolean;
	onToggleEdit: () => void;
	onCancel: () => void;
	onSave: () => void;
}) {
	const [notifications, setNotifications] = useState({
		email: true,
		newMember: true,
		payment: true,
		system: true,
	});

	return (
		<div className="settings-section bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
			<div className="section-header-modern flex items-center justify-between mb-8 pb-6 border-b border-[var(--card-border)]">
				<h2 className="section-title text-[1.75rem] font-semibold text-[var(--text-primary)] font-['Poppins'] m-0">
					Notification Settings
				</h2>
				<button
					onClick={onToggleEdit}
					className={`btn-edit-modern flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] text-[var(--text-secondary)] text-sm font-medium transition-[var(--transition)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(249,197,19,0.3)] hover:text-[var(--primary-yellow)] ${editMode ? 'editing' : ''}`}
				>
					<Pencil className="w-4 h-4" />
					Edit
				</button>
			</div>
			<div className="section-content flex flex-col gap-6">
				<div className="notification-list flex flex-col gap-6">
					<div className="notification-item">
						<div className="notification-info">
							<h3>Email Notifications</h3>
							<p>Receive email alerts for important system events</p>
						</div>
						<label className="toggle-switch">
							<input
								type="checkbox"
								checked={notifications.email}
								disabled={!editMode}
								onChange={(e) => setNotifications((prev) => ({ ...prev, email: e.target.checked }))}
							/>
							<span className="toggle-slider"></span>
						</label>
					</div>
					<div className="notification-item">
						<div className="notification-info">
							<h3>New Member Registration</h3>
							<p>Get notified when a new member registers</p>
						</div>
						<label className="toggle-switch">
							<input
								type="checkbox"
								checked={notifications.newMember}
								disabled={!editMode}
								onChange={(e) =>
									setNotifications((prev) => ({ ...prev, newMember: e.target.checked }))
								}
							/>
							<span className="toggle-slider"></span>
						</label>
					</div>
					<div className="notification-item">
						<div className="notification-info">
							<h3>Payment Alerts</h3>
							<p>Receive notifications for payment transactions</p>
						</div>
						<label className="toggle-switch">
							<input
								type="checkbox"
								checked={notifications.payment}
								disabled={!editMode}
								onChange={(e) =>
									setNotifications((prev) => ({ ...prev, payment: e.target.checked }))
								}
							/>
							<span className="toggle-slider"></span>
						</label>
					</div>
					<div className="notification-item">
						<div className="notification-info">
							<h3>System Updates</h3>
							<p>Get notified about system maintenance and updates</p>
						</div>
						<label className="toggle-switch">
							<input
								type="checkbox"
								checked={notifications.system}
								disabled={!editMode}
								onChange={(e) =>
									setNotifications((prev) => ({ ...prev, system: e.target.checked }))
								}
							/>
							<span className="toggle-slider"></span>
						</label>
					</div>
				</div>
				<div
					className={`form-actions flex gap-4 justify-end mt-8 pt-6 border-t border-[var(--card-border)] ${editMode ? '' : 'hidden'}`}
				>
					<button
						type="button"
						onClick={onCancel}
						className="btn-discard px-6 py-3 bg-transparent text-[var(--primary-yellow)] border border-[var(--primary-yellow)] rounded-lg font-medium text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[var(--primary-yellow)] hover:text-[#1a1a1a]"
					>
						Discard Changes
					</button>
					<button
						type="button"
						onClick={onSave}
						className="btn-save px-6 py-3 bg-[var(--primary-yellow)] text-[#1a1a1a] border-none rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)]"
					>
						Save Changes
					</button>
				</div>
			</div>
		</div>
	);
}

function SecuritySection() {
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [updateUserMutation] = useMutation(UPDATE_USER);

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!passwordData.currentPassword) {
			dispatch(addToast({ type: 'error', message: 'Current password is required' }));
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			dispatch(addToast({ type: 'error', message: 'New passwords do not match' }));
			return;
		}

		if (passwordData.newPassword.length < 6) {
			dispatch(addToast({ type: 'error', message: 'Password must be at least 6 characters long' }));
			return;
		}

		if (!user?.id) return;

		try {
			await updateUserMutation({
				variables: {
					id: user.id,
					input: {
						password: passwordData.newPassword,
						currentPassword: passwordData.currentPassword,
					},
				},
			});

			dispatch(addToast({ type: 'success', message: 'Password changed successfully!' }));
			setPasswordData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
			setIsPasswordModalOpen(false);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to change password';
			dispatch(addToast({ type: 'error', message }));
		}
	};

	return (
		<>
			<div className="settings-section bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
				<h2 className="section-title text-[1.75rem] font-semibold text-[var(--text-primary)] font-['Poppins'] mb-6">
					Account Security
				</h2>
				<div className="section-content flex flex-col gap-6">
					<div className="security-actions flex flex-col gap-4">
						<div className="security-item flex items-center justify-between p-6 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-xl transition-[var(--transition)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)]">
							<div className="security-info flex items-center gap-4 flex-1">
								<div className="w-12 h-12 rounded-xl bg-[rgba(249,197,19,0.1)] flex items-center justify-center text-[var(--primary-yellow)] text-2xl">
									<Key className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-[0.95rem] font-semibold text-[var(--text-primary)] mb-1">
										Change Password
									</h3>
									<p className="text-xs text-[var(--text-secondary)]">
										Update your password to keep your account secure
									</p>
								</div>
							</div>
							<button
								onClick={() => setIsPasswordModalOpen(true)}
								className="btn-secondary px-6 py-3 bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] border border-[var(--card-border)] rounded-lg font-medium text-sm cursor-pointer transition-[var(--transition)] flex items-center gap-2 hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.15)]"
							>
								<Pencil className="w-4 h-4" />
								Change Password
							</button>
						</div>
						<div className="security-item flex items-center justify-between p-6 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-xl transition-[var(--transition)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)]">
							<div className="security-info flex items-center gap-4 flex-1">
								<div className="w-12 h-12 rounded-xl bg-[rgba(249,197,19,0.1)] flex items-center justify-center text-[var(--primary-yellow)] text-2xl">
									<History className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-[0.95rem] font-semibold text-[var(--text-primary)] mb-1">
										Login History
									</h3>
									<p className="text-xs text-[var(--text-secondary)]">
										View your recent login activity and sessions
									</p>
								</div>
							</div>
							<button
								onClick={() => setIsHistoryModalOpen(true)}
								className="btn-secondary px-6 py-3 bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] border border-[var(--card-border)] rounded-lg font-medium text-sm cursor-pointer transition-[var(--transition)] flex items-center gap-2 hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.15)]"
							>
								<History className="w-4 h-4" />
								View History
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Change Password Modal */}
			<div
				className={`modal-overlay ${isPasswordModalOpen ? 'active' : ''}`}
				onClick={() => setIsPasswordModalOpen(false)}
			>
				<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
					<div className="modal-body">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-[var(--text-primary)] font-['Poppins']">
								Change Password
							</h3>
							<button
								onClick={() => setIsPasswordModalOpen(false)}
								className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									Current Password *
								</label>
								<div className="input-wrapper relative">
									<input
										type={showPasswords.current ? 'text' : 'password'}
										value={passwordData.currentPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, currentPassword: e.target.value })
										}
										required
										className="w-full px-4 py-3 pr-12 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
									/>
									<button
										type="button"
										onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
									>
										{showPasswords.current ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									New Password *
								</label>
								<div className="input-wrapper relative">
									<input
										type={showPasswords.new ? 'text' : 'password'}
										value={passwordData.newPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, newPassword: e.target.value })
										}
										required
										minLength={6}
										className="w-full px-4 py-3 pr-12 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
									/>
									<button
										type="button"
										onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
									>
										{showPasswords.new ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									Confirm New Password *
								</label>
								<div className="input-wrapper relative">
									<input
										type={showPasswords.confirm ? 'text' : 'password'}
										value={passwordData.confirmPassword}
										onChange={(e) =>
											setPasswordData({ ...passwordData, confirmPassword: e.target.value })
										}
										required
										minLength={6}
										className="w-full px-4 py-3 pr-12 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
									/>
									<button
										type="button"
										onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
									>
										{showPasswords.confirm ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>
							<div className="flex gap-4 justify-end mt-4 pt-4 border-t border-[var(--card-border)]">
								<button
									type="button"
									onClick={() => setIsPasswordModalOpen(false)}
									className="btn-discard px-6 py-3 bg-transparent text-[var(--primary-yellow)] border border-[var(--primary-yellow)] rounded-lg font-medium text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[var(--primary-yellow)] hover:text-[#1a1a1a]"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn-save px-6 py-3 bg-[var(--primary-yellow)] text-[#1a1a1a] border-none rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)]"
								>
									Change Password
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* Login History Modal */}
			<LoginHistoryModal
				isOpen={isHistoryModalOpen}
				onClose={() => setIsHistoryModalOpen(false)}
			/>
		</>
	);
}

function AdminAccountsSection() {
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		dateOfBirth: '',
	});
	const [createUserMutation] = useMutation(CREATE_USER);
	const { data: adminsData, refetch } = useQuery(GET_USERS, {
		variables: { role: RoleType.Admin },
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user?.id) return;

		if (!formData.dateOfBirth) {
			dispatch(addToast({ type: 'error', message: 'Date of birth is required for admin accounts.' }));
			return;
		}
		const dob = new Date(formData.dateOfBirth);
		const now = new Date();
		let age = now.getFullYear() - dob.getFullYear();
		const md = now.getMonth() - dob.getMonth();
		if (md < 0 || (md === 0 && now.getDate() < dob.getDate())) age -= 1;
		if (age < 18) {
			dispatch(addToast({ type: 'error', message: 'Admin accounts must be 18 years old and above.' }));
			return;
		}

		try {
			const result = await createUserMutation({
				variables: {
					input: {
						firstName: formData.firstName,
						lastName: formData.lastName,
						email: formData.email,
						dateOfBirth: formData.dateOfBirth,
						role: RoleType.Admin,
					},
				},
			});

			if (result.data?.createUser) {
				dispatch(addToast({ type: 'success', message: 'Admin account created successfully!' }));
				setFormData({
					firstName: '',
					lastName: '',
					email: '',
					dateOfBirth: '',
				});
				setIsModalOpen(false);
				refetch();
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to create admin account';
			dispatch(addToast({ type: 'error', message }));
		}
	};

	const admins = adminsData?.getUsers || [];

	return (
		<div className="settings-section bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
			<div className="section-header-modern flex items-center justify-between mb-8 pb-6 border-b border-[var(--card-border)]">
				<h2 className="section-title text-[1.75rem] font-semibold text-[var(--text-primary)] font-['Poppins'] m-0">
					Admin Accounts
				</h2>
				<button
					onClick={() => setIsModalOpen(true)}
					className="btn-edit-modern flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary-yellow)] text-[#1a1a1a] text-sm font-semibold transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)]"
				>
					<UserPlus className="w-4 h-4" />
					Add Admin
				</button>
			</div>
			<div className="section-content flex flex-col gap-6">
				<p className="text-[var(--text-secondary)] text-sm mb-4">
					Create admins only from here. New staff need a MongoDB user first (this form); they sign in with Clerk
					using the same email. Public sign-up is disabled.
				</p>
				{admins.length > 0 && (
					<div className="admin-list">
						<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Current Admin Accounts</h3>
						<div className="grid grid-cols-1 gap-4">
							{admins.map((admin) => {
								if (!admin) return null;
								return (
									<div
										key={admin.id}
										className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-xl"
									>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="text-[var(--text-primary)] font-medium">
													{admin.firstName} {admin.lastName}
												</h4>
												<p className="text-sm text-[var(--text-secondary)]">{admin.email}</p>
											</div>
											{admin.id === user?.id && (
												<span className="px-3 py-1 bg-[var(--primary-yellow)] text-[#1a1a1a] text-xs font-semibold rounded-full">
													You
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Add Admin Modal */}
			<div
				className={`modal-overlay ${isModalOpen ? 'active' : ''}`}
				onClick={() => setIsModalOpen(false)}
			>
				<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
					<div className="modal-body">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-[var(--text-primary)] font-['Poppins']">
								Add New Admin Account
							</h3>
							<button
								onClick={() => setIsModalOpen(false)}
								className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									First Name *
								</label>
								<input
									type="text"
									name="firstName"
									value={formData.firstName}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
								/>
							</div>
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									Last Name *
								</label>
								<input
									type="text"
									name="lastName"
									value={formData.lastName}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
								/>
							</div>
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									Email Address *
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
								/>
							</div>
							<div className="form-group flex flex-col gap-2">
								<label className="text-sm font-medium text-[var(--text-secondary)]">
									Date of Birth *
								</label>
								<input
									type="date"
									name="dateOfBirth"
									value={formData.dateOfBirth}
									onChange={handleInputChange}
									required
									max={new Date().toISOString().split('T')[0]}
									className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-lg text-[var(--text-primary)] text-[0.95rem] transition-[var(--transition)] focus:outline-none focus:bg-[rgba(255,255,255,0.08)] focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)]"
								/>
							</div>
							<div className="flex gap-4 justify-end mt-4 pt-4 border-t border-[var(--card-border)]">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="btn-discard px-6 py-3 bg-transparent text-[var(--primary-yellow)] border border-[var(--primary-yellow)] rounded-lg font-medium text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[var(--primary-yellow)] hover:text-[#1a1a1a]"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn-save px-6 py-3 bg-[var(--primary-yellow)] text-[#1a1a1a] border-none rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)]"
								>
									Create Admin
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

function ManageDataSection() {
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const [isClearDataOpen, setIsClearDataOpen] = useState(false);
	const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
	const { data: usersData, loading, refetch } = useQuery(GET_USERS, {
		variables: { includeDisabled: true },
	});
	const [deleteUserMutation, { loading: isDeleting }] = useMutation(DELETE_USER);

	const accounts = (usersData?.getUsers || []).filter((account): account is NonNullable<typeof account> => Boolean(account));
	const selectedCount = selectedAccountIds.length;

	const toggleAccount = (accountId: string) => {
		setSelectedAccountIds((prev) =>
			prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId],
		);
	};

	const openClearData = () => {
		setSelectedAccountIds([]);
		setIsClearDataOpen(true);
	};

	const closeClearData = () => {
		setSelectedAccountIds([]);
		setIsClearDataOpen(false);
	};

	const handleClearSelectedData = async () => {
		if (!selectedCount) {
			dispatch(addToast({ type: 'error', message: 'Select at least one account to delete.' }));
			return;
		}

		try {
			await Promise.all(
				selectedAccountIds.map((id) =>
					deleteUserMutation({
						variables: { id },
					}),
				),
			);

			dispatch(addToast({
				type: 'success',
				message: selectedCount === 1 ? '1 account deleted successfully.' : `${selectedCount} accounts deleted successfully.`,
			}));
			closeClearData();
			await refetch();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to clear selected account data';
			dispatch(addToast({ type: 'error', message }));
		}
	};

	return (
		<div className="settings-section bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
			<div className="section-header-modern flex items-center justify-between mb-8 pb-6 border-b border-[var(--card-border)]">
				<h2 className="section-title text-[1.75rem] font-semibold text-[var(--text-primary)] font-['Poppins'] m-0">
					Manage Data
				</h2>
				<button
					onClick={openClearData}
					className="btn-edit-modern flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary-yellow)] text-[#1a1a1a] text-sm font-semibold transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)]"
				>
					Clear Data
				</button>
			</div>

			<div className="section-content flex flex-col gap-6">
				<p className="text-[var(--text-secondary)] text-sm">
					Use clear data to remove selected accounts. Only checked accounts will be deleted.
				</p>
			</div>

			<div
				className={`modal-overlay ${isClearDataOpen ? 'active' : ''}`}
				onClick={closeClearData}
			>
				<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
					<div className="modal-body">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-[var(--text-primary)] font-['Poppins']">
								Clear Data
							</h3>
							<button
								onClick={closeClearData}
								className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<p className="text-sm text-[var(--text-secondary)] mb-4">
							Check the accounts you want to delete.
						</p>

						<div className="max-h-[320px] overflow-y-auto border border-[var(--card-border)] rounded-xl p-3 bg-[rgba(255,255,255,0.02)]">
							{loading ? (
								<p className="text-[var(--text-secondary)] text-center py-6">Loading accounts...</p>
							) : accounts.length === 0 ? (
								<p className="text-[var(--text-secondary)] text-center py-6">No accounts found.</p>
							) : (
								<div className="flex flex-col gap-2">
									{accounts.map((account) => {
										const isCurrentUser = account.id === user?.id;
										return (
											<label
												key={account.id}
												className={`flex items-center gap-3 p-3 border rounded-lg transition-[var(--transition)] ${
													isCurrentUser
														? 'border-[var(--card-border)] opacity-60 cursor-not-allowed'
														: 'border-[var(--card-border)] hover:border-[rgba(249,197,19,0.45)] cursor-pointer'
												}`}
											>
												<input
													type="checkbox"
													checked={selectedAccountIds.includes(account.id)}
													onChange={() => toggleAccount(account.id)}
													disabled={isCurrentUser || isDeleting}
													className="w-4 h-4 accent-[var(--primary-yellow)]"
												/>
												<div className="flex-1">
													<p className="text-[var(--text-primary)] text-sm font-medium">
														{account.firstName} {account.lastName}
													</p>
													<p className="text-xs text-[var(--text-secondary)]">
														{account.email}
														{isCurrentUser ? ' (You)' : ''}
													</p>
												</div>
											</label>
										);
									})}
								</div>
							)}
						</div>

						<div className="flex items-center justify-between mt-4">
							<p className="text-xs text-[var(--text-secondary)]">
								{selectedCount} selected
							</p>
							<div className="flex gap-4">
								<button
									type="button"
									onClick={closeClearData}
									disabled={isDeleting}
									className="btn-discard px-6 py-3 bg-transparent text-[var(--primary-yellow)] border border-[var(--primary-yellow)] rounded-lg font-medium text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[var(--primary-yellow)] hover:text-[#1a1a1a] disabled:opacity-60 disabled:cursor-not-allowed"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleClearSelectedData}
									disabled={!selectedCount || isDeleting}
									className="btn-save px-6 py-3 bg-[var(--primary-yellow)] text-[#1a1a1a] border-none rounded-lg font-semibold text-[0.95rem] cursor-pointer transition-[var(--transition)] hover:bg-[#E6B800] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(249,197,19,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
								>
									{isDeleting ? 'Deleting...' : 'Delete Selected'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function LoginHistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const { user } = useAppSelector((state) => state.auth);
	const { data, loading } = useQuery(GET_USER, {
		variables: { id: user?.id || '' },
		skip: !user?.id || !isOpen,
	});

	const loginHistory = (data?.getUser as any)?.loginHistory || [];

	return (
		<div
			className={`modal-overlay ${isOpen ? 'active' : ''}`}
			onClick={onClose}
		>
			<div className="modal modal-center" onClick={(e) => e.stopPropagation()}>
				<div className="modal-body">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-semibold text-[var(--text-primary)] font-['Poppins']">
							Login History
						</h3>
						<button
							onClick={onClose}
							className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-[var(--transition)]"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
					<div className="max-h-[60vh] overflow-y-auto">
						{loading ? (
							<p className="text-[var(--text-secondary)] text-center py-8">Loading...</p>
						) : loginHistory.length === 0 ? (
							<p className="text-[var(--text-secondary)] text-center py-8">No login history available</p>
						) : (
							<div className="flex flex-col gap-3">
								{loginHistory.map((entry: any, index: number) => (
									<div
										key={index}
										className="p-4 bg-[rgba(255,255,255,0.03)] border border-[var(--card-border)] rounded-xl"
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-[var(--text-primary)] font-medium">
													{entry.ipAddress || 'Unknown IP'}
												</p>
												<p className="text-sm text-[var(--text-secondary)]">
													{entry.userAgent || 'Unknown device'}
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm text-[var(--text-primary)]">
													{entry.loginAt ? new Date(entry.loginAt).toLocaleString() : 'Unknown date'}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
