import React from 'react';
import svgPaths from '../imports/svg-fsqvf8pn71';

interface ViewTogglesProps {
  showGraph: boolean;
  showHistogram: boolean;
  showHeatmap: boolean;
  onToggleGraph: () => void;
  onToggleHistogram: () => void;
  onToggleHeatmap: () => void;
}

export const ViewToggles: React.FC<ViewTogglesProps> = ({
  showGraph,
  showHistogram,
  showHeatmap,
  onToggleGraph,
  onToggleHistogram,
  onToggleHeatmap,
}) => {
  return (
    <div className="content-stretch flex gap-[16px] h-[20px] items-center" data-name="Container">
      {/* Graph Toggle */}
      <div className="h-[20px] relative shrink-0 w-[61.75px]" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center relative w-[61.75px]">
          <div 
            className={`relative rounded-[4px] shrink-0 size-[16px] cursor-pointer ${showGraph ? 'bg-[#030213]' : 'bg-[#f3f3f5]'}`}
            onClick={onToggleGraph}
          >
            <div aria-hidden="true" className="absolute border-[#030213] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
            {showGraph && (
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start p-[1.6px] relative size-[16px]">
                <div className="content-stretch flex h-[14px] items-center justify-center relative shrink-0 w-full">
                  <div className="relative shrink-0 size-[12.8px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                      <g id="Icon">
                        <path d={svgPaths.p8b49980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.06667" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0">
            <p className="absolute font-['Arimo:Regular',sans-serif] leading-[20px] left-0 text-[14px] text-neutral-950 text-nowrap top-[-1.2px] whitespace-pre">Graph</p>
          </div>
        </div>
      </div>

      {/* Histogram Toggle */}
      <div className="h-[20px] relative shrink-0 w-[88.513px]" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center relative w-[88.513px]">
          <div 
            className={`relative rounded-[4px] shrink-0 size-[16px] cursor-pointer ${showHistogram ? 'bg-[#030213]' : 'bg-[#f3f3f5]'}`}
            onClick={onToggleHistogram}
          >
            <div aria-hidden="true" className="absolute border-[#030213] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
            {showHistogram && (
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start p-[1.6px] relative size-[16px]">
                <div className="content-stretch flex h-[14px] items-center justify-center relative shrink-0 w-full">
                  <div className="relative shrink-0 size-[12.8px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                      <g id="Icon">
                        <path d={svgPaths.p8b49980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.06667" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0">
            <p className="absolute font-['Arimo:Regular',sans-serif] leading-[20px] left-0 text-[14px] text-neutral-950 text-nowrap top-[-1.2px] whitespace-pre">Histogram</p>
          </div>
        </div>
      </div>

      {/* Color Legend Toggle */}
      <div className="h-[20px] relative shrink-0 w-[100px]" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[20px] items-center relative w-[100px]">
          <div 
            className={`relative rounded-[4px] shrink-0 size-[16px] cursor-pointer ${showHeatmap ? 'bg-[#030213]' : 'bg-[#f3f3f5]'}`}
            onClick={onToggleHeatmap}
          >
            <div aria-hidden="true" className="absolute border-[#030213] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
            {showHeatmap && (
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start p-[1.6px] relative size-[16px]">
                <div className="content-stretch flex h-[14px] items-center justify-center relative shrink-0 w-full">
                  <div className="relative shrink-0 size-[12.8px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                      <g id="Icon"><path d={svgPaths.p8b49980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.06667" /></g>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="font-['Arimo:Regular',sans-serif] leading-[20px] text-[14px] text-neutral-950 text-nowrap whitespace-pre">Color Legend</p>
        </div>
      </div>
    </div>
  );
};
