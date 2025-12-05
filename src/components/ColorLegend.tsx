import { useAppSelector } from '../hooks/hooks';

// --- Logic from colorScale.ts ---

// Palette "RdBu" (Red-Blue) inversée et adaptée pour la température
// Ces codes hexadécimaux proviennent des échelles de couleur professionnelles (ColorBrewer)
export const COLOR_STOPS = [
  { t: 0.0, color: { r: 18, g: 48, b: 95 } },    // #12305f (Bleu profond)
  { t: 0.25, color: { r: 49, g: 91, b: 154 } },   // #315b9a (Bleu moyen)
  { t: 0.40, color: { r: 93, g: 135, b: 198 } },  // #5d87c6 (Bleu clair)
  { t: 0.50,    color: { r: 234, g: 234, b: 237 } }, // #eaeaed (Blanc/Gris neutre)
  { t: 0.60,  color: { r: 255, g: 227, b: 65 } },  // #ffe341 (Jaune)
  { t: 0.75,  color: { r: 237, g: 153, b: 31 } },  // #ed991f (Orange)
  { t: 1.0,  color: { r: 199, g: 65, b: 11 } },   // #c7410b (Rouge profond)
];

export const rgbToHex = (r: number, g: number, b: number) =>
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

const interpolateColor = (c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}, factor: number) => {
    return {
        r: Math.round(c1.r + (c2.r - c1.r) * factor),
        g: Math.round(c1.g + (c2.g - c1.g) * factor),
        b: Math.round(c1.b + (c2.b - c1.b) * factor)
    };
};

export const getTemperatureColor = (value: number, min: number, max: number) => {
    if (value === null || isNaN(value)) return 'transparent';

    // 1. Normaliser la valeur entre 0 et 1 par rapport aux bornes Min/Max
    // On clamp (limite) la valeur pour ne pas dépasser 0 ou 1 si une donnée est hors bornes
    let t = (value - min) / (max - min);
    t = Math.max(0, Math.min(1, t));

    // 2. Trouver les deux "stops" de couleur qui encadrent notre valeur t
    let lowerStop = COLOR_STOPS[0];
    let upperStop = COLOR_STOPS[COLOR_STOPS.length - 1];

    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        if (t >= COLOR_STOPS[i].t && t <= COLOR_STOPS[i + 1].t) {
            lowerStop = COLOR_STOPS[i];
            upperStop = COLOR_STOPS[i + 1];
            break;
        }
    }

    // 3. Calculer le facteur local entre ces deux stops
    // Ex: si stops à 0.5 et 0.6, et t = 0.55, alors localFactor = 0.5
    const range = upperStop.t - lowerStop.t;
    const localFactor = (t - lowerStop.t) / range;

    // 4. Interpoler
    const c1 = lowerStop.color;
    const c2 = upperStop.color;
    const resultRgb = interpolateColor(c1, c2, localFactor);

    return rgbToHex(resultRgb.r, resultRgb.g, resultRgb.b);
};

// --- Component ---

export const ColorLegend = () => {

  const { minAnomaly, maxAnomaly } = useAppSelector((state) => state.data);

  const color_scale = COLOR_STOPS.map((stop) => {
    const { r, g, b } = stop.color;
    return rgbToHex(r, g, b)}
  ).reverse();
  
  const degreeScale = COLOR_STOPS
    .filter((stop) => [0.0, 0.25, 0.5, 0.75, 1.0].includes(stop.t))
    .map((stop) => {
      const value = minAnomaly + stop.t * (maxAnomaly - minAnomaly);
      return `${value.toFixed(1)}°C`;
    }
  ).reverse();

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
