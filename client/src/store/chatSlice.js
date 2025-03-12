import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
    name: 'chat',
    initialState: {
      sessionId: null,
    },
    reducers: {
       setSessionId : (state, action) => {
         state.sessionId = action.payload.sessionId;
       },
       removeSessionId: (state) => {
        state.sessionId = null;
       }
    }
})

export const { setSessionId, removeSessionId } = chatSlice.actions;

export default chatSlice.reducer;