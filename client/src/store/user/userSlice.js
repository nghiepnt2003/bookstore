import { createSlice, current } from "@reduxjs/toolkit";
import * as actions from './asyncActions'

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        isLoggedIn: false,
        current: null,
        token: null,
        isLoading: false,
        mes: ''
    },
    reducers: {
        register: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
            state.current = action.payload.userData
            state.token = action.payload.token
        },
        logout: (state, action) => {
            state.isLoggedIn = false
            state.current = null
            state.token = null
        },
        clearMessage: (state) => {
            state.mes = ''
        }
    },
    extraReducers: (builder) => {
        builder.addCase(actions.getCurrent.pending,(state) => {
            state.isLoading = true;
        })

        builder.addCase(actions.getCurrent.fulfilled,(state,action) => {
            state.isLoading = false;
            state.current = action.payload;
            state.isLoggedIn = true;
        });

        builder.addCase(actions.getCurrent.rejected,(state,action) => {
            state.isLoading = false;
            state.current = null;
            state.isLoggedIn = false;
            state.token = null;
            state.mes = 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại!'
        });
    }
})

export const { register, logout,  clearMessage } = userSlice.actions
export default userSlice.reducer