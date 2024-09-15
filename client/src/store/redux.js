import { configureStore } from '@reduxjs/toolkit';
import appSlice from './app/appSlice';
import userSlice from './user/userSlice';
import storage from 'redux-persist/lib/storage'
import {persistReducer, persistStore} from 'redux-persist'

const commonConfig = {
  key: 'shop/user',
  storage
}

const userConfig = {
  ...commonConfig,
  whiteList: ['isLoggedIn', 'token']
}

export const store = configureStore({
  reducer: {
    app: appSlice,
    user: persistReducer(userConfig,userSlice)
  },
});

export const persistor = persistStore(store)
