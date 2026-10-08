import { useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useSignIn } from '@clerk/clerk-react';
import { Eye, EyeOff, KeyRound, LoaderCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/store/hooks';
import {
	consumeAdminPortalAuthNotice,
	messageForAdminPortalAuthNotice,
	type AdminPortalAuthNotice,
} from '@/lib/adminPortalAuthNotice';

export function LoginPage() {
	const [portalNotice, setPortalNotice] = useState<AdminPortalAuthNotice | null>(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	useEffect(() => {
		document.title = 'Login - X-TRIM FIT GYM';
	}, []);

	useEffect(() => {
		const notice = consumeAdminPortalAuthNotice();
		if (notice) setPortalNotice(notice);
	}, []);

	const navigate = useNavigate();
	const { isLoaded, isSignedIn } = useClerkAuth();
	const { signIn, setActive } = useSignIn();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const user = useAppSelector((state) => state.auth.user);

	useEffect(() => {
		if (!isLoaded) return;
		if (isSignedIn && isAuthenticated && user?.role === 'admin') {
			navigate('/dashboard', { replace: true });
		}
	}, [isLoaded, isSignedIn, isAuthenticated, user, navigate]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!isLoaded || !signIn || !setActive || isSubmitting) return;

		const normalizedEmail = email.trim().toLowerCase();
		if (!normalizedEmail || !password) {
			setFormError('Enter both your email address and password.');
			return;
		}

		setIsSubmitting(true);
		setFormError(null);

		try {
			const result = await signIn.create({
				identifier: normalizedEmail,
				password,
			});

			if (result.status !== 'complete' || !result.createdSessionId) {
				setFormError(
					'This account needs an additional verification step. Ask the system owner to review its Clerk sign-in settings.'
				);
				return;
			}

			await setActive({ session: result.createdSessionId });
			navigate('/dashboard', { replace: true });
		} catch (error: unknown) {
			const clerkError = error as {
				errors?: Array<{ code?: string; longMessage?: string; message?: string }>;
			};
			const firstError = clerkError.errors?.[0];
			const invalidCredentials =
				firstError?.code === 'form_password_incorrect' ||
				firstError?.code === 'form_identifier_not_found';

			setFormError(
				invalidCredentials
					? 'The email address or password is incorrect.'
					: firstError?.longMessage || firstError?.message || 'Sign-in failed. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (!isLoaded) {
		return (
			<div className="login-page login-loading-screen">
				<div className="login-loading-mark" aria-label="Loading sign in" />
			</div>
		);
	}

	return (
		<div className="login-page">
			<div className="login-shell">
				<section className="login-visual" aria-label="X-TRIM FIT GYM">
					<div className="login-visual-image" />
					<div className="login-visual-shade" />
					<img src="/logo.png" alt="X-TRIM FIT GYM" className="login-brand-logo" />
					<div className="login-visual-copy">
						<span>ADMIN OPERATIONS</span>
						<h1>Built for the work behind every strong gym.</h1>
						<p>Members, attendance, coaching, and performance—managed in one place.</p>
					</div>
				</section>

				<main className="login-panel">
					<div className="login-mobile-brand">
						<img src="/logo.png" alt="X-TRIM FIT GYM" />
					</div>
					<div className="login-panel-content">
						<div className="login-heading">
							<p>SECURE ADMIN PORTAL</p>
							<h2>Welcome back</h2>
							<span>Use your authorized staff account to continue.</span>
						</div>

						{portalNotice && (
							<div className="login-alert" role="alert">
								{messageForAdminPortalAuthNotice(portalNotice)}
							</div>
						)}

						<form className="login-form" onSubmit={handleSubmit} noValidate>
							<label className="login-field">
								<span>Email address</span>
								<div className="login-input-wrap">
									<Mail aria-hidden="true" />
									<input
										type="email"
										name="email"
										autoComplete="username"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
										placeholder="Email address"
										disabled={isSubmitting}
										required
									/>
								</div>
							</label>

							<label className="login-field">
								<span>Password</span>
								<div className="login-input-wrap">
									<KeyRound aria-hidden="true" />
									<input
										type={showPassword ? 'text' : 'password'}
										name="password"
										autoComplete="current-password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										placeholder="Password"
										disabled={isSubmitting}
										required
									/>
									<button
										type="button"
										className="login-password-toggle"
										onClick={() => setShowPassword((visible) => !visible)}
										aria-label={showPassword ? 'Hide password' : 'Show password'}
										disabled={isSubmitting}
									>
										{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
									</button>
								</div>
							</label>

							{formError && (
								<div className="login-form-error" role="alert">
									{formError}
								</div>
							)}

							<button className="login-submit" type="submit" disabled={isSubmitting}>
								{isSubmitting && (
									<LoaderCircle className="login-submit-spinner" aria-hidden="true" />
								)}
								{isSubmitting ? 'Signing in...' : 'Sign in'}
							</button>
						</form>

						<p className="login-support-note">
							No password yet? Ask the system owner to set one for your authorized Clerk account.
						</p>

						<p className="login-footnote">
							Authorized X-TRIM FIT GYM staff only · {new Date().getFullYear()}
						</p>
					</div>
				</main>
			</div>
		</div>
	);
}
