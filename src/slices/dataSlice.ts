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
  minAnomaly: number;
  maxAnomaly: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DataState = {
  allData: [],
  minAnomaly: -2,
  maxAnomaly: 2, // valeurs par défaut
  status: 'idle',
  error: null,
};


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

        // --- LOGIQUE DE CALCUL MIN/MAX ADAPTEE AUX VALEURS ---
        if (action.payload.length > 0) {
            // On extrait toutes les anomalies et on les trie
            const anomalies = action.payload.map(d => d.anomaly).sort((a, b) => a - b);
            
            // On prend les valeurs à 2% et 98% pour exclure les "outliers"
            // Cela permet de concentrer l'échelle de couleur sur la majorité des données.
            const lowerIndex = Math.floor(anomalies.length * 0.02);
            const upperIndex = Math.floor(anomalies.length * 0.98);

            // On arrondit à l'entier pour une légende propre
            // Floor pour le min, Ceil pour le max afin d'inclure la plage
            let minVal = Math.floor(anomalies[Math.max(0, lowerIndex)]);
            let maxVal = Math.ceil(anomalies[Math.min(anomalies.length - 1, upperIndex)]);

            if (minVal > 0) {
                // Si toutes les anomalies sont positives, on force le min à 0
                minVal = 0;
            } else if (Math.abs(maxVal) < Math.abs(minVal)) {
                // Si le max absolu est plus petit que le min absolu, on symétrise autour de 0
                maxVal = Math.abs(minVal);
            } else {
                // Sinon, on symétrise le min autour de 0
                minVal = -maxVal;
            }

            state.minAnomaly = minVal;
            state.maxAnomaly = maxVal;
            
            // Sécurité : si min/max sont trop proches (ex: 0 et 0), on force un écart minimum
            if (state.minAnomaly === state.maxAnomaly) {
                state.minAnomaly -= 1;
                state.maxAnomaly += 1;
            }
        }
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default dataSlice.reducer;