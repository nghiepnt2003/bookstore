import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from '../../apis';

// Tạo action để lấy giỏ hàng
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const response = await apis.apiGetUserCart();
        console.log("CART NE " + JSON.stringify(response))
        if (!response.success) {
            return rejectWithValue(response);
        }
        else {
            console.log("AAA")
            const newcart = {
                ...response.cart,
                items: response.cart.items.map(item => {
                  if (item.product.discount !== null) {
                    console.log("IIIII");
                    return { 
                      ...item, 
                      product: { 
                        ...item.product, 
                        price: item.finalPrice 
                      }
                    };
                  }
                  return item;
                })
              };
              return newcart;
        }
    } catch (error) {
        return rejectWithValue({ success: false, message: error.message });
    }
});