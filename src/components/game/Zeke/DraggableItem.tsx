// src/components/game/Zeke/DraggableItem.tsx 
// Added a prop to trigger click sound

import React from 'react';
import { GameItem } from './GameData';
import './Game.css';

interface DraggableItemProps {
  item: GameItem;
  isPlaced: boolean;
  onDragStartCustom?: () => void; // Optional prop for custom drag start logic (e.g. sound)
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, isPlaced, onDragStartCustom }) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    if (onDragStartCustom) {
      onDragStartCustom(); // Play click sound
    }
  };

  if (isPlaced) {
    return null; 
  }

  return (
    <div
      id={item.id}
      className="draggable-item"
      draggable
      onDragStart={handleDragStart}
      title={item.name} 
    >
      <span className="item-text-content">{item.name}</span>
    </div>
  );
};

export default DraggableItem;