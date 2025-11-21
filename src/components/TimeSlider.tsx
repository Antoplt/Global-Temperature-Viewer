import React, { useState, useEffect } from 'react';

interface TimeSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

const MIN_YEAR = 1880;
const MAX_YEAR = 2024; // Mettez ici l'année max de vos données

export const TimeSlider: React.FC<TimeSliderProps> = ({ currentYear, onYearChange }) => {
  const [inputValue, setInputValue] = useState(currentYear.toString());

  // Mettre à jour la valeur du champ si l'année change depuis l'extérieur (ex: slider)
  useEffect(() => {
    setInputValue(currentYear.toString());
  }, [currentYear]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const newYear = parseInt(inputValue, 10);

      // Valide que la valeur est un nombre et dans la plage autorisée
      if (!isNaN(newYear) && newYear >= MIN_YEAR && newYear <= MAX_YEAR) {
        onYearChange(newYear);
      } else {
        // Si invalide, réinitialise à l'année actuelle
        setInputValue(currentYear.toString());
      }
      // Optionnel: retire le focus du champ après la soumission
      event.currentTarget.blur();
    }
  };

  return (
    <div className="content-stretch flex gap-[16px] h-[35.2px] items-center" data-name="Container">
      {/* YEAR Label */}
      <div className="h-[24px] relative shrink-0 w-[38.375px]" data-name="Text">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[38.375px]">
          <p className="absolute font-['Arimo:Bold',sans-serif] leading-[24px] left-0 text-[16px] text-neutral-950 text-nowrap top-[-2.2px] whitespace-pre">YEAR</p>
        </div>
      </div>

      {/* Year Input and Slider */}
      <div className="basis-0 grow h-[35.2px] min-h-px min-w-px relative shrink-0" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[35.2px] relative w-full">
          
          {/* Year Display */}
          <div className="absolute h-[35.2px] left-0 top-0 w-[80px]" data-name="Container">
            {/* Bordure décorative (inchangée) */}
            <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setInputValue(currentYear.toString())} // Réinitialise si on quitte le champ sans valider
              className="w-full h-full bg-transparent text-center font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950 focus:outline-none"
              // Ajout de `aria-label` pour l'accessibilité
              aria-label="Year input, press Enter to submit"
            />
          </div>

          {/* --- SLIDER AVEC CLASSES CORRIGÉES --- */}
          <div className="absolute h-[16px] left-[88px] top-[9.6px] w-full flex items-center pr-4"> {/* Ajustement du conteneur */}
            <input
              type="range"
              min={MIN_YEAR}
              max={MAX_YEAR}
              step="1"
              value={currentYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              // *** Voici les classes copiées du slider de vitesse (qui marche) ***
              className="w-full h-[4px] bg-gray-300 rounded-full appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-[14px] 
              [&::-webkit-slider-thumb]:h-[14px] 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-black 
              [&::-webkit-slider-thumb]:cursor-pointer 
              [&::-moz-range-thumb]:w-[14px] 
              [&::-moz-range-thumb]:h-[14px] 
              [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-black 
              [&::-moz-range-thumb]:border-0 
              [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>

        </div>
      </div>
    </div>
  );
};