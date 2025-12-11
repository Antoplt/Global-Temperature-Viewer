// src/slices/layoutSlice.ts
// Redux slice for managing layout views and their positions
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// --- Position Interface ---
export interface Position {
  x: number;
  y: number;
}


// --- State Interface ---
interface LayoutState {
  visibleViews: {
    graph: boolean;
    histogram: boolean;
    colorLegend: boolean; 
    heatmapView: boolean;
    extremes: boolean;
  };
  viewPositions: {
    graph: Position;
    histogram: Position;
    colorLegend: Position;
    heatmapView: Position;
  };
}


// --- Initial State ---
const initialState: LayoutState = {
  visibleViews: {
    graph: true,
    histogram: true,
    colorLegend: true, 
    heatmapView: false,
    extremes: true,
  },
  viewPositions: {
    graph: { x: window.innerWidth - 400, y: 20 },
    histogram: { x: window.innerWidth - 400, y: 240 },
    colorLegend: { x: 20, y: window.innerHeight - 350 },
    heatmapView: { x: 20, y: 20 },
  }
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleView: (state, action: PayloadAction<keyof LayoutState['visibleViews']>) => {
      const view = action.payload;
      state.visibleViews[view] = !state.visibleViews[view];
    },
    updateViewPosition: (state, action: PayloadAction<{ id: keyof LayoutState['viewPositions']; position: Position }>) => {
      const { id, position } = action.payload;
      state.viewPositions[id] = position;
    },
  },
});

export const { toggleView, updateViewPosition } = layoutSlice.actions;
export default layoutSlice.reducer;