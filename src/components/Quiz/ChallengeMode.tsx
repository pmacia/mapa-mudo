import React, { useEffect, useState, useCallback } from 'react';
import { GeoElement } from '../../types/geography';
import { useChallengeSession, ChallengeType } from '../../hooks/useChallengeSession';
import { 
  Trophy, 
  Heart, 
  Flame, 
  HelpCircle, 
  Volume2, 
  Sparkles, 
  Timer, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2, 
  XCircle, 
  Award, 
  Check, 
  X, 
  PauseCircle, 
  PlayCircle,
  Lightbulb,
  FastForward,
  Mountain,
  Droplet,
  Compass,
  Palmtree,
  Waves,
  Touchpad,
  GraduationCap,
  Users,
  BookOpen,
  Zap,
  Printer,
  Star
} from 'lucide-react';
import { GAME_CONFIG } from '../../constants/gameConfig';

export type { ChallengeType };

export interface ChallengeModeProps {
  session: ReturnType<typeof useChallengeSession>;
  challengeType: ChallengeType;
  lastClickedElement?: GeoElement | null;
  onResetClickedElement?: () => void;
  onSwitchToAtlas?: () => void;
  onOpenPrintable?: () => void;
  className?: string;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({
  session,
  challengeType,
  onSwitchToAtlas,
  onOpenPrintable,
  className,
}) => {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    options,
    contrarrelojPrompt,
    lives,
    streak,
    maxStreak,
    score,
    correctCount,
    wrongCount,
    resultsHistory,
    showHint,
    feedback,
    isGameOver,
    isCompleted,
    timeLeft,
    handleAnswer,
    handleContrarrelojAnswer,
    handleNext,
    handleRestart,
    handleHint,
    speakQuestion,
  } = session;

  const [autoAdvanceMode, setAutoAdvanceMode] = useState<'manual' | 'auto'>(() => {
    return (localStorage.getItem('geoespana_advance_mode') as 'manual' | 'auto') || 'manual';
  });
  const [autoCountdown, setAutoCountdown] = useState<number>(GAME_CONFIG.TIMERS.AUTO_ADVANCE_COUNTDOWN_SECONDS);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  // Reset 50:50 and hidden options on question change
  useEffect(() => {
    setHiddenOptions([]);
  }, [currentIndex]);

  // Keyboard shortcut listener for Contrarreloj (ArrowLeft = Sí, ArrowRight = No)
  useEffect(() => {
    if (challengeType !== 'contrarreloj' || isGameOver || isCompleted || !currentQuestion) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== null) return;
      if (e.key === 'ArrowLeft') {
        // User says YES, it is the element
        handleContrarrelojAnswer(true);
      } else if (e.key === 'ArrowRight') {
        // User says NO, it is not
        handleContrarrelojAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [challengeType, isGameOver, isCompleted, currentQuestion, feedback, handleContrarrelojAnswer]);

  // Auto-advance timer when in 'auto' mode
  useEffect(() => {
    if (!feedback || autoAdvanceMode !== 'auto' || isGameOver || isCompleted || challengeType === 'contrarreloj') {
      return;
    }

    setAutoCountdown(GAME_CONFIG.TIMERS.AUTO_ADVANCE_COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [feedback, autoAdvanceMode, isGameOver, isCompleted, challengeType, handleNext]);

  // Lifeline 50:50 handler
  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || !currentQuestion || options.length <= 2) return;
    const wrong = options.filter((o) => o.id !== currentQuestion.id);
    // Hide 2 wrong options
    const toHide = wrong.slice(0, 2).map((o) => o.id);
    setHiddenOptions(toHide);
    setFiftyFiftyUsed(true);
  };

  const getCategoryThemeIcon = (category?: string) => {
    switch (category) {
      case 'afluentes':
      case 'rios':
        return <Droplet className="w-6 h-6 text-category-rivers" />;
      case 'montanas':
      case 'picos':
        return <Mountain className="w-6 h-6 text-category-mountains" />;
      case 'costas':
        return <Compass className="w-6 h-6 text-category-coasts" />;
      case 'islas':
        return <Palmtree className="w-6 h-6 text-tertiary" />;
      default:
        return <Compass className="w-6 h-6 text-primary" />;
    }
  };

  // Calculate escolar mark out of 10
  const escolarGrade = totalQuestions > 0 ? ((correctCount / totalQuestions) * 10).toFixed(1) : '10.0';
  const gradeLabel = parseFloat(escolarGrade) >= 9 ? 'SOBRESALIENTE' : parseFloat(escolarGrade) >= 7 ? 'NOTABLE' : parseFloat(escolarGrade) >= 5 ? 'APROBADO' : 'NECESITA MEJORAR';

  if (totalQuestions === 0) {
    return (
      <div className={`w-full rounded-DEFAULT border border-slate-200 dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 text-center ${className || ''}`}>
        <Compass className="w-8 h-8 mx-auto text-primary" />
        <p className="mt-3 font-headline-md text-sm text-on-surface dark:text-white">
          No hay accidentes seleccionados para este juego.
        </p>
        <p className="mt-1 text-xs text-on-surface-variant dark:text-slate-400">
          Elige los elementos que quieres estudiar en la configuración de capas.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN: VICTORY & RESULTS (Game Completed or Game Over)
  // -------------------------------------------------------------
  if (isCompleted || isGameOver) {
    return (
      <div className={`w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5 animate-fadeIn ${className || ''}`}>
        {/* 1. Header Hero Banner motivador y festivo */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary-container to-primary text-on-primary rounded-DEFAULT p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-tertiary-container/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center gap-4 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary-container flex items-center justify-center shadow-[0_6px_0_#b45309] text-on-secondary-container animate-bounce shrink-0">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-secondary-fixed">
                <Star className="w-4 h-4 fill-secondary-fixed" />
                <Star className="w-4 h-4 fill-secondary-fixed" />
                <Star className="w-4 h-4 fill-secondary-fixed" />
                <span className="font-label-caps text-[10px] ml-1 uppercase text-white font-extrabold">
                  {wrongCount === 0 ? '3 de 3 Estrellas' : 'Ronda Completada'}
                </span>
              </div>
              <h2 className="font-headline-md text-lg sm:text-xl text-white font-extrabold leading-tight">
                {isGameOver ? '¡Tiempo Agotado!' : '¡Misión Cumplida, Explorador!'}
              </h2>
              <p className="font-body-sm text-xs text-on-primary-container">
                {challengeType === 'localizar'
                  ? 'Reto de Ubicación Cartográfica Mudo'
                  : challengeType === 'identificar'
                  ? 'Quiz Curricular de Relieve e Hidrografía'
                  : 'Desafío 60 Segundos Contrarreloj'}
              </p>
            </div>
          </div>

          {/* Calificación Escolar Destacada */}
          <div className="z-10 bg-surface-container-lowest text-on-surface rounded-DEFAULT p-3 sm:p-4 shadow-[0_4px_0_#002b80] flex flex-col items-center min-w-[140px] shrink-0">
            <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">
              Calificación Escolar
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="font-display-lg text-2xl sm:text-3xl font-black text-primary leading-none">
                {escolarGrade}
              </span>
              <span className="font-title-sm text-xs text-on-surface-variant font-bold">/ 10</span>
            </div>
            <span className="font-label-caps text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">
              {gradeLabel}
            </span>
          </div>
        </section>

        {/* 2. Estadísticas Didácticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-surface-container-low dark:bg-slate-800 p-3 rounded-DEFAULT shadow-[0_2px_0_#cbd5e1] dark:shadow-none flex flex-col">
            <span className="font-label-caps text-[10px] text-success-emerald uppercase font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Aciertos
            </span>
            <span className="font-headline-md text-xl sm:text-2xl text-on-surface dark:text-white mt-1">
              {correctCount}
            </span>
          </div>

          <div className="bg-surface-container-low dark:bg-slate-800 p-3 rounded-DEFAULT shadow-[0_2px_0_#cbd5e1] dark:shadow-none flex flex-col">
            <span className="font-label-caps text-[10px] text-danger-rose uppercase font-bold flex items-center gap-1">
              <X className="w-3.5 h-3.5 stroke-[3]" /> Fallos
            </span>
            <span className="font-headline-md text-xl sm:text-2xl text-on-surface dark:text-white mt-1">
              {wrongCount}
            </span>
          </div>

          <div className="bg-surface-container-low dark:bg-slate-800 p-3 rounded-DEFAULT shadow-[0_2px_0_#cbd5e1] dark:shadow-none flex flex-col">
            <span className="font-label-caps text-[10px] text-secondary uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Puntos Ganados
            </span>
            <span className="font-headline-md text-xl sm:text-2xl text-secondary mt-1">
              +{score} XP
            </span>
          </div>

          <div className="bg-surface-container-low dark:bg-slate-800 p-3 rounded-DEFAULT shadow-[0_2px_0_#cbd5e1] dark:shadow-none flex flex-col">
            <span className="font-label-caps text-[10px] text-adventure-orange uppercase font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Racha Máxima
            </span>
            <span className="font-headline-md text-xl sm:text-2xl text-adventure-orange mt-1">
              x{maxStreak}
            </span>
          </div>
        </div>

        {/* 3. Botones de Acción Táctiles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleRestart}
            className="flex-1 sm:flex-none px-5 py-3 rounded-DEFAULT bg-primary text-on-primary font-headline-md text-sm shadow-[0_4px_0_#003ea8] active:translate-y-1 active:shadow-[0_1px_0_#003ea8] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jugar Otra Ronda</span>
          </button>

          {onSwitchToAtlas && (
            <button
              onClick={onSwitchToAtlas}
              className="px-4 py-3 rounded-DEFAULT bg-surface-container dark:bg-slate-800 text-on-surface font-body-bold text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#cbd5e1] dark:shadow-none"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Explorar en el Atlas</span>
            </button>
          )}

          {onOpenPrintable && (
            <button
              onClick={onOpenPrintable}
              className="px-4 py-3 rounded-DEFAULT bg-surface-container dark:bg-slate-800 text-on-surface font-body-bold text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#cbd5e1] dark:shadow-none"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Imprimir Ficha</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN: MODO 60S CONTRARRELOJ
  // -------------------------------------------------------------
    if (challengeType === 'contrarreloj') {
    return (
      <div className={`w-full flex flex-col gap-3 ${className || ''}`}>
        {/* Critical Adrenaline Heads-Up Display */}
        <section className="w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-3 sm:p-4 portrait:p-2 shadow-[0_4px_0_#c3c6d7] portrait:shadow-[0_1px_0_#c3c6d7] dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Gigantic Pulsing Critical Timer */}
          <div className="flex items-center gap-3 portrait:gap-1.5 bg-error-container/80 dark:bg-red-950/60 px-4 py-2 portrait:px-2 portrait:py-1 rounded-DEFAULT portrait:rounded-md shadow-[0_3px_0_#93000a] portrait:shadow-[0_2px_0_#93000a] animate-pulse portrait:shrink-0">
            <div className="w-10 h-10 portrait:w-6 portrait:h-6 rounded-full bg-danger-rose text-on-error flex items-center justify-center shadow-[0_2px_0_#ba1a1a] portrait:shadow-[0_1px_0_#ba1a1a]">
              <Timer className="w-6 h-6 portrait:w-3.5 portrait:h-3.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-label-caps text-[9px] text-on-error-container uppercase tracking-wider font-extrabold portrait:hidden">
                ¡Ritmo Crítico!
              </span>
              <span className="font-display-lg text-2xl portrait:text-base font-black text-danger-rose tracking-tight">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </span>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="flex items-center gap-2 portrait:gap-1 flex-wrap portrait:justify-end portrait:flex-1">
            {/* Aciertos */}
            <div title="Aciertos" className="flex items-center gap-1.5 portrait:gap-1 bg-surface-container-low dark:bg-slate-800 px-3 py-1.5 portrait:px-1.5 portrait:py-1 rounded-DEFAULT portrait:rounded-md shadow-[0_2px_0_#cbd5e1] portrait:shadow-[0_1px_0_#cbd5e1]">
              <CheckCircle2 className="w-5 h-5 portrait:w-3.5 portrait:h-3.5 text-success-emerald portrait:shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="font-label-caps text-[8px] text-on-surface-variant uppercase portrait:hidden">Aciertos</span>
                <span className="font-stat-lg text-xs font-black text-on-surface dark:text-white">
                  {correctCount}
                </span>
              </div>
            </div>

            {/* Fallos */}
            <div title="Fallos" className="flex items-center gap-1.5 portrait:gap-1 bg-surface-container-low dark:bg-slate-800 px-3 py-1.5 portrait:px-1.5 portrait:py-1 rounded-DEFAULT portrait:rounded-md shadow-[0_2px_0_#cbd5e1] portrait:shadow-[0_1px_0_#cbd5e1]">
              <XCircle className="w-5 h-5 portrait:w-3.5 portrait:h-3.5 text-danger-rose portrait:shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="font-label-caps text-[8px] text-on-surface-variant uppercase portrait:hidden">Fallos</span>
                <span className="font-stat-lg text-xs font-black text-on-surface dark:text-white">
                  {wrongCount}
                </span>
              </div>
            </div>

            {/* Score */}
            <div title="Puntos de experiencia acumulados" className="flex items-center gap-1.5 portrait:gap-1 bg-surface-container-low dark:bg-slate-800 px-3 py-1.5 portrait:px-1.5 portrait:py-1 rounded-DEFAULT portrait:rounded-md shadow-[0_2px_0_#cbd5e1] portrait:shadow-[0_1px_0_#cbd5e1]">
              <Trophy className="w-5 h-5 portrait:w-3.5 portrait:h-3.5 text-secondary-container portrait:shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="font-label-caps text-[8px] text-on-surface-variant uppercase portrait:hidden">Puntos</span>
                <span className="font-stat-lg text-xs font-black text-on-surface dark:text-white portrait:whitespace-nowrap">
                  {score}<span className="portrait:hidden"> XP</span>
                </span>
              </div>
            </div>

            {/* Multiplier Flame */}
            <div title="Racha de aciertos consecutivos" className="flex items-center gap-1.5 portrait:gap-1 bg-secondary-fixed dark:bg-amber-950/80 px-3 py-1.5 portrait:px-1.5 portrait:py-1 rounded-DEFAULT portrait:rounded-md shadow-[0_3px_0_#855300] portrait:shadow-[0_2px_0_#855300]">
              <Flame className="w-5 h-5 portrait:w-3.5 portrait:h-3.5 text-adventure-orange animate-bounce portrait:shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="font-label-caps text-[8px] text-on-secondary-fixed-variant uppercase portrait:hidden">Racha</span>
                <span className="font-headline-md text-xs font-bold text-on-secondary-fixed portrait:whitespace-nowrap">
                  x{streak || 1}<span className="portrait:hidden"> ACTIVO</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Rapid Identification Question Banner */}
        {currentQuestion && (
          <div className="w-full bg-primary text-on-primary rounded-DEFAULT p-4 shadow-[0_4px_0_#003ea8] portrait:shadow-[0_2px_0_#003ea8] flex flex-col gap-2">
            <div className="flex items-center justify-between portrait:hidden">
              <span className="font-label-caps text-[10px] text-primary-fixed uppercase tracking-wider font-extrabold">
                Identificacón Relámpago • {currentQuestion.subCategory || currentQuestion.category}
              </span>
              <span className="text-[10px] bg-primary-container px-2 py-0.5 rounded-full font-bold">
                #{currentIndex + 1}
              </span>
            </div>
            <h2 className="font-display-lg text-lg sm:text-xl text-white font-extrabold leading-snug portrait:leading-tight portrait:text-center">
              ¿Es este el <span className="text-secondary-fixed underline decoration-secondary-container decoration-4 portrait:decoration-2">{contrarrelojPrompt?.promptName || currentQuestion.name}</span>?
            </h2>
            <p className="text-xs text-primary-fixed portrait:hidden">
              Mira el indicador señalado en el mapa mudo y responde rápidamente:
            </p>
          </div>
        )}

        {/* Dual Massive Tactile Buttons (Sí / No) */}
        {currentQuestion && (
          <div className="grid grid-cols-1 sm:grid-cols-2 portrait:grid-cols-2 gap-3 portrait:gap-2 mt-1 portrait:mt-0.5">
            {/* SÍ, ES CORRECTO */}
            <button
              onClick={() => handleContrarrelojAnswer(true)}
              disabled={feedback !== null}
              className="w-full min-h-[90px] portrait:min-h-[44px] rounded-DEFAULT portrait:rounded-lg bg-success-emerald text-on-primary flex flex-col portrait:flex-row items-center justify-center p-3 portrait:px-2 portrait:py-1.5 shadow-[0_6px_0_#047857] portrait:shadow-[0_3px_0_#047857] hover:bg-emerald-600 active:translate-y-1.5 portrait:active:translate-y-1 active:shadow-[0_1px_0_#047857] transition-all cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-3 portrait:gap-1.5">
                <CheckCircle2 className="w-8 h-8 portrait:w-4 portrait:h-4 font-bold group-hover:scale-110 transition-transform portrait:shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-display-lg text-lg sm:text-xl portrait:text-xs font-black">
                    SÍ, ES
                  </span>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider text-emerald-100 portrait:hidden">
                    Respuesta Verdadera
                  </span>
                </div>
              </div>
              <div className="mt-1 portrait:hidden bg-emerald-800/40 px-2.5 py-0.5 rounded-full text-[10px] font-body-bold text-white">
                [  Flecha Izquierda ]
              </div>
            </button>

            {/* NO, ES OTRO */}
            <button
              onClick={() => handleContrarrelojAnswer(false)}
              disabled={feedback !== null}
              className="w-full min-h-[90px] portrait:min-h-[44px] rounded-DEFAULT portrait:rounded-lg bg-danger-rose text-on-error flex flex-col portrait:flex-row items-center justify-center p-3 portrait:px-2 portrait:py-1.5 shadow-[0_6px_0_#991b1b] portrait:shadow-[0_3px_0_#991b1b] hover:bg-rose-600 active:translate-y-1.5 portrait:active:translate-y-1 active:shadow-[0_1px_0_#991b1b] transition-all cursor-pointer group disabled:opacity-60"
            >
              <div className="flex items-center gap-3 portrait:gap-1.5">
                <XCircle className="w-8 h-8 portrait:w-4 portrait:h-4 font-bold group-hover:scale-110 transition-transform portrait:shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-display-lg text-lg sm:text-xl portrait:text-xs font-black">
                    NO ES
                  </span>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider text-rose-100 portrait:hidden">
                    Respuesta Falsa
                  </span>
                </div>
              </div>
              <div className="mt-1 portrait:hidden bg-rose-950/40 px-2.5 py-0.5 rounded-full text-[10px] font-body-bold text-white">
                [  Flecha Derecha ]
              </div>
            </button>
          </div>
        )}

        {/* Fast Feedback Notification for Contrarreloj */}
        {feedback && (
          <div className={`p-3 portrait:py-1 portrait:px-2 rounded-DEFAULT portrait:rounded-lg border flex items-center justify-between gap-2.5 portrait:gap-1.5 animate-fadeIn shadow-sm portrait:shadow-xs ${
            feedback.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2 portrait:gap-1.5">
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 portrait:w-3.5 portrait:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 portrait:w-3.5 portrait:h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="font-headline-md text-xs sm:text-sm portrait:text-[11px] font-bold">
                {feedback.message}
              </span>
            </div>
            <span className="text-[10px] portrait:text-[8px] uppercase font-bold opacity-75 shrink-0">
               Siguiente
            </span>
          </div>
        )}
      </div>
    );
  }



  // -------------------------------------------------------------
  // SCREEN: MODO QUIZ CURRICULAR (Test con opciones A, B, C, D)
  // -------------------------------------------------------------
  if (challengeType === 'identificar') {
    return (
      <div className={`w-full flex flex-col gap-3.5 ${className || ''}`}>
        {/* Top Telemetry & Status Bar */}
        <section className="w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-surface-container-high dark:bg-slate-800 px-3 py-1 rounded-full">
              <span className="font-headline-md text-xs sm:text-sm text-primary font-bold">
                Ronda {currentIndex + 1} <span className="font-normal text-on-surface-variant">/ {totalQuestions}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 bg-secondary-fixed dark:bg-amber-950/70 px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-secondary" />
              <span className="font-stat-lg text-xs sm:text-sm font-bold text-on-secondary-fixed">
                {score} XP
              </span>
            </div>

            <div className="flex items-center gap-1 bg-adventure-orange/15 px-3 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 text-adventure-orange" />
              <span className="font-stat-lg text-xs sm:text-sm font-bold text-adventure-orange">
                x{streak || 1}
              </span>
            </div>
          </div>

          {/* Lifelines (50:50 and Pista) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFiftyFifty}
              disabled={fiftyFiftyUsed || feedback !== null}
              className="flex items-center gap-1 bg-surface-container dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-bold hover:bg-surface-container-high disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              title="Comodín 50:50: Descarta 2 opciones erróneas"
            >
              <span className="text-[11px]">50:50</span>
              <span className="w-4 h-4 rounded-full bg-category-rivers text-white text-[9px] flex items-center justify-center font-bold">
                {fiftyFiftyUsed ? '0' : '1'}
              </span>
            </button>

            {/* Advance mode toggle */}
            <button
              onClick={() => {
                const nextMode = autoAdvanceMode === 'manual' ? 'auto' : 'manual';
                setAutoAdvanceMode(nextMode);
                localStorage.setItem('geoespana_advance_mode', nextMode);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container dark:bg-slate-800 hover:bg-surface-container-high transition-colors cursor-pointer"
              title="Cambiar entre avance manual o automático tras respuesta"
            >
              {autoAdvanceMode === 'auto' ? <PlayCircle className="w-3.5 h-3.5 text-amber-500" /> : <PauseCircle className="w-3.5 h-3.5 text-blue-500" />}
              <span>{autoAdvanceMode === 'auto' ? 'Auto (2s)' : 'Pausa'}</span>
            </button>
          </div>
        </section>

        {/* Question Header Card */}
        {currentQuestion && (
          <div className="w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-category-rivers uppercase tracking-wider font-extrabold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Pregunta Curricular • {currentQuestion.subCategory || currentQuestion.category}
              </span>
              {currentQuestion.vertiente && (
                <span className="font-label-caps text-[9px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full uppercase">
                  Vertiente {currentQuestion.vertiente}
                </span>
              )}
            </div>

            <h2 className="font-display-lg text-base sm:text-lg text-on-surface dark:text-white font-extrabold leading-snug">
              ¿Qué accidente geográfico está señalado en el mapa mudo con el indicador fucsia?
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-slate-400">
              {currentQuestion.description}
            </p>
          </div>
        )}

        {/* 4 Large Interactive Multiple-Choice Cards */}
        {currentQuestion && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup">
            {options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
              const isHidden = hiddenOptions.includes(opt.id);
              if (isHidden) {
                return (
                  <div
                    key={opt.id}
                    className="w-full bg-surface-container-low dark:bg-slate-800/40 p-3.5 rounded-DEFAULT opacity-30 border border-dashed border-slate-300 dark:border-slate-700 pointer-events-none flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-surface-container text-slate-400 font-headline-md text-xs flex items-center justify-center">
                      {letter}
                    </span>
                    <span className="text-xs text-slate-400 italic">Descartada por 50:50</span>
                  </div>
                );
              }

              const isTarget = opt.id === currentQuestion.id;
              const hasAnswered = feedback !== null;

              let cardClasses = 'w-full bg-surface-container-low hover:bg-surface-container dark:bg-slate-800 dark:hover:bg-slate-750 text-on-surface dark:text-white p-3.5 rounded-DEFAULT flex items-center justify-between shadow-sm cursor-pointer active:scale-95 transition-all border border-slate-200/80 dark:border-slate-700';

              if (hasAnswered) {
                if (isTarget) {
                  cardClasses = 'w-full bg-success-emerald text-on-primary p-3.5 rounded-DEFAULT flex items-center justify-between shadow-md transition-all active:scale-95 border-2 border-emerald-600 font-bold';
                } else {
                  cardClasses = 'w-full bg-surface-container-low dark:bg-slate-800/50 text-slate-400 p-3.5 rounded-DEFAULT flex items-center justify-between opacity-50 border border-transparent pointer-events-none';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!hasAnswered) handleAnswer(isTarget, opt);
                  }}
                  className={cardClasses}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full font-headline-md text-xs flex items-center justify-center shadow-xs shrink-0 ${
                      hasAnswered && isTarget
                        ? 'bg-white text-success-emerald font-black'
                        : 'bg-surface-container-lowest dark:bg-slate-700 text-on-surface dark:text-white'
                    }`}>
                      {hasAnswered && isTarget ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-headline-md text-xs sm:text-sm font-bold leading-tight">
                        {opt.name}
                      </span>
                      <span className={`font-label-caps text-[9px] uppercase ${hasAnswered && isTarget ? 'text-white/80' : 'text-slate-400'}`}>
                        {opt.subCategory || opt.category}
                      </span>
                    </div>
                  </div>

                  {hasAnswered && isTarget && (
                    <span className="font-stat-lg text-xs font-black text-white bg-emerald-800/40 px-2 py-0.5 rounded-full">
                      +200 XP
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Post-Answer Feedback Banner & Next Button */}
        {feedback && (
          <div className={`p-4 rounded-DEFAULT border flex flex-col gap-3 animate-fadeIn shadow-sm ${
            feedback.isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="font-headline-md text-xs sm:text-sm font-bold">
                {feedback.message}
              </span>
            </div>

            {currentQuestion.curiosity && (
              <p className="text-xs text-on-surface-variant dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 p-2.5 rounded-DEFAULT">
                💡 <span className="font-bold">Dato Didáctico:</span> {currentQuestion.curiosity}
              </p>
            )}

            <button
              onClick={handleNext}
              className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-DEFAULT font-headline-md text-xs sm:text-sm shadow-[0_3px_0_#003ea8] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {autoAdvanceMode === 'auto'
                  ? `Continuar (${autoCountdown > 0 ? autoCountdown + 's...' : 'avanzando...'})`
                  : 'Siguiente Pregunta'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN: MODO UBICAR ("¿Dónde está?")
  // -------------------------------------------------------------
  return (
    <div className={`w-full flex flex-col gap-3.5 ${className || ''}`}>
      {/* 1. HUD Superior de Partida (Stitch Ubicar) */}
      <section className="w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-3 sm:p-4 shadow-[0_4px_0_#dbe1ff] dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Ronda y Progreso Segmentado */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Misión Activa
              </span>
              <span className="font-headline-md text-xs sm:text-sm text-primary font-black">
                Ronda {currentIndex + 1}<span className="text-on-surface-variant font-normal">/{totalQuestions}</span>
              </span>
            </div>
            {/* Barra Segmentada de Progreso */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {resultsHistory.map((res, idx) => {
                const isCurrent = idx === currentIndex && !isGameOver && !isCompleted;
                let bgPip = 'bg-surface-container-high dark:bg-slate-700';
                if (res === 'correct') bgPip = 'bg-success-emerald shadow-[0_1px_0_#059669]';
                else if (res === 'wrong') bgPip = 'bg-danger-rose shadow-[0_1px_0_#dc2626]';
                else if (isCurrent) bgPip = 'bg-primary animate-pulse shadow-[0_1px_0_#003ea8]';

                return (
                  <div
                    key={idx}
                    className={`w-5 sm:w-6 h-2 rounded-full transition-all ${bgPip}`}
                    title={`Pregunta ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Vidas Restantes */}
        <div className="flex items-center gap-1.5 bg-surface-container-low dark:bg-slate-800 px-3 py-1 rounded-full shadow-[0_2px_0_#cbd5e1] dark:shadow-none">
          <span className="font-label-caps text-[9px] text-on-surface-variant font-bold mr-1">VIDAS</span>
          {Array.from({ length: GAME_CONFIG.GAMEPLAY.INITIAL_LIVES }, (_, i) => i + 1).map((h) => (
            <Heart
              key={h}
              className={`w-4 h-4 transition-transform ${
                h <= lives
                  ? 'text-danger-rose fill-danger-rose animate-bounce'
                  : 'text-outline-variant opacity-40'
              }`}
            />
          ))}
        </div>

        {/* Combo & Puntuación */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-adventure-orange/15 px-2.5 sm:px-3 py-1 rounded-full shadow-[0_2px_0_#fdba74]">
            <Flame className="w-4 h-4 text-adventure-orange animate-pulse" />
            <span className="font-headline-md text-xs text-adventure-orange font-bold">
              x{streak || 1} Combo
            </span>
          </div>

          <div className="flex items-center gap-1 bg-secondary-fixed dark:bg-amber-950/70 px-2.5 sm:px-3 py-1 rounded-full shadow-[0_2px_0_#fea619]">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="font-headline-md text-xs font-black text-on-secondary-fixed">
              {score} PTS
            </span>
          </div>
        </div>

        {/* Botones Auxiliares: Pista Educativa & Saltar */}
        <div className="flex items-center gap-1.5">
          {/* Advance mode toggle */}
          <button
            onClick={() => {
              const nextMode = autoAdvanceMode === 'manual' ? 'auto' : 'manual';
              setAutoAdvanceMode(nextMode);
              localStorage.setItem('geoespana_advance_mode', nextMode);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface-container dark:bg-slate-800 hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Cambiar entre avance manual o automático tras respuesta"
          >
            {autoAdvanceMode === 'auto' ? <PlayCircle className="w-3.5 h-3.5 text-amber-500" /> : <PauseCircle className="w-3.5 h-3.5 text-blue-500" />}
            <span>{autoAdvanceMode === 'auto' ? 'Auto (2s)' : 'Pausa'}</span>
          </button>

          {/* Speak button */}
          <button
            onClick={speakQuestion}
            className="w-7 h-7 rounded-full bg-surface-container dark:bg-slate-800 flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Escuchar nombre del accidente"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 2. Tarjeta Central de Misión (Legible desde el fondo del aula / PDI) */}
      {currentQuestion && (
        <section className="w-full shrink-0 bg-primary text-on-primary rounded-DEFAULT p-4 sm:p-5 shadow-[0_4px_0_#003ea8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full">
            {/* Icono 3D Relieve */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-DEFAULT bg-surface-container-lowest text-category-mountains flex items-center justify-center shadow-[0_3px_0_#cbd5e1] shrink-0">
              {getCategoryThemeIcon(currentQuestion.category)}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-category-mountains text-on-primary font-label-caps text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                  {currentQuestion.subCategory || currentQuestion.category}
                </span>
                <span className="text-primary-fixed font-label-caps text-[9px] uppercase font-bold">
                  1º ESO • Relieve Peninsular
                </span>
              </div>

              <h1 className="font-display-lg text-lg sm:text-2xl text-on-primary tracking-tight leading-tight">
                TOCA EN EL MAPA MUDO:{' '}
                <span className="text-secondary-fixed underline decoration-secondary-container decoration-4 underline-offset-4">
                  {currentQuestion.name}
                </span>
              </h1>

              {!showHint ? (
                <button
                  onClick={handleHint}
                  disabled={showHint || feedback !== null}
                  className="self-end shrink-0 mt-3 mb-1 inline-flex items-center gap-1.5 bg-surface-container dark:bg-slate-800 text-on-surface px-2.5 py-1.5 min-h-8 rounded-DEFAULT font-body-bold text-xs leading-normal enabled:hover:brightness-110 enabled:hover:-translate-y-0.5 active:translate-y-0.5 shadow-[0_2px_0_#cbd5e1] dark:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Pista Educativa (-25 pts)"
                >
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 text-secondary-container" />

                  <span>Pista</span>

                  <span className="font-label-caps text-[9px] bg-surface-container-lowest dark:bg-slate-700 px-1 py-0.5 rounded-full">
                    -25 pts
                  </span>
                </button>
              ) : (
                <p className="font-body-sm text-xs text-on-primary/90 mt-4 line-clamp-3">
                  <span className="font-bold text-amber-300">💡 {currentQuestion.description}</span>
                </p>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 3. Feedback Banner en caso de haber tocado el mapa */}
      {feedback && (
        <div className={`p-4 rounded-DEFAULT border flex flex-col gap-3 animate-fadeIn shadow-sm ${
          feedback.isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-headline-md text-xs sm:text-sm font-bold">
              {feedback.message}
            </span>
          </div>

          {currentQuestion && currentQuestion.curiosity && (
            <p className="text-xs text-on-surface-variant dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 p-2.5 rounded-DEFAULT">
              💡 <span className="font-bold">Curiosidad Curricular:</span> {currentQuestion.curiosity}
            </p>
          )}

          <button
            onClick={handleNext}
            className="w-full py-2.5 px-4 bg-primary text-on-primary rounded-DEFAULT font-headline-md text-xs sm:text-sm shadow-[0_3px_0_#003ea8] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {autoAdvanceMode === 'auto'
                ? `Continuar (${autoCountdown > 0 ? autoCountdown + 's...' : 'avanzando...'})`
                : 'Siguiente Accidente'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Desktop Right Companion: Aula Ranking & Glosario Curricular */}
      {/* <div className="hidden lg:grid grid-cols-2 gap-3 mt-1"> */}
        {/* Card 1: Clasificación de Aula */}
        {/*
        <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-3 shadow-[0_3px_0_#cbd5e1] dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-headline-md text-xs text-on-surface dark:text-white font-bold">
                Aula 1º ESO A
              </h3>
            </div>
            <span className="font-label-caps text-[9px] bg-success-emerald/15 text-success-emerald px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-ping" />
              EN VIVO
            </span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center p-1 rounded bg-surface-container-low dark:bg-slate-800/50">
              <span className="font-body-bold">1. Lucía G.</span>
              <span className="font-bold text-primary">2.420 pts</span>
            </div>
            <div className="flex justify-between items-center p-1 rounded bg-surface-container-low dark:bg-slate-800/50">
              <span className="font-body-bold">2. Marc R.</span>
              <span className="font-bold text-primary">2.280 pts</span>
            </div>
            <div className="flex justify-between items-center p-1 rounded bg-primary text-on-primary font-bold shadow-xs">
              <span>★ Tú (Explorador)</span>
              <span className="text-secondary-fixed">{score} pts</span>
            </div>
          </div>
        </div>
        */}

        {/* Card 2: Glosario Curricular Didáctico */}
        {showHint && currentQuestion && (
          <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-3 shadow-[0_3px_0_#cbd5e1] dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-4 h-4 text-category-mountains" />
              <h3 className="font-headline-md text-xs text-on-surface dark:text-white font-bold">
                Ficha Curricular
              </h3>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-slate-300 leading-snug">
              <strong>{currentQuestion.name}: </strong>
              {currentQuestion.description}
            </p>
            {currentQuestion.elevationOrLength && (
              <span className="mt-1 font-label-caps text-[9px] text-primary font-bold">
                📏 {currentQuestion.elevationOrLength}
              </span>
            )}
          </div>
        )}
      {/* </div> */}
    </div>
  );
};
