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
import { ColorLegend } from './components/ColorLegend';
import { Toolbar } from './components/Toolbar';
import { DraggableWindow } from './components/DraggableWindow';

function AppContent() {
  const dispatch = useAppDispatch();

  
  const dataStatus = useAppSelector((state) => state.data.status);
  const { 
    graph: showGraph, 
    histogram: showHistogram,
    heatmap: showHeatmap,
    heatmapView: showHeatmapView
  } = useAppSelector((state) => state.layout.visibleViews);
  
  const viewPositions = useAppSelector((state) => state.layout.viewPositions);


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
          {/* Left Column Container */}
          <div className="absolute top-4 left-4 bottom-4 flex flex-col justify-between w-[250px]">
            {/* Selection Panel - Top Left */}
            <div className="pointer-events-auto">
              <SelectionPanel />
            </div>
          </div>

          {/* Draggable Windows */}
          {showGraph && (
            <DraggableWindow id="graph" initialPosition={viewPositions.graph}>
              <GraphView />
            </DraggableWindow>
          )}
          
          {showHistogram && (
            <DraggableWindow id="histogram" initialPosition={viewPositions.histogram}>
              <HistogramView />
            </DraggableWindow>
          )}
          
          {showHeatmap && (
            <DraggableWindow id="legend" initialPosition={viewPositions.legend}>
              <ColorLegend />
            </DraggableWindow>
          )}

          {showHeatmapView && (
            <DraggableWindow id="heatmapView" initialPosition={viewPositions.heatmapView} width={600} height={400}>
              <HeatmapView />
            </DraggableWindow>
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