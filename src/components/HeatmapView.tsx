// src/components/HeatmapView.tsx
// Component to display the heatmap of temperature anomalies over years and latitudes
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { scaleLinear } from 'd3-scale';
import { setCurrentYear } from '../slices/controlsSlice';
import { addLatitude } from '../slices/selectionSlice';
import { getTemperatureColor } from './ColorLegend';

// --- Constants for dimensions ---
const MARGIN = { top: 15, right: 15, bottom: 35, left: 40 };

const MIN_YEAR = 1880;
const MAX_YEAR = 2024;
const MIN_LAT = -90;
const MAX_LAT = 90;


// --- Props Interface ---
interface HeatmapViewProps {
  width?: number;
  height?: number;
}


// --- HeatmapView Component ---
export const HeatmapView: React.FC<HeatmapViewProps> = ({ width = 600, height = 400 }) => {
  const CHART_WIDTH = Math.max(0, width - MARGIN.left - MARGIN.right);
  const CHART_HEIGHT = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const dispatch = useAppDispatch();
  const { allData, status, minAnomaly, maxAnomaly } = useAppSelector((state) => state.data);
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const { selectedLatitudes } = useAppSelector((state) => state.selection);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ year: number; lat: number } | null>(null);

  // --- Data Aggregation ---
  const aggregatedData = useMemo(() => {
    if (status !== 'succeeded' || !allData) return null;

    // Group by Year -> Lat -> Average Anomaly
    const dataMap = new Map<number, Map<number, { sum: number; count: number }>>();

    // Aggregate data by year and latitude
    allData.forEach(d => {
      if (!dataMap.has(d.year)) {
        dataMap.set(d.year, new Map());
      }
      const yearMap = dataMap.get(d.year)!;
      
      if (!yearMap.has(d.lat)) {
        yearMap.set(d.lat, { sum: 0, count: 0 });
      }
      const latEntry = yearMap.get(d.lat)!;
      latEntry.sum += d.anomaly;
      latEntry.count += 1;
    });

    // Convert to array for easier rendering
    // Array of { year, lat, anomaly }
    const result: { year: number; lat: number; anomaly: number }[] = [];
    dataMap.forEach((yearMap, year) => {
      yearMap.forEach((entry, lat) => {
        result.push({
          year,
          lat,
          anomaly: entry.sum / entry.count
        });
      });
    });

    return result;
  }, [allData, status]);
  

  // Unique latitudes for hover calculations
  const uniqueLats = useMemo(() => {
    if (!aggregatedData) return [];
    const lats = new Set(aggregatedData.map(d => d.lat));
    return Array.from(lats).sort((a, b) => a - b);
  }, [aggregatedData]);


  // --- Scales ---
  const xScale = scaleLinear().domain([MIN_YEAR, MAX_YEAR + 1]).range([0, CHART_WIDTH]);
  // Y axis: Latitudes. -90 at bottom, 90 at top.
  // SVG coordinate system: 0 is top. So 90 should be at 0, -90 at CHART_HEIGHT.
  const yScale = scaleLinear().domain([MIN_LAT, MAX_LAT]).range([CHART_HEIGHT, 0]);

  // Calculate dimensions of each rect
  // Width of one year
  const yearWidth = xScale(MIN_YEAR + 1) - xScale(MIN_YEAR);
  // Height of one latitude band. 
  const latHeight = Math.abs(yScale(4) - yScale(0)); 

  // --- Render Heatmap to Canvas ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !aggregatedData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each cell
    aggregatedData.forEach(d => {
      const x = xScale(d.year);
      
      const y = yScale(d.lat) - latHeight / 2;

      ctx.fillStyle = getTemperatureColor(d.anomaly, minAnomaly, maxAnomaly);
      // Use slightly larger width/height to avoid gaps due to anti-aliasing or rounding
      ctx.fillRect(x, y, yearWidth + 0.5, latHeight + 0.5);
    });

  }, [aggregatedData, xScale, yScale, yearWidth, latHeight, minAnomaly, maxAnomaly]);

  // --- Mouse Handlers ---
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - MARGIN.left;
    const y = event.clientY - bounds.top - MARGIN.top;

    // Check bounds
    if (x < 0 || x > CHART_WIDTH || y < 0 || y > CHART_HEIGHT) {
        setHoveredCell(null);
        return;
    }

    const year = Math.floor(xScale.invert(x));
    const rawLat = yScale.invert(y);
    
    // Find closest lat
    let closestLat = uniqueLats[0];
    let minDiff = Math.abs(rawLat - closestLat);
    
    for (let i = 1; i < uniqueLats.length; i++) {
        const diff = Math.abs(rawLat - uniqueLats[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closestLat = uniqueLats[i];
        }
    }
    
    setHoveredCell({ year, lat: closestLat });
  };

  // --- Mouse Leave Handler ---
  const handleMouseLeave = () => {
      setHoveredCell(null);
  };

  // --- Click Handler ---
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hoveredCell) return;
    
    const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, hoveredCell.year));
    
    dispatch(setCurrentYear(clampedYear));
    // Add the clicked latitude to the selection
    dispatch(addLatitude(hoveredCell.lat));
  };

  return (
    <div 
      className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px] shrink-0" 
      data-name="HeatmapView"
      style={{ width, height }}
    >
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div 
        className="size-full relative" 
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Canvas for Heatmap */}
        <canvas 
          ref={canvasRef}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          style={{ 
            position: 'absolute', 
            left: MARGIN.left, 
            top: MARGIN.top,
            pointerEvents: 'none' 
          }}
        />
        
        {/* SVG for Axes and Overlay */}
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute top-0 left-0 cursor-pointer">
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Y-axis labels */}
            {yScale.ticks(5).map(tickValue => (
              <g key={tickValue} transform={`translate(0, ${yScale(tickValue)})`}>
                <text x="-5" y="3" textAnchor="end" className="text-[10px] fill-gray-600 font-sans">
                  {tickValue}°
                </text>
                <line x1="0" x2={CHART_WIDTH} stroke="#CCCCCC" strokeDasharray="2 2" opacity="0.3" />
              </g>
            ))}
            
            {/* X-axis labels */}
            {xScale.ticks(5).map(tickValue => (
              <g key={tickValue} transform={`translate(${xScale(tickValue)}, ${CHART_HEIGHT})`}>
                <text y="15" textAnchor="middle" className="text-[10px] fill-gray-600 font-sans">
                  {tickValue}
                </text>
              </g>
            ))}

            {/* Axis Titles */}
            <text x={CHART_WIDTH / 2} y={CHART_HEIGHT + 30} textAnchor="middle" className="text-[10px] fill-gray-700 font-sans font-bold">
              Year
            </text>
            <text transform={`rotate(-90)`} x={-CHART_HEIGHT / 2} y={-MARGIN.left + 12} textAnchor="middle" className="text-[10px] fill-gray-700 font-sans font-bold">
              Latitude
            </text>

            {/* Current Year Marker */}
            <line
              x1={xScale(currentYear)}
              y1="0"
              x2={xScale(currentYear)}
              y2={CHART_HEIGHT}
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* Selected Latitudes Markers */}
            {selectedLatitudes.map(lat => (
              <line
                key={lat.id}
                x1="0"
                y1={yScale(lat.value)}
                x2={CHART_WIDTH}
                y2={yScale(lat.value)}
                stroke={lat.color}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            ))}

            {/* Hover Highlight */}
            {hoveredCell && (
              <rect
                x={xScale(hoveredCell.year)}
                y={yScale(hoveredCell.lat) - latHeight / 2}
                width={yearWidth}
                height={latHeight}
                fill="none"
                stroke="#00FFFF" 
                strokeWidth="2"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
