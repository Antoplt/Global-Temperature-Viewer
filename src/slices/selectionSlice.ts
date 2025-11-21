import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types pour les sélections
export type SelectionMode = 'latitude' | 'area' | 'move' | 'none';

// Un groupe de zones
export interface AreaGroup {
  id: string;
  name: string;
  color: string;
}

// Définition d'un rectangle de sélection
export interface SelectionRectangle {
  id: string;
  groupId: string; // Chaque zone appartient à un groupe
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

interface SelectionState {
  selectionMode: SelectionMode;
  selectedLatitudes: number[];
  areaGroups: AreaGroup[];
  selectedAreas: SelectionRectangle[];
  activeGroupId: string | null; // Le groupe dans lequel on dessine actuellement
  highlightedLon: number | null; // Pour la sélection dans l'histogramme
}

const initialState: SelectionState = {
  // Le mode par défaut est 'latitude' comme dans votre version précédente
  // mais nous allons le rendre compatible avec 'area'
  selectionMode: 'none',
  selectedLatitudes: [],
  areaGroups: [],
  selectedAreas: [],
  activeGroupId: null,
  highlightedLon: null,
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
      // Si on supprime la dernière zone d'un groupe, on supprime aussi le groupe
      const remainingGroups = new Set(state.selectedAreas.map(a => a.groupId));
      state.areaGroups = state.areaGroups.filter(g => remainingGroups.has(g.id));
      if (state.activeGroupId && !remainingGroups.has(state.activeGroupId)) {
        state.activeGroupId = state.areaGroups.length > 0 ? state.areaGroups[0].id : null;
      }
    },
    // Action pour créer un nouveau groupe
    addAreaGroup: (state, action: PayloadAction<AreaGroup>) => {
      state.areaGroups.push(action.payload);
      state.activeGroupId = action.payload.id;
    },
    // Action pour définir le groupe actif
    setActiveGroupId: (state, action: PayloadAction<string>) => {
      state.activeGroupId = action.payload;
    },
    // Action pour mettre en évidence une longitude
    setHighlightedLon: (state, action: PayloadAction<number | null>) => {
      state.highlightedLon = action.payload;
    },
  },
});

export const { setSelectionMode, addLatitude, removeLatitude, addArea, removeArea, addAreaGroup, setActiveGroupId, setHighlightedLon } =
  selectionSlice.actions;
export default selectionSlice.reducer;