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
  isActive?: boolean;
  onCorrectAnswer?: (element: GeoElement, earnedXp: number, streak: number) => void;
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
  isActive = true,
  onCorrectAnswer,
  onWrongAnswer,
  onSetTargetHighlight,
  onSetFeedback,
  onTourCompleted,
  roundSize = GAME_CONFIG.GAMEPLAY.DEFAULT_ROUND_SIZE,
}: ChallengeSessionOptions) {
  // Stable refs for external callback functions to prevent circular re-renders and game resets
  const onSetTargetHighlightRef = useRef(onSetTargetHighlight);
  onSetTargetHighlightRef.current = onSetTargetHighlight;

  const onSetFeedbackRef = useRef(onSetFeedback);
  onSetFeedbackRef.current = onSetFeedback;

  const onCorrectAnswerRef = useRef(onCorrectAnswer);
  onCorrectAnswerRef.current = onCorrectAnswer;

  const onWrongAnswerRef = useRef(onWrongAnswer);
  onWrongAnswerRef.current = onWrongAnswer;

  const onTourCompletedRef = useRef(onTourCompleted);
  onTourCompletedRef.current = onTourCompleted;

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
  const [maxStreak, setMaxStreak] = useState(0);
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

  const [contrarrelojPrompt, setContrarrelojPrompt] = useState<{
    promptName: string;
    isMatch: boolean;
  } | null>(null);

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

  // Helper to generate rapid True/False question for "contrarreloj"
  const setupContrarrelojFor = useCallback((target: GeoElement, allItems: GeoElement[]) => {
    const isMatch = Math.random() < 0.5;
    if (isMatch) {
      setContrarrelojPrompt({ promptName: target.name, isMatch: true });
    } else {
      const sameCategoryWrongs = allItems.filter(
        (i) => i.id !== target.id && i.category === target.category
      );
      const candidates = sameCategoryWrongs.length > 0
        ? sameCategoryWrongs
        : allItems.filter((i) => i.id !== target.id);
      const randomWrong = candidates[Math.floor(Math.random() * candidates.length)] || target;
      setContrarrelojPrompt({ promptName: randomWrong.name, isMatch: false });
    }
  }, []);

  // Start/Restart Game
  const startNewGame = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isActive) {
      setQuestions([]);
      setCurrentIndex(0);
      setContrarrelojPrompt(null);
      onSetTargetHighlightRef.current?.(null);
      onSetFeedbackRef.current?.(null, null);
      return;
    }

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
    setMaxStreak(0);
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

    onSetFeedbackRef.current?.(null, null);

    const first = selectedRound[0] || null;
    if (first) {
      if (challengeType === 'identificar') {
        onSetTargetHighlightRef.current?.(first.id);
        generateOptionsFor(first, pool);
      } else if (challengeType === 'contrarreloj') {
        onSetTargetHighlightRef.current?.(first.id);
        setupContrarrelojFor(first, pool);
      } else {
        // En "localizar", el alumno debe encontrar el accidente sin baliza
        onSetTargetHighlightRef.current?.(null);
      }
    }
  }, [isActive, pool, challengeType, roundSize, generateOptionsFor, setupContrarrelojFor]);

  // Restart only when challengeType, filterCategory, or active status transition
  const prevActiveRef = useRef(isActive);
  const prevTypeRef = useRef(challengeType);
  const prevCatRef = useRef(filterCategory);

  useEffect(() => {
    const typeChanged = prevTypeRef.current !== challengeType;
    const catChanged = prevCatRef.current !== filterCategory;
    const becameActive = isActive && !prevActiveRef.current;
    const becameInactive = !isActive && prevActiveRef.current;

    prevTypeRef.current = challengeType;
    prevCatRef.current = filterCategory;
    prevActiveRef.current = isActive;

    if (becameInactive) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      onSetTargetHighlightRef.current?.(null);
      onSetFeedbackRef.current?.(null, null);
      setQuestions([]);
      return;
    }

    if (typeChanged || catChanged || becameActive) {
      startNewGame();
    }
  }, [challengeType, filterCategory, isActive, startNewGame]);

  // When game completes or game over occurs, immediately remove any active map beacons / highlights
  useEffect(() => {
    if (isGameOver || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      onSetTargetHighlightRef.current?.(null);
      onSetFeedbackRef.current?.(null, null);
    }
  }, [isGameOver, isCompleted]);

  // Contrarreloj timer effect
  useEffect(() => {
    if (isActive && challengeType === 'contrarreloj' && !isGameOver && !isCompleted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsGameOver(true);
            onSetTargetHighlightRef.current?.(null);
            onSetFeedbackRef.current?.(null, null);
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
  }, [isActive, challengeType, isGameOver, isCompleted, timeLeft]);

  // Advance to next question
  const handleNext = useCallback(() => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setFeedback(null);
    setShowHint(false);
    onSetFeedbackRef.current?.(null, null);

    // If lives ran out, transition to Game Over after user acknowledged feedback
    if (lives <= 0 && challengeType !== 'contrarreloj') {
      setIsGameOver(true);
      onSetTargetHighlightRef.current?.(null);
      return;
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setIsCompleted(true);
      onSetTargetHighlightRef.current?.(null);

      // Confetis y celebración SOLO si se completa con acierto (al menos el 50% de aciertos)
      const passed = correctCountRef.current >= Math.ceil(questions.length * GAME_CONFIG.GAMEPLAY.MIN_PASSING_RATIO);
      if (passed) {
        playSound('levelup');
        confetti({ particleCount: 180, spread: 100, origin: { y: 0.45 } });

        // En "¿Dónde está?" (localizar), bonus por superar la ronda
        if (challengeType === 'localizar') {
          const bonus = GAME_CONFIG.POINTS.TOUR_COMPLETION_BONUS_XP;
          setTourBonusAwarded(bonus);
          onTourCompletedRef.current?.(bonus);
        }
      } else {
        playSound('wrong');
      }
      return;
    }

    setCurrentIndex(nextIdx);
    const nextElem = questions[nextIdx];

    if (challengeType === 'identificar' && nextElem) {
      onSetTargetHighlightRef.current?.(nextElem.id);
      generateOptionsFor(nextElem, pool);
    } else if (challengeType === 'contrarreloj' && nextElem) {
      onSetTargetHighlightRef.current?.(nextElem.id);
      setupContrarrelojFor(nextElem, pool);
    } else {
      onSetTargetHighlightRef.current?.(null);
    }
  }, [
    currentIndex,
    questions,
    lives,
    challengeType,
    generateOptionsFor,
    setupContrarrelojFor,
    pool,
  ]);

  // Evaluate Answer
  const handleAnswer = useCallback(
    (isCorrect: boolean, clickedItem?: GeoElement, customMessage?: string) => {
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
        setMaxStreak((previousMax) => Math.max(previousMax, newStreak));

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

        // In 60s mode (contrarreloj), award extra time for each correct answer
        if (challengeType === 'contrarreloj') {
          setTimeLeft((prev) => prev + GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS);
        }

        onSetFeedbackRef.current?.(currentQuestion.id, 'correct');

        const hintNotice = showHint
          ? ` (${points} XP por usar pista)`
          : ` (+${points} XP)`;
        const timeBonusNotice = challengeType === 'contrarreloj'
          ? ` (+${GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s)`
          : '';

        setFeedback({
          isCorrect: true,
          message: customMessage || `¡Genial! Has acertado: ${currentQuestion.name}.${hintNotice}${timeBonusNotice}`,
          clickedName: clickedItem?.name,
        });

        onCorrectAnswerRef.current?.(currentQuestion, points, newStreak);

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
        onSetFeedbackRef.current?.(clickedId || targetId, 'wrong');

        setFeedback({
          isCorrect: false,
          message: customMessage || (clickedItem
            ? `¡Vaya! Has pulsado en ${clickedItem.name}. La respuesta correcta era ${currentQuestion.name}.`
            : `¡Respuesta incorrecta! El accidente correcto era ${currentQuestion.name}.`),
          clickedName: clickedItem?.name,
        });

        onWrongAnswerRef.current?.();

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
      handleNext,
    ]
  );

  const handleContrarrelojAnswer = useCallback((userSaidYes: boolean) => {
    if (!currentQuestion || !contrarrelojPrompt || feedback !== null || isGameOver || isCompleted) return;
    const isCorrect = userSaidYes === contrarrelojPrompt.isMatch;

    let customMessage = '';
    if (isCorrect) {
      customMessage = contrarrelojPrompt.isMatch
        ? `¡Correcto! Es el ${currentQuestion.name}. (+${GAME_CONFIG.POINTS.CONTRARRELOJ_BASE} XP, +${GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s)`
        : `¡Bien visto! No es el ${contrarrelojPrompt.promptName}, sino el ${currentQuestion.name}. (+${GAME_CONFIG.POINTS.CONTRARRELOJ_BASE} XP, +${GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s)`;
    } else {
      customMessage = contrarrelojPrompt.isMatch
        ? `¡Vaya! Sí que era el ${currentQuestion.name}.`
        : `¡Fallaste! No era el ${contrarrelojPrompt.promptName}, sino el ${currentQuestion.name}.`;
    }

    handleAnswer(isCorrect, currentQuestion, customMessage);
  }, [currentQuestion, contrarrelojPrompt, feedback, isGameOver, isCompleted, handleAnswer]);

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
    contrarrelojPrompt,
    lives,
    streak,
    maxStreak,
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
    handleContrarrelojAnswer,
    handleNext,
    handleRestart: startNewGame,
    handleHint,
    speakQuestion,
  };
}
