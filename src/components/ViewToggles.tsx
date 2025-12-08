// src/components/ViewToggles.tsx
// Component for toggling visibility of different views in the toolbar
import React from 'react';
import svgPaths from '../imports/svg-fsqvf8pn71';


// --- Props Interface ---
interface ViewTogglesProps {
  showGraph: boolean;
  showHistogram: boolean;
  showColorLegend: boolean;
  showHeatmapView: boolean;
  showExtremesPanel: boolean;
  onToggleGraph: () => void;
  onToggleHistogram: () => void;
  onToggleColorLegend: () => void;
  onToggleHeatmapView: () => void;
  onToggleExtremesPanel: () => void;
}


// --- ViewToggles Component ---
export const ViewToggles: React.FC<ViewTogglesProps> = ({
  showGraph,
  showHistogram,
  showColorLegend,
  showHeatmapView,
  showExtremesPanel,
  onToggleGraph,
  onToggleHistogram,
  onToggleColorLegend,
  onToggleHeatmapView,
  onToggleExtremesPanel,
}) => {
  
  const ToggleItem = ({ label, checked, onToggle }: { label: string, checked: boolean, onToggle: () => void }) => (
    <div className="flex items-center gap-[8px] cursor-pointer" onClick={onToggle}>
      <div 
        className={`relative rounded-[4px] shrink-0 size-[16px] ${checked ? 'bg-[#030213]' : 'bg-[#f3f3f5]'}`}
      >
        <div aria-hidden="true" className="absolute border-[#030213] border-[1.6px] border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
        {checked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-[12.8px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
                <g id="Icon">
                  <path d={svgPaths.p8b49980} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.06667" />
                </g>
              </svg>
            </div>
          </div>
        )}
      </div>
      <p className="font-['Arimo:Regular',sans-serif] text-[14px] text-neutral-950 whitespace-nowrap select-none">{label}</p>
    </div>
  );

  return (
    <div className="flex gap-[16px] items-center" data-name="Container">
      <ToggleItem label="Graph" checked={showGraph} onToggle={onToggleGraph} />
      <ToggleItem label="Histogram" checked={showHistogram} onToggle={onToggleHistogram} />
      <ToggleItem label="Color Legend" checked={showColorLegend} onToggle={onToggleColorLegend} />
      <ToggleItem label="Heatmap" checked={showHeatmapView} onToggle={onToggleHeatmapView} />
      <ToggleItem label="Extremes" checked={showExtremesPanel} onToggle={onToggleExtremesPanel} />
    </div>
  );
};
