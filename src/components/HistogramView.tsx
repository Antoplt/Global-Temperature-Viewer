import React, { useMemo } from 'react';
// 1. Import du hook
import { useAppSelector } from '../hooks/hooks';
import { scaleBand, scaleLinear } from 'd3-scale';
import { group, mean } from 'd3-array';

// --- Constantes pour les dimensions ---
const SVG_WIDTH = 360;
const SVG_HEIGHT = 200;
const MARGIN = { top: 15, right: 15, bottom: 45, left: 30 };
const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

// --- Plage des températures pour l'axe Y ---
const MIN_TEMP = -2;
const MAX_TEMP = 2;

export const HistogramView: React.FC = () => {
  // --- Récupération des données depuis le store ---
  const { allData, status } = useAppSelector((state) => state.data);
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const { selectedLatitudes, selectionMode } = useAppSelector((state) => state.selection);

  // --- Calcul des données pour l'histogramme (mémoïsé) ---
  const histogramData = useMemo(() => {
    if (status !== 'succeeded' || selectedLatitudes.length === 0) {
      return [];
    }

    // 1. Filtrer les données pour l'année en cours et les latitudes sélectionnées
    // On prend les latitudes les plus proches dans les données pour chaque sélection
    const availableLats = [...new Set(allData.map(d => d.lat))];
    const closestLats = selectedLatitudes.map(sl => 
      availableLats.reduce((prev, curr) => 
        Math.abs(curr - sl) < Math.abs(prev - sl) ? curr : prev
      )
    );

    const filteredData = allData.filter(d => 
      d.year === currentYear && closestLats.includes(d.lat)
    );

    // 2. Grouper par longitude et calculer la moyenne de l'anomalie
    const groupedByLon = group(filteredData, d => d.lon);
    
    const data = Array.from(groupedByLon, ([lon, values]) => ({
      lon,
      meanAnomaly: mean(values, d => d.anomaly) || 0,
    }));

    // 3. Trier par longitude pour un affichage correct
    return data.sort((a, b) => a.lon - b.lon);

  }, [allData, currentYear, selectedLatitudes, status]);

  // --- Création des échelles D3 ---
  const xScale = scaleBand()
    .domain(histogramData.map(d => d.lon.toString()))
    .range([0, CHART_WIDTH])
    .padding(0.2);

  const yScale = scaleLinear()
    .domain([MIN_TEMP, MAX_TEMP])
    .range([CHART_HEIGHT, 0]);

  // Si aucune latitude n'est sélectionnée, on affiche un message d'aide.
  if (selectedLatitudes.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255,0.95)] h-[200px] relative rounded-[10px] w-[360px] flex items-center justify-center p-4">
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-lg" />
        <p className="text-center text-gray-500 font-sans">Select one or more latitudes on the map to display the histogram.</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[200px] relative rounded-[10px] w-[360px]" data-name="TemperatureHistogram">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
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
            <text x={CHART_WIDTH / 2} y={CHART_HEIGHT + 35} textAnchor="middle" className="text-[10px] fill-gray-700 font-sans font-bold">
              Longitude
            </text>
            <text transform={`rotate(-90)`} x={-CHART_HEIGHT / 2} y={-MARGIN.left + 10} textAnchor="middle" className="text-[10px] fill-gray-700 font-sans font-bold">
              Anomaly (°C)
            </text>

            {/* Barres de l'histogramme */}
            {histogramData.map(({ lon, meanAnomaly }) => (
              <rect
                key={lon}
                x={xScale(lon.toString())}
                y={yScale(Math.max(0, meanAnomaly))}
                width={xScale.bandwidth()}
                height={Math.abs(yScale(meanAnomaly) - yScale(0))}
                fill={meanAnomaly > 0 ? "#F97316" : "#2563EB"}
              />
            ))}
          </g>
        </svg>
      </div>
      {/* Légende */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center">
        <p className="font-sans text-sm text-gray-700">
          Anomaly vs Longitude for {currentYear}
        </p>
      </div>
    </div>
  );
};