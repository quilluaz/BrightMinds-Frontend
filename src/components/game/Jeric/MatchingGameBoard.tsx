// src/components/game/MatchingGameBoard.tsx
import React from 'react';
import MatchingCard from './MatchingCard';
import { MatchingCard as MatchingCardType } from '../../../types'; // Use alias
import './MatchingGameBoard.css'; // We'll create this CSS next

interface MatchingGameBoardProps {
    cards: MatchingCardType[];
    handleCardClick: (id: string) => void;
    isBoardDisabled: boolean; // Prop to disable clicks on the whole board sometimes
}

const MatchingGameBoard: React.FC<MatchingGameBoardProps> = ({ cards, handleCardClick, isBoardDisabled }) => {
    return (
        <div className="matching-game-board">
            {cards.map(card => (
                <MatchingCard
                    key={card.id}
                    card={card}
                    handleCardClick={handleCardClick}
                    isDisabled={isBoardDisabled} // Pass down the disabled state
                />
            ))}
        </div>
    );
};

export default MatchingGameBoard;