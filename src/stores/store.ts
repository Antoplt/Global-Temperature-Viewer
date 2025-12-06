// src/stores/store.ts
// Redux store configuration
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../slices/dataSlice';
import controlsReducer from '../slices/controlsSlice';
import selectionReducer from '../slices/selectionSlice';
import layoutReducer from '../slices/layoutSlice';


// Configure the Redux store with the defined slices
export const store = configureStore({
  reducer: {
    data: dataReducer,
    controls: controlsReducer,
    selection: selectionReducer,
    layout: layoutReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;