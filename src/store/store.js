// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import residentialsReducer from './slices/residentialsSlice'
import { residentialsApi } from './api/residentialsApi'

export const store = configureStore({
  reducer: {
    residentials: residentialsReducer,
    [residentialsApi.reducerPath]: residentialsApi.reducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(residentialsApi.middleware)
})