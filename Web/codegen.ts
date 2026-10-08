import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	schema: '../Api/src/graphql/**/*.graphql',
	documents: ['src/**/*.{ts,tsx}', 'src/**/*.graphql'],
	generates: {
		'./src/graphql/generated/': {
			preset: 'client',
			plugins: [],
			presetConfig: {
				gqlTagName: 'gql',
			},
			config: {
				useTypeImports: true,
			},
		},
		'./src/graphql/generated/types.ts': {
			plugins: ['typescript', 'typescript-operations'],
			config: {
				useTypeImports: true,
				scalars: {
					DateTime: 'string',
				},
			},
		},
	},
	ignoreNoDocuments: true,
};

export default config;
