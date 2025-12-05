import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { scaleLinear } from 'd3-scale';
import { setCurrentYear } from '../slices/controlsSlice';
import { addLatitude } from '../slices/selectionSlice';

// --- Constants for dimensions ---
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const MARGIN = { top: 15, right: 15, bottom: 35, left: 40 };
const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

const MIN_YEAR = 1880;
const MAX_YEAR = 2024;
const MIN_LAT = -90;
const MAX_LAT = 90;

// --- Color Palette (Same as MapContainer) ---
const COLOR_STOPS = [
  { val: -2.5, color: { r: 37, g: 99, b: 235 } },   // bg-blue-600
  { val: -0.5, color: { r: 96, g: 165, b: 250 } },  // bg-blue-400
  { val: 0,    color: { r: 255, g: 255, b: 255 } }, // White
  { val: 0.5,  color: { r: 251, g: 191, b: 36 } },  // bg-amber-400
  { val: 1.0,  color: { r: 249, g: 115, b: 22 } },  // bg-orange-500
  { val: 2.5,  color: { r: 220, g: 38, b: 38 } },   // bg-red-600
];

const getContinuousColor = (value: number) => {
  const val = Math.max(-2.5, Math.min(2.5, value));
  let lower = COLOR_STOPS[0];
  let upper = COLOR_STOPS[COLOR_STOPS.length - 1];

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (val >= COLOR_STOPS[i].val && val <= COLOR_STOPS[i+1].val) {
      lower = COLOR_STOPS[i];
      upper = COLOR_STOPS[i+1];
      break;
    }
  }

  if (lower === upper) return `rgb(${lower.color.r}, ${lower.color.g}, ${lower.color.b})`;

  const t = (val - lower.val) / (upper.val - lower.val);
  const r = Math.round(lower.color.r + (upper.color.r - lower.color.r) * t);
  const g = Math.round(lower.color.g + (upper.color.g - lower.color.g) * t);
  const b = Math.round(lower.color.b + (upper.color.b - lower.color.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
};

export const HeatmapView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allData, status } = useAppSelector((state) => state.data);
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const { selectedLatitudes } = useAppSelector((state) => state.selection);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ year: number; lat: number } | null>(null);

  // --- Data Aggregation ---
  const aggregatedData = useMemo(() => {
    if (status !== 'succeeded' || !allData) return null;

    // Group by Year -> Lat -> Average Anomaly
    // We assume data is on a grid. We want to average anomalies for each latitude band per year.
    // Map: Year -> { Lat -> { sum, count } }
    const dataMap = new Map<number, Map<number, { sum: number; count: number }>>();

    allData.forEach(d => {
      if (!dataMap.has(d.year)) {
        dataMap.set(d.year, new Map());
      }
      const yearMap = dataMap.get(d.year)!;
      
      // We can round latitude to nearest grid point if needed, but assuming raw lat is consistent
      // Let's assume raw lat is fine.
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

    aggregatedData.forEach(d => {
      const x = xScale(d.year);
      // d.lat is center? If we want rect to be centered on lat:
      // y = yScale(d.lat + 2) (top edge)
      // But yScale flips.
      // Let's just use yScale(d.lat) as center.
      // Top left corner:
      // x = xScale(d.year)
      // y = yScale(d.lat) - latHeight / 2
      
      const y = yScale(d.lat) - latHeight / 2;

      ctx.fillStyle = getContinuousColor(d.anomaly);
      // Use slightly larger width/height to avoid gaps due to anti-aliasing or rounding
      ctx.fillRect(x, y, yearWidth + 0.5, latHeight + 0.5);
    });

  }, [aggregatedData, xScale, yScale, yearWidth, latHeight]);

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

  const handleMouseLeave = () => {
      setHoveredCell(null);
  };

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
      style={{ width: 600, height: 400 }}
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
            pointerEvents: 'none' // Let click pass through to container or handle on canvas
          }}
        />
        
        {/* SVG for Axes and Overlay */}
        <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="absolute top-0 left-0 cursor-pointer">
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
