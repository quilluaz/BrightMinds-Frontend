// src/components/game/Zeke/DraggableItem.tsx
import React from 'react';
import { GameItem } from './GameData';
// Game.css might still be used for very generic styles if any, but Tailwind will dominate here.

interface DraggableItemProps {
  item: GameItem;
  isPlaced: boolean;
  onDragStartCustom: () => void;
  // Optional: Pass theme-based text color if needed, though Tailwind below handles it
  // textColorClassName?: string; 
}

const DraggableItem: React.FC<DraggableItemProps> = ({ 
  item, 
  isPlaced, 
  onDragStartCustom,
  // textColorClassName = "text-gray-700 dark:text-gray-200" // Default, can be overridden by Tailwind directly
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    onDragStartCustom();
  };

  if (isPlaced) {
    return null; // Don't render if already placed in a bin
  }

  // This structure mimics how items are displayed in LikasYamanGame's draggable pool
  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="flex flex-col items-center gap-1 cursor-grab transform transition-transform hover:scale-110" // Outer container for circle + label
      title={item.name}
    >
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md text-lg font-bold border-2 border-orange-300 dark:border-orange-500 bg-orange-400 dark:bg-orange-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all select-none overflow-hidden group"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 md:w-16 md:h-16 object-contain rounded-full group-hover:scale-105 transition-transform duration-200"
            draggable={false} // Prevent native image drag interference
          />
        ) : (
          <span className="text-2xl md:text-3xl text-white dark:text-gray-100"> {/* Fallback for no image */}
            {item.name[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <span className={`mt-1 text-xs sm:text-sm font-medium text-center text-gray-700 dark:text-gray-200 w-20 truncate`}>
        {item.name}
      </span>
    </div>
  );
};

export default DraggableItem;