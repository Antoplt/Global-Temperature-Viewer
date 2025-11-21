import React from 'react';
// 1. Imports corrigés depuis les bons dossiers
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setSelectionMode, removeLatitude, removeArea, addAreaGroup, setActiveGroupId } from '../slices/selectionSlice';
import { LINE_COLORS } from './GraphView'; // Importer les couleurs

export const SelectionPanel: React.FC = () => {
  // 2. Connexion au store Redux
  const dispatch = useAppDispatch();
  // On récupère aussi la liste des latitudes
  const { selectionMode: currentMode, selectedLatitudes, selectedAreas, areaGroups, activeGroupId } = useAppSelector((state) => state.selection);

  // 3. Classes de style pour les boutons
  const baseButtonClass = "size-[32px] rounded-[4px] border-[1.6px] border-black cursor-pointer hover:bg-gray-200 transition-colors pointer-events-auto";
  const activeClass = "bg-gray-300";   // Style pour le bouton actif
  const inactiveClass = "bg-[#f3f3f5]"; // Style pour le bouton inactif

  return (
    <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px] shrink-0 w-[250px] max-h-[600px] flex flex-col">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="p-[16.8px]">
        <div className="space-y-[12px]">
          {/* --- Bouton de sélection Déplacement --- */}
          <div className="flex items-center gap-[12px]">
            <div 
              className={`${baseButtonClass} ${
                currentMode === 'move' ? activeClass : inactiveClass
              }`}
              onClick={() => dispatch(setSelectionMode('move'))} // 4. Action au clic
            />
            <p className="font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950">Move</p>
          </div>

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
      {/* --- AJOUT : Affichage des latitudes sélectionnées --- */}
      {currentMode === 'latitude' && selectedLatitudes.length > 0 && (
        <>
          <hr className="border-t border-gray-300 mx-[16.8px]" />
          <div className="p-[16.8px] space-y-2 overflow-y-auto">
            <p className="font-['Arimo:Bold',sans-serif] text-sm text-gray-600">Selected Latitudes:</p>
            {selectedLatitudes.map((lat, index) => (
              <div key={lat} className="flex items-center justify-between text-sm">
                <span
                  style={{ color: LINE_COLORS[index % LINE_COLORS.length], fontWeight: 'bold' }}
                >
                  {lat}° {lat > 0 ? 'N' : lat < 0 ? 'S' : ''}
                </span>
                <button
                  onClick={() => dispatch(removeLatitude(lat))}
                  className="font-bold text-red-500 hover:text-red-700 text-lg leading-none px-2"
                  aria-label={`Remove latitude ${lat}°`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {/* --- AJOUT : Affichage des zones sélectionnées --- */}
      {areaGroups.length > 0 && (
        <>
          <hr className="border-t border-gray-300 mx-[16.8px]" />
          <div className="p-[16.8px] space-y-2 overflow-y-auto">
            <p className="font-['Arimo:Bold',sans-serif] text-sm text-gray-600">Area Groups:</p>
            {areaGroups.map((group) => (
              <div key={group.id} className={`p-2 rounded-md cursor-pointer ${activeGroupId === group.id ? 'bg-gray-200' : ''}`} onClick={() => dispatch(setActiveGroupId(group.id))}>
                <div style={{ color: group.color, fontWeight: 'bold' }}>{group.name}</div>
                <div className="pl-4 mt-1 space-y-1">
                  {selectedAreas.filter(area => area.groupId === group.id).map((area, index) => (
                    <div key={area.id} className="flex items-center justify-between text-sm text-gray-800">
                      <span>Area {index + 1}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch(removeArea(area.id)); }}
                        className="font-bold text-red-500 hover:text-red-700 text-lg leading-none px-2"
                        aria-label={`Remove area ${index + 1}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Bouton pour ajouter un groupe */}
      {currentMode === 'area' && (
        <>
          <hr className="border-t border-gray-300 mx-[16.8px]" />
          <div className="p-[16.8px]">
            <button
              onClick={() => {
                const newGroupIndex = areaGroups.length;
                dispatch(addAreaGroup({
                  id: new Date().toISOString(),
                  name: `Group ${newGroupIndex + 1}`,
                  color: LINE_COLORS[newGroupIndex % LINE_COLORS.length],
                }));
              }}
              className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              + New Group
            </button>
          </div>
        </>
      )}
    </div>
  );
};