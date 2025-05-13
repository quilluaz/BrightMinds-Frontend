// src/components/game/Zeke/SortingBin.tsx
// No structural changes needed for these improvements.

import React from 'react';
import { Category, GameItem } from './GameData';
import './Game.css';

interface SortingBinProps {
  category: Category;
  onDropItem: (item: GameItem, categoryKey: Category['key']) => void;
  droppedItemsHere: GameItem[]; 
}

const SortingBin: React.FC<SortingBinProps> = ({ category, onDropItem, droppedItemsHere }) => {
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const itemDataString = event.dataTransfer.getData('application/json');
    if (itemDataString) {
      try {
        const droppedItem: GameItem = JSON.parse(itemDataString);
        onDropItem(droppedItem, category.key);
      } catch (e) {
        console.error("Failed to parse dropped item data:", e);
      }
    }
  };

  return (
    <div
      className="sorting-bin"
      style={{ borderColor: category.color }} 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h3 className="bin-title" style={{ backgroundColor: category.color, color: category.textColor || '#FFFFFF' }}>
        {category.title}
      </h3>
      <div className="dropped-items-container">
        {droppedItemsHere.map(item => (
          <div key={item.id} className="dropped-item-preview" title={item.name} style={{backgroundColor: category.color, borderColor: category.textColor === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)' }}>
            <span style={{color: category.textColor || '#FFFFFF'}}>{item.name.substring(0,1).toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortingBin;