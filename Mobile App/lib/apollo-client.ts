import { getClerkBearerToken } from '@/lib/clerk-token';
import {
	ApolloClient,
	InMemoryCache,
	createHttpLink,
	from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
	const configuredApiUrl =
		process.env.EXPO_PUBLIC_API_URL?.trim() ||
		(Constants.expoConfig?.extra?.apiUrl as string | undefined)?.trim();
	if (configuredApiUrl) return configuredApiUrl;

	if (__DEV__) {
		const isPhysicalDevice = Constants.isDevice;
		if (isPhysicalDevice) {
			console.warn(
				'EXPO_PUBLIC_API_URL is not configured for this physical device; using the hosted API.',
			);
			return 'https://xtrimfitgym-api.onrender.com/graphql';
		}

		if (Platform.OS === 'android') {
			return 'http://10.0.2.2:8000/graphql';
		}
		return 'http://localhost:8000/graphql';
	}

	return 'https://xtrimfitgym-api.onrender.com/graphql';
};

export const API_URL = getApiUrl();
console.log('✅ [Apollo Client] GraphQL endpoint:', API_URL);

const httpLink = createHttpLink({
	uri: API_URL,
	credentials: 'include', // Important for cookies
});

// Auth link to add token header (fallback if cookies don't work)
const authLink = setContext(async (_, { headers }) => {
	try {
		const token = await getClerkBearerToken();

		if (token) {
			return {
				headers: {
					...headers,
					authorization: `Bearer ${token}`,
				},
			};
		}
	} catch (error) {
		console.error('❌ [Apollo Client] Auth header error:', error);
	}

	return { headers: { ...headers } };
});

// Error link for handling errors
const errorLink = onError((error: any) => {
	if (error.graphQLErrors) {
		error.graphQLErrors.forEach((graphQLError: any) => {
			console.error(
				`[GraphQL error]: Message: ${graphQLError.message}, Location: ${graphQLError.locations}, Path: ${graphQLError.path}`,
			);
		});
	}

	if (error.networkError) {
		console.error(
			`[Network error]: ${error.networkError.message || error.networkError}`,
		);
	}
});

// Create Apollo Client
const client = new ApolloClient({
	link: from([errorLink, authLink, httpLink]),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			errorPolicy: 'all',
		},
		query: {
			errorPolicy: 'all',
		},
	},
});

export default client;
