import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import './index.css';
import App from './App.tsx';

// Replace minified Apollo invariant links (go.apollo.dev/c/err#...) with readable messages in the console.
if (import.meta.env.DEV) {
	loadDevMessages();
}
loadErrorMessages();

const root = document.getElementById('root')!;

// Dev-only: React StrictMode double-mount can make Clerk send two email verification codes.
createRoot(root).render(
	import.meta.env.DEV ? <App /> : (
		<StrictMode>
			<App />
		</StrictMode>
	)
);
