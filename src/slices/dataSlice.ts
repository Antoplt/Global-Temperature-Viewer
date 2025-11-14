import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// C'est le format "plat" que l'application ATTEND
export interface AnomalyData {
  year: number;
  lat: number;
  lon: number;
  anomaly: number;
}

// L'état reste le même
interface DataState {
  allData: AnomalyData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DataState = {
  allData: [],
  status: 'idle',
  error: null,
};

// Le Thunk est maintenant beaucoup plus intelligent
export const fetchData = createAsyncThunk('data/fetchData', async () => {
  const response = await fetch('/tempanomaly_4x4grid.json');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const rawData = await response.json();

  // --- LOGIQUE DE TRANSFORMATION ---
  const flatData: AnomalyData[] = [];
  
  // 1. Accéder au bon tableau
  const gridCells = rawData.tempanomaly; 

  // 2. Boucler sur chaque cellule de la grille (ex: {lat: -88, lon: -178, data: [...]})
  for (const cell of gridCells) {
    const lat = cell.lat;
    const lon = cell.lon;

    // 3. Boucler sur chaque entrée année/valeur (ex: {"1880": "NA"})
    for (const yearEntry of cell.data) {
      const yearStr = Object.keys(yearEntry)[0];
      const anomalyStr = Object.values(yearEntry)[0] as string;

      // 4. Ignorer les données manquantes ("NA")
      if (anomalyStr !== 'NA') {
        flatData.push({
          year: parseInt(yearStr, 10),
          lat: lat,
          lon: lon,
          anomaly: parseFloat(anomalyStr),
        });
      }
    }
  }

  // 5. Retourner le grand tableau "plat"
  return flatData;
});

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 'action.payload' est maintenant le tableau plat que nous avons construit
        state.allData = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default dataSlice.reducer;