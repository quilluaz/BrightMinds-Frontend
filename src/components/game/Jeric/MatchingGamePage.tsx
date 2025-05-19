import React, { useState, useEffect } from 'react';
import MatchingGameBoard from './MatchingGameBoard';
import { anyongTubigPairs as rawPairsData } from '../../../data/anyongTubigPairs'; // Renamed for clarity
import { MatchingPair, MatchingCard as MatchingCardType } from '../../../types'; // Import both types
import shuffleArray from '../../../utils/shuffleArray'; // Your shuffle utility

const MatchingGamePage: React.FC = () => {
    const [cards, setCards] = useState<MatchingCardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<MatchingCardType[]>([]);
    const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
    const [isBoardDisabled, setIsBoardDisabled] = useState(false); // To disable clicks during checks

    useEffect(() => {
        // Initialize and prepare cards from the raw data
        const preparedCards: MatchingCardType[] = [];
        rawPairsData.forEach((pair: MatchingPair) => {
            // Word card
            preparedCards.push({
                id: `pair-${pair.id}-word`, // Unique ID for the word card
                pairId: pair.id,
                type: 'word',
                content: pair.word,
                isFaceUp: false,
                isMatched: false,
            });
            // Picture card
            preparedCards.push({
                id: `pair-${pair.id}-image`, // Unique ID for the image card
                pairId: pair.id,
                type: 'picture',
                content: pair.word, // Alt text or identifier for the image
                imageUrl: pair.imageUrl,
                isFaceUp: false,
                isMatched: false,
            });
        });
        setCards(shuffleArray(preparedCards));
    }, []); // Empty dependency array means this runs once on mount

    const handleCardClick = (clickedCardId: string) => {
        if (isBoardDisabled || flippedCards.length >= 2) {
            return; // Do nothing if board is disabled or 2 cards are already flipped
        }

        const cardToFlip = cards.find(c => c.id === clickedCardId);
        if (!cardToFlip || cardToFlip.isFaceUp || cardToFlip.isMatched) {
            return; // Card already flipped, matched, or not found
        }

        // Flip the card
        const newCards = cards.map(card =>
            card.id === clickedCardId ? { ...card, isFaceUp: true } : card
        );
        setCards(newCards);

        const newlyFlippedCard = newCards.find(c => c.id === clickedCardId)!; // We know it exists
        const currentFlipped = [...flippedCards, newlyFlippedCard];
        setFlippedCards(currentFlipped);

        // If two cards are flipped, check for a match
        if (currentFlipped.length === 2) {
            setIsBoardDisabled(true); // Disable board during check
            const [firstCard, secondCard] = currentFlipped;

            if (firstCard.pairId === secondCard.pairId) {
                // It's a match!
                setMatchedPairIds(prev => [...prev, firstCard.pairId]);
                setCards(prevCards =>
                    prevCards.map(card =>
                        card.pairId === firstCard.pairId ? { ...card, isMatched: true, isFaceUp: true } : card
                    )
                );
                setFlippedCards([]);
                setIsBoardDisabled(false);
            } else {
                // Not a match, flip them back after a delay
                setTimeout(() => {
                    setCards(prevCards =>
                        prevCards.map(card =>
                            (card.id === firstCard.id || card.id === secondCard.id)
                                ? { ...card, isFaceUp: false }
                                : card
                        )
                    );
                    setFlippedCards([]);
                    setIsBoardDisabled(false);
                }, 1000); // 1 second delay
            }
        }
    };

    // Update cards' isMatched status based on matchedPairIds (e.g. on initial load if game was saved)
    // For now, we also need to ensure cards reflect their matched status correctly if only pairId is tracked for matches.
     useEffect(() => {
        if (matchedPairIds.length > 0) {
            setCards(prevCards =>
                prevCards.map(card =>
                    matchedPairIds.includes(card.pairId)
                        ? { ...card, isMatched: true, isFaceUp: true } // Keep matched cards face up
                        : card
                )
            );
        }
    }, [matchedPairIds]);


    if (cards.length === 0) {
        return <div>Loading game...</div>; // Or a loading spinner
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-6 text-primary dark:text-primary-dark">
                Anyong Tubig - Matching Game
            </h1>
            <MatchingGameBoard
                cards={cards}
                handleCardClick={handleCardClick}
                isBoardDisabled={isBoardDisabled}
            />
            {/* Optional: Add a score, timer, or reset button here */}
        </div>
    );
};

export default MatchingGamePage;