import React, { useRef, useState } from 'react';
// 1. Imports mis à jour
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';

// 2. Suppression de 'MapContainerProps' et de la prop '{ currentYear }'
export const MapContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const svgRef = useRef<SVGSVGElement>(null);

  // État local pour gérer le dessin en cours
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRectangle | null>(null);

  // 3. Récupération des états depuis le store
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  const { selectionMode, selectedLatitudes, selectedAreas } = useAppSelector((state) => state.selection);

  // --- Fonctions de conversion de coordonnées ---
  const latitudeToY = (lat: number): number => {
    // Mappage linéaire: 90N -> 0, 0 (équateur) -> 300, -90S -> 600
    return 300 - (lat / 90) * 300;
  };
  const yToLatitude = (y: number): number => {
    return Math.round(((300 - y) / 300) * 90);
  };
  const longitudeToX = (lon: number): number => {
    // Mappage linéaire: -180W -> 0, 0 -> 600, 180E -> 1200
    return 600 + (lon / 180) * 600;
  };
  const xToLongitude = (x: number): number => {
    return Math.round(((x - 600) / 600) * 180);
  };

  // Convertit un rectangle de coordonnées en attributs SVG pour <rect>
  const rectToSvgProps = (rect: SelectionRectangle) => {
    const x = longitudeToX(rect.minLon);
    const y = latitudeToY(rect.maxLat);
    const width = longitudeToX(rect.maxLon) - x;
    const height = latitudeToY(rect.minLat) - y;
    return { x, y, width, height };
  };
  // --- Fin des fonctions de conversion ---

  // Le reste de votre logique et de votre JSX est INCHANGÉ
  // Temperature colors based on year progression
  const getTemperatureColor = (baseTemp: number) => {
    const yearProgress = (currentYear - 1980) / 40; // 1980-2020 range
    const temp = baseTemp + yearProgress * 1.5; // Warming trend
    
    if (temp < -0.5) return '#2563EB'; // blue-600
    if (temp < 0) return '#60A5FA'; // blue-400
    if (temp < 0.5) return '#FCD34D'; // amber-300
    if (temp < 1.0) return '#F97316'; // orange-500
    return '#DC2626'; // red-600
  };

  // --- Gestionnaires d'événements souris ---
  const getPointInSvg = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    return svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (selectionMode !== 'area') return;
    event.preventDefault();
    const point = getPointInSvg(event);
    if (!point) return;

    setIsDrawing(true);
    setStartPoint({ x: point.x, y: point.y });
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !startPoint) return;
    const point = getPointInSvg(event);
    if (!point) return;

    const minX = Math.min(startPoint.x, point.x);
    const maxX = Math.max(startPoint.x, point.x);
    const minY = Math.min(startPoint.y, point.y);
    const maxY = Math.max(startPoint.y, point.y);

    setCurrentRect({
      id: 'temp',
      minLon: xToLongitude(minX),
      maxLon: xToLongitude(maxX),
      minLat: yToLatitude(maxY), // Y inversé pour la latitude
      maxLat: yToLatitude(minY),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    
    // Finaliser la zone et l'ajouter au store Redux
    dispatch(addArea({ ...currentRect, id: new Date().toISOString() }));

    // Réinitialiser l'état de dessin
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  };

  const handleMouseLeave = () => {
    // Annule le dessin si la souris quitte le SVG
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentRect(null);
    }
  };

  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (selectionMode === 'latitude') {
      const point = getPointInSvg(event);
      if (!point) return;
      const clickedLat = yToLatitude(point.y);
      if (clickedLat >= -90 && clickedLat <= 90) {
        dispatch(addLatitude(clickedLat));
      }
    }
  };

  return (
    <div className="w-full h-full overflow-visible relative" data-name="ComposableMap">
      {/* Ajout de ref et onClick */}
      <svg 
        ref={svgRef} 
        onClick={handleMapClick}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
        viewBox="0 0 1200 600" className={`w-full h-full ${selectionMode !== 'none' ? 'cursor-crosshair' : ''}`} preserveAspectRatio="xMidYMid meet" style={{ transform: 'translateY(-10%)' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ocean background (placé en premier pour être en arrière-plan) */}
        <rect x="0" y="0" width="1200" height="600" fill="#E0F2FE" opacity="0.3" style={{ mixBlendMode: 'multiply' }} />

        {/* --- GROUPE POUR LES LIGNES DE LATITUDE --- */}
        <g id="latitude-lines">
          {selectedLatitudes.map(lat => (
            <line
              key={`lat-line-${lat}`}
              x1="0" y1={latitudeToY(lat)} x2="1200" y2={latitudeToY(lat)}
              stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.8"
            />
          ))}
        </g>

        {/* --- GROUPE POUR LES ZONES DE SÉLECTION --- */}
        <g id="area-selections">
          {selectedAreas.map(area => (
            <rect key={area.id} {...rectToSvgProps(area)} fill="rgba(29, 78, 216, 0.2)" stroke="rgba(29, 78, 216, 0.8)" strokeWidth="2" />
          ))}
          {/* Rectangle de prévisualisation pendant le dessin */}
          {isDrawing && currentRect && (
            <rect
              {...rectToSvgProps(currentRect)}
              fill="rgba(59, 130, 246, 0.3)"
              stroke="rgba(59, 130, 246, 1)"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
          )}
        </g>

        {/* Simplified World Map - Continents as geometric shapes */}
        <g transform="translate(100, 100)">
          {/* North America */}
          <path
            d="M 150 80 L 120 150 L 130 200 L 180 220 L 220 200 L 280 210 L 300 180 L 320 140 L 310 100 L 280 80 L 240 70 L 200 75 Z"
            fill={getTemperatureColor(-0.2)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* South America */}
          <path
            d="M 220 240 L 200 280 L 210 350 L 230 420 L 260 450 L 280 440 L 290 380 L 280 320 L 260 270 L 240 250 Z"
            fill={getTemperatureColor(0.1)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Europe */}
          <path
            d="M 450 90 L 430 120 L 440 150 L 480 160 L 520 155 L 540 130 L 530 100 L 500 85 L 470 88 Z"
            fill={getTemperatureColor(0.3)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Africa */}
          <path
            d="M 480 180 L 460 220 L 450 280 L 460 350 L 490 420 L 530 440 L 570 430 L 590 380 L 585 310 L 570 250 L 540 200 L 510 180 Z"
            fill={getTemperatureColor(0.4)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Asia */}
          <path
            d="M 550 60 L 520 90 L 530 130 L 560 150 L 600 140 L 680 160 L 750 140 L 820 150 L 850 120 L 840 80 L 800 60 L 740 50 L 680 55 L 620 65 L 570 60 Z"
            fill={getTemperatureColor(0.2)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Asia - Southern part */}
          <path
            d="M 600 170 L 580 210 L 590 260 L 620 280 L 670 270 L 700 240 L 720 200 L 700 175 L 660 165 Z"
            fill={getTemperatureColor(0.35)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Australia */}
          <path
            d="M 750 330 L 730 360 L 740 400 L 780 420 L 830 415 L 860 385 L 855 350 L 830 330 L 790 328 Z"
            fill={getTemperatureColor(0.45)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Greenland */}
          <path
            d="M 320 20 L 300 40 L 310 70 L 340 80 L 380 75 L 400 50 L 390 25 L 360 15 Z"
            fill={getTemperatureColor(-0.8)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Antarctica */}
          <path
            d="M 100 480 L 200 490 L 350 495 L 500 490 L 650 495 L 800 490 L 900 485 L 850 470 L 700 475 L 500 470 L 300 475 L 150 470 Z"
            fill={getTemperatureColor(-1.2)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Russia/Northern Asia */}
          <path
            d="M 550 30 L 600 40 L 700 35 L 800 45 L 900 50 L 920 80 L 900 110 L 850 115 L 800 105 L 750 100 L 700 110 L 650 100 L 600 95 L 560 85 L 540 60 Z"
            fill={getTemperatureColor(-0.3)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Middle East */}
          <path
            d="M 540 160 L 520 180 L 530 210 L 560 220 L 600 215 L 620 190 L 610 165 L 580 158 Z"
            fill={getTemperatureColor(0.5)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
          
          {/* Central America */}
          <path
            d="M 180 230 L 170 245 L 185 260 L 205 255 L 215 240 L 200 232 Z"
            fill={getTemperatureColor(0.25)}
            stroke="#1F2937"
            strokeWidth="1.5"
            opacity="0.9"
          />
        </g>
        
      </svg>
    </div>
  );
};