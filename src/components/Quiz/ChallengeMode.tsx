import React, { useEffect } from 'react';
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
  X
} from 'lucide-react';

export type { ChallengeType };

export interface ChallengeModeProps {
  session: ReturnType<typeof useChallengeSession>;
  challengeType: ChallengeType;
  lastClickedElement: GeoElement | null;
  onResetClickedElement: () => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({
  session,
  challengeType,
  lastClickedElement,
  onResetClickedElement,
}) => {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    options,
    lives,
    streak,
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
    handleNext,
    handleRestart,
    handleHint,
    speakQuestion,
  } = session;

  // Handle map clicks in "localizar" and "contrarreloj" modes
  useEffect(() => {
    if (challengeType !== 'identificar' && lastClickedElement && currentQuestion && !feedback && !isGameOver && !isCompleted) {
      const isCorrect = lastClickedElement.id === currentQuestion.id;
      handleAnswer(isCorrect, lastClickedElement);
      onResetClickedElement();
    }
  }, [lastClickedElement, challengeType, currentQuestion, feedback, isGameOver, isCompleted, handleAnswer, onResetClickedElement]);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3.5 max-h-[calc(100vh-210px)] overflow-y-auto scrollbar-thin">
      {/* 1. Challenge Header / Game Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        {/* Score & Streak */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs sm:text-sm font-black">{score} XP</span>
          </div>

          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-xl border border-orange-200 dark:border-orange-800 shadow-xs">
            <Flame className={`w-3.5 h-3.5 text-orange-500 ${streak >= 3 ? 'animate-bounce' : ''}`} />
            <span className="text-xs sm:text-sm font-bold">Racha: {streak}</span>
          </div>
        </div>

        {/* Counters & Lives / Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Aciertos & Fallos chips */}
          <div className="flex items-center gap-1 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800" title="Aciertos en esta ronda">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{correctCount}</span>
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800" title="Fallos en esta ronda">
              <X className="w-3 h-3 stroke-[3]" />
              <span>{wrongCount}</span>
            </span>
          </div>

          {/* Lives or Timer */}
          {challengeType === 'contrarreloj' ? (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono font-bold text-xs ${
              timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-transform ${
                    heart <= lives
                      ? 'text-red-500 fill-red-500 scale-100'
                      : 'text-slate-300 dark:text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Round Question Progress Dots Bar */}
      <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          Pregunta {currentIndex + 1} de {totalQuestions}
        </span>
        <div className="flex items-center gap-1">
          {resultsHistory.map((res, idx) => {
            const isCurrent = idx === currentIndex && !isGameOver && !isCompleted;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  res === 'correct'
                    ? 'bg-emerald-500 text-white'
                    : res === 'wrong'
                    ? 'bg-rose-500 text-white'
                    : isCurrent
                    ? 'border-2 border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-950 animate-pulse scale-110'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
                title={`Pregunta ${idx + 1}: ${res === 'correct' ? 'Acertada' : res === 'wrong' ? 'Fallada' : isCurrent ? 'Actual' : 'Pendiente'}`}
              >
                {res === 'correct' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                {res === 'wrong' && <X className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Challenge Content */}
      {!isGameOver && !isCompleted && currentQuestion && (
        <div className="flex flex-col gap-3">
          {/* Target Prompt Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {challengeType === 'localizar'
                  ? '🎯 ¡Localiza en el mapa mudo!'
                  : challengeType === 'identificar'
                  ? '🔍 ¿Qué accidente geográfico está señalado?'
                  : '⚡ ¡Contrarreloj! Haz clic en:'}
              </span>

              {challengeType !== 'identificar' && (
                <button
                  onClick={speakQuestion}
                  title="Escuchar pronunciación"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Oír</span>
                </button>
              )}
            </div>

            {challengeType !== 'identificar' ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {currentQuestion.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Categoría: {currentQuestion.subCategory || currentQuestion.category}
                  </p>
                </div>

                {/* Hint Button */}
                <button
                  onClick={handleHint}
                  disabled={showHint}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 hover:bg-amber-200/80 dark:bg-amber-950/70 dark:hover:bg-amber-900/80 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showHint ? 'Pista activa' : 'Pedir Pista'}</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mira en el mapa el elemento marcado con el indicador fucsia brillante{' '}
                  <span className="inline-block bg-rose-600 text-white font-extrabold text-[11px] px-1.5 py-0.5 rounded shadow-xs">
                    ¿QUÉ ES?
                  </span>{' '}
                  y elige la opción correcta:
                </p>
              </div>
            )}

            {/* Hint Box (if activated) */}
            {showHint && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pista clave: </span>
                  {currentQuestion.description}
                </div>
              </div>
            )}
          </div>

          {/* Multiple Choice Buttons (when in 'identificar' mode) */}
          {challengeType === 'identificar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((opt) => {
                const isTarget = opt.id === currentQuestion.id;
                const isSelected = feedback !== null;

                let btnStyle = 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400';

                if (isSelected) {
                  if (isTarget) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-700 font-bold ring-2 ring-emerald-400';
                  } else {
                    btnStyle = 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={feedback !== null}
                    onClick={() => handleAnswer(isTarget, opt)}
                    className={`p-3 rounded-xl border text-left font-semibold transition-all duration-200 shadow-xs flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span className="text-xs sm:text-sm">{opt.name}</span>
                    <span className="text-[10px] opacity-70 font-normal">
                      {opt.subCategory || opt.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Post-Answer Feedback Banner & Next Button */}
          {feedback && (
            <div
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn ${
                feedback.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-xs sm:text-sm">{feedback.message}</div>
                  {currentQuestion.curiosity && (
                    <div className="text-[11px] mt-1 opacity-90 leading-tight">
                      💡 <span className="font-semibold">Curiosidad:</span> {currentQuestion.curiosity}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Siguiente Accidente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="text-center py-6 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 mb-1">
            <XCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {challengeType === 'contrarreloj' ? '¡Tiempo Agotado!' : '¡Ronda Terminada!'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md">
            Has conseguido un total de <span className="font-bold text-amber-600">{score} XP</span> ({correctCount} aciertos y {wrongCount} fallos) y una racha máxima de {streak}.
          </p>
          <button
            onClick={handleRestart}
            className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Volver a Jugar</span>
          </button>
        </div>
      )}

      {/* Challenge Completed Screen */}
      {isCompleted && (
        <div className="text-center py-6 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 mb-1">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ¡Enhorabuena, Ronda Completada!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md">
            ¡Has superado todas las preguntas! Puntuación de ronda: <span className="font-bold text-amber-600">{score} XP</span> ({correctCount} aciertos / {wrongCount} fallos).
          </p>
          <button
            onClick={handleRestart}
            className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jugar Otra Ronda</span>
          </button>
        </div>
      )}
    </div>
  );
};
