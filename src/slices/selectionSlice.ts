import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types pour les sélections
type SelectionMode = 'area' | 'latitude';
interface AreaGroup {
  id: string;
  areas: any[]; // Définissez le type pour une "area"
}

interface SelectionState {
  selectionMode: SelectionMode;
  selectedLatitudes: number[];
  areaGroups: AreaGroup[];
}

const initialState: SelectionState = {
  selectionMode: 'area',
  selectedLatitudes: [],
  areaGroups: [],
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
      }
    },
    removeLatitude: (state, action: PayloadAction<number>) => {
      state.selectedLatitudes = state.selectedLatitudes.filter(
        (lat) => lat !== action.payload
      );
    },
    // Ajoutez ici des reducers pour gérer les areaGroups (add, remove, update)
  },
});

export const { setSelectionMode, addLatitude, removeLatitude } = selectionSlice.actions;
export default selectionSlice.reducer;