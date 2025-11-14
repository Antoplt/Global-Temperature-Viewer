import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../slices/dataSlice';
import controlsReducer from '../slices/controlsSlice';
import selectionReducer from '../slices/selectionSlice';
import layoutReducer from '../slices/layoutSlice';
// Importez les anciens reducers si vous devez les supprimer
// import temperatureReducer from '../slices/temperatureSlice'; // EXEMPLE
// import uiReducer from '../slices/uiSlice'; // EXEMPLE

export const store = configureStore({
  reducer: {
    // Supprimez les anciens reducers (comme 'temperature' et 'ui')
    // temperature: temperatureReducer, // À SUPPRIMER
    // ui: uiReducer, // À SUPPRIMER
    
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