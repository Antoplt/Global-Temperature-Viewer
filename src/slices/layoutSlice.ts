import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VisibleViews {
  graph: boolean;
  histogram: boolean;
  heatmap: boolean;
  // Ajoutez d'autres vues si nécessaire
}

interface LayoutState {
  visibleViews: VisibleViews;
}

const initialState: LayoutState = {
  visibleViews: {
    graph: true,
    histogram: true,
    heatmap: true, // Modifié pour correspondre à votre App.tsx (HeatmapView est affichée)
  },
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleView: (state, action: PayloadAction<keyof VisibleViews>) => {
      const view = action.payload;
      state.visibleViews[view] = !state.visibleViews[view];
    },
    setViewVisibility: (
      state,
      action: PayloadAction<{ view: keyof VisibleViews; isVisible: boolean }>
    ) => {
      const { view, isVisible } = action.payload;
      state.visibleViews[view] = isVisible;
    },
  },
});

export const { toggleView, setViewVisibility } = layoutSlice.actions;
export default layoutSlice.reducer;