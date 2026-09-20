import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchResume } from '@/config/api';
import { IResume } from '@/types/backend';

interface IState {
    isFetching: boolean;
    error: string;
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IResume[]
}
// First, create the thunk
export const fetchResume = createAsyncThunk(
    'resume/fetchResume',
    async ({ query }: { query: string }) => {
        const response = await callFetchResume(query);
        if (!response.data?.meta || !Array.isArray(response.data.result)) {
            throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message || 'Không tải được danh sách CV');
        }
        return response;
    }
)


const initialState: IState = {
    isFetching: false,
    error: '',
    meta: {
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};


export const resumeSlide = createSlice({
    name: 'resume',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },


    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchResume.pending, (state, action) => {
            state.isFetching = true;
            state.error = '';
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchResume.rejected, (state, action) => {
            state.isFetching = false;
            state.error = action.error.message || 'Không tải được danh sách CV';
            state.result = [];
            state.meta.total = 0;
            state.meta.pages = 0;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchResume.fulfilled, (state, action) => {
            state.isFetching = false;
            if (action.payload && action.payload.data) {
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
            // Add user to the state array

            // state.courseOrder = action.payload;
        })
    },

});

export const {
    setActiveMenu,
} = resumeSlide.actions;

export default resumeSlide.reducer;
