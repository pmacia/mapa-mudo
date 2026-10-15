import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GeoElement, CategoryType } from '../types/geography';
import { playSound, speakSpanish } from '../utils/audio';
import confetti from 'canvas-confetti';

export type ChallengeType = 'localizar' | 'identificar' | 'contrarreloj';

export interface ChallengeSessionOptions {
  elements: GeoElement[];
  challengeType: ChallengeType;
  filterCategory?: CategoryType | 'todos';
  onCorrectAnswer?: (element: GeoElement, earnedXp: number) => void;
  onWrongAnswer?: () => void;
  onSetTargetHighlight?: (id: string | null) => void;
  onSetFeedback?: (id: string | null, status: 'correct' | 'wrong' | null) => void;
  onTourCompleted?: (bonusXp: number) => void;
  roundSize?: number;
}

export type QuestionResult = 'correct' | 'wrong' | 'pending';

export function useChallengeSession({
  elements,
  challengeType,
  filterCategory = 'todos',
  onCorrectAnswer,
  onWrongAnswer,
  onSetTargetHighlight,
  onSetFeedback,
  onTourCompleted,
  roundSize = 10,
}: ChallengeSessionOptions) {
  // Pool of candidate elements
  const pool = useMemo(() => {
    let filtered = elements;
    if (filterCategory !== 'todos') {
      filtered = elements.filter((e) => e.category === filterCategory);
    }
    return filtered.length > 0 ? filtered : elements;
  }, [elements, filterCategory]);

  const [questions, setQuestions] = useState<GeoElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<GeoElement[]>([]);
  
  // Game metrics & indicators
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [resultsHistory, setResultsHistory] = useState<QuestionResult[]>([]);
  
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    clickedName?: string;
  } | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [tourBonusAwarded, setTourBonusAwarded] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex] || null;

  // Helper to generate 4 multiple-choice options for "identificar"
  // Picks distractors from the SAME category first to avoid any confusion between points/peaks/ranges
  const generateOptionsFor = useCallback((target: GeoElement, allItems: GeoElement[]) => {
    const sameCategoryWrongs = allItems.filter(
      (i) => i.id !== target.id && i.category === target.category
    );
    let selectedWrongs: GeoElement[] = [];

    if (sameCategoryWrongs.length >= 3) {
      selectedWrongs = sameCategoryWrongs.sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
      const remainingNeeded = 3 - sameCategoryWrongs.length;
      const otherWrongs = allItems
        .filter((i) => i.id !== target.id && i.category !== target.category)
        .sort(() => Math.random() - 0.5)
        .slice(0, remainingNeeded);
      selectedWrongs = [...sameCategoryWrongs, ...otherWrongs];
    }

    const allFour = [target, ...selectedWrongs].sort(() => Math.random() - 0.5);
    setOptions(allFour);
  }, []);

  // Start/Restart Game
  const startNewGame = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    // In "localizar" (¿Dónde está?) and "contrarreloj" (60s), use the FULL pool of accidents so there are no repeats!
    const effectiveRoundSize = challengeType === 'localizar' || challengeType === 'contrarreloj'
      ? shuffled.length
      : Math.min(roundSize, shuffled.length);

    const selectedRound = shuffled.slice(0, effectiveRoundSize);

    setQuestions(selectedRound);
    setCurrentIndex(0);
    setLives(3);
    setStreak(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setResultsHistory(new Array(selectedRound.length).fill('pending'));
    setShowHint(false);
    setFeedback(null);
    setIsGameOver(false);
    setIsCompleted(false);
    setTourBonusAwarded(null);
    setTimeLeft(60);

    if (onSetFeedback) onSetFeedback(null, null);

    const first = selectedRound[0] || null;
    if (first) {
      if (challengeType === 'identificar') {
        if (onSetTargetHighlight) onSetTargetHighlight(first.id);
        generateOptionsFor(first, pool);
      } else {
        if (onSetTargetHighlight) onSetTargetHighlight(null);
      }
    }
  }, [pool, challengeType, roundSize, generateOptionsFor, onSetFeedback, onSetTargetHighlight]);

  // Restart whenever challengeType or filterCategory changes
  useEffect(() => {
    startNewGame();
  }, [challengeType, filterCategory]);

  // Contrarreloj timer effect
  useEffect(() => {
    if (challengeType === 'contrarreloj' && !isGameOver && !isCompleted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsGameOver(true);
            playSound('levelup');
            confetti({ particleCount: 70, spread: 60 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [challengeType, isGameOver, isCompleted, timeLeft]);

  // Advance to next question
  const handleNext = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setFeedback(null);
    setShowHint(false);
    if (onSetFeedback) onSetFeedback(null, null);

    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setIsCompleted(true);
      playSound('levelup');
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 } });
      if (onSetTargetHighlight) onSetTargetHighlight(null);

      // In "¿Dónde está?" (localizar), grant grand bonus for completing the entire tour of Spain!
      if (challengeType === 'localizar') {
        const bonus = 200;
        setTourBonusAwarded(bonus);
        if (onTourCompleted) onTourCompleted(bonus);
      }
      return;
    }

    setCurrentIndex(nextIdx);
    const nextElem = questions[nextIdx];

    if (challengeType === 'identificar' && nextElem) {
      if (onSetTargetHighlight) onSetTargetHighlight(nextElem.id);
      generateOptionsFor(nextElem, pool);
    } else {
      if (onSetTargetHighlight) onSetTargetHighlight(null);
    }
  }, [currentIndex, questions, challengeType, generateOptionsFor, pool, onSetFeedback, onSetTargetHighlight, onTourCompleted]);

  // Evaluate Answer
  const handleAnswer = useCallback(
    (isCorrect: boolean, clickedItem?: GeoElement) => {
      if (!currentQuestion || feedback !== null || isGameOver || isCompleted) return;

      setResultsHistory((prev) => {
        const next = [...prev];
        next[currentIndex] = isCorrect ? 'correct' : 'wrong';
        return next;
      });

      if (isCorrect) {
        playSound('correct');
        const newStreak = streak + 1;
        setStreak(newStreak);

        // Scoring rules per mode
        let points = 30; // Default for "¿Dónde está?" and "Identificar"
        if (challengeType === 'contrarreloj') {
          points = 20; // 20 pts per hit in 60s mode
        } else if (challengeType === 'localizar') {
          points = 30; // 30 pts in ¿Dónde está?
        } else if (challengeType === 'identificar') {
          points = 30; // 30 pts in Identificar
        }

        setScore((prev) => prev + points);
        setCorrectCount((prev) => prev + 1);

        if (onSetFeedback) onSetFeedback(currentQuestion.id, 'correct');
        setFeedback({
          isCorrect: true,
          message: `¡Genial! Has acertado: ${currentQuestion.name}.`,
          clickedName: clickedItem?.name,
        });

        if (onCorrectAnswer) onCorrectAnswer(currentQuestion, points);

        if (newStreak % 5 === 0) {
          playSound('streak');
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }

        // In 60s mode (contrarreloj), automatically jump to the next accident at high speed
        if (challengeType === 'contrarreloj') {
          autoAdvanceRef.current = setTimeout(() => {
            handleNext();
          }, 400);
        }
      } else {
        playSound('wrong');
        const newLives = challengeType === 'contrarreloj' ? lives : lives - 1;
        setLives(newLives);
        setStreak(0);
        setWrongCount((prev) => prev + 1);

        // Mode 4 (60s): deduct 5 points on error, score never drops below 0
        if (challengeType === 'contrarreloj') {
          setScore((prev) => Math.max(0, prev - 5));
        }

        const targetId = currentQuestion.id;
        const clickedId = clickedItem?.id || null;
        if (onSetFeedback) onSetFeedback(clickedId || targetId, 'wrong');

        setFeedback({
          isCorrect: false,
          message: clickedItem
            ? `¡Vaya! Has pulsado en ${clickedItem.name}. La respuesta correcta era ${currentQuestion.name}.`
            : `¡Respuesta incorrecta! El accidente correcto era ${currentQuestion.name}.`,
          clickedName: clickedItem?.name,
        });

        if (onWrongAnswer) onWrongAnswer();

        if (newLives <= 0 && challengeType !== 'contrarreloj') {
          setIsGameOver(true);
        }

        // In 60s mode (contrarreloj), advance quickly on error so timer isn't wasted
        if (challengeType === 'contrarreloj') {
          autoAdvanceRef.current = setTimeout(() => {
            handleNext();
          }, 650);
        }
      }
    },
    [
      currentQuestion,
      feedback,
      isGameOver,
      isCompleted,
      currentIndex,
      streak,
      lives,
      challengeType,
      onSetFeedback,
      onCorrectAnswer,
      onWrongAnswer,
      handleNext,
    ]
  );

  const handleHint = useCallback(() => {
    setShowHint(true);
    playSound('hint');
  }, []);

  const speakQuestion = useCallback(() => {
    if (currentQuestion) {
      speakSpanish(currentQuestion.name);
    }
  }, [currentQuestion]);

  const totalAttempts = correctCount + wrongCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  return {
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions: questions.length,
    options,
    lives,
    streak,
    score,
    correctCount,
    wrongCount,
    accuracy,
    resultsHistory,
    showHint,
    feedback,
    isGameOver,
    isCompleted,
    tourBonusAwarded,
    timeLeft,
    handleAnswer,
    handleNext,
    handleRestart: startNewGame,
    handleHint,
    speakQuestion,
  };
}
