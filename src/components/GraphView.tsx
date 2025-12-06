//src/components/GraphView.tsx
// Component to display the temperature anomaly graph
import React, { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { scaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { setCurrentYear } from '../slices/controlsSlice';

// --- Constants for chart dimensions ---
const MARGIN = { top: 15, right: 15, bottom: 35, left: 40 };


// --- Range of years and temperatures for axes ---
const MIN_YEAR = 1880;
const MAX_YEAR = 2024;
const MIN_TEMP = -2.0;
const MAX_TEMP = 2.0;


// --- Props Interface ---
interface GraphViewProps {
  width?: number;
  height?: number;
}


// --- GraphView Component ---
export const GraphView: React.FC<GraphViewProps> = ({ width = 360, height = 200 }) => {
  const CHART_WIDTH = Math.max(0, width - MARGIN.left - MARGIN.right);
  const CHART_HEIGHT = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  // Retrieve data from the store
  const dispatch = useAppDispatch();
  const { allData, status } = useAppSelector((state) => state.data);
  const { selectedAreas, areaGroups } = useAppSelector((state) => state.selection);
  const currentYear = useAppSelector((state) => state.controls.currentYear);

  // Calculation of graph data (memoized for performance) 
  const areaLinesData = useMemo(() => {
    if (status !== 'succeeded' || areaGroups.length === 0) {
      return [];
    }

    // Group all data by year
    const dataByYear = allData.reduce((acc, d) => {
      if (!acc[d.year]) {
        acc[d.year] = [];
      }
      acc[d.year].push(d);
      return acc;
    }, {} as Record<number, typeof allData>);

    // For each group, calculate the combined average of its areas per year
    return areaGroups.filter(g => g.isVisibleInGraph).map(group => {
      const areasInGroup = selectedAreas.filter(a => a.groupId === group.id);
      if (areasInGroup.length === 0) return null;

      const yearlyMeans: { year: number; mean: number }[] = [];

      for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
        if (dataByYear[year]) {
          // Aggregate points from all areas in the group
          const pointsInGroup = areasInGroup.flatMap(area => 
            dataByYear[year].filter(
              d => d.lat >= area.minLat && d.lat <= area.maxLat && d.lon >= area.minLon && d.lon <= area.maxLon
            )
          );

          if (pointsInGroup.length > 0) {
            // Calculate the average of anomalies
            const sum = pointsInGroup.reduce((acc, d) => acc + d.anomaly, 0);
            yearlyMeans.push({ year, mean: sum / pointsInGroup.length });
          }
        }
      }
      return {
        groupId: group.id,
        color: group.color,
        data: yearlyMeans,
      };
    }).filter(Boolean) as { groupId: string; color: string; data: { year: number; mean: number }[] }[]; // Filtrer les groupes vides
  }, [allData, selectedAreas, areaGroups, status]);

  // --- Creation of D3 scales ---
  const xScale = scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, CHART_WIDTH]);
  const yScale = scaleLinear().domain([MIN_TEMP, MAX_TEMP]).range([CHART_HEIGHT, 0]);


  // --- D3 line generator ---
  const lineGenerator = d3Line<{ year: number; mean: number }>()
    .x(d => xScale(d.year))
    .y(d => yScale(d.mean));


  // --- Click handler for the graph ---
  const handleGraphClick = (event: React.MouseEvent<SVGSVGElement>) => {
    // Use the parent SVG to get a stable reference
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    // Use the inverse of the scale to convert the X coordinate to a year
    const clickX = transformedPoint.x - MARGIN.left;
    const clickedYear = Math.round(xScale.invert(clickX));

    // Ensure the year stays within valid bounds
    if (clickedYear >= MIN_YEAR && clickedYear <= MAX_YEAR) {
      dispatch(setCurrentYear(clickedYear));
    }
  };

  // If no area groups are defined, show a placeholder message
  if (areaGroups.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px] flex items-center justify-center p-4" style={{ width, height }}>
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-lg" />
        <p className="text-center text-gray-500 font-sans">Select an area on the map to display the graph.</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px]" style={{ width, height }} data-name="TemperatureGraph">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} onClick={handleGraphClick} className="cursor-pointer">
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Axes and Grid */}
            {/* Y Axis */}
            {yScale.ticks(5).map(tickValue => (
              <g key={tickValue} transform={`translate(0, ${yScale(tickValue)})`}>
                <text x="-10" y="3" textAnchor="end" className="text-[10px] fill-gray-600 font-sans">
                  {tickValue}°
                </text>
                <line x1="0" x2={CHART_WIDTH} stroke="#e5e7eb" strokeWidth="1" />
              </g>
            ))}
            
            {/* X Axis */}
            {xScale.ticks(5).map(tickValue => (
              <g key={tickValue} transform={`translate(${xScale(tickValue)}, ${CHART_HEIGHT})`}>
                <text y="15" textAnchor="middle" className="text-[10px] fill-gray-600 font-sans">
                  {tickValue}
                </text>
                <line y1="0" y2="-5" stroke="#9ca3af" strokeWidth="1" />
              </g>
            ))}

            {/* Vertical line for the current year */}
            <line
              x1={xScale(currentYear)}
              x2={xScale(currentYear)}
              y1={0}
              y2={CHART_HEIGHT}
              stroke="black"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* Temperature curves */}
            {areaLinesData.map((lineData) => (
              <path
                key={lineData.groupId}
                d={lineGenerator(lineData.data) || ''}
                fill="none"
                stroke={lineData.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
