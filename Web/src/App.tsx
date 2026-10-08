import { ApolloProvider } from '@apollo/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router';
import { apolloClient } from './lib/apollo/client';
import { store, persistor } from './store';
import { router } from './routes';
import { ToastContainer } from './components/ui/toast';
import { AuthValidator } from './components/AuthValidator';
import { DEFAULT_GRAPHQL_HTTP_URL, DEFAULT_GRAPHQL_WS_URL } from './lib/defaultGraphqlEndpoint';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!clerkPublishableKey) {
	console.error(
		'[App] VITE_CLERK_PUBLISHABLE_KEY is missing. Add it to .env (same value as in the API env).'
	);
}

function App() {
	if (!clerkPublishableKey) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-darker)] to-[var(--bg-dark)] p-6">
				<div className="max-w-xl w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-[var(--text-primary)]">
					<h1 className="text-2xl font-bold mb-3">Missing frontend environment setup</h1>
					<p className="text-[var(--text-secondary)] mb-4">
						Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your project <code>.env</code> file,
						then restart the Vite server.
					</p>
					<pre className="rounded-lg bg-black/30 p-4 overflow-x-auto text-sm">
{`VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# Optional — defaults to Render if omitted:
VITE_GRAPHQL_URL=${DEFAULT_GRAPHQL_HTTP_URL}
VITE_GRAPHQL_WS_URL=${DEFAULT_GRAPHQL_WS_URL}`}
					</pre>
				</div>
			</div>
		);
	}

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<ClerkProvider publishableKey={clerkPublishableKey}>
					<ApolloProvider client={apolloClient}>
						<AuthValidator>
							<RouterProvider router={router} />
							<ToastContainer />
						</AuthValidator>
					</ApolloProvider>
				</ClerkProvider>
			</PersistGate>
		</Provider>
	);
}

export default App;
