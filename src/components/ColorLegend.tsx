// src/components/ColorLegend.tsx
// Component to display a color legend for temperature anomalies
import { useAppSelector } from '../hooks/hooks';


// --- Color Stops Definition ---
export const COLOR_STOPS = [
  { t: 0.0, color: { r: 18, g: 48, b: 95 } },    // #12305f 
  { t: 0.25, color: { r: 49, g: 91, b: 154 } },   // #315b9a 
  { t: 0.40, color: { r: 93, g: 135, b: 198 } },  // #5d87c6 
  { t: 0.50,    color: { r: 234, g: 234, b: 237 } }, // #eaeaed 
  { t: 0.60,  color: { r: 255, g: 227, b: 65 } },  // #ffe341 
  { t: 0.75,  color: { r: 237, g: 153, b: 31 } },  // #ed991f 
  { t: 1.0,  color: { r: 199, g: 65, b: 11 } },   // #c7410b 
];


// --- Utility Functions ---

// Convert RGB to HEX
export const rgbToHex = (r: number, g: number, b: number) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);


// Interpolate between two colors
const interpolateColor = (c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}, factor: number) => {
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * factor),
        g: Math.round(c1.g + (c2.g - c1.g) * factor),
        b: Math.round(c1.b + (c2.b - c1.b) * factor)
    };
};


// Get color for a given temperature value
export const getTemperatureColor = (value: number, min: number, max: number) => {
    if (value === null || isNaN(value)) return 'transparent';

    // Normalize value to [0, 1]
    let t = (value - min) / (max - min);
    t = Math.max(0, Math.min(1, t));

    // Find surrounding color stops
    let lowerStop = COLOR_STOPS[0];
    let upperStop = COLOR_STOPS[COLOR_STOPS.length - 1];

    // Find the two stops between which t lies
    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        if (t >= COLOR_STOPS[i].t && t <= COLOR_STOPS[i + 1].t) {
            lowerStop = COLOR_STOPS[i];
            upperStop = COLOR_STOPS[i + 1];
            break;
        }
    }

    // Calculate local factor between the two stops
    const range = upperStop.t - lowerStop.t;
    const localFactor = (t - lowerStop.t) / range;

    // Interpolate
    const c1 = lowerStop.color;
    const c2 = upperStop.color;
    const resultRgb = interpolateColor(c1, c2, localFactor);

    return rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b);
};

// --- ColorLegend Component ---
export const ColorLegend = () => {

  // Retrieve min and max anomaly from the store
  const { minAnomaly, maxAnomaly } = useAppSelector((state) => state.data);

  // Generate color scale and degree labels
  const color_scale = COLOR_STOPS.map((stop) => {
    const { r, g, b } = stop.color;
    return rgbToHex(r, g, b)}
  ).reverse();
  
  // Degree labels at specific stops
  const degreeScale = COLOR_STOPS
    .filter((stop) => [0.0, 0.25, 0.5, 0.75, 1.0].includes(stop.t)) 
    .map((stop) => {
      const value = minAnomaly + stop.t * (maxAnomaly - minAnomaly);
      return `${value.toFixed(1)}°C`;
    }
  ).reverse();

  // Create CSS gradient string
  const backgroundGradient = `linear-gradient(to bottom, ${color_scale.join(", ")})`;

  return (
    <div className="relative w-[120px] h-[200px]" data-name="colorScale">

      {/* COLOR BAR */}
      <div className="absolute h-full">
        <div
          style={{
            width: "24px",
            height: "100%",
            borderRadius: "30px",
            border: "1px solid #000",
            background: backgroundGradient,
          }}
        />
      </div>
    
      {/* TICKS (graduations) */}
      <div className="absolute" style={{left: '23px', top: '10px', width: '7px'}}>
        <svg className="w-full h-[1px]" viewBox="0 0 7 1">
          <line stroke="black" x2="7" y1="0.5" y2="0.5" />
        </svg>
      </div>
    
      <div className="absolute" style={{left: '23px', top: '55px', width: '7px'}}>
        <svg className="w-full h-[1px]" viewBox="0 0 7 1">
          <line stroke="black" x2="7" y1="0.5" y2="0.5" />
        </svg>
      </div>
    
      <div className="absolute" style={{left: '23px', top: '100px', width: '7px'}}>
        <svg className="w-full h-[1px]" viewBox="0 0 7 1">
          <line stroke="black" x2="7" y1="0.5" y2="0.5" />
        </svg>
      </div>

      <div className="absolute" style={{left: '23px', top: '145px', width: '7px'}}>
        <svg className="w-full h-[1px]" viewBox="0 0 7 1">
          <line stroke="black" x2="7" y1="0.5" y2="0.5" />
        </svg>
      </div>

      <div className="absolute" style={{left: '23px', top: '190px', width: '7px'}}>
        <svg className="w-full h-[1px]" viewBox="0 0 7 1">
          <line stroke="black" x2="7" y1="0.5" y2="0.5" />
        </svg>
      </div>
    
      {degreeScale.map((label, index) => (
        <div key={index} className="absolute" style={{left: '33px', top: `${index * 45}px`, fontSize: '12px'}}>
          {label}
        </div>
      ))}
    
    </div>
  );
};
