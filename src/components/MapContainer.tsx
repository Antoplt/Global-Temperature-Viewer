// src/components/MapContainer.tsx
// Component for the interactive world map with temperature anomaly heatmap and selection features
import React, { useRef, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; 
import { getTemperatureColor } from './ColorLegend';


// --- Constants for map dimensions and coordinate conversions ---
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 600;


// Conversion functions between lon/lat and x/y on the map
const lonToX = (lon: number) => ((lon + 180) / 360) * MAP_WIDTH;
const latToY = (lat: number) => ((90 - lat) / 180) * MAP_HEIGHT;
const xToLon = (x: number) => (x / MAP_WIDTH) * 360 - 180;
const yToLat = (y: number) => 90 - (y / MAP_HEIGHT) * 180;


// --- MapContainer Component ---
export const MapContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Local States ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<SelectionRectangle | null>(null);

  // --- Redux States ---
  const { selectionMode, selectedLatitudes, selectedAreas, highlightedLon, areaGroups, activeGroupId } = useAppSelector((state) => state.selection);
  const { allData, minAnomaly, maxAnomaly, status } = useAppSelector((state) => state.data);
  const { currentYear } = useAppSelector((state) => state.controls);

  // --- Drawing the Heatmap (Canvas) ---
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

    // Creation of a small "offscreen" canvas corresponding to the data grid (90x45 for 4°x4°)
    const gridWidth = 90;
    const gridHeight = 45;
    
    const offCanvas = document.createElement('canvas');
    offCanvas.width = gridWidth;
    offCanvas.height = gridHeight;
    const offCtx = offCanvas.getContext('2d');

    if (!offCtx) return;

    // Filling pixel by pixel with the interpolated color
    // Each pixel represents a 4°x4° area
    yearData.forEach((point) => {
      const px = Math.floor((point.lon + 180) / 4);
      const py = Math.floor((90 - point.lat) / 4);

      offCtx.fillStyle = getTemperatureColor(point.anomaly, minAnomaly, maxAnomaly);
      offCtx.fillRect(px, py, 1, 1);
    });

    // 3. Final stretched drawing (the browser's bilinear interpolation creates the blur)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.6; // Transparency to see the map underneath
    ctx.drawImage(offCanvas, 0, 0, gridWidth, gridHeight, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

  }, [allData, currentYear, status]);


  // --- Interaction Handling (same as before) ---
  const getPointInSvg = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    return svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
  };

  // Mouse event handler for starting the drawing of a selection rectangle
  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (selectionMode !== 'area') return;
    event.preventDefault();
    const point = getPointInSvg(event);
    if (!point) return;
    setIsDrawing(true);
    setStartPoint({ x: point.x, y: point.y });
  };

  // Mouse move handler for drawing selection rectangle
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
      minLon: xToLon(minX),
      maxLon: xToLon(maxX),
      minLat: yToLat(maxY),
      maxLat: yToLat(minY),
    });
  };

  // Mouse up handler to finalize the selection rectangle
  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;
    if (!activeGroupId) return; // Do nothing if no group is active
    dispatch(addArea({ ...currentRect, id: new Date().toISOString() }));
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  };

  // Mouse leave handler to cancel drawing if the mouse leaves the SVG area
  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentRect(null);
    }
  };

  // Click handler for latitude selection
  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (selectionMode === 'move') return;
    if (selectionMode === 'latitude') {
      const point = getPointInSvg(event);
      if (!point) return;
      const clickedLat = yToLat(point.y);
      if (clickedLat >= -90 && clickedLat <= 90) dispatch(addLatitude(clickedLat));
    }
  };

  // --- Helper to convert SelectionRectangle to SVG rect props ---
  const rectToSvgProps = (rect: SelectionRectangle) => {
    const x = lonToX(rect.minLon);
    const y = latToY(rect.maxLat);
    const width = lonToX(rect.maxLon) - x;
    const height = latToY(rect.minLat) - y;
    return { x, y, width, height };
  };

  return (
    <div className="w-full h-full overflow-hidden relative bg-[#f0f0f0]" data-name="ComposableMap">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
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
            {/* Map Image */}
            <img 
              src="/earth.svg" 
              alt="World Map" 
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} 
            />

            {/* Canvas Heatmap Layer */}
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              style={{ 
                width: '100%', 
                height: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                pointerEvents: 'none',
                imageRendering: 'auto' // Ensures smoothing by the browser
              }}
            />

            {/* Interactive SVG Layer */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              className={selectionMode !== 'move' ? 'cursor-crosshair' : ''}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Latitude Lines */}
              <g id="latitude-lines">
                {selectedLatitudes.map((lat) => (
                  <line
                    key={lat.id}
                    x1="0"
                    y1={latToY(lat.value)}
                    x2={MAP_WIDTH}
                    y2={latToY(lat.value)}
                    stroke={lat.color}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                ))}
              </g>

              {/* Selected Areas */}
              <g id="area-selections">
                {selectedAreas.map((area, index) => {
                  const group = areaGroups.find(g => g.id === area.groupId);
                  const props = rectToSvgProps(area);
                  const color = group?.color || '#888888'; // Default color if group not found
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
                 const minLat = Math.min(...selectedLatitudes.map(l => l.value));
                 const maxLat = Math.max(...selectedLatitudes.map(l => l.value));
                 const lonWidth = 4; 
                 return (
                   <rect 
                     x={lonToX(highlightedLon - lonWidth/2)}
                     y={latToY(maxLat + lonWidth/2)}
                     width={lonToX(highlightedLon + lonWidth/2) - lonToX(highlightedLon - lonWidth/2)}
                     height={latToY(minLat - lonWidth/2) - latToY(maxLat + lonWidth/2)}
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