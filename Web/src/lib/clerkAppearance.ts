/** Shared Clerk auth styling (SignIn / SignUp). */
export const clerkAuthAppearance = {
	variables: {
		colorPrimary: '#f9c513',
		colorText: '#f5f5f5',
		colorTextSecondary: '#a3a3a3',
		colorBackground: 'rgba(24, 24, 27, 0.95)',
		colorInputBackground: 'rgba(39, 39, 42, 0.95)',
		colorInputText: '#f5f5f5',
	},
	elements: {
		rootBox: 'w-full',
		card: 'bg-[var(--card-bg)] border border-[var(--card-border)] shadow-none rounded-[20px]',
		headerTitle: 'text-[var(--text-primary)]',
		headerSubtitle: 'text-[var(--text-secondary)]',
		formFieldLabel: 'text-[var(--text-primary)]',
		formFieldInput: 'text-[var(--text-primary)]',
		dividerLine: 'bg-[var(--card-border)]',
		dividerText: 'text-[var(--text-secondary)]',
		// Google / OAuth: light chip so icon + label stay readable (global colorText is light)
		socialButtonsBlockButton:
			'!bg-white !text-zinc-900 !border !border-zinc-200 hover:!bg-zinc-100 !shadow-sm [&_.cl-socialButtonsBlockButtonText]:!text-zinc-900',
		socialButtonsBlockButtonText: '!text-zinc-900',
		footer: 'text-[var(--text-secondary)]',
		footerAction: 'text-[var(--text-secondary)]',
		footerActionLink: 'text-[var(--primary-yellow)] hover:underline font-medium',
		identityPreviewText: 'text-[var(--text-primary)]',
		identityPreviewEditButton: 'text-[var(--primary-yellow)]',
	},
} as const;
