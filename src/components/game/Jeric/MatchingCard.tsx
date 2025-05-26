import React from 'react';
import { MatchingCard as MatchingCardType } from '../../../types'; // Use alias to avoid name conflict
import './MatchingCard.css'; // We'll create this CSS next

interface MatchingCardProps {
    card: MatchingCardType;
    handleCardClick: (id: string) => void;
    isDisabled: boolean; // Prop to disable clicks during processing
}

const MatchingCard: React.FC<MatchingCardProps> = ({ card, handleCardClick, isDisabled }) => {
    const handleClick = () => {
        // Only clickable if not face up, not matched, and not disabled (during pair check)
        if (!card.isFaceUp && !card.isMatched && !isDisabled) {
            handleCardClick(card.id);
        }
    };

    return (
        // Use card.id as key when mapping in parent
        <div
            className={`matching-card ${card.isFaceUp ? 'face-up' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={handleClick}
            style={{ pointerEvents: (isDisabled || card.isFaceUp || card.isMatched) ? 'none' : 'auto' }} // Alternative/additional disable
        >
            <div className="matching-card-inner">
                <div className="matching-card-face matching-card-back">
                    {/* Optional: Add a back image or pattern */}
                     {/* <img src="/images/card-back.png" alt="Card Back" className="card-back-icon" /> Update path */}
                    {/* Or just a simple background color/pattern */}
                </div>
                <div className="matching-card-face matching-card-front">
                    {card.type === 'word' ? (
                        <p className="matching-card-word">{card.content}</p>
                    ) : (
                        <div className="matching-card-image-container">
                            <img src={card.imageUrl} alt={card.content} className="matching-card-image" />
                            <p className="matching-card-word matching-card-image-label">{card.content}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchingCard;