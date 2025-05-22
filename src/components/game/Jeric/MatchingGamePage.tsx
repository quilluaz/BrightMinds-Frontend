import React, { useState, useEffect } from 'react';
import MatchingGameBoard from './MatchingGameBoard';
import { anyongTubigPairs as rawPairsData } from '../../../data/anyongTubigPairs'; // Renamed for clarity
import { MatchingPair, MatchingCard as MatchingCardType } from '../../../types'; // Import both types
import shuffleArray from '../../../utils/shuffleArray'; // Your shuffle utility
import { playSound, CelebrationAnimation, GameCompleteCelebration, animationStyles } from './GameConfigurations';
import { useTheme } from '../../../context/ThemeContext';

// Color palette for container and text
const COLORS = {
  light: {
    cardBg: '#fff',
    text: '#1A1B41',
    secondaryAccent: '#FFA500',
    feedback: {
      correct: 'bg-green-100 text-green-800',
      incorrect: 'bg-red-100 text-red-800',
      default: 'bg-blue-100 text-blue-800',
    },
  },
  dark: {
    cardBg: '#23244a',
    text: '#E8F9FF',
    secondaryAccent: '#FFA500',
    feedback: {
      correct: 'bg-green-900 text-green-200',
      incorrect: 'bg-red-900 text-red-200',
      default: 'bg-blue-900 text-blue-200',
    },
  },
};

const MatchingGamePage: React.FC = () => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const [cards, setCards] = useState<MatchingCardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<MatchingCardType[]>([]);
    const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
    const [isBoardDisabled, setIsBoardDisabled] = useState(false); // To disable clicks during checks
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showGameComplete, setShowGameComplete] = useState(false);

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

    // Add animation styles to document head once
    useEffect(() => {
        if (!document.getElementById('matching-game-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'matching-game-animations';
            styleSheet.innerText = animationStyles;
            document.head.appendChild(styleSheet);
        }
    }, []);

    const handleStartGame = () => {
        playSound('click');
        setHasGameStarted(true);
    };

    const handleCardClick = (clickedCardId: string) => {
        if (isBoardDisabled || flippedCards.length >= 2) {
            return; // Do nothing if board is disabled or 2 cards are already flipped
        }

        const cardToFlip = cards.find(c => c.id === clickedCardId);
        if (!cardToFlip || cardToFlip.isFaceUp || cardToFlip.isMatched) {
            return; // Card already flipped, matched, or not found
        }

        playSound('flip');

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
                playSound('match');
                setMatchedPairIds(prev => [...prev, firstCard.pairId]);
                setCards(prevCards =>
                    prevCards.map(card =>
                        card.pairId === firstCard.pairId ? { ...card, isMatched: true, isFaceUp: true } : card
                    )
                );
                setFlippedCards([]);
                setIsBoardDisabled(false);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 1200);

                // Check if all pairs are matched
                if (matchedPairIds.length + 1 === rawPairsData.length) {
                    setTimeout(() => {
                        playSound('gameComplete');
                        setShowGameComplete(true);
                    }, 1000);
                }
            } else {
                // Not a match, flip them back after a delay
                playSound('incorrect');
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

    const handlePlayAgain = () => {
        playSound('click');
        setCards(shuffleArray(cards.map(card => ({ ...card, isFaceUp: false, isMatched: false }))));
        setFlippedCards([]);
        setMatchedPairIds([]);
        setShowGameComplete(false);
        setHasGameStarted(false);
    };

    if (!hasGameStarted) {
        return (
            <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.text }}>
                <div className={`p-10 rounded-3xl shadow-xl text-center max-w-xl w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBg }}>
                    <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ color: colors.text }}>
                        Welcome to
                    </h1>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: colors.secondaryAccent }}>
                        Anyong Tubig Matching Game!
                    </h2>
                    <p className="text-xl sm:text-xl mb-3 opacity-80" style={{ color: colors.text }}>
                        Test your knowledge about different bodies of water!
                    </p>
                    <p className="text-xl sm:text-2xl mb-12 opacity-80" style={{ color: colors.text }}>
                        Match the words with their corresponding pictures!
                    </p>
                    <button
                        onClick={handleStartGame}
                        className="hover:bg-[#db8e00] text-white font-bold py-4 px-12 rounded-full text-2xl sm:text-3xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
                        style={{ backgroundColor: colors.secondaryAccent }}
                    >
                        Start
                    </button>
                </div>
            </div>
        );
    }

    if (showGameComplete) {
        return (
            <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.text }}>
                {showGameComplete && <GameCompleteCelebration />}
                <div className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBg }}>
                    <h2 className="text-5xl font-bold mb-6" style={{ color: colors.secondaryAccent }}>Congratulations!</h2>
                    <p className="text-3xl mb-10" style={{ color: colors.text }}>
                        You've matched all pairs!
                    </p>
                    <button
                        onClick={handlePlayAgain}
                        className="hover:bg-[#db8e00] text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
                        style={{ backgroundColor: colors.secondaryAccent }}
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return <div>Loading game...</div>; // Or a loading spinner
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {showCelebration && <CelebrationAnimation />}
            <h1 className="text-3xl font-bold text-center mb-6" style={{ color: colors.text }}>
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