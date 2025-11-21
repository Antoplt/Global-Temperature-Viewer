import React, { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { scaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { setCurrentYear } from '../slices/controlsSlice';

// --- Constantes pour les dimensions du graphique ---
const SVG_WIDTH = 320;
const SVG_HEIGHT = 115;
const MARGIN = { top: 5, right: 10, bottom: 20, left: 28 };
const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const CHART_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

// --- Plage des années et des températures pour les axes ---
const MIN_YEAR = 1880;
const MAX_YEAR = 2024;
const MIN_TEMP = -1.5;
const MAX_TEMP = 1.5;

// --- Couleurs pour les différentes courbes ---
const LINE_COLORS = ["#DC2626", "#2563EB", "#F97316", "#16A34A", "#9333EA"];

export const GraphView: React.FC = () => {
  // --- Récupération des données depuis le store Redux ---
  const dispatch = useAppDispatch();
  const { allData, status } = useAppSelector((state) => state.data);
  const { selectedAreas } = useAppSelector((state) => state.selection);
  const currentYear = useAppSelector((state) => state.controls.currentYear);

  // --- Calcul des données du graphique (mémoïsé pour la performance) ---
  const areaLinesData = useMemo(() => {
    if (status !== 'succeeded' || selectedAreas.length === 0) {
      return [];
    }

    // 1. Regrouper toutes les données par année
    const dataByYear = allData.reduce((acc, d) => {
      if (!acc[d.year]) {
        acc[d.year] = [];
      }
      acc[d.year].push(d);
      return acc;
    }, {} as Record<number, typeof allData>);

    // 2. Pour chaque zone sélectionnée, calculer la moyenne par année
    return selectedAreas.map(area => {
      const yearlyMeans: { year: number; mean: number }[] = [];

      for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
        if (dataByYear[year]) {
          // Filtrer les points de données qui sont dans la zone
          const pointsInArea = dataByYear[year].filter(
            d => d.lat >= area.minLat && d.lat <= area.maxLat && d.lon >= area.minLon && d.lon <= area.maxLon
          );

          if (pointsInArea.length > 0) {
            // Calculer la moyenne des anomalies
            const sum = pointsInArea.reduce((acc, d) => acc + d.anomaly, 0);
            yearlyMeans.push({ year, mean: sum / pointsInArea.length });
          }
        }
      }
      return {
        areaId: area.id,
        data: yearlyMeans,
      };
    });
  }, [allData, selectedAreas, status]);

  // --- Création des échelles D3 ---
  const xScale = scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, CHART_WIDTH]);
  const yScale = scaleLinear().domain([MIN_TEMP, MAX_TEMP]).range([CHART_HEIGHT, 0]);

  // --- Générateur de ligne D3 ---
  const lineGenerator = d3Line<{ year: number; mean: number }>()
    .x(d => xScale(d.year))
    .y(d => yScale(d.mean));

  // --- Gestionnaire de clic sur le graphique ---
  const handleGraphClick = (event: React.MouseEvent<SVGSVGElement>) => {
    // On utilise le SVG parent pour obtenir une référence stable
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    // Utilise l'inverse de l'échelle pour convertir la coordonnée X en année
    const clickX = transformedPoint.x - MARGIN.left;
    const clickedYear = Math.round(xScale.invert(clickX));

    // S'assure que l'année reste dans les bornes valides
    const newYear = Math.max(MIN_YEAR, Math.min(clickedYear, MAX_YEAR));

    dispatch(setCurrentYear(newYear));
  };

  // Si aucune zone n'est sélectionnée, afficher un message
  if (selectedAreas.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255,0.95)] h-[200px] relative rounded-[10px] w-[360px] flex items-center justify-center p-4">
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-lg" />
        <p className="text-center text-gray-500 font-sans">Select an area on the map to display its temperature anomaly graph.</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[200px] relative rounded-[10px] shrink-0 w-[360px]" data-name="TemperatureGraph">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="size-full p-2">
        <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} onClick={handleGraphClick} className="cursor-pointer">
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Y-axis labels */}
            {yScale.ticks(5).map(tickValue => (
              <g key={tickValue} transform={`translate(0, ${yScale(tickValue)})`}>
                <text x="-5" y="3" textAnchor="end" className="text-[10px] fill-gray-600 font-sans">
                  {tickValue}
                </text>
                <line x1="0" x2={CHART_WIDTH} stroke="#CCCCCC" strokeDasharray="2 2" />
              </g>
            ))}
            
            {/* X-axis labels */}
            {xScale.ticks(4).map(tickValue => (
              <g key={tickValue} transform={`translate(${xScale(tickValue)}, ${CHART_HEIGHT})`}>
                <text y="15" textAnchor="middle" className="text-[10px] fill-gray-600 font-sans">
                  {tickValue}
                </text>
              </g>
            ))}
            
            {/* Temperature Line */}
            {areaLinesData.map((lineData, index) => (
              <path
                key={lineData.areaId}
                d={lineGenerator(lineData.data) || ''}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth="2"
                fill="none"
              />
            ))}

            {/* Marqueur pour l'année en cours */}
            <line
              x1={xScale(currentYear)}
              y1="0"
              x2={xScale(currentYear)}
              y2={CHART_HEIGHT}
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

          </g>
        </svg>
      </div>
          
      {/* Légende dynamique */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-4 text-xs font-sans">
        {areaLinesData.map((lineData, index) => (
          <div key={lineData.areaId} className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: LINE_COLORS[index % LINE_COLORS.length] }} />
            <span>Area {selectedAreas.findIndex(a => a.id === lineData.areaId) + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};