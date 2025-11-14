import React from 'react';

// 1. Suppression de 'HeatmapViewProps' et de la prop '{ data }'
export const HeatmapView: React.FC = () => {
  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[157.6px] rounded-[10px] w-[128.425px]" data-name="ColorLegend">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="p-[12.8px]">
        {/* Color Legend Items */}
        <div className="space-y-[12px]">
          <ColorLegendItem color="bg-blue-600" label="< -0.5°C" />
          <ColorLegendItem color="bg-blue-400" label="-0.5 to 0°C" />
          <ColorLegendItem color="bg-amber-400" label="0 to 0.5°C" />
          <ColorLegendItem color="bg-orange-500" label="0.5 to 1.0°C" />
          <ColorLegendItem color="bg-red-600" label="> 1.0°C" />
        </div>
      </div>
    </div>
  );
};

const ColorLegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="content-stretch flex gap-[8px] h-[20px] items-center">
    <div className={`${color} h-[16px] relative shrink-0 w-[24px]`} />
    <div className="h-[20px] relative shrink-0">
      <p className="font-['Arimo:Regular',sans-serif] leading-[20px] text-[14px] text-neutral-950 text-nowrap whitespace-pre">{label}</p>
    </div>
  </div>
);