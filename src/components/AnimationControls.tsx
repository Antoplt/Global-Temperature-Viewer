import React from 'react';
import svgPaths from '../imports/svg-fsqvf8pn71';

interface AnimationControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  speed,
  onPlay,
  onPause,
  onRestart,
  onSpeedChange
}) => {
  return (
    // J'ai réduit le 'gap' pour un meilleur espacement visuel
    <div className="flex gap-[12px] h-[36px] items-center"> 
      {/* Play/Pause Button */}
      {/* L'ancien conteneur 'data-name="Container"' qui incluait le texte a été retiré */}
      <div 
        className="bg-white relative rounded-[8px] shrink-0 size-[36px] cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={isPlaying ? onPause : onPlay}
      >
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-[1.6px] relative size-[36px]">
          <div className="relative shrink-0 size-[16px]" data-name="Icon">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <g id="Icon">
                <path d={svgPaths.p2bb5f600} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      {/* Le <div> avec le texte "Play/Pause" a été supprimé */}


      {/* Restart Button */}
      {/* L'ancien conteneur 'data-name="Container"' qui incluait le texte a été retiré */}
      <div 
        className="bg-white relative rounded-[8px] shrink-0 size-[36px] cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onRestart}
      >
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-[1.6px] relative size-[36px]">
          <div className="relative shrink-0 size-[16px]" data-name="Icon">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <g id="Icon">
                <path d={svgPaths.p12949080} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M2 2V5.33333H5.33333" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      {/* Le <div> avec le texte "Restart" a été supprimé */}


      {/* Speed Control with Slider (Inchangé) */}
      <div className="flex items-center gap-[12px]" data-name="Container">
        <div className="h-[20px] relative" data-name="Text">
          <p className="font-['Arimo:Regular',sans-serif] leading-[20px] text-[14px] text-neutral-950 text-nowrap whitespace-pre">Speed</p>
        </div>
        <div className="relative w-[80px]">
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
        <div className="h-[20px] relative min-w-[20px]" data-name="Text">
          <p className="font-['Arimo:Regular',sans-serif] leading-[20px] text-[14px] text-neutral-950">{speed}x</p>
        </div>
      </div>
    </div>
  );
};