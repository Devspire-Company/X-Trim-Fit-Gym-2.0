import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
}

interface UIState {
	sidebarOpen: boolean;
	toasts: Toast[];
}

const initialState: UIState = {
	sidebarOpen: true,
	toasts: [],
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},
		addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
			const id = `toast-${Date.now()}-${Math.random()}`;
			state.toasts.push({ ...action.payload, id });
		},
		removeToast: (state, action: PayloadAction<string>) => {
			state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
		},
		clearToasts: (state) => {
			state.toasts = [];
		},
	},
});

export const { toggleSidebar, setSidebarOpen, addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;

