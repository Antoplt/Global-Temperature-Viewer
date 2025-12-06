// src/components/HistogramView.tsx
// Component to display the temperature anomaly histogram over longitudes for selected latitudes
import React, { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { scaleBand, scaleLinear } from 'd3-scale';
import { group, mean } from 'd3-array';
import { setHighlightedLon } from '../slices/selectionSlice';


// --- Constants for dimensions ---
const MARGIN = { top: 10, right: 10, bottom: 30, left: 50 };


// --- Temperature range for Y axis ---
const MIN_TEMP = -4;
const MAX_TEMP = 4;


// --- Props Interface ---
interface HistogramViewProps {
  width?: number;
  height?: number;
}


// --- HistogramView Component ---
export const HistogramView: React.FC<HistogramViewProps> = ({ width = 360, height = 200 }) => {
  const CHART_WIDTH = Math.max(0, width - MARGIN.left - MARGIN.right);
  const CHART_HEIGHT = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  // Data retrieval from store 
  const dispatch = useAppDispatch();
  const { allData, status } = useAppSelector((state) => state.data);
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const { selectedLatitudes, highlightedLon } = useAppSelector((state) => state.selection);

  // Calculation of data for the histogram (memoized) 
  const histogramData = useMemo(() => {
    if (status !== 'succeeded' || selectedLatitudes.length === 0) {
      return [];
    }

    // Filter data for the current year and selected latitudes
    const availableLats = [...new Set(allData.map(d => d.lat))];
    const closestLats = selectedLatitudes.map(sl => 
      availableLats.reduce((prev, curr) => 
        Math.abs(curr - sl.value) < Math.abs(prev - sl.value) ? curr : prev
      )
    );

    const filteredData = allData.filter(d => 
      d.year === currentYear && closestLats.includes(d.lat)
    );

    // Group by longitude and calculate mean anomaly
    const groupedByLon = group(filteredData, d => d.lon);
    
    const data = Array.from(groupedByLon, ([lon, values]) => ({
      lon,
      meanAnomaly: mean(values, d => d.anomaly) || 0,
    }));

    // Sort by longitude for correct display
    return data.sort((a, b) => a.lon - b.lon);

  }, [allData, currentYear, selectedLatitudes, status]);

  // Creation of D3 scales for axes
  const xScale = scaleBand()
    .domain(histogramData.map(d => d.lon.toString()))
    .range([0, CHART_WIDTH])
    .padding(0.2);

  const yScale = scaleLinear()
    .domain([MIN_TEMP, MAX_TEMP])
    .range([CHART_HEIGHT, 0]);

  const handleBarClick = (lon: number) => {
    // Toggle highlight on clicked longitude
    if (highlightedLon === lon) {
      dispatch(setHighlightedLon(null));
    } else {
      dispatch(setHighlightedLon(lon));
    }
  };
  // If no latitude is selected, display a help message.
  if (selectedLatitudes.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px] flex items-center justify-center p-4" style={{ width, height }}>
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-lg" />
        <p className="text-center text-gray-500 font-sans">Select one or more latitudes on the map to display the histogram.</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px]" style={{ width, height }} data-name="TemperatureHistogram">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Y-axis labels */}
            {yScale.ticks(5).map(tickValue => (
              <g key={tickValue} transform={`translate(0, ${yScale(tickValue)})`}>
                <text x="-5" y="3" textAnchor="end" className="text-[8px] fill-gray-600 font-sans">
                  {tickValue}°
                </text>
                <line x1="0" x2={CHART_WIDTH} stroke={tickValue === 0 ? "#888" : "#EEE"} strokeWidth={tickValue === 0 ? 1 : 0.5} />
              </g>
            ))}
            
            {/* X-axis labels */}
            <text x={CHART_WIDTH / 2} y={CHART_HEIGHT + 25} textAnchor="middle" className="text-[10px] fill-gray-700 font-sans font-bold">
              Longitude
            </text>
            <text transform={`rotate(-90)`} x={-CHART_HEIGHT / 2} y={-MARGIN.left + 10} textAnchor="middle" className="text-[10px] fill-gray-700 font-sans font-bold">
              Anomaly (°C)
            </text>

            {/* Histogram bars */}
            {histogramData.map(({ lon, meanAnomaly }) => {
              const isHighlighted = lon === highlightedLon;
              return (
                <rect
                  key={lon}
                  x={xScale(lon.toString())}
                  y={yScale(Math.max(0, meanAnomaly))}
                  width={xScale.bandwidth()}
                  height={Math.abs(yScale(meanAnomaly) - yScale(0))}
                  fill={meanAnomaly > 0 ? "#F97316" : "#2563EB"}
                  onClick={() => handleBarClick(lon)}
                  className="cursor-pointer"
                  stroke={isHighlighted ? '#0A0A0A' : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};