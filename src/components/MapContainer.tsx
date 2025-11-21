import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; // Import
import { LINE_COLORS } from './GraphView'; // Importer les couleurs

export const MapContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const svgRef = useRef<SVGSVGElement>(null);

  // État local pour gérer le dessin en cours
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRectangle | null>(null);

  // Récupération des états depuis le store
  const { selectionMode, selectedLatitudes, selectedAreas, highlightedLon, areaGroups, activeGroupId } = useAppSelector((state) => state.selection);

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
      groupId: activeGroupId || '', // Associer au groupe actif
      minLon: xToLongitude(minX),
      maxLon: xToLongitude(maxX),
      minLat: yToLatitude(maxY), // Y inversé pour la latitude
      maxLat: yToLatitude(minY),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    if (!activeGroupId) return; // Ne rien faire si aucun groupe n'est actif
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
    if (selectionMode === 'move') return;
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
        disabled={selectionMode !== 'move'}
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
            className={`w-full h-full block ${selectionMode !== 'move' ? 'cursor-crosshair' : ''}`} 
            preserveAspectRatio="xMidYMid meet" 
          >
            {/* Remplacement des zones dessinées par l'image SVG */}
            <image href="/earth.svg" x="0" y="0" width="1200" height="550" preserveAspectRatio="none" />

            {/* Overlay léger pour l'esthétique (optionnel) */}
            <rect x="0" y="0" width="1200" height="600" fill="#E0F2FE" opacity="0.1" style={{ mixBlendMode: 'multiply' }} />

            <g id="latitude-lines">
              {selectedLatitudes.map((lat, index) => (
                <line
                  key={lat}
                  x1="0"
                  y1={latitudeToY(lat)}
                  x2="1200"
                  y2={latitudeToY(lat)}
                  stroke={LINE_COLORS[index % LINE_COLORS.length]}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              ))}
            </g>

                <g id="area-selections">
                  {selectedAreas.map((area, index) => {
                    const group = areaGroups.find(g => g.id === area.groupId);
                    const props = rectToSvgProps(area);
                    const color = group?.color || '#888888'; // Couleur par défaut si le groupe n'est pas trouvé
                    // Convertir la couleur hexadécimale en RGBA pour le remplissage
                    const fillColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`;

                    return (
                      <rect
                        key={area.id}
                        {...props}
                        fill={fillColor}
                        stroke={color}
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

                {/* --- Surbrillance de la longitude depuis l'histogramme --- */}
                {highlightedLon !== null && selectedLatitudes.length > 0 && (() => {
                  const minLat = Math.min(...selectedLatitudes);
                  const maxLat = Math.max(...selectedLatitudes);
                  // La zone de données fait 4° de large
                  const lonWidth = 4; 

                  return (
                    <rect
                      x={longitudeToX(highlightedLon - lonWidth / 2)}
                      y={latitudeToY(maxLat + lonWidth / 2)}
                      width={longitudeToX(highlightedLon + lonWidth / 2) - longitudeToX(highlightedLon - lonWidth / 2)}
                      height={latitudeToY(minLat - lonWidth / 2) - latitudeToY(maxLat + lonWidth / 2)}
                      fill="rgba(255, 255, 0, 0.4)"
                      stroke="rgba(255, 200, 0, 1)"
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                  );
                })()}
              </svg>
            </TransformComponent>
      </TransformWrapper>
    </div>
  );
};