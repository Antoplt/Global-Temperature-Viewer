// src/components/AnimationControls.tsx
// Component for animation controls in the toolbar

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';


// --- Props Interface ---
interface AnimationControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
}


// --- AnimationControls Component ---
export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  speed,
  onPlay,
  onPause,
  onRestart,
  onSpeedChange
}) => {
  return (
    
    <div className="flex gap-[12px] h-[36px] items-center"> 
      {/* Play/Pause Button */}
      <div 
        className="bg-white relative rounded-[8px] shrink-0 size-[36px] cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center border-[1.6px] border-black"
        onClick={isPlaying ? onPause : onPlay}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-black fill-black" />
        ) : (
          <Play className="w-4 h-4 text-black fill-black ml-0.5" />
        )}
      </div>
      {/* Restart Button */}
      <div 
        className="bg-white relative rounded-[8px] shrink-0 size-[36px] cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center border-[1.6px] border-black"
        onClick={onRestart}
      >
        <RotateCcw className="w-4 h-4 text-black" />
      </div>
      {/* Speed Control with Slider */}
      <div className="flex items-center gap-[12px]" data-name="Container">
        <div className="relative" data-name="Text">
          <p className="font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 text-nowrap whitespace-pre">Speed</p>
        </div>
        <div className="relative w-[80px] flex items-center h-full">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-[4px] bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
        <div className="relative min-w-[20px]" data-name="Text">
          <p className="font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950">{speed}x</p>
        </div>
      </div>
    </div>
  );
};