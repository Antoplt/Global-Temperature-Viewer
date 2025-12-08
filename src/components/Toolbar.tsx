//src/components/Toolbar.tsx
// Toolbar component with time slider, animation controls, and view toggles
import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks'; 
import { setCurrentYear, togglePlaying, setAnimationSpeed } from '../slices/controlsSlice';
import { toggleView } from '../slices/layoutSlice';
import { TimeSlider } from './TimeSlider';
import { AnimationControls } from './AnimationControls';
import { ViewToggles } from './ViewToggles';


// --- Constants for year range ---
const MIN_YEAR = 1880;
const MAX_YEAR = 2024;


// --- Toolbar Component ---
export const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Retrieve necessary state from the store
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const isPlaying = useAppSelector((state) => state.controls.isPlaying);
  const speed = useAppSelector((state) => state.controls.animationSpeed);
  const showGraph = useAppSelector((state) => state.layout.visibleViews.graph);
  const showHistogram = useAppSelector((state) => state.layout.visibleViews.histogram);
  const showColorLegend = useAppSelector((state) => state.layout.visibleViews.colorLegend);
  const showHeatmapView = useAppSelector((state) => state.layout.visibleViews.heatmapView);
  const showExtremesPanel = useAppSelector((state) => state.layout.visibleViews.extremesPanel);

 
  const animationStartYearRef = useRef(currentYear);

  // --- Animation Logic ---
  useEffect(() => {
    // If isPlaying is false, do nothing.
    if (!isPlaying) {
      return;
    }

    // Calculate the interval in milliseconds based on the speed.
    // Speed 1 = 1s, Speed 2 = 0.5s, etc.
    const interval = 1000 / speed;

    const timer = setInterval(() => {
      dispatch(setCurrentYear(currentYear >= MAX_YEAR ? MIN_YEAR : currentYear + 1));
    }, interval);

    // Cleanup function: called when the component is unmounted or when dependencies (isPlaying, speed) change.
    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, speed, currentYear, dispatch]); 
  const handleYearChange = (year: number) => {
    dispatch(setCurrentYear(year));
  };

  const handlePlay = () => {
    // If not currently playing, memorize the current year as the starting point.
    if (!isPlaying) {
      animationStartYearRef.current = currentYear;
    }
    dispatch(togglePlaying());
  };

  const handlePause = () => {
    // The same action toggles the isPlaying state
    dispatch(togglePlaying());
  };

  const handleRestart = () => {
    // If the current year is already at the animation start point,
    // a second click resets to the very first year.
    if (currentYear === animationStartYearRef.current) {
      dispatch(setCurrentYear(MIN_YEAR));
    } else {
      // Otherwise, the first click brings back to the start of the animation.
      dispatch(setCurrentYear(animationStartYearRef.current));
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    dispatch(setAnimationSpeed(newSpeed));
  };

  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[69.6px] relative rounded-[10px] w-full max-w-[1200px] mx-auto">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border flex h-full items-center px-[16.8px] w-full gap-[24px]">
          
          {/* TimeSlider */}
          <div className="flex-1 pointer-events-auto">
            <TimeSlider 
              currentYear={currentYear} 
              onYearChange={handleYearChange} 
            />
          </div>
          
          {/* AnimationControls */}
          <div className="flex-shrink-0 pointer-events-auto">
            <AnimationControls
              isPlaying={isPlaying}
              speed={speed}
              onPlay={handlePlay}
              onPause={handlePause}
              onRestart={handleRestart}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          {/* ViewToggles  */}
          <div className="flex-shrink-0 ml-auto pointer-events-auto">
            <ViewToggles
              showGraph={showGraph}
              showHistogram={showHistogram}
              showColorLegend={showColorLegend}
              showHeatmapView={showHeatmapView}
              showExtremesPanel={showExtremesPanel}
              onToggleGraph={() => dispatch(toggleView('graph'))}
              onToggleHistogram={() => dispatch(toggleView('histogram'))}
              onToggleColorLegend={() => dispatch(toggleView('colorLegend'))}
              onToggleHeatmapView={() => dispatch(toggleView('heatmapView'))}
              onToggleExtremesPanel={() => dispatch(toggleView('extremesPanel'))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};