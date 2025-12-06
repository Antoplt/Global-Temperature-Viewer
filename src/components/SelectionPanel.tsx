// src/components/SelectionPanel.tsx
// Component for the selection panel with mode buttons and selected items list
import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { setSelectionMode, removeLatitude, removeArea, addAreaGroup, setActiveGroupId } from '../slices/selectionSlice';
import { toggleGroupVisibility, LINE_COLORS } from '../slices/selectionSlice';


// --- SelectionPanel Component ---
export const SelectionPanel: React.FC = () => {
  
  const dispatch = useAppDispatch();

  // Retrieve selection state from the store
  const { selectionMode: currentMode, selectedLatitudes, selectedAreas, areaGroups, activeGroupId } = useAppSelector((state) => state.selection);

  // --- Button Styles ---
  const baseButtonClass = "size-[32px] rounded-[4px] border-[1.6px] border-black cursor-pointer hover:bg-gray-200 transition-colors pointer-events-auto";
  const activeClass = "bg-gray-300";   
  const inactiveClass = "bg-[#f3f3f5]"; 


  return (
    <div className="bg-[rgba(255,255,255,0.95)] relative rounded-[10px] shrink-0 w-[250px] max-h-[600px] flex flex-col">
      <div aria-hidden="true" className="absolute border-[0.8px] border-gray-200 border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="p-[16.8px]">
        <div className="space-y-[12px]">
          {/* --- Move Selection Button --- */}
          <div className="flex items-center gap-[12px]">
            <div 
              className={`${baseButtonClass} ${
                currentMode === 'move' ? activeClass : inactiveClass
              }`}
              onClick={() => dispatch(setSelectionMode('move'))} 
            />
            <p className="font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950">Move</p>
          </div>

          {/* --- Latitude Selection Button --- */}
          <div className="flex items-center gap-[12px]">
            <div 
              className={`${baseButtonClass} ${
                currentMode === 'latitude' ? activeClass : inactiveClass
              }`}
              onClick={() => dispatch(setSelectionMode('latitude'))} 
            />
            <p className="font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950">Latitude selection</p>
          </div>
          
          {/* --- Area Selection Button --- */}
          <div className="flex items-center gap-[12px]">
            <div 
              className={`${baseButtonClass} ${
                currentMode === 'area' ? activeClass : inactiveClass
              }`}
              onClick={() => {
                dispatch(setSelectionMode('area'));
                if (areaGroups.length === 0) {
                  const newGroupIndex = 0;
                  dispatch(addAreaGroup({
                    id: new Date().toISOString(),
                    name: `Group ${newGroupIndex + 1}`,
                    color: LINE_COLORS[newGroupIndex % LINE_COLORS.length],
                  }));
                }
              }}
            />
            <p className="font-['Arimo:Regular',sans-serif] text-[16px] text-neutral-950">Area selection</p>
          </div>
        </div>
      </div>
      {/* --- Display of selected latitudes --- */}
      {currentMode === 'latitude' && selectedLatitudes.length > 0 && (
        <>
          <hr className="border-t border-gray-300 mx-[16.8px]" />
          <div className="p-[16.8px] space-y-2 overflow-y-auto">
            <p className="font-['Arimo:Bold',sans-serif] text-sm text-gray-600">Selected Latitudes:</p>
            {selectedLatitudes.map((lat) => (
              <div key={lat.id} className="flex items-center justify-between text-sm">
                <span
                  style={{ color: lat.color, fontWeight: 'bold' }}
                >
                  {lat.value}° {lat.value > 0 ? 'N' : lat.value < 0 ? 'S' : ''}
                </span>
                <button
                  onClick={() => dispatch(removeLatitude(lat.value))}
                  className="font-bold text-red-500 hover:text-red-700 text-lg leading-none px-2"
                  aria-label={`Remove latitude ${lat.value}°`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {/* --- Display of selected areas --- */}
      {currentMode === 'area' && areaGroups.length > 0 && (
        <>
          <hr className="border-t border-gray-300 mx-[16.8px]" />
          <div className="p-[16.8px] space-y-2 overflow-y-auto">
            <p className="font-['Arimo:Bold',sans-serif] text-sm text-gray-600">Area Groups:</p>
            {areaGroups.map((group) => (
              <div 
                key={group.id} 
                className={`p-2 rounded-md border-2 transition-all ${activeGroupId === group.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}
                onClick={() => dispatch(setActiveGroupId(group.id))}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Visual indicator of the active group */}
                    <div className={`w-3 h-3 rounded-full ${activeGroupId === group.id ? 'bg-blue-500 ring-2 ring-blue-200' : 'bg-gray-300'}`} />
                    
                    <input
                      type="checkbox"
                      checked={group.isVisibleInGraph}
                      onChange={(e) => { e.stopPropagation(); dispatch(toggleGroupVisibility(group.id)); }}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span style={{ color: group.color, fontWeight: 'bold' }} className="cursor-pointer select-none">
                      {group.name} {activeGroupId === group.id && <span className="text-xs text-blue-500 ml-1">(Active)</span>}
                    </span>
                  </div>
                  <div className="flex-grow"></div> {/* Space to push the delete button to the right */}
                </div>
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
      {/* Button to add a group */}
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