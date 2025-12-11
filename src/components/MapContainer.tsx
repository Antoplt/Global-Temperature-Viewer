// src/components/MapContainer.tsx
// Component for the interactive world map with temperature anomaly heatmap and selection features
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { addLatitude, addArea, SelectionRectangle } from '../slices/selectionSlice';
import { AnomalyData } from '../slices/dataSlice';
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
  const [cursorPos, setCursorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [hoveredExtreme, setHoveredExtreme] = useState<{ data: AnomalyData; rank: number; isHot: boolean } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // --- Redux States ---
  const { selectionMode, selectedLatitudes, selectedAreas, highlightedLon, areaGroups, activeGroupId } = useAppSelector((state) => state.selection);
  const { allData, minAnomaly, maxAnomaly, status } = useAppSelector((state) => state.data);
  const { currentYear } = useAppSelector((state) => state.controls);
  const showExtremes = useAppSelector((state) => state.layout.visibleViews.extremes);

  const extremes = useMemo(() => {
    if (!allData || allData.length === 0) return { top5: [], flop5: [] };

    const yearData = allData.filter((d) => d.year === currentYear);
    
    // Function to filter points that are too close (within ~20 degrees)
    const filterClosestPoints = (sortedData: AnomalyData[], maxPoints: number = 5, minDistance: number = 20) => {
      const filtered: AnomalyData[] = [];
      
      for (const point of sortedData) {
        // Check if this point is far enough from all already selected points
        const isFarEnough = filtered.every(existing => {
          const latDiff = Math.abs(existing.lat - point.lat);
          const lonDiff = Math.abs(existing.lon - point.lon);
          return latDiff > minDistance || lonDiff > minDistance;
        });
        
        if (isFarEnough) {
          filtered.push(point);
          if (filtered.length >= maxPoints) break;
        }
      }
      
      return filtered;
    };
    
    // Sort descending for hottest
    const sortedDesc = [...yearData].sort((a, b) => b.anomaly - a.anomaly);
    const top5 = filterClosestPoints(sortedDesc, 5);

    // Sort ascending for coldest
    const sortedAsc = [...yearData].sort((a, b) => a.anomaly - b.anomaly);
    const flop5 = filterClosestPoints(sortedAsc, 5);

    return { top5, flop5 };
  }, [allData, currentYear]);

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
    const point = getPointInSvg(event);
    if (!point) return;

    setCursorPos({
      lat: yToLat(point.y),
      lon: xToLon(point.x)
    });

    if (!isDrawing || !startPoint) return;

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
    setCursorPos(null);
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
      {cursorPos && (
        <div className="absolute top-0 left-0 z-50 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-br-md text-[10px] font-mono border-r border-b border-gray-200 shadow-sm pointer-events-none flex gap-3 text-gray-700">
          <span>Lat: <span className="font-bold text-black">{cursorPos.lat.toFixed(1)}°</span></span>
          <span>Lon: <span className="font-bold text-black">{cursorPos.lon.toFixed(1)}°</span></span>
        </div>
      )}
      
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

              {/* Extremes Emojis */}
              {showExtremes && (
                <g id="extremes-markers">
                  {extremes.top5.map((d, i) => (
                    <text
                      key={`hot-${i}`}
                      x={lonToX(d.lon)}
                      y={latToY(d.lat)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20"
                      className="cursor-pointer select-none"
                      onMouseEnter={() => setHoveredExtreme({ data: d, rank: i + 1, isHot: true })}
                      onMouseMove={(e) => {
                          const rect = svgRef.current?.getBoundingClientRect();
                          if (rect) {
                            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                      }}
                      onMouseLeave={() => {
                          setHoveredExtreme(null);
                          setMousePos(null);
                      }}
                    >
                      🔥
                    </text>
                  ))}
                  {extremes.flop5.map((d, i) => (
                    <text
                      key={`cold-${i}`}
                      x={lonToX(d.lon)}
                      y={latToY(d.lat)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="20"
                      className="cursor-pointer select-none"
                      onMouseEnter={() => setHoveredExtreme({ data: d, rank: i + 1, isHot: false })}
                      onMouseMove={(e) => {
                          const rect = svgRef.current?.getBoundingClientRect();
                          if (rect) {
                            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                      }}
                      onMouseLeave={() => {
                          setHoveredExtreme(null);
                          setMousePos(null);
                      }}
                    >
                      ❄️
                    </text>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Extreme Point Tooltip */}
      {hoveredExtreme && mousePos && (
        <div 
            className="absolute z-[9999] pointer-events-none"
            style={{ 
                left: mousePos.x + 15,
                top: mousePos.y + 15,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                fontSize: '14px'
            }}
        >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {hoveredExtreme.isHot ? `🔥 ${hoveredExtreme.rank}${hoveredExtreme.rank === 1 ? 'ère' : 'e'} plus forte anomalie positive` : `❄️ ${hoveredExtreme.rank}${hoveredExtreme.rank === 1 ? 'ère' : 'e'} plus forte anomalie négative`}
            </div>
            <div style={{ fontSize: '12px' }}>Lat: {hoveredExtreme.data.lat}°, Lon: {hoveredExtreme.data.lon}°</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px', color: hoveredExtreme.data.anomaly > 0 ? '#dc2626' : '#2563eb' }}>
                Anomalie: {hoveredExtreme.data.anomaly > 0 ? '+' : ''}{hoveredExtreme.data.anomaly.toFixed(2)}°C
            </div>
        </div>
      )}
    </div>
  );
};