import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/config/axios-customize';
import { callFetchAccount } from '@/config/api';
import type { IAccount } from '@/types/backend';

// First, create the thunk
export const fetchAccount = createAsyncThunk(
    'account/fetchAccount',
    async () => {
        const response = await callFetchAccount();
        if (!response?.data?.user) {
            throw new Error('Không thể lấy thông tin tài khoản');
        }
        return response.data;
    }
)

const initialState = {
    isAuthenticated: false,
    isLoading: true,
    isRefreshToken: false,
    errorRefreshToken: "",
    user: {
        email: "",
        name: "",
        phone: "",
        _id: "",
        role: null as IAccount['user']['role'],
        company: null as IAccount['user']['company'],
        permissions: [] as NonNullable<IAccount['user']['permissions']>,
    },
    activeMenu: 'home'
};


export const accountSlide = createSlice({
    name: 'account',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            state.activeMenu = action.payload;
        },
        setUserLoginInfo: (state, action) => {
            state.isAuthenticated = true;
            state.isLoading = false;
            state.user = {
                ...state.user,
                permissions: [],
                ...action.payload
            }
        },
        setLogoutAction: (state, action) => {
            localStorage.removeItem('access_token');
            state.isAuthenticated = false;
            state.user = {
                email: "",
                phone: "",
                _id: "",
                role: "",
                company: null,
                permissions: [],
                name: ""
            }
        },
        setRefreshTokenAction: (state, action) => {
            state.isRefreshToken = action.payload?.status ?? false;
            state.errorRefreshToken = action.payload?.message ?? "";
        }

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchAccount.pending, (state, action) => {
            state.isLoading = true;
        })

        builder.addCase(fetchAccount.fulfilled, (state, action) => {
            if (action.payload) {
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user = { ...state.user, permissions: [], ...action?.payload?.user }
            }
        })

        builder.addCase(fetchAccount.rejected, (state, action) => {
            state.isAuthenticated = false;
            state.isLoading = false;
        })

    },

});

export const {
    setActiveMenu, setUserLoginInfo, setLogoutAction, setRefreshTokenAction
} = accountSlide.actions;

export default accountSlide.reducer;
