import React from 'react';
// 1. Imports corrigés depuis les bons dossiers
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setSelectionMode } from '../slices/selectionSlice';

export const SelectionPanel: React.FC = () => {
  // 2. Connexion au store Redux
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((state) => state.selection.selectionMode);

  // 3. Classes de style pour les boutons
  const baseButtonClass = "size-[32px] rounded-[4px] border-[1.6px] border-black cursor-pointer hover:bg-gray-200 transition-colors pointer-events-auto";
  const activeClass = "bg-gray-300";   // Style pour le bouton actif
  const inactiveClass = "bg-[#f3f3f5]"; // Style pour le bouton inactif

  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[109.6px] relative rounded-[10px] shrink-0 w-[205.85px]">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="p-[16.8px]">
        <div className="space-y-[12px]">
          {/* --- Bouton de sélection Latitude --- */}
          <div className="flex items-center gap-[12px]">
            <div 
              className={`${baseButtonClass} ${
                currentMode === 'latitude' ? activeClass : inactiveClass
              }`}
              onClick={() => dispatch(setSelectionMode('latitude'))} // 4. Action au clic
            />
            <p className="font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950">Latitude selection</p>
          </div>
          
          {/* --- Bouton de sélection Area --- */}
          <div className="flex items-center gap-[12px]">
            <div 
              className={`${baseButtonClass} ${
                currentMode === 'area' ? activeClass : inactiveClass
              }`}
              onClick={() => dispatch(setSelectionMode('area'))} // 4. Action au clic
            />
            <p className="font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950">Area selection</p>
          </div>
        </div>
      </div>
    </div>
  );
};