// src/slices/controlsSlice.ts
// Redux slice for controlling the current year, animation state, and speed
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


// --- State Interface ---
interface ControlsState {
  currentYear: number;
  isPlaying: boolean;
  animationSpeed: number; 
}


// --- Initial State ---
const initialState: ControlsState = {
  currentYear: 1880, 
  isPlaying: false,
  animationSpeed: 1,
};


// --- Controls Slice ---
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