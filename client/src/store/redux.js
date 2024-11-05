// import { configureStore } from '@reduxjs/toolkit';
// import appSlice from './app/appSlice';
// import userSlice from './user/userSlice';
// import storage from 'redux-persist/lib/storage'
// import {persistReducer, persistStore} from 'redux-persist'
// import cartSlice from './cart/cartSlice'

// const commonConfig = {
//   key: 'shop/user',
//   storage
// }

// const userConfig = {
//   ...commonConfig,
//   whiteList: ['isLoggedIn', 'token']
// }

// export const store = configureStore({
//   reducer: {
//     app: appSlice,
//     user: persistReducer(userConfig,userSlice),
//     cart: cartReducer,
//   },
// });

// export const persistor = persistStore(store)

import { configureStore } from '@reduxjs/toolkit';
import appSlice from './app/appSlice';
import userSlice from './user/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import cartSlice from './cart/cartSlice'; // Đảm bảo đường dẫn đúng

const commonConfig = {
  key: 'shop/user',
  storage,
};

const userConfig = {
  ...commonConfig,
  whiteList: ['isLoggedIn', 'token'],
};

// Cấu hình store
export const store = configureStore({
  reducer: {
    app: appSlice,
    user: persistReducer(userConfig, userSlice),
    cart: cartSlice
  },
});

// Tạo persistor
export const persistor = persistStore(store);
