import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from '../../apis';

// Tạo action để lấy giỏ hàng
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    console.log("HELLLLLJDJ")
    try {
        const response = await apis.apiGetUserCart();
        if (!response.success) {
            return rejectWithValue(response);
        }
        return response.cart; // Trả về cart
    } catch (error) {
        return rejectWithValue({ success: false, message: error.message });
    }
});