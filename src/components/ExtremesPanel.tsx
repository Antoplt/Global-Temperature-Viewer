import React, { useMemo } from 'react';
import { useAppSelector } from '../hooks/hooks';

export const ExtremesPanel: React.FC = () => {
  const { allData } = useAppSelector((state) => state.data);
  const { currentYear } = useAppSelector((state) => state.controls);

  const extremes = useMemo(() => {
    if (!allData || allData.length === 0) return { top5: [], flop5: [] };

    const yearData = allData.filter((d) => d.year === currentYear);
    
    // Sort descending for hottest
    const sortedDesc = [...yearData].sort((a, b) => b.anomaly - a.anomaly);
    const top5 = sortedDesc.slice(0, 5);

    // Sort ascending for coldest
    const sortedAsc = [...yearData].sort((a, b) => a.anomaly - b.anomaly);
    const flop5 = sortedAsc.slice(0, 5);

    return { top5, flop5 };
  }, [allData, currentYear]);

  if (!allData.length) return <div className="p-4 text-sm">Loading data...</div>;

  return (
    <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px] size-full overflow-hidden" data-name="ExtremesPanel">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] z-10" />
      
      <div className="p-3 h-full overflow-hidden font-sans relative z-0 flex flex-col">
        <h3 className="font-bold mb-2 text-center text-xs uppercase tracking-wider text-gray-800 shrink-0">Extremes ({currentYear})</h3>
        
        <div className="flex gap-2 overflow-hidden h-full pl-12">
          {/* Hottest Column */}
          <div className="flex-1 overflow-auto">
            <h4 className="font-semibold text-[10px] text-red-600 border-b border-red-200 mb-1 pb-0.5 flex items-center gap-1 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <span className="text-sm">🔥</span> 
              <span className="uppercase tracking-wide">Hottest</span>
            </h4>
            <ul className="space-y-1">
              {extremes.top5.map((d, i) => (
                <li key={i} className="flex flex-col gap-0.5 text-[10px] bg-red-50/50 p-1 rounded border border-red-100 hover:bg-red-50 transition-colors">
                  <span className="font-medium text-gray-700 truncate">Lat:{d.lat} Lon:{d.lon}</span>
                  <span className="font-mono font-bold text-red-600 bg-white px-1 py-0 rounded border border-red-100 self-start text-[9px]">
                    +{d.anomaly.toFixed(2)}°C
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coldest Column */}
          <div className="flex-1 overflow-auto">
            <h4 className="font-semibold text-[10px] text-blue-600 border-b border-blue-200 mb-1 pb-0.5 flex items-center gap-1 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <span className="text-sm">❄️</span> 
              <span className="uppercase tracking-wide">Coldest</span>
            </h4>
            <ul className="space-y-1">
              {extremes.flop5.map((d, i) => (
                <li key={i} className="flex flex-col gap-0.5 text-[10px] bg-blue-50/50 p-1 rounded border border-blue-100 hover:bg-blue-50 transition-colors">
                  <span className="font-medium text-gray-700 truncate">Lat:{d.lat} Lon:{d.lon}</span>
                  <span className="font-mono font-bold text-blue-600 bg-white px-1 py-0 rounded border border-blue-100 self-start text-[9px]">
                    {d.anomaly.toFixed(2)}°C
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
