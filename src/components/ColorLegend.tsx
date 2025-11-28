import { useAppSelector } from '../hooks/hooks';
import { COLOR_STOPS, rgbToHex } from "./colorScale";

export const ColorLegend = () => {

  const { minAnomaly, maxAnomaly } = useAppSelector((state) => state.data);

  const color_scale = COLOR_STOPS.map((stop) => {
    const { r, g, b } = stop.color;
    return rgbToHex(r, g, b)}
  ).reverse();
  console.log(color_scale);

  const degreeScale = COLOR_STOPS
    .filter((stop) => [0.0, 0.25, 0.5, 0.75, 1.0].includes(stop.t))
    .map((stop) => {
      const value = minAnomaly + stop.t * (maxAnomaly - minAnomaly);
      return `${value.toFixed(1)}°C`;
    }
  ).reverse();
  console.log(degreeScale);

  const backgroundGradient = `linear-gradient(to bottom, ${color_scale.join(", ")})`;

  return (
    <div className="relative w-[120px] h-[200px]" data-name="colorScale">

      {/* BARRE DE COULEUR */}
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
    
      {/* === TICKS (graduations) === */}
    
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