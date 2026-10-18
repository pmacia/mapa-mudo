import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GeoElement, CategoryType } from '../types/geography';
import { playSound, speakSpanish } from '../utils/audio';
import confetti from 'canvas-confetti';
import { GAME_CONFIG } from '../constants/gameConfig';

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
  roundSize = GAME_CONFIG.GAMEPLAY.DEFAULT_ROUND_SIZE,
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
  const [lives, setLives] = useState<number>(GAME_CONFIG.GAMEPLAY.INITIAL_LIVES);
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
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.TIMERS.CONTRARRELOJ_INITIAL_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const correctCountRef = useRef(0);

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
  // Start/Restart Game
  const startNewGame = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    // In "contrarreloj" (60s), use the FULL pool of accidents so there are no repeats!
    // In "localizar" (¿Dónde está?) and "identificar", rounds have a defined roundSize (10 questions)
    const effectiveRoundSize = challengeType === 'contrarreloj'
      ? shuffled.length
      : Math.min(roundSize, shuffled.length);

    const selectedRound = shuffled.slice(0, effectiveRoundSize);

    setQuestions(selectedRound);
    setCurrentIndex(0);
    setLives(GAME_CONFIG.GAMEPLAY.INITIAL_LIVES);
    setStreak(0);
    setScore(0);
    setCorrectCount(0);
    correctCountRef.current = 0;
    setWrongCount(0);
    setResultsHistory(new Array(selectedRound.length).fill('pending'));
    setShowHint(false);
    setFeedback(null);
    setIsGameOver(false);
    setIsCompleted(false);
    setTourBonusAwarded(null);
    setTimeLeft(GAME_CONFIG.TIMERS.CONTRARRELOJ_INITIAL_SECONDS);

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
            // Confetis al completar con acierto el modo 60s
            if (correctCountRef.current > 0) {
              playSound('levelup');
              confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
            }
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

    // If lives ran out, transition to Game Over after user acknowledged feedback
    if (lives <= 0 && challengeType !== 'contrarreloj') {
      setIsGameOver(true);
      if (onSetTargetHighlight) onSetTargetHighlight(null);
      return;
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setIsCompleted(true);
      if (onSetTargetHighlight) onSetTargetHighlight(null);

      // Confetis y celebración SOLO si se completa con acierto (al menos el 50% de aciertos)
      const passed = correctCountRef.current >= Math.ceil(questions.length * GAME_CONFIG.GAMEPLAY.MIN_PASSING_RATIO);
      if (passed) {
        playSound('levelup');
        confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 } });

        // En "¿Dónde está?" (localizar), bonus por superar la ronda
        if (challengeType === 'localizar') {
          const bonus = GAME_CONFIG.POINTS.TOUR_COMPLETION_BONUS_XP;
          setTourBonusAwarded(bonus);
          if (onTourCompleted) onTourCompleted(bonus);
        }
      } else {
        playSound('wrong');
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
  }, [
    currentIndex,
    questions,
    lives,
    challengeType,
    generateOptionsFor,
    pool,
    onSetFeedback,
    onSetTargetHighlight,
    onTourCompleted,
  ]);

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

        // Scoring rules per mode & hint penalty
        let points: number = GAME_CONFIG.POINTS.LOCALIZAR_BASE;
        if (challengeType === 'contrarreloj') {
          points = showHint
            ? GAME_CONFIG.POINTS.CONTRARRELOJ_WITH_HINT
            : GAME_CONFIG.POINTS.CONTRARRELOJ_BASE;
        } else if (challengeType === 'localizar') {
          points = showHint
            ? GAME_CONFIG.POINTS.LOCALIZAR_WITH_HINT
            : GAME_CONFIG.POINTS.LOCALIZAR_BASE;
        } else if (challengeType === 'identificar') {
          points = showHint
            ? GAME_CONFIG.POINTS.IDENTIFICAR_WITH_HINT
            : GAME_CONFIG.POINTS.IDENTIFICAR_BASE;
        }

        setScore((prev) => prev + points);
        setCorrectCount((prev) => prev + 1);
        correctCountRef.current += 1;

        // In 60s mode (contrarreloj), award +5s bonus time for every correct answer
        if (challengeType === 'contrarreloj') {
          setTimeLeft((prev) => prev + GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS);
        }

        if (onSetFeedback) onSetFeedback(currentQuestion.id, 'correct');

        const hintNotice = showHint
          ? ` (${points} XP por usar pista)`
          : ` (+${points} XP)`;
        const timeBonusNotice = challengeType === 'contrarreloj'
          ? ` (+${GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s)`
          : '';

        setFeedback({
          isCorrect: true,
          message: `¡Genial! Has acertado: ${currentQuestion.name}.${hintNotice}${timeBonusNotice}`,
          clickedName: clickedItem?.name,
        });

        if (onCorrectAnswer) onCorrectAnswer(currentQuestion, points);

        if (newStreak % GAME_CONFIG.GAMEPLAY.STREAK_CELEBRATION_INTERVAL === 0) {
          playSound('streak');
        }

        // In 60s mode (contrarreloj), automatically jump to the next accident at high speed
        if (challengeType === 'contrarreloj') {
          autoAdvanceRef.current = setTimeout(() => {
            handleNext();
          }, GAME_CONFIG.TIMERS.AUTO_ADVANCE_FAST_CORRECT_MS);
        }
      } else {
        playSound('wrong');
        const newLives = challengeType === 'contrarreloj' ? lives : Math.max(0, lives - 1);
        setLives(newLives);
        setStreak(0);
        setWrongCount((prev) => prev + 1);

        // Mode 4 (60s): deduct points on error, score never drops below 0
        if (challengeType === 'contrarreloj') {
          setScore((prev) => Math.max(0, prev - GAME_CONFIG.POINTS.CONTRARRELOJ_WRONG_PENALTY));
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

        // In 60s mode (contrarreloj), advance quickly on error so timer isn't wasted
        if (challengeType === 'contrarreloj') {
          autoAdvanceRef.current = setTimeout(() => {
            handleNext();
          }, GAME_CONFIG.TIMERS.AUTO_ADVANCE_FAST_WRONG_MS);
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
      showHint,
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
