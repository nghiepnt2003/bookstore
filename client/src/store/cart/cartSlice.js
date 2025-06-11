// // import { createSlice } from "@reduxjs/toolkit";
// // import { fetchCart } from './asyncActions'; // Import action từ asyncActions.js

// // const cartSlice = createSlice({
// //     name: 'cart',
// //     initialState: {
// //         items: [],
// //         totalPrice: 0,
// //         loading: false,
// //         error: null,
// //     },
// //     reducers: {
// //         clearCart(state) {
// //             state.items = [];
// //             state.totalPrice = 0;
// //         },
// //         updateCart(state, action) {
// //             state.items.push(action.payload);
// //             state.totalPrice += action.payload.product.price * action.payload.quantity;
// //         },
// //     },
// //     extraReducers: (builder) => {
// //         builder
// //             .addCase(fetchCart.pending, (state) => {
// //                 state.loading = true;
// //                 state.error = null;
// //             })
// //             .addCase(fetchCart.fulfilled, (state, action) => {
// //                 console.log("CART NE "+ action.payload.items)
// //                 state.loading = false;
// //                 state.items = action.payload.items; // Cập nhật danh sách items
// //                 state.totalPrice = action.payload.items.reduce((acc, item) => {
// //                     return acc + item.product.price * item.quantity;
// //                 }, 0); // Tính tổng giá trị
// //             })
// //             .addCase(fetchCart.rejected, (state, action) => {
// //                 state.loading = false;
// //                 state.error = action.payload;
// //             });
// //     },
// // });

// // // Export actions
// // export const { clearCart, updateCart } = cartSlice.actions;

// // export default cartSlice.reducer;

// import { createSlice } from "@reduxjs/toolkit";
// import { fetchCart } from './asyncActions'; // Import action từ asyncActions.js

// // Hàm để khôi phục giỏ hàng từ localStorage
// const loadCartFromLocalStorage = () => {
//     const savedCart = localStorage.getItem('cart');
//     if (savedCart) {
//         return JSON.parse(savedCart); // Chuyển đổi dữ liệu từ JSON thành object
//     }
//     return {
//         items: [],
//         totalPrice: 0,
//         loading: false,
//         error: null,
//     };
// };

// // Tạo slice cho giỏ hàng
// const cartSlice = createSlice({
//     name: 'cart',
//     initialState: loadCartFromLocalStorage(), // Khôi phục trạng thái từ localStorage
//     reducers: {
//         clearCart(state) {
//             state.items = [];
//             state.totalPrice = 0;
//             localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
//         },
//         updateCart(state, action) {
//             const { product, quantity } = action.payload;
//             const existingItem = state.items.find(item => item.product._id === product._id);
//             if (existingItem) {
//                 existingItem.quantity += quantity; // Cập nhật số lượng
//             } else {
//                 state.items.push({ product, quantity }); // Thêm sản phẩm mới
//             }
//             state.totalPrice += product.price * quantity; // Cập nhật tổng giá trị
//             localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchCart.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchCart.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.items = action.payload.items; // Cập nhật danh sách items
//                 state.totalPrice = action.payload.items.reduce((acc, item) => {
//                     return acc + item.product.price * item.quantity;
//                 }, 0); // Tính tổng giá trị
//                 localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
//             })
//             .addCase(fetchCart.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload;
//             });
//     },
// });

// // Export actions
// export const { clearCart, updateCart } = cartSlice.actions;

// export default cartSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { fetchCart } from './asyncActions'; // Import action từ asyncActions.js

// Hàm để khôi phục giỏ hàng từ localStorage
const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        return JSON.parse(savedCart); // Chuyển đổi dữ liệu từ JSON thành object
    }
    return {
        items: [],
        totalPrice: 0,
        loading: false,
        error: null,
    };
};

// Tạo slice cho giỏ hàng
const cartSlice = createSlice({
    name: 'cart',
    initialState: loadCartFromLocalStorage(), // Khôi phục trạng thái từ localStorage
    reducers: {
        clearCart(state) {
            state.items = [];
            state.totalPrice = 0;
            localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
        },
        updateCart(state, action) {
            const { product, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product._id === product._id);
            if (existingItem) {
                existingItem.quantity += quantity; // Cập nhật số lượng
            } else {
                state.items.push({ product, quantity }); // Thêm sản phẩm mới
            }
            state.totalPrice += product.price * quantity; // Cập nhật tổng giá trị
            localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
        },
        removeFromCart(state, action) {
            const { product } = action.payload; // Lấy sản phẩm từ payload
            state.items = state.items.filter(item => item.product._id !== product._id); // Xóa sản phẩm
            state.totalPrice -= product.price * state.items.find(item => item.product._id === product._id)?.quantity || 0; // Cập nhật tổng giá trị
            localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items; // Cập nhật danh sách items
                state.totalPrice = action.payload.items.reduce((acc, item) => {
                    return acc + item.product.price * item.quantity;
                }, 0); // Tính tổng giá trị
                localStorage.setItem('cart', JSON.stringify(state)); // Lưu vào localStorage
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const { clearCart, updateCart, removeFromCart } = cartSlice.actions;

export default cartSlice.reducer;