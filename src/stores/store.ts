import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../slices/dataSlice';
import controlsReducer from '../slices/controlsSlice';
import selectionReducer from '../slices/selectionSlice';
import layoutReducer from '../slices/layoutSlice';


export const store = configureStore({
  reducer: {
    
    // Ajoutez les nouveaux
    data: dataReducer,
    controls: controlsReducer,
    selection: selectionReducer,
    layout: layoutReducer,
  },
});

// Définissez vos types RootState et AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;