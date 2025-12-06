// src/slices/dataSlice.ts
// Redux slice for fetching and storing temperature anomaly data
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// --- Data Interface ---
export interface AnomalyData {
  year: number;
  lat: number;
  lon: number;
  anomaly: number;
}


// --- State Interface ---
interface DataState {
  allData: AnomalyData[];
  minAnomaly: number;
  maxAnomaly: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}


// --- Initial State ---
const initialState: DataState = {
  allData: [],
  minAnomaly: -2,
  maxAnomaly: 2, 
  status: 'idle',
  error: null,
};


// --- Async Thunk to Fetch and Transform Data ---
export const fetchData = createAsyncThunk('data/fetchData', async () => {
  const response = await fetch('/tempanomaly_4x4grid.json');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const rawData = await response.json();

  // --- Data Transformation Logic ---
  const flatData: AnomalyData[] = [];
  
  // 1. Access the correct array
  const gridCells = rawData.tempanomaly; 

  // 2. Loop through each grid cell (e.g., {lat: -88, lon: -178, data: [...]})
  for (const cell of gridCells) {
    const lat = cell.lat;
    const lon = cell.lon;

    // 3. Loop through each year/value entry (e.g., {"1880": "NA"})
    for (const yearEntry of cell.data) {
      const yearStr = Object.keys(yearEntry)[0];
      const anomalyStr = Object.values(yearEntry)[0] as string;

      // 4. Ignore missing data ("NA")
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

  // 5. Return the flattened array"
  return flatData;
});


// --- Data Slice ---
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
        state.allData = action.payload;

        // --- MIN/MAX CALCULATION LOGIC ADAPTED TO VALUES ---
        if (action.payload.length > 0) {
            // Sort anomalies to find percentiles
            const anomalies = action.payload.map(d => d.anomaly).sort((a, b) => a - b);
            
            // Only consider the 2nd to 98th percentiles for min/max
            // This helps focus the color scale on the majority of the data.
            const lowerIndex = Math.floor(anomalies.length * 0.02);
            const upperIndex = Math.floor(anomalies.length * 0.98);

            // Round to integers for a clean legend
            // Floor for min, Ceil for max to include the range
            let minVal = Math.floor(anomalies[Math.max(0, lowerIndex)]);
            let maxVal = Math.ceil(anomalies[Math.min(anomalies.length - 1, upperIndex)]);

            if (minVal > 0) {
                // If all anomalies are positive, force min to 0
                minVal = 0;
            } else if (Math.abs(maxVal) < Math.abs(minVal)) {
                // If absolute max is smaller than absolute min, symmetrize around 0
                maxVal = Math.abs(minVal);
            } else {
                // Otherwise, symmetrize min around 0
                minVal = -maxVal;
            }

            state.minAnomaly = minVal;
            state.maxAnomaly = maxVal;
            
            // Ensure min and max are not equal to avoid division by zero
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