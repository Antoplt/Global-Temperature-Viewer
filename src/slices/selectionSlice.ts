import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types pour les sélections
export type SelectionMode = 'latitude' | 'area' | 'move' | 'none';

export const LINE_COLORS = ["#DC2626", "#2563EB", "#F97316", "#16A34A", "#9333EA"];

export interface SelectedLatitude {
  id: string;
  value: number;
  color: string;
}

// Un groupe de zones
export interface AreaGroup {
  id: string;
  name: string;
  color: string;
  isVisibleInGraph: boolean; // Ajout pour contrôler la visibilité sur le graphique
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
  selectedLatitudes: SelectedLatitude[];
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
      const latValue = action.payload;
      if (!state.selectedLatitudes.some(l => l.value === latValue)) {
        // Assign a color that isn't used by the immediately preceding latitudes if possible, 
        // or just cycle through. To ensure stability, we just pick based on current length.
        // Even if we sort later, this object keeps its color.
        const color = LINE_COLORS[state.selectedLatitudes.length % LINE_COLORS.length];
        
        state.selectedLatitudes.push({
          id: new Date().toISOString(),
          value: latValue,
          color: color
        });
        
        // We can sort by value so the list looks ordered, but the color is now fixed to the object.
        state.selectedLatitudes.sort((a, b) => b.value - a.value);
      }
    },
    removeLatitude: (state, action: PayloadAction<number>) => {
      state.selectedLatitudes = state.selectedLatitudes.filter(
        (lat) => lat.value !== action.payload
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
    addAreaGroup: (state, action: PayloadAction<Omit<AreaGroup, 'isVisibleInGraph'>>) => {
      const newGroup: AreaGroup = {
        ...action.payload,
        isVisibleInGraph: true, // Toujours visible par défaut
      };
      state.areaGroups.push(newGroup);
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
    // Action pour basculer la visibilité d'un groupe sur le graphique
    toggleGroupVisibility: (state, action: PayloadAction<string>) => {
      const group = state.areaGroups.find(g => g.id === action.payload);
      if (group) {
        group.isVisibleInGraph = !group.isVisibleInGraph;
      }
    },
  },
});

export const { setSelectionMode, addLatitude, removeLatitude, addArea, removeArea, addAreaGroup, setActiveGroupId, setHighlightedLon, toggleGroupVisibility } =
  selectionSlice.actions;
export default selectionSlice.reducer;