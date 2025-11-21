import React, { useRef, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; 
import { LINE_COLORS } from './GraphView'; 

// --- Configuration de la Palette Continue (Basée sur Tailwind) ---
// Nous définissons des "points d'arrêt" (stops) pour l'interpolation.
// Les valeurs RGB correspondent aux classes Tailwind fournies.
const COLOR_STOPS = [
  { val: -2.5, color: { r: 37, g: 99, b: 235 } },   // bg-blue-600 (Extrême froid)
  { val: -0.5, color: { r: 96, g: 165, b: 250 } },  // bg-blue-400
  { val: 0,    color: { r: 255, g: 255, b: 255 } }, // Blanc (Neutre)
  { val: 0.5,  color: { r: 251, g: 191, b: 36 } },  // bg-amber-400
  { val: 1.0,  color: { r: 249, g: 115, b: 22 } },  // bg-orange-500
  { val: 2.5,  color: { r: 220, g: 38, b: 38 } },   // bg-red-600 (Extrême chaud)
];

// Fonction utilitaire pour interpoler linéairement entre deux couleurs RGB
const getContinuousColor = (value: number) => {
  // On contraint la valeur dans les bornes de notre échelle
  const val = Math.max(-2.5, Math.min(2.5, value));
  
  // Trouver les deux stops qui encadrent la valeur
  let lower = COLOR_STOPS[0];
  let upper = COLOR_STOPS[COLOR_STOPS.length - 1];

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (val >= COLOR_STOPS[i].val && val <= COLOR_STOPS[i+1].val) {
      lower = COLOR_STOPS[i];
      upper = COLOR_STOPS[i+1];
      break;
    }
  }

  // Si on tombe pile sur un stop
  if (lower === upper) return `rgb(${lower.color.r}, ${lower.color.g}, ${lower.color.b})`;

  // Calcul du pourcentage de progression entre les deux stops (0 à 1)
  const t = (val - lower.val) / (upper.val - lower.val);
  
  // Mélange des couleurs (Lerp)
  const r = Math.round(lower.color.r + (upper.color.r - lower.color.r) * t);
  const g = Math.round(lower.color.g + (upper.color.g - lower.color.g) * t);
  const b = Math.round(lower.color.b + (upper.color.b - lower.color.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
};

export const MapContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- États Locaux ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRectangle | null>(null);

  // --- États Redux ---
  const { selectionMode, selectedLatitudes, selectedAreas, highlightedLon, areaGroups, activeGroupId } = useAppSelector((state) => state.selection);
  const { allData, status } = useAppSelector((state) => state.data);
  const { currentYear } = useAppSelector((state) => state.controls);

  // --- Helpers de Conversion de Coordonnées (Logique 1200x600) ---
  const longitudeToX = (lon: number): number => ((lon + 180) / 360) * 1200;
  const xToLongitude = (x: number): number => (x / 1200) * 360 - 180;
  const latitudeToY = (lat: number): number => ((90 - lat) / 180) * 600;
  const yToLatitude = (y: number): number => 90 - (y / 600) * 180;

  // --- Dessin de la Heatmap (Canvas) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !allData || status !== 'succeeded') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const yearData = allData.filter((d) => d.year === currentYear);

    if (yearData.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 1. Création d'un petit canvas "tampon" correspondant à la grille de données (90x45 pour 4°x4°)
    const gridWidth = 90;
    const gridHeight = 45;
    
    const offCanvas = document.createElement('canvas');
    offCanvas.width = gridWidth;
    offCanvas.height = gridHeight;
    const offCtx = offCanvas.getContext('2d');

    if (!offCtx) return;

    // 2. Remplissage pixel par pixel avec la couleur interpolée
    // Chaque pixel représente une zone de 4°x4°
    yearData.forEach((point) => {
      const px = Math.floor((point.lon + 180) / 4);
      const py = Math.floor((90 - point.lat) / 4);

      // C'est ici que la magie opère : on utilise la couleur continue
      offCtx.fillStyle = getContinuousColor(point.anomaly);
      offCtx.fillRect(px, py, 1, 1);
    });

    // 3. Dessin final étiré (l'interpolation bilinéaire du navigateur crée le flou)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.6; // Transparence pour voir la carte en dessous
    ctx.drawImage(offCanvas, 0, 0, gridWidth, gridHeight, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

  }, [allData, currentYear, status]);


  // --- Gestion des interactions (identique à avant) ---
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
      minLat: yToLatitude(maxY),
      maxLat: yToLatitude(minY),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    if (!activeGroupId) return; // Ne rien faire si aucun groupe n'est actif
    dispatch(addArea({ ...currentRect, id: new Date().toISOString() }));
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  };

  const handleMouseLeave = () => {
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
      if (clickedLat >= -90 && clickedLat <= 90) dispatch(addLatitude(clickedLat));
    }
  };

  const rectToSvgProps = (rect: SelectionRectangle) => {
    const x = longitudeToX(rect.minLon);
    const y = latitudeToY(rect.maxLat);
    const width = longitudeToX(rect.maxLon) - x;
    const height = latitudeToY(rect.minLat) - y;
    return { x, y, width, height };
  };

  return (
    <div className="w-full h-full overflow-hidden relative bg-[#f0f0f0]" data-name="ComposableMap">
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={8}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        disabled={selectionMode !== 'move'}
      >
        <TransformComponent
          wrapperClass="w-full h-full flex items-center justify-center"
          contentClass="w-full h-full flex items-center justify-center"
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <div style={{ 
            width: '100%', 
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '2 / 1', 
            position: 'relative',
            margin: 'auto'
          }}>
            {/* Image Carte */}
            <img 
              src="/earth.svg" 
              alt="World Map" 
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} 
            />

            {/* Canvas Heatmap Continue */}
            <canvas
              ref={canvasRef}
              width={1200}
              height={600}
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                pointerEvents: 'none',
                imageRendering: 'auto' // Assure le lissage par le navigateur
              }}
            />

            {/* Couche Interactive SVG */}
            <svg
              ref={svgRef}
              viewBox="0 0 1200 600"
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              className={selectionMode !== 'move' ? 'cursor-crosshair' : ''}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Lignes Latitude */}
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

              {/* Zones Sélectionnées */}
              <g id="area-selections">
                {selectedAreas.map((area, index) => {
                  const group = areaGroups.find(g => g.id === area.groupId);
                  const props = rectToSvgProps(area);
                  const color = group?.color || '#888888'; // Couleur par défaut si le groupe n'est pas trouvé
                  const fillColor = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.1)`;
                  
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

              {/* Highlight Longitude */}
              {highlightedLon !== null && selectedLatitudes.length > 0 && (() => {
                 const minLat = Math.min(...selectedLatitudes);
                 const maxLat = Math.max(...selectedLatitudes);
                 const lonWidth = 4; 
                 return (
                   <rect 
                     x={longitudeToX(highlightedLon - lonWidth/2)}
                     y={latitudeToY(maxLat + lonWidth/2)}
                     width={longitudeToX(highlightedLon + lonWidth/2) - longitudeToX(highlightedLon - lonWidth/2)}
                     height={latitudeToY(minLat - lonWidth/2) - latitudeToY(maxLat + lonWidth/2)}
                     fill="none"
                     stroke="rgba(255, 255, 0, 0.8)"
                     strokeWidth="3"
                     className="pointer-events-none"
                   />
                 );
              })()}
            </svg>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};