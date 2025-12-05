import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Position {
  x: number;
  y: number;
}

interface LayoutState {
  visibleViews: {
    graph: boolean;
    histogram: boolean;
    heatmap: boolean; // 'heatmap' contrôle la visibilité de la légende
    heatmapView: boolean;
  };
  viewPositions: {
    graph: Position;
    histogram: Position;
    legend: Position;
    heatmapView: Position;
  };
}

const initialState: LayoutState = {
  visibleViews: {
    graph: true,
    histogram: true,
    heatmap: true, 
    heatmapView: false,
  },
  viewPositions: {
    graph: { x: window.innerWidth - 400, y: 20 },
    histogram: { x: window.innerWidth - 400, y: 240 },
    legend: { x: 20, y: window.innerHeight - 240 },
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