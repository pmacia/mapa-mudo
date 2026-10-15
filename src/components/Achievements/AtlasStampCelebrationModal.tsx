import React, { useEffect, useState } from 'react';
import { Award, Compass, Sparkles, X, CheckCircle, Trophy } from 'lucide-react';
import { playSound } from '../../utils/audio';

interface AtlasStampCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAchievements?: () => void;
  totalExplored: number;
}

export const AtlasStampCelebrationModal: React.FC<AtlasStampCelebrationModalProps> = ({
  isOpen,
  onClose,
  onOpenAchievements,
  totalExplored,
}) => {
  const [stampDown, setStampDown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playSound('stamp');
      const timer = setTimeout(() => {
        setStampDown(true);
        setShowConfetti(true);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setStampDown(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Decorative Confetti Particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => {
            const randomLeft = (i * 2.5 + (i % 5) * 2) % 100;
            const randomDelay = (i % 8) * 0.2;
            const randomDuration = 2 + (i % 4) * 0.5;
            const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#eab308'];
            const bg = colors[i % colors.length];
            return (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-sm animate-fall opacity-80"
                style={{
                  left: `${randomLeft}%`,
                  top: '-20px',
                  backgroundColor: bg,
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                  transform: `rotate(${i * 35}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main Dialog */}
      <div className="relative bg-gradient-to-b from-amber-50 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 max-w-lg w-full rounded-3xl shadow-2xl border-2 border-amber-300 dark:border-amber-600/60 p-6 sm:p-8 text-center flex flex-col items-center gap-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>¡Hito de Cartografía Completado!</span>
        </div>

        {/* Stamping Animation Area */}
        <div className="my-2 relative flex items-center justify-center w-36 h-36">
          {/* Glowing Aura */}
          <div className="absolute inset-0 rounded-full bg-amber-400/20 dark:bg-amber-500/20 blur-xl animate-pulse" />

          {/* Golden Wax Seal */}
          <div
            className={`w-32 h-32 rounded-full border-4 border-amber-500/80 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-xl flex flex-col items-center justify-center p-3 transition-all duration-300 ${
              stampDown
                ? 'scale-100 rotate-[-6deg] shadow-amber-500/50 drop-shadow-2xl'
                : 'scale-150 rotate-12 opacity-0'
            }`}
          >
            {/* Outer Dotted Ring */}
            <div className="w-full h-full rounded-full border-2 border-dashed border-amber-200/60 flex flex-col items-center justify-center relative">
              <Compass className="w-8 h-8 text-amber-100 mb-0.5 animate-spin-slow" />
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-100 leading-tight">
                SELLO REAL
              </div>
              <div className="text-[8px] font-bold tracking-wider text-amber-200">
                ATLAS DE ESPAÑA
              </div>
              <div className="text-[9px] font-black bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded-full mt-1">
                65 / 65
              </div>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            ¡Sello Cartógrafo Conseguido!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
            Has visitado con tu ratón los <span className="font-extrabold text-blue-600 dark:text-blue-400">{totalExplored} accidentes geográficos</span> de España en el Modo Atlas sin saltarte ninguno.
          </p>
        </div>

        {/* Rewards Summary Box */}
        <div className="w-full bg-white dark:bg-slate-800/90 rounded-2xl border border-amber-200 dark:border-slate-700 p-4 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Exploración Atlas (10 pts × 65):
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              +650 XP
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Bonus por completar el Atlas:
            </span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400">
              +100 XP Extra
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Medalla Desbloqueada:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              🎖️ Sello Cartógrafo Real
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-2">
          {onOpenAchievements && (
            <button
              onClick={() => {
                onClose();
                onOpenAchievements();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Ver en mis Trofeos</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
          >
            Continuar Explorando
          </button>
        </div>
      </div>
    </div>
  );
};
