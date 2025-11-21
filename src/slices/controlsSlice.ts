import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ControlsState {
  currentYear: number;
  isPlaying: boolean;
  animationSpeed: number; // ex: 1 = 1x, 2 = 2x
}

const initialState: ControlsState = {
  currentYear: 1880, // Année de début par défaut, à ajuster
  isPlaying: false,
  animationSpeed: 1,
};

const controlsSlice = createSlice({
  name: 'controls',
  initialState,
  reducers: {
    setCurrentYear: (state, action: PayloadAction<number>) => {
      state.currentYear = action.payload;
    },
    togglePlaying: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setAnimationSpeed: (state, action: PayloadAction<number>) => {
      state.animationSpeed = action.payload;
    },    
    incrementYear: (state) => {
      state.currentYear += 1; 
    }
  },
});

export const { setCurrentYear, togglePlaying, setAnimationSpeed, incrementYear } = controlsSlice.actions;
export default controlsSlice.reducer;