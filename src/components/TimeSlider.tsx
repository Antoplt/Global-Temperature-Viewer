// src/components/TimeSlider.tsx
// Component for selecting year via slider and input box
import React, { useState, useEffect } from 'react';


// --- Props Interface ---
interface TimeSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}


// --- Constants for year range ---
const MIN_YEAR = 1880;
const MAX_YEAR = 2024; 


// --- TimeSlider Component ---
export const TimeSlider: React.FC<TimeSliderProps> = ({ currentYear, onYearChange }) => {
  const [inputValue, setInputValue] = useState(currentYear.toString());

  // Update the input field value if the year changes externally (e.g., slider)
  useEffect(() => {
    setInputValue(currentYear.toString());
  }, [currentYear]);

  // Handle Enter key press in the input box
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const newYear = parseInt(inputValue, 10);

      // Validate that the value is a number and within the allowed range
      if (!isNaN(newYear) && newYear >= MIN_YEAR && newYear <= MAX_YEAR) {
        onYearChange(newYear);
      } else {
        // If invalid, reset to the current year
        setInputValue(currentYear.toString());
      }
      // Remove focus from the input field after submission
      event.currentTarget.blur();
    }
  };

  return (
    <div className="w-full flex items-center gap-[16px] h-[35.2px]">
      {/* YEAR Label */}
      <div className="shrink-0 flex items-center h-full">
        <p className="font-['Arimo:Bold',sans-serif] text-[16px] text-neutral-950 whitespace-pre">YEAR</p>
      </div>

      {/* Year Input Box */}
      <div className="relative w-[80px] h-full shrink-0">
        <div aria-hidden="true" className="absolute border-[1.6px] border-black border-solid inset-0 pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setInputValue(currentYear.toString())}
          className="w-full h-full bg-transparent text-center font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950 focus:outline-none"
          aria-label="Year input"
        />
      </div>

      {/* Slider */}
      <div className="flex-1 flex items-center h-full">
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step="1"
          value={currentYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
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
  );
};