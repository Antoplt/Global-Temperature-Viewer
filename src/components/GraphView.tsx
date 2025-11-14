import React from 'react';
import svgPaths from '../imports/svg-fsqvf8pn71';
// 1. Import du hook
import { useAppSelector } from '../hooks/hooks';

// 2. Suppression de 'GraphViewProps' et de la prop '{ data }'
export const GraphView: React.FC = () => {

  // 3. Récupération des données directement depuis le store
  const { allData, status } = useAppSelector((state) => state.data);
  
  // Optionnel : Gérer l'état de chargement si vous le souhaitez ici
  // if (status !== 'succeeded') {
  //   return <div>Loading graph...</div>; // Ou un placeholder
  // }

  // --- Votre JSX et design sont INCHANGÉS ---
  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[200px] relative rounded-[10px] shrink-0 w-[360px]" data-name="TemperatureGraph">
      <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[200px] items-start pb-[1.6px] pl-[8px] pr-[13.4px] pt-[13.6px] relative w-[360px]">
        <div className="h-[173px] relative shrink-0 w-full" data-name="Container">
          {/* Chart Area */}
          <div className="absolute h-[173px] left-0 overflow-visible top-0 w-full" data-name="Icon">
            {/* Y-axis labels */}
            <div className="absolute left-[2px] top-[5px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">1.5</p>
            </div>
            <div className="absolute left-[2px] top-[50px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">1.0</p>
            </div>
            <div className="absolute left-[2px] top-[95px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">0.5</p>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute left-[60px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">1980</p>
            </div>
            <div className="absolute left-[150px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">2000</p>
            </div>
            <div className="absolute left-[240px] top-[118px]">
              <p className="font-['Arimo:Regular',sans-serif] text-[10px] text-gray-600">2020</p>
            </div>
            
            {/* Grid Lines */}
            <div className="absolute left-[28px] top-[5px] right-[10px] bottom-[50px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 263 110">
                <g id="Group">
                  <path d="M0 109.5H263" stroke="#CCCCCC" strokeDasharray="3 3" />
                  <path d="M0 55H263" stroke="#CCCCCC" strokeDasharray="3 3" />
                  <path d="M0 0.5H263" stroke="#CCCCCC" strokeDasharray="3 3" />
                </g>
              </svg>
            </div>
            
            {/* Temperature Line */}
            <div className="absolute left-[28px] top-[8px] right-[10px] bottom-[60px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 265 86">
                <g>
                  {/*
                    *** NOTE IMPORTANTE ***
                    Ce chemin 'svgPaths.p10b2bd80' est STATIQUE. Il vient de la maquette Figma.
                    Pour que le graphique soit dynamique, vous devrez remplacer
                    ce <path> par une logique qui génère un chemin SVG
                    basé sur les 'allData' (ex: avec D3.js ou Recharts).
                  */}
                  <path d={svgPaths.p10b2bd80} stroke="#DC2626" strokeWidth="2" fill="none" />
                </g>
              </svg>
            </div>
          </div>
          
          {/* Legend */}
          <div className="absolute h-[24px] left-[64.71px] top-[144px] w-[223.563px]" data-name="Legend">
            <div className="absolute left-0 size-[14px] top-[7.4px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                <g>
                  <path d={svgPaths.p10f52180} stroke="#DC2626" strokeWidth="1.75" />
                </g>
              </svg>
            </div>
            <div className="absolute content-stretch flex h-[21.6px] items-start left-[18px] top-[0.8px] w-[205.563px]">
              <p className="font-['Arimo:Regular',sans-serif] leading-[24px] relative shrink-0 text-[16px] text-center text-nowrap text-red-600 whitespace-pre">Global Temperature Anomaly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};