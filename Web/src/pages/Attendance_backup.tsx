import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export function LoginPage() {
	useEffect(() => {
		document.title = 'Login - X-TRIM FIT GYM';
	}, []);

	const navigate = useNavigate();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const loginLoading = false;
	const login = async (_email: string, _password: string) => {};

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await login(email, password);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-darker)] to-[var(--bg-dark)] p-4">
			<div className="w-full max-w-md">
				{/* Logo and Title */}
				<div className="text-center mb-8">
					<img
						src="/logo.png"
						alt="X-TRIM FIT GYM"
						className="h-16 w-auto mx-auto mb-4"
					/>
					<h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
						Welcome Back
					</h1>
					<p className="text-[var(--text-secondary)]">
						Sign in to access your admin dashboard
					</p>
				</div>

				{/* Login Form */}
				<div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[20px] p-8 backdrop-blur-md">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Email Input */}
						<div className="form-group">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-[var(--text-primary)] mb-2"
							>
								Email Address
							</label>
							<div className="input-wrapper">
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="admin@xtrimfitgym.com"
									required
									className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)] transition-all"
								/>
							</div>
						</div>

						{/* Password Input */}
						<div className="form-group">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-[var(--text-primary)] mb-2"
							>
								Password
							</label>
							<div className="input-wrapper relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter your password"
									required
									className="w-full px-4 py-3 pr-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-yellow)] focus:ring-[3px] focus:ring-[rgba(249,197,19,0.1)] transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="flex items-center justify-between">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									className="w-4 h-4 rounded border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--primary-yellow)] focus:ring-[var(--primary-yellow)]"
								/>
								<span className="text-sm text-[var(--text-secondary)]">
									Remember me
								</span>
							</label>
							<button
								type="button"
								className="text-sm text-[var(--primary-yellow)] hover:underline"
							>
								Forgot Password?
							</button>
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							className="btn-primary w-full gap-2"
							disabled={loginLoading}
						>
							{loginLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									Signing In...
								</>
							) : (
								<>
									<LogIn className="w-4 h-4" />
									Sign In
								</>
							)}
						</Button>
					</form>
				</div>

				{/* Footer */}
				<p className="text-center text-sm text-[var(--text-secondary)] mt-6">
					© 2025 X-TRIM FIT GYM. All rights reserved.
				</p>
			</div>
		</div>
	);
}

