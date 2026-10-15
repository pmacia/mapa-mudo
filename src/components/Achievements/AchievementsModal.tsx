import React from 'react';
import { BADGES } from '../../data/geographyData';
import { PlayerStats } from '../../types/geography';
import { Trophy, Flame, Target, Award, X, Sparkles } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const getRankTitle = (xp: number) => {
    if (xp >= 1000) return 'Catedrático de Geografía Ibérica';
    if (xp >= 500) return 'Gran Explorador de España';
    if (xp >= 250) return 'Cartógrafo Aventurero';
    if (xp >= 100) return 'Geógrafo Junior';
    return 'Novato de la Cartografía';
  };

  const currentRank = getRankTitle(stats.xp);
  const accuracy =
    stats.totalAttempts > 0
      ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold text-blue-100">
                Tu Carrera Geográfica
              </div>
              <h3 className="text-lg font-black">{currentRank}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
            <Sparkles className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Total XP</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats.xp}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
            <Award className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Nivel</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">Nivel {stats.level}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
            <Flame className="w-5 h-5 text-orange-500 mb-1" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Racha Máx.</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats.maxStreak}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
            <Target className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Precisión</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{accuracy}%</span>
          </div>
        </div>

        {/* Badges & Stamps Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Featured Atlas Stamp Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-800/60 shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex flex-col items-center justify-center shadow-lg border-2 border-amber-200/80 shrink-0">
              <span className="text-xl">🎖️</span>
              <span className="text-[8px] font-black tracking-widest uppercase">SELLO</span>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h5 className="font-black text-sm text-slate-900 dark:text-white">
                  Sello Cartógrafo del Atlas
                </h5>
                {stats.atlasStampUnlocked ? (
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
                    Completado
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    En Exploración
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Visita los 65 accidentes geográficos de España con el ratón en el Modo Atlas para conseguir el Sello Real y 650 puntos de exploración.
              </p>

              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1 bg-amber-200/60 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((stats.visitedAtlasElements?.length || 0) / 65) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-black text-amber-800 dark:text-amber-300 shrink-0">
                  {stats.visitedAtlasElements?.length || 0} / 65
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Medallas & Logros Desbloqueables
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {stats.unlockedBadges.length} de {BADGES.length} completadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES.map((badge) => {
              const isUnlocked = stats.unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-900/40 shadow-inner'
                        : 'bg-slate-200 dark:bg-slate-800 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {badge.title}
                      </h5>
                      {isUnlocked && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          Conseguido
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {badge.description}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Objetivo: {badge.conditionDesc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
