import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; 
import { LINE_COLORS } from './GraphView'; 

const getColorForAnomaly = (anomaly: number): string => {
  if (anomaly < -0.5) return '#2563eb';
  if (anomaly < 0) return '#60a5fa';
  if (anomaly < 0.5) return '#fbbf24';
  if (anomaly < 1.0) return '#f97316';
  return '#dc2626';
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

  // --- Helpers de Conversion de Coordonnées ---
  // Carte de 1200x600 pour lat [-90, 90] et lon [-180, 180]
  
  const longitudeToX = (lon: number): number => {
    return ((lon + 180) / 360) * 1200;
  };

  const xToLongitude = (x: number): number => {
    return (x / 1200) * 360 - 180;
  };

  const latitudeToY = (lat: number): number => {
    // Attention : Y augmente vers le bas, Lat augmente vers le haut.
    // 90° lat = 0y, -90° lat = 600y
    return ((90 - lat) / 180) * 600;
  };

  const yToLatitude = (y: number): number => {
    return 90 - (y / 600) * 180;
  };

  // --- Dessin de la Heatmap (Canvas) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !allData || status !== 'succeeded') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Filtrer les données pour l'année en cours
    const yearData = allData.filter((d) => d.year === currentYear);

    if (yearData.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 2. Création d'un canvas "tampon" (offscreen) de petite taille
    // La grille est de 4°x4°.
    // Largeur grille : 360 / 4 = 90 cellules
    // Hauteur grille : 180 / 4 = 45 cellules
    const gridWidth = 90;
    const gridHeight = 45;
    
    const offCanvas = document.createElement('canvas');
    offCanvas.width = gridWidth;
    offCanvas.height = gridHeight;
    const offCtx = offCanvas.getContext('2d');

    if (!offCtx) return;

    // Remplir le petit canvas. Chaque pixel correspond à une cellule 4x4.
    yearData.forEach((point) => {
      // Mapping Lat/Lon vers coordonnées de la grille (0..89, 0..44)
      // Lon -180 => x=0, Lon 180 => x=90
      // Lat 90 => y=0, Lat -90 => y=45
      
      // On centre le point dans sa cellule pour trouver l'index
      const px = Math.floor((point.lon + 180) / 4);
      const py = Math.floor((90 - point.lat) / 4);

      offCtx.fillStyle = getColorForAnomaly(point.anomaly);
      offCtx.fillRect(px, py, 1, 1);
    });

    // 3. Dessiner le petit canvas étiré sur le grand canvas (1200x600)
    // L'interpolation du navigateur va créer le flou (dégradé) entre les pixels
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // On applique une opacité globale pour voir la carte dessous
    ctx.globalAlpha = 0.6; 
    
    // Astuce : dessiner l'image étirée
    ctx.drawImage(offCanvas, 0, 0, gridWidth, gridHeight, 0, 0, canvas.width, canvas.height);
    
    // Reset alpha
    ctx.globalAlpha = 1.0;

  }, [allData, currentYear, status]);


  // --- Gestion des intéractions (SVG) ---
  const getPointInSvg = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    // Transformation inverse pour prendre en compte le zoom/pan
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
      // Clamp latitude
      if (clickedLat >= -90 && clickedLat <= 90) {
        dispatch(addLatitude(clickedLat));
      }
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
          wrapperClass="w-full h-full flex items-center justify-center" // Centrage du contenu
          contentClass="w-full h-full flex items-center justify-center" 
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          {/* MODIFICATION : Remplacement des dimensions fixes par du CSS responsive.
            - width: 100% : prend la largeur disponible.
            - aspectRatio: '2 / 1' : conserve le ratio de la carte.
            - maxHeight: '100%' : empêche la carte d'être plus haute que l'écran.
            - margin: 'auto' : centre la carte si elle est plus petite que le conteneur.
          */}
          <div style={{ 
            width: '100%', 
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: '2 / 1', 
            position: 'relative',
            margin: 'auto'
          }}>
            
            {/* 1. Image de fond (Carte) */}
            <img 
              src="/earth.svg" 
              alt="World Map" 
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} 
            />

            {/* 2. Canvas pour les données (Heatmap floutée) */}
            <canvas
              ref={canvasRef}
              width={1200} // Résolution logique interne (doit correspondre aux calculs)
              height={600}
              style={{ 
                width: '100%', // S'adapte au conteneur responsive
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                pointerEvents: 'none',
                imageRendering: 'auto' 
              }}
            />

            {/* 3. SVG pour les sélections et grilles (au-dessus) */}
            <svg
              ref={svgRef}
              viewBox="0 0 1200 600" // Coordinate system logique interne
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              className={selectionMode !== 'move' ? 'cursor-crosshair' : ''}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Lignes de latitude sélectionnées */}
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

              {/* Zones sélectionnées (Rectangles) */}
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
                
                {/* Rectangle en cours de dessin */}
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

              {/* Surbrillance Longitude (Barre verticale transparente) */}
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