import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../hooks/hooks';
import { updateViewPosition, Position } from '../slices/layoutSlice';
import { GripVertical } from 'lucide-react';

interface DraggableWindowProps {
  id: 'graph' | 'histogram' | 'legend' | 'heatmapView';
  initialPosition: Position;
  children: React.ReactNode;
  title?: string;
  width?: number;
  height?: number;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({ id, initialPosition, children, title, width = 360, height = 200 }) => {
  const dispatch = useAppDispatch();
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync local state with Redux state if it changes externally (e.g. reset)
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  // Handle window resize to keep window in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Use provided width/height or measure if possible (but here we use props for boundary checks)
        // Ideally we would use containerRef.current.offsetWidth but that might cause loops or be 0 initially
        
        let newX = prev.x;
        let newY = prev.y;
        
        // If off screen to the right
        if (newX + 50 > windowWidth) {
          newX = windowWidth - width - 20;
        }
        // If off screen to the bottom
        if (newY + 50 > windowHeight) {
          newY = windowHeight - height - 20;
        }
        
        // Ensure not negative
        newX = Math.max(20, newX);
        newY = Math.max(20, newY);
        
        if (newX !== prev.x || newY !== prev.y) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    // Call once on mount to ensure initial position is valid
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the handle or if no handle is present (but we will add a handle)
    // We'll attach the handler to the handle element.
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { x: position.x, y: position.y };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    const newX = windowStartPos.current.x + dx;
    const newY = windowStartPos.current.y + dy;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Calculate final position to be sure
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const finalX = windowStartPos.current.x + dx;
    const finalY = windowStartPos.current.y + dy;

    dispatch(updateViewPosition({ id, position: { x: finalX, y: finalY } }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 100 : 50,
      }}
      className="pointer-events-auto group"
    >
      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Drag Handle - Floating Pill */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-0 -translate-x-full 
                   w-6 h-12 bg-[rgba(255,255,255,0.6)] backdrop-blur-md rounded-l-xl shadow-sm
                   flex items-center justify-center cursor-move active:cursor-grabbing
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>
    </div>
  );
};
