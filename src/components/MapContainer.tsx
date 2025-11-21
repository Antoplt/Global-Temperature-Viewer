import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; // Import

export const MapContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const svgRef = useRef<SVGSVGElement>(null);

  // État local pour gérer le dessin en cours
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRectangle | null>(null);

  // Récupération des états depuis le store
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
    <div className="w-full h-full overflow-hidden relative bg-blue-50" data-name="ComposableMap">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={8}
        centerOnInit={true}
        wheel={{ step: 0.1 }} // Vitesse du zoom molette
      >
        <TransformComponent 
          wrapperClass="w-full h-full" 
          contentClass="w-full h-full"
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          
          <svg 
            ref={svgRef} 
            onClick={handleMapClick}
            onMouseDown={handleMouseDown} 
            onMouseMove={handleMouseMove} 
            onMouseUp={handleMouseUp} 
            onMouseLeave={handleMouseLeave}
            viewBox="0 0 1200 600" 
            className={`w-full h-full block ${selectionMode !== 'none' ? 'cursor-crosshair' : ''}`} 
            preserveAspectRatio="xMidYMid meet" 
          >
            {/* Remplacement des zones dessinées par l'image SVG */}
            <image href="/earth.svg" x="0" y="0" width="1200" height="550" preserveAspectRatio="none" />

            {/* Overlay léger pour l'esthétique (optionnel) */}
            <rect x="0" y="0" width="1200" height="600" fill="#E0F2FE" opacity="0.1" style={{ mixBlendMode: 'multiply' }} />

            <g id="latitude-lines">
              {selectedLatitudes.map((lat) => (
                <line
                  key={lat}
                  x1="0"
                  y1={latitudeToY(lat)}
                  x2="1200"
                  y2={latitudeToY(lat)}
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              ))}
            </g>

            <g id="area-selections">
              {selectedAreas.map((area) => {
                const props = rectToSvgProps(area);
                return (
                  <rect
                    key={area.id}
                    {...props}
                    fill="rgba(239, 68, 68, 0.2)"
                    stroke="#EF4444"
                    strokeWidth="2"
                  />
                );
              })}
              {currentRect && (
                <rect
                  {...rectToSvgProps(currentRect)}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}
            </g>
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};