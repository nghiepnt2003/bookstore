import { configureStore } from '@reduxjs/toolkit';
import appSlice from './app/appSlice';
import userSlice from './user/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import cartSlice from './cart/cartSlice'; // Đảm bảo đường dẫn đúng
import chatSlice from './chat/chatSlice'; // Thêm import cho chatSlice

const commonConfig = {
  key: 'shop/user',
  storage,
};

const userConfig = {
  ...commonConfig,
  whiteList: ['isLoggedIn', 'token'],
};

// Cấu hình cho chatSlice (nếu cần lưu trữ)
const chatConfig = {
  key: 'shop/chat',
  storage,
};

// Cấu hình store
export const store = configureStore({
  reducer: {
    app: appSlice,
    user: persistReducer(userConfig, userSlice),
    cart: cartSlice,
    chat: persistReducer(chatConfig, chatSlice), // Thêm chatSlice vào store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Tạo persistor
export const persistor = persistStore(store);

