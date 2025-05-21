// src/components/game/Zeke/DraggableItem.tsx 
// Added a prop to trigger click sound

import React from 'react';
import { GameItem } from './GameData';
import './Game.css';

interface DraggableItemProps {
  item: GameItem;
  isPlaced: boolean;
  onDragStartCustom: () => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, isPlaced, onDragStartCustom }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    onDragStartCustom();
  };

  if (isPlaced) {
    return null;
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="draggable-item"
    >
      <span className="item-text-content">{item.name}</span>
    </div>
  );
};

export default DraggableItem;