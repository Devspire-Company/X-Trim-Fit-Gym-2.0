import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
	id: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	role: 'admin' | 'coach' | 'member';
	phoneNumber?: string;
	dateOfBirth?: string;
	gender: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<{ user: User }>) => {
			// Only allow admin users to be authenticated
			if (action.payload.user.role !== 'admin') {
				return; // Don't set credentials for non-admin users
			}
			state.user = action.payload.user;
			state.isAuthenticated = true;
		},
		logout: (state) => {
			state.user = null;
			state.isAuthenticated = false;
		},
		updateUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
			}
		},
	},
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
