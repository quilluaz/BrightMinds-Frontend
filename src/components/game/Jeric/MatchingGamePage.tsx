import React, { useState, useEffect } from 'react';
import MatchingGameBoard from './MatchingGameBoard';
import { gameLevels, LevelConfiguration } from '../../../data/gameLevels'; // Adjust path as needed
import { MatchingPair, MatchingCard as MatchingCardType } from '../../../types';
import shuffleArray from '../../../utils/shuffleArray';
import { playSound, CelebrationAnimation, GameCompleteCelebration, animationStyles } from './GameConfigurations';
import { useTheme } from '../../../context/ThemeContext';

// Color palette for container and text (THIS WAS MISSING)
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
    const colors = COLORS[theme]; // This line should now work

    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [currentLevelData, setCurrentLevelData] = useState<LevelConfiguration | undefined>(
        gameLevels.find(l => l.level === currentLevel)
    );

    const [cards, setCards] = useState<MatchingCardType[]>([]);
    const [flippedCards, setFlippedCards] = useState<MatchingCardType[]>([]);
    const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
    const [isBoardDisabled, setIsBoardDisabled] = useState(false);
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [showGameComplete, setShowGameComplete] = useState(false);

    useEffect(() => {
        const levelData = gameLevels.find(l => l.level === currentLevel);
        setCurrentLevelData(levelData);

        if (levelData) {
            const preparedCards: MatchingCardType[] = [];
            levelData.pairs.forEach((pair: MatchingPair) => {
                preparedCards.push({
                    id: `pair-${pair.id}-word-${levelData.level}`,
                    pairId: pair.id,
                    type: 'word',
                    content: pair.word,
                    imageUrl: pair.imageUrl,
                    isFaceUp: false,
                    isMatched: false,
                });
                preparedCards.push({
                    id: `pair-${pair.id}-image-${levelData.level}`,
                    pairId: pair.id,
                    type: 'picture',
                    content: pair.english,
                    imageUrl: pair.imageUrl,
                    isFaceUp: false,
                    isMatched: false,
                });
            });
            setCards(shuffleArray(preparedCards));
            setFlippedCards([]);
            setMatchedPairIds([]);
            setIsBoardDisabled(false);
            setShowLevelComplete(false);
            setShowGameComplete(false);
        }
    }, [currentLevel]);

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
        setCurrentLevel(1);
        setHasGameStarted(true);
        setShowLevelComplete(false);
        setShowGameComplete(false);
    };

    const handleCardClick = (clickedCardId: string) => {
        if (isBoardDisabled || flippedCards.length >= 2 || !currentLevelData) {
            return;
        }

        const cardToFlip = cards.find(c => c.id === clickedCardId);
        if (!cardToFlip || cardToFlip.isFaceUp || cardToFlip.isMatched) {
            return;
        }

        playSound('flip');
        const newCards = cards.map(card =>
            card.id === clickedCardId ? { ...card, isFaceUp: true } : card
        );
        setCards(newCards);

        const newlyFlippedCard = newCards.find(c => c.id === clickedCardId)!;
        const currentFlipped = [...flippedCards, newlyFlippedCard];
        setFlippedCards(currentFlipped);

        if (currentFlipped.length === 2) {
            setIsBoardDisabled(true);
            const [firstCard, secondCard] = currentFlipped;

            if (firstCard.pairId === secondCard.pairId) {
                playSound('match');
                const newMatchedPairIds = [...matchedPairIds, firstCard.pairId];
                setMatchedPairIds(newMatchedPairIds);

                setCards(prevCards =>
                    prevCards.map(card =>
                        card.pairId === firstCard.pairId ? { ...card, isMatched: true, isFaceUp: true } : card
                    )
                );
                setFlippedCards([]);
                setIsBoardDisabled(false);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 1200);

                if (newMatchedPairIds.length === currentLevelData.pairs.length) {
                    setTimeout(() => {
                        if (currentLevel < gameLevels.length) {
                            playSound('gameComplete');
                            setShowLevelComplete(true);
                        } else {
                            playSound('gameComplete');
                            setShowGameComplete(true);
                        }
                    }, 1000);
                }
            } else {
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
                }, 1000);
            }
        }
    };

    useEffect(() => {
        if (matchedPairIds.length > 0) {
            setCards(prevCards =>
                prevCards.map(card =>
                    matchedPairIds.includes(card.pairId)
                        ? { ...card, isMatched: true, isFaceUp: true }
                        : card
                )
            );
        }
    }, [matchedPairIds]);

    const handleNextLevel = () => {
        playSound('click');
        if (currentLevel < gameLevels.length) {
            setCurrentLevel(prevLevel => prevLevel + 1);
            setShowLevelComplete(false);
        }
    };

    const handlePlayAgain = () => {
        playSound('click');
        setCurrentLevel(1);
        setHasGameStarted(false);
        setShowGameComplete(false);
        setShowLevelComplete(false);
    };

    if (!hasGameStarted) {
        return (
            <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.text }}>
                <div className={`p-10 rounded-3xl shadow-xl text-center max-w-xl w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBg }}>
                    <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ color: colors.text }}>
                        Welcome to
                    </h1>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: colors.secondaryAccent }}>
                        Likas na Yaman Matching Game!
                    </h2>
                    <p className="text-xl sm:text-xl mb-3 opacity-80" style={{ color: colors.text }}>
                        Test your knowledge about natural resources!
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

    if (showLevelComplete) {
        const nextLevelData = gameLevels.find(l => l.level === currentLevel + 1);
        return (
            <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.text }}>
                <GameCompleteCelebration />
                <div className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBg }}>
                    <h2 className="text-5xl font-bold mb-6" style={{ color: colors.secondaryAccent }}>Level {currentLevelData?.level} Complete!</h2>
                    <p className="text-3xl mb-10" style={{ color: colors.text }}>
                        Great job matching all {currentLevelData?.title} pairs!
                    </p>
                    {nextLevelData && (
                        <button
                            onClick={handleNextLevel}
                            className="hover:bg-[#db8e00] text-white font-bold py-4 px-10 rounded-full text-2xl transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#DBD053] shadow-lg"
                            style={{ backgroundColor: colors.secondaryAccent }}
                        >
                            Next Level: {nextLevelData.title}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (showGameComplete) {
        return (
            <div className={`bg-pattern min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-200`} style={{ color: colors.text }}>
                <GameCompleteCelebration />
                <div className={`p-10 rounded-3xl shadow-xl text-center max-w-md w-full transition-colors duration-200`} style={{ backgroundColor: colors.cardBg }}>
                    <h2 className="text-5xl font-bold mb-6" style={{ color: colors.secondaryAccent }}>Congratulations!</h2>
                    <p className="text-3xl mb-10" style={{ color: colors.text }}>
                        You've matched all pairs in all levels!
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

    if (cards.length === 0 || !currentLevelData) {
        return <div>Loading Level {currentLevel}...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {showCelebration && <CelebrationAnimation />}
            <h1 className="text-3xl font-bold text-center mb-2" style={{ color: colors.text }}>
                Level {currentLevelData.level}: {currentLevelData.title}
            </h1>
            <p className="text-xl text-center mb-6" style={{ color: colors.text, opacity: 0.8 }}>
                Match the pairs!
            </p>
            <MatchingGameBoard
                cards={cards}
                handleCardClick={handleCardClick}
                isBoardDisabled={isBoardDisabled}
            />
        </div>
    );
};  

export default MatchingGamePage;