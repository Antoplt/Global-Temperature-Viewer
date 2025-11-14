import React from 'react';
// 1. Import du hook
import { useAppSelector } from '../hooks/hooks';

// 2. Suppression de 'MapContainerProps' et de la prop '{ currentYear }'
export const MapContainer: React.FC = () => {

  // 3. Récupération de 'currentYear' directement depuis le store
  const currentYear = useAppSelector((state) => state.controls.currentYear);

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

  return (
    <div className="w-full h-full overflow-visible relative" data-name="ComposableMap">
      <svg viewBox="0 0 1200 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ transform: 'translateY(-10%)' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
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
        
        {/* Ocean background */}
        <rect x="0" y="0" width="1200" height="600" fill="#E0F2FE" opacity="0.3" style={{ mixBlendMode: 'multiply' }} />
      </svg>
    </div>
  );
};