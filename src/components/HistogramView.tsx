import React from 'react';
// 1. Import du hook
import { useAppSelector } from '../hooks/hooks';
// import { AnomalyData } from '../slices/dataSlice'; // Optionnel : pour typer 'yearData'

interface HistogramViewProps {
  // 2. L'interface 'data' n'est plus nécessaire
  // data: any[];
}

// 3. Suppression de la prop '{ data }'
export const HistogramView: React.FC<HistogramViewProps> = () => {

  // 4. Récupération des données ET de l'année en cours
  const { allData } = useAppSelector((state) => state.data);
  const currentYear = useAppSelector((state) => state.controls.currentYear);
  
  // 5. Logique de filtrage (à utiliser pour générer les barres dynamiques)
  // Note : 'useMemo' serait idéal ici pour la performance
  const yearData = allData.filter(d => d.year === currentYear);
  
  // --- Le JSX est inchangé, SAUF la légende ---
  return (
    <div className="basis-0 bg-[rgba(255,255,255,0.95)] grow min-h-px min-w-px relative rounded-[10px] shrink-0 w-[360px]" data-name="TemperatureHistogram">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-full items-start pb-[1.6px] pl-[8px] pr-[13.4px] pt-[13.6px] relative w-[360px]">
        <div className="h-[173px] relative shrink-0 w-full" data-name="Container">
          {/* Histogram Chart Area */}
          <div className="absolute h-[173px] left-0 overflow-visible top-0 w-full">
            {/* Y-axis labels */}
            <div className="absolute left-[0px] top-[5px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">100</p>
            </div>
            <div className="absolute left-[5px] top-[50px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">50</p>
            </div>
            <div className="absolute left-[10px] top-[95px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">0</p>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute left-[70px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">-2°</p>
            </div>
            <div className="absolute left-[135px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">0°</p>
            </div>
            <div className="absolute left-[200px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">2°</p>
            </div>
            <div className="absolute left-[265px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">4°</p>
            </div>
            
            {/* Grid Lines */}
            <div className="absolute left-[28px] top-[5px] right-[10px] bottom-[50px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 263 110">
                <g>
                  <path d="M0 109.5H263" stroke="#CCCCCC" strokeDasharray="3 3" />
                  <path d="M0 55H263" stroke="#CCCCCC" strokeDasharray="3 3" />
                  <path d="M0 0.5H263" stroke="#CCCCCC" strokeDasharray="3 3" />
                </g>
              </svg>
            </div>
            
            {/* Sample Bars */}
            <div className="absolute left-[28px] top-[10px] right-[10px] bottom-[60px]">
              <svg viewBox="0 0 270 104" className="block size-full">
                {/*
                  *** NOTE IMPORTANTE ***
                  Ces barres <rect> sont STATIQUES (maquette Figma).
                  Pour que l'histogramme soit dynamique, vous devrez :
                  1. Calculer la distribution des anomalies pour 'yearData' (données de l'année en cours).
                  2. Remplacer ces <rect> statiques par des barres générées
                     dynamiquement (ex: en bouclant sur vos données de distribution).
                */}
                <rect x="5" y="20" width="38" height="83.55" fill="#3B82F6" />
                <rect x="53" y="10" width="38" height="93.55" fill="#3B82F6" />
                <rect x="101" y="30" width="38" height="73.55" fill="#3B82F6" />
                <rect x="149" y="5" width="38" height="98.55" fill="#3B82F6" />
                <rect x="197" y="15" width="38" height="88.55" fill="#3B82F6" />
              </svg>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute h-[24px] left-[103.63px] top-[144px] w-[145.738px]">
            <div className="absolute left-0 size-[14px] top-[7.4px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <path d="M0 1.75H14V12.25H0V1.75Z" fill="#3B82F6" />
              </svg>
            </div>
            <div className="absolute content-stretch flex h-[21.6px] items-start left-[18px] top-[0.8px] w-[127.738px]">
              {/* 6. Légende rendue dynamique */}
              <p className="font-['Arimo:Regular',sans-serif] leading-[24px] relative shrink-0 text-[16px] text-blue-500 text-center text-nowrap whitespace-pre">
                Temperature {currentYear}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};