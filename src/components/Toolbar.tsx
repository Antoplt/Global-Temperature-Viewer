import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks'; // Chemin corrigé
import { 
  setCurrentYear, 
  togglePlaying, 
  setAnimationSpeed 
} from '../slices/controlsSlice';
import { toggleView } from '../slices/layoutSlice';
import { TimeSlider } from './TimeSlider';
import { AnimationControls } from './AnimationControls';
import { ViewToggles } from './ViewToggles';

export const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const isPlaying = useAppSelector((state) => state.controls.isPlaying);
  const speed = useAppSelector((state) => state.controls.animationSpeed);
  const showGraph = useAppSelector((state) => state.layout.visibleViews.graph);
  const showHistogram = useAppSelector((state) => state.layout.visibleViews.histogram);

  const handleYearChange = (year: number) => {
    dispatch(setCurrentYear(year));
  };

  const handlePlay = () => {
    dispatch(togglePlaying());
  };

  const handlePause = () => {
    dispatch(togglePlaying());
  };

  const handleRestart = () => {
    dispatch(setCurrentYear(1880)); // Assurez-vous que c'est bien votre MIN_YEAR
  };

  const handleSpeedChange = (newSpeed: number) => {
    dispatch(setAnimationSpeed(newSpeed));
  };

  const handleToggleGraph = () => {
    dispatch(toggleView('graph'));
  };

  const handleToggleHistogram = () => {
    dispatch(toggleView('histogram'));
  };

  return (
    // --- CHANGEMENT 1 : max-w-[1000px] -> max-w-[1200px] ---
    <div className="bg-[rgba(255,255,255,0.95)] h-[69.6px] relative rounded-[10px] w-full max-w-[1200px] mx-auto">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border flex h-full items-center px-[16.8px] w-full gap-[24px]">
          
          {/* --- CHANGEMENT 2 : max-w-[400px] -> max-w-[600px] --- */}
          <div className="flex-1 max-w-[600px] pointer-events-auto">
            <TimeSlider 
              currentYear={currentYear} 
              onYearChange={handleYearChange} 
            />
          </div>
          
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
          <div className="flex-shrink-0 ml-auto pointer-events-auto">
            <ViewToggles
              showGraph={showGraph}
              showHistogram={showHistogram}
              onToggleGraph={handleToggleGraph}
              onToggleHistogram={handleToggleHistogram}
            />
          </div>
        </div>
      </div>
    </div>
  );
};