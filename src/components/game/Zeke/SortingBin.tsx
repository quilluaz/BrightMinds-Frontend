// src/components/game/Zeke/SortingBin.tsx
// No structural changes needed for these improvements.

import React from 'react';
import { Category, GameItem } from './GameData';
import { useTheme } from '../../../context/ThemeContext';
import './Game.css';

interface SortingBinProps {
  category: Category;
  onDropItem: (item: GameItem, categoryKey: Category['key']) => void;
  droppedItemsHere: GameItem[];
}

const SortingBin: React.FC<SortingBinProps> = ({ category, onDropItem, droppedItemsHere }) => {
  const { theme } = useTheme();
  const binBg = theme === 'dark' ? '#23244a' : '#fff';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData('text/plain');
    try {
      const item = JSON.parse(itemData) as GameItem;
      onDropItem(item, category.key);
    } catch (error) {
      console.error('Error parsing dropped item:', error);
    }
  };

  return (
    <div
      className="sorting-bin"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ borderColor: category.color, background: binBg }}
    >
      <h3 className="bin-title" style={{ backgroundColor: category.color, color: category.textColor || '#FFFFFF' }}>
        {category.title}
      </h3>
      <div className="dropped-items-container">
        {droppedItemsHere.map(item => (
          <div
            key={item.id}
            className="dropped-item-preview w-14 h-14 flex items-center justify-center"
            title={item.name}
            style={{
              backgroundColor: category.color,
              borderColor: category.textColor === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'
            }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-contain rounded-full"
                draggable={false}
              />
            ) : (
              <span style={{ color: category.textColor || '#FFFFFF' }}>
                {item.name.substring(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortingBin;