import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getAuthBearerToken } from '@/lib/clerkTokenBridge';
import { DEFAULT_GRAPHQL_HTTP_URL, DEFAULT_GRAPHQL_WS_URL } from '@/lib/defaultGraphqlEndpoint';

/** Resolved HTTP(S) GraphQL URL (same value passed to createHttpLink). */
const resolvedGraphqlHttpUrl = (() => {
	const url = (import.meta.env.VITE_GRAPHQL_URL || '').trim();
	return url || DEFAULT_GRAPHQL_HTTP_URL;
})();

if (import.meta.env.DEV) {
	console.log(`[Apollo Client] GraphQL endpoint: ${resolvedGraphqlHttpUrl}`);
} else {
	console.info(
		`[Apollo Client] GraphQL endpoint: ${resolvedGraphqlHttpUrl.replace(/\/graphql\/?$/, '/graphql')}`,
	);
}

const getGraphQLUrl = (): string => resolvedGraphqlHttpUrl;

const httpLink = createHttpLink({
	uri: resolvedGraphqlHttpUrl,
	fetchOptions: {
		mode: 'cors',
	},
});

// WebSocket link for real-time subscriptions
const getWebSocketUrl = (): string => {
	// If not set, derive from HTTP URL (http -> ws, https -> wss) so you only need VITE_GRAPHQL_URL in production
	const graphqlUrl = getGraphQLUrl();
	const explicitWs = import.meta.env.VITE_GRAPHQL_WS_URL;
	if (explicitWs) return explicitWs;
	if (graphqlUrl.startsWith('https://')) return graphqlUrl.replace(/^https:\/\//, 'wss://');
	if (graphqlUrl.startsWith('http://')) return graphqlUrl.replace(/^http:\/\//, 'ws://');
	return DEFAULT_GRAPHQL_WS_URL;
};

const wsLink = new GraphQLWsLink(
	createClient({
		url: getWebSocketUrl(),
		lazy: true,
		// Keep the socket alive so proxies don't close it; reduces reconnects and missed messages
		keepAlive: 15_000,
		connectionParams: async () => {
			const token = await getAuthBearerToken();
			return {
				authorization: token ? `Bearer ${token}` : '',
			};
		},
		retryAttempts: 10,
		shouldRetry: () => true,
		retryWait: async (retries) => {
			// Back off: 1s, 2s, 3s... cap at 5s so reconnects don't take too long
			const delay = Math.min(1000 * (retries + 1), 5000);
			await new Promise((r) => setTimeout(r, delay));
		},
		on: {
			connected: () => {
				console.log('✅ [WebSocket] Real-time connection established');
			},
			closed: () => {
				console.warn('⚠️ [WebSocket] Real-time connection closed');
			},
			error: (error) => {
				console.error('❌ [WebSocket] Real-time connection error:', error);
			},
			opened: () => {
				console.log('✅ [WebSocket] Connection opened');
			},
		},
	})
);

const authLink = setContext(async (_, { headers }) => {
	const token = await getAuthBearerToken();
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
		},
	};
});

// Transient 502/503 from Render (cold start) often surface as "Failed to fetch" + misleading CORS in DevTools.
// Retry queries only (not mutations) with backoff.
const retryLink = new RetryLink({
	delay: {
		initial: 2000,
		max: 20_000,
		jitter: true,
	},
	attempts: {
		max: 6,
		retryIf: (error, operation) => {
			const def = getMainDefinition(operation.query);
			if (def.kind === 'OperationDefinition' && def.operation === 'mutation') {
				return false;
			}
			if (!error) return false;
			const status = (error as { statusCode?: number }).statusCode;
			if (status === 502 || status === 503 || status === 504) return true;
			const msg = String((error as Error).message || '');
			if (msg.includes('Failed to fetch') || msg.includes('Load failed') || msg.includes('NetworkError')) {
				return true;
			}
			return false;
		},
	},
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, locations, path }) => {
			// Only log GraphQL errors that aren't expected (like authorization errors)
			// Analytics queries may fail if user is not admin, which is handled gracefully
			const operationName = operation?.operationName || '';
			const isAnalyticsQuery =
				operationName.includes('Analytics') || operationName.includes('Revenue');

			if (isAnalyticsQuery && message.includes('Unauthorized')) {
				// Silently handle unauthorized analytics errors - they're expected and handled with fallback data
				return;
			}

			if (!message.includes('Unauthorized') && !message.includes('Forbidden')) {
				console.error(
					`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				);
			}
		});
	}

	if (networkError) {
		const operationName = operation?.operationName || 'unknown';
		const isAnalyticsQuery =
			operationName.includes('Analytics') ||
			operationName.includes('Revenue') ||
			operationName.includes('RevenueSummary');

		// Check if this is a real connectivity issue vs a handled error
		const isRealNetworkError =
			networkError.message.includes('Failed to fetch') ||
			networkError.message.includes('NetworkError') ||
			networkError.message.includes('Network request failed');

		// For analytics queries, suppress network errors - they're handled gracefully with fallback data
		if (isAnalyticsQuery) {
			// Don't log analytics query network errors - they're expected and handled
			return;
		}

		// Only log real network errors for non-analytics queries
		if (isRealNetworkError) {
			const endpoint = resolvedGraphqlHttpUrl || '(not configured)';
			const status = (networkError as { statusCode?: number }).statusCode;
			console.error(`[Network error]: ${networkError}`);
			console.error(`Failed to reach GraphQL endpoint: ${endpoint}`);
			if (status === 502 || status === 503 || status === 504) {
				console.error(
					'HTTP 502/503/504: the API gateway could not reach your app. On Render Free, the instance may be waking up — wait ~60s and retry, or open Render → XTrimFitGym-Api → Logs / Restart.',
				);
			}
			console.error('Other checks:');
			console.error('1. Render (or local) API is running and latest deploy succeeded');
			console.error('2. VITE_GRAPHQL_URL points to …/graphql for this environment (defaults to Render if unset)');
			console.error(
				'3. If the console also shows a CORS error alongside 502, the CORS message is usually a side effect of the failed response — fix the 502 first.',
			);
			if (import.meta.env.DEV) {
				console.error(
					'4. To use a different API in dev, set VITE_GRAPHQL_URL / VITE_GRAPHQL_WS_URL in .env and restart Vite.',
				);
			}
		}
	}
});

// Split link based on operation type
// Use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
	},
	wsLink,
	from([errorLink, authLink, retryLink, httpLink])
);

export const apolloClient = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					getUsers: {
						merge(_existing, incoming) {
							return incoming;
						},
					},
					getMemberships: {
						merge(_existing, incoming) {
							return incoming;
						},
					},
				},
			},
		},
	}),
	defaultOptions: {
		watchQuery: {
			errorPolicy: 'all',
		},
		query: {
			errorPolicy: 'all',
		},
	},
});
