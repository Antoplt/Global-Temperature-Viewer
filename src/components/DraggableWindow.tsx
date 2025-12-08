//src/components/DraggableWindow.tsx
// Component for draggable and resizable windows
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../hooks/hooks';
import { updateViewPosition, Position } from '../slices/layoutSlice';
import { GripVertical, ArrowDownRight } from 'lucide-react';


// --- Props Interface ---
interface DraggableWindowProps {
  id: 'graph' | 'histogram' | 'colorLegend' | 'heatmapView' | 'extremesPanel';
  initialPosition: Position;
  children: React.ReactNode;
  title?: string;
  width?: number;
  height?: number;
  resizable?: boolean;
}


// --- DraggableWindow Component ---
export const DraggableWindow: React.FC<DraggableWindowProps> = ({ 
  id, 
  initialPosition, 
  children, 
  title, 
  width: initialWidth = 360, 
  height: initialHeight = 200,
  resizable = true 
}) => {
  const dispatch = useAppDispatch();
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs to track positions during drag/resize
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  // Sync local state with Redux state if it changes externally (e.g. reset)
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  // Handle window resize to keep window in bounds
  useEffect(() => {
    if (isResizing) return; // Don't clamp while resizing

    const handleResize = () => {
      setPosition((prev) => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let newX = prev.x;
        let newY = prev.y;
        
        // If off screen to the right
        if (newX + 50 > windowWidth) {
          newX = windowWidth - size.width - 20;
        }
        // If off screen to the bottom
        if (newY + 50 > windowHeight) {
          newY = windowHeight - size.height - 20;
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
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [size.width, size.height, isResizing]);

  // --- Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { x: position.x, y: position.y };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Mouse move handler for dragging
  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    const newX = windowStartPos.current.x + dx;
    const newY = windowStartPos.current.y + dy;

    setPosition({ x: newX, y: newY });
  };

  // Mouse up handler to stop dragging
  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const finalX = windowStartPos.current.x + dx;
    const finalY = windowStartPos.current.y + dy;

    dispatch(updateViewPosition({ id, position: { x: finalX, y: finalY } }));
  };

  // --- Resize Logic ---
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: size.width, height: size.height };
    
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  // Mouse move handler for resizing
  const handleResizeMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - resizeStartPos.current.x;
    const dy = e.clientY - resizeStartPos.current.y;
    
    const newWidth = Math.max(200, startSize.current.width + dx); // Min width 200
    const newHeight = Math.max(150, startSize.current.height + dy); // Min height 150

    setSize({ width: newWidth, height: newHeight });
  };

  // Mouse up handler to stop resizing
  const handleResizeMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  };

  // Clone children to pass width and height
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { width: size.width, height: size.height });
    }
    return child;
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging || isResizing ? 100 : 50,
      }}
      className="pointer-events-auto group"
    >
      {/* Content */}
      <div className="relative w-full h-full">
        {childrenWithProps}
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

      {/* Resize Handle - Bottom Right Corner */}
      {resizable && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute w-6 h-6 cursor-se-resize z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ bottom: 0, right: 0 }}
        >
           <ArrowDownRight className="w-4 h-4 text-gray-500" />
        </div>
      )}
    </div>
  );
};
