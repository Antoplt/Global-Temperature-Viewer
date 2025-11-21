import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types pour les sélections
export type SelectionMode = 'latitude' | 'area' | 'none';

// Définition d'un rectangle de sélection
export interface SelectionRectangle {
  id: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

interface SelectionState {
  selectionMode: SelectionMode;
  selectedLatitudes: number[];
  selectedAreas: SelectionRectangle[];
}

const initialState: SelectionState = {
  // Le mode par défaut est 'latitude' comme dans votre version précédente
  // mais nous allons le rendre compatible avec 'area'
  selectionMode: 'latitude',
  selectedLatitudes: [],
  selectedAreas: [],
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setSelectionMode: (state, action: PayloadAction<SelectionMode>) => {
      state.selectionMode = action.payload;
    },
    addLatitude: (state, action: PayloadAction<number>) => {
      if (!state.selectedLatitudes.includes(action.payload)) {
        state.selectedLatitudes.push(action.payload);
        state.selectedLatitudes.sort((a, b) => b - a);
      }
    },
    removeLatitude: (state, action: PayloadAction<number>) => {
      state.selectedLatitudes = state.selectedLatitudes.filter(
        (lat) => lat !== action.payload
      );
    },
    // Action pour ajouter une zone
    addArea: (state, action: PayloadAction<SelectionRectangle>) => {
      state.selectedAreas.push(action.payload);
    },
    // Action pour supprimer une zone par son ID
    removeArea: (state, action: PayloadAction<string>) => {
      state.selectedAreas = state.selectedAreas.filter(
        (area) => area.id !== action.payload
      );
    },
  },
});

export const { setSelectionMode, addLatitude, removeLatitude, addArea, removeArea } = selectionSlice.actions;
export default selectionSlice.reducer;