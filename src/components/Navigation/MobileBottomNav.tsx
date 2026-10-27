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
      className="mobile-dock"
    >
      <div className="flex justify-around items-center h-full px-1 max-w-lg mx-auto">
        {/* 1. Explorar / Mapa */}
        <button
          onClick={() => onModeChange('explorar')}
          aria-current={currentMode === 'explorar' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'explorar'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary opacity-80'
          }`}
          title="Mapa Mudo Exploratorio" aria-label="Mapa Mudo Exploratorio"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'explorar' ? 'bg-primary-fixed text-primary font-bold shadow-xs' : ''}`}>
            <Compass className="w-5 h-5" />
          </div>
          <span>Explorar</span>
        </button>

        {/* 2. Ubicar (¿Dónde está?) */}
        <button
          onClick={() => onModeChange('reto_localizar')}
          aria-current={currentMode === 'reto_localizar' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'reto_localizar'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary opacity-80'
          }`}
          title="Modo Ubicar en el mapa" aria-label="Modo Ubicar en el mapa"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'reto_localizar' ? 'bg-primary-fixed text-primary font-bold shadow-xs' : ''}`}>
            <Target className="w-5 h-5 text-red-500" />
          </div>
          <span>Ubicar</span>
        </button>

        {/* 3. Quiz Curricular */}
        <button
          onClick={() => onModeChange('reto_identificar')}
          aria-current={currentMode === 'reto_identificar' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'reto_identificar'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary opacity-80'
          }`}
          title="Quiz Curricular con opciones" aria-label="Quiz Curricular con opciones"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'reto_identificar' ? 'bg-primary-fixed text-primary font-bold shadow-xs' : ''}`}>
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span>Quiz</span>
        </button>

        {/* 4. 60s Contrarreloj */}
        <button
          onClick={() => onModeChange('contrarreloj')}
          aria-current={currentMode === 'contrarreloj' ? 'page' : undefined}
          className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-all duration-150 active:scale-95 cursor-pointer ${
            currentMode === 'contrarreloj'
              ? 'text-adventure-orange font-bold scale-105'
              : 'text-on-surface-variant hover:text-adventure-orange opacity-80'
          }`}
          title="60 segundos contrarreloj" aria-label="60 segundos contrarreloj"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === 'contrarreloj' ? 'bg-orange-100 dark:bg-orange-950/70 text-adventure-orange font-bold shadow-xs' : ''}`}>
            <Timer className="w-5 h-5 text-adventure-orange" />
          </div>
          <span>60 s</span>
        </button>

        {/* 5. Capas y Filtros */}
        <button
          onClick={onOpenLayers}
          className="flex flex-col items-center justify-center flex-1 h-full py-0.5 text-on-surface-variant hover:text-primary transition-all duration-150 active:scale-95 cursor-pointer opacity-80"
          title="Capas del Mapa" aria-label="Capas del Mapa"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <span>Capas</span>
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
          <span>Logros</span>
        </button>
      </div>
    </nav>
  );
};
