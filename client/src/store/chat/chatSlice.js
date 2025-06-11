// src/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetAllChatSessions } from '../../apis/message';

export const fetchSessions = createAsyncThunk('chat/fetchSessions', async () => {
    const response = await apiGetAllChatSessions();
    return response.data; // Trả về dữ liệu từ API mà không chuẩn hóa
});

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        sessions: [],
        messages: [],
        loading: false,
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        updateSessions: (state, action) => {
            const { session } = action.payload;
            const index = state.sessions.findIndex(s => s._id === session._id);
            if (index !== -1) {
                state.sessions[index] = session;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSessions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.sessions = action.payload; // Lưu giữ dữ liệu gốc từ API
                state.loading = false;
            });
    },
});

export const { addMessage, updateSessions } = chatSlice.actions;
export default chatSlice.reducer;