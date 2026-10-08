import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 3000,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes('node_modules')) return undefined;
					if (id.includes('jspdf-autotable')) return 'pdf-tables';
					if (id.includes('html2canvas')) return 'pdf-render';
					if (id.includes('jspdf')) return 'pdf-core';
					if (id.includes('@clerk')) return 'auth';
					if (id.includes('@apollo') || id.includes('graphql')) return 'graphql';
					if (id.includes('recharts') || id.includes('d3-')) return 'charts';
					return undefined;
				},
			},
		},
	},
});
