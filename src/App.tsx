import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './stores/store'; 
import { useAppSelector, useAppDispatch } from './hooks/hooks';
import { fetchData } from './slices/dataSlice';
import { MapContainer } from './components/MapContainer';
import { SelectionPanel } from './components/SelectionPanel';
import { GraphView } from './components/GraphView';
import { HistogramView } from './components/HistogramView';
import { HeatmapView } from './components/HeatmapView';
import { Toolbar } from './components/Toolbar';

function AppContent() {
  const dispatch = useAppDispatch();

  
  const dataStatus = useAppSelector((state) => state.data.status);
  const { 
    graph: showGraph, 
    histogram: showHistogram,
    heatmap: showHeatmap 
  } = useAppSelector((state) => state.layout.visibleViews);
  


  useEffect(() => {
    if (dataStatus === 'idle') {
      dispatch(fetchData());
    }
  }, [dataStatus, dispatch]);

  if (dataStatus === 'loading') {
    return <div style={{ padding: '20px' }}>Loading data...</div>; 
  }
  
  if (dataStatus === 'failed') {
    return <div style={{ padding: '20px' }}>Error loading data.</div>;
  }

  return (
    <div className="bg-gray-100 w-screen h-screen overflow-hidden relative" data-name="Global Temperature Viewer App">
      {/* World Map Background */}
      <div className="absolute inset-0 z-0">
        {/* prop 'currentYear' SUPPRIMÉE */}
        <MapContainer /> 
      </div>

      {/* Widgets Container */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Selection Panel - Top Left */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <SelectionPanel />
        </div>

        {/* Graph - Top Right */}
        {showGraph && (
          <div className="absolute top-4 right-4 pointer-events-auto">
            {/* prop 'data' SUPPRIMÉE */}
            <GraphView /> 
          </div>
        )}

        {/* Histogram - Below Graph */}
        {showHistogram && (
          <div className="absolute top-[216px] right-4 pointer-events-auto">
            {/* prop 'data' SUPPRIMÉE */}
            <HistogramView />
          </div>
        )}

        {/* Legend - Bottom Left */}
        {showHeatmap && ( 
           <div className="absolute bottom-[110px] left-4 pointer-events-auto">
             {/* prop 'data' SUPPRIMÉE */}
             <HeatmapView />
           </div>
        )}

        {/* Toolbar - Bottom */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <Toolbar />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}