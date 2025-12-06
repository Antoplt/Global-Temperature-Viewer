// src/slices/selectionSlice.ts
// Redux slice for managing user selections of latitudes and areas
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// Types for selection modes
export type SelectionMode = 'latitude' | 'area' | 'move' | 'none';


// Predefined line colors for latitudes
export const LINE_COLORS = ["#DC2626", "#2563EB", "#F97316", "#16A34A", "#9333EA"];


// Selected latitude interface
export interface SelectedLatitude {
  id: string;
  value: number;
  color: string;
}


// Group of areas
export interface AreaGroup {
  id: string;
  name: string;
  color: string;
  isVisibleInGraph: boolean; 
}


// Definition of a selection rectangle
export interface SelectionRectangle {
  id: string;
  groupId: string; 
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}


// --- State Interface ---
interface SelectionState {
  selectionMode: SelectionMode;
  selectedLatitudes: SelectedLatitude[];
  areaGroups: AreaGroup[];
  selectedAreas: SelectionRectangle[];
  activeGroupId: string | null; 
  highlightedLon: number | null; 
}


// --- Initial State ---
const initialState: SelectionState = {
  selectionMode: 'none',
  selectedLatitudes: [],
  areaGroups: [],
  selectedAreas: [],
  activeGroupId: null,
  highlightedLon: null,
};


// --- Selection Slice ---
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

    // Action to remove a latitude
    removeLatitude: (state, action: PayloadAction<number>) => {
      state.selectedLatitudes = state.selectedLatitudes.filter(
        (lat) => lat.value !== action.payload
      );
    },
    
    // Action to add an area
    addArea: (state, action: PayloadAction<SelectionRectangle>) => {
      state.selectedAreas.push(action.payload);
    },
    
    // Action to remove an area by its ID
    removeArea: (state, action: PayloadAction<string>) => {
      state.selectedAreas = state.selectedAreas.filter(
        (area) => area.id !== action.payload
      );
      
      const remainingGroups = new Set(state.selectedAreas.map(a => a.groupId));
      state.areaGroups = state.areaGroups.filter(g => remainingGroups.has(g.id));
      if (state.activeGroupId && !remainingGroups.has(state.activeGroupId)) {
        state.activeGroupId = state.areaGroups.length > 0 ? state.areaGroups[0].id : null;
      }
    },

    // Action to create a new group
    addAreaGroup: (state, action: PayloadAction<Omit<AreaGroup, 'isVisibleInGraph'>>) => {
      const newGroup: AreaGroup = {
        ...action.payload,
        isVisibleInGraph: true, 
      };
      state.areaGroups.push(newGroup);
      state.activeGroupId = action.payload.id;
    },
    
    // Action to set the active group
    setActiveGroupId: (state, action: PayloadAction<string>) => {
      state.activeGroupId = action.payload;
    },
    
    // Action to highlight a longitude
    setHighlightedLon: (state, action: PayloadAction<number | null>) => {
      state.highlightedLon = action.payload;
    },

    // Action to toggle the visibility of a group on the graph
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