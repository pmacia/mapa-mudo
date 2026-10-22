import React from 'react';
import { GameMode } from '../../types/geography';
import { Compass, Target, HelpCircle, Timer, Layers, Trophy } from 'lucide-react';

interface MobileBottomNavProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onOpenLayers: () => void;
  onOpenAchievements: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMode,
  onModeChange,
  onOpenLayers,
  onOpenAchievements,
}) => {
  return (
    <nav 
      style={{ height: '46px' }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-surface/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(11,28,48,0.06)] h-[46px]"
    >
      <div className="flex justify-around items-center h-full px-1 max-w-lg mx-auto">
        {/* 1. Explorar / Mapa */}
        <button
          onClick={() => onModeChange('explorar')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'explorar'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary opacity-80'
          }`}
          title="Mapa Mudo Exploratorio"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'explorar' ? 'bg-primary-fixed text-primary font-bold shadow-xs' : ''}`}>
            <Compass className="w-5 h-5" />
          </div>
        </button>

        {/* 2. Ubicar (¿Dónde está?) */}
        <button
          onClick={() => onModeChange('reto_localizar')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'reto_localizar'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary opacity-80'
          }`}
          title="Modo Ubicar en el mapa"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'reto_localizar' ? 'bg-primary-fixed text-primary font-bold shadow-xs' : ''}`}>
            <Target className="w-5 h-5 text-red-500" />
          </div>
        </button>

        {/* 3. Quiz Curricular */}
        <button
          onClick={() => onModeChange('reto_identificar')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'reto_identificar'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary opacity-80'
          }`}
          title="Quiz Curricular con opciones"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'reto_identificar' ? 'bg-primary-fixed text-primary font-bold shadow-xs' : ''}`}>
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </button>

        {/* 4. 60s Contrarreloj */}
        <button
          onClick={() => onModeChange('contrarreloj')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'contrarreloj'
              ? 'text-adventure-orange font-bold scale-105'
              : 'text-on-surface-variant hover:text-adventure-orange opacity-80'
          }`}
          title="60 segundos contrarreloj"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'contrarreloj' ? 'bg-orange-100 dark:bg-orange-950/70 text-adventure-orange font-bold shadow-xs' : ''}`}>
            <Timer className="w-5 h-5 text-adventure-orange" />
          </div>
        </button>

        {/* 5. Capas y Filtros */}
        <button
          onClick={onOpenLayers}
          className="flex flex-col items-center justify-center flex-1 h-full py-0.5 text-on-surface-variant hover:text-primary transition-all duration-150 active:scale-95 cursor-pointer opacity-80"
          title="Capas del Mapa"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </button>

        {/* 6. Trofeos / Perfil */}
        <button
          onClick={onOpenAchievements}
          className="flex flex-col items-center justify-center flex-1 h-full py-0.5 text-on-surface-variant hover:text-secondary-container transition-all duration-150 active:scale-95 cursor-pointer opacity-80"
          title="Trofeos y Recompensas"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
        </button>
      </div>
    </nav>
  );
};
