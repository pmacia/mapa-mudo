import React, { useState } from 'react';
import { GameMode, PlayerStats } from '../types/geography';
import { MapTheme } from './Map/SpainMap';
import { 
  Compass, 
  Map as MapIcon, 
  Target, 
  HelpCircle, 
  Timer, 
  Printer, 
  Trophy, 
  Layers, 
  Palette,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  activeCount: number;
  onOpenAccidentFilter: () => void;
  theme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  stats: PlayerStats;
  onOpenAchievements: () => void;
  onOpenPrintable: () => void;
  onOpenManual: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  activeCount,
  onOpenAccidentFilter,
  theme,
  onThemeChange,
  stats,
  onOpenAchievements,
  onOpenPrintable,
  onOpenManual,
  soundEnabled,
  onToggleSound,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  return (
    <header
      className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-4 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'py-1 sm:py-1.5 shadow-sm' : 'py-2.5 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            className={`rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0 transition-all duration-300 ${
              isCollapsed ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg' : 'w-9 h-9 sm:w-10 sm:h-10'
            }`}
          >
            <Compass
              className={`transition-all duration-300 ${
                isCollapsed ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6 animate-pulse'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className={`font-black tracking-tight text-slate-900 dark:text-white transition-all duration-300 ${
                  isCollapsed ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
                }`}
              >
                GeoEspaña <span className="text-blue-600 dark:text-blue-400">Junior</span>
              </h1>
              {!isCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 hidden xs:inline-block">
                  12-14 Años
                </span>
              )}
            </div>
            {!isCollapsed && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Mapa Mudo Interactivo & Retos de Geografía de España
              </p>
            )}
          </div>
        </div>

        {/* Game Mode Switcher Tabs */}
        <nav
          className={`flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all ${
            isCollapsed ? 'p-0.5' : 'p-1'
          }`}
        >
          <button
            onClick={() => onModeChange('explorar')}
            className={`flex items-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCollapsed ? 'px-2 py-1 text-[11px]' : 'px-2.5 sm:px-3 py-1.5'
            } ${
              currentMode === 'explorar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Atlas</span>
          </button>

          <button
            onClick={() => onModeChange('reto_localizar')}
            className={`flex items-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCollapsed ? 'px-2 py-1 text-[11px]' : 'px-2.5 sm:px-3 py-1.5'
            } ${
              currentMode === 'reto_localizar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">¿Dónde está?</span>
            <span className="sm:hidden">Ubicar</span>
          </button>

          <button
            onClick={() => onModeChange('reto_identificar')}
            className={`flex items-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCollapsed ? 'px-2 py-1 text-[11px]' : 'px-2.5 sm:px-3 py-1.5'
            } ${
              currentMode === 'reto_identificar'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Identificar</span>
            <span className="sm:hidden">Quiz</span>
          </button>

          <button
            onClick={() => onModeChange('contrarreloj')}
            className={`flex items-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCollapsed ? 'px-2 py-1 text-[11px]' : 'px-2.5 sm:px-3 py-1.5'
            } ${
              currentMode === 'contrarreloj'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-orange-500" />
            <span>60s</span>
          </button>
        </nav>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Unified Capas y Selección de Accidentes Button */}
          <button
            onClick={onOpenAccidentFilter}
            className={`flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-xs font-bold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer shadow-xs ${
              isCollapsed ? 'px-2 py-1 text-[11px]' : 'px-2.5 sm:px-3 py-1.5'
            }`}
            title="Abrir panel de selección de capas y accidentes"
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Capas</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-extrabold leading-none">
              {activeCount}
            </span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className={`rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ${
                isCollapsed ? 'p-1' : 'p-1.5'
              }`}
              title="Cambiar estilo de mapa"
            >
              <Palette className="w-4 h-4 text-purple-600" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs flex flex-col gap-1">
                {[
                  { id: 'clasico', label: '📜 Atlas Clásico' },
                  { id: 'fisico_moderno', label: '🏔️ Físico Moderno' },
                  { id: 'nocturno', label: '🌙 Modo Gamer / Satélite' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      onThemeChange(th.id as MapTheme);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      theme === th.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            className={`rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ${
              isCollapsed ? 'p-1' : 'p-1.5'
            }`}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar efectos de sonido'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Toggle Header Collapse/Expand Button (Next to audio toggle) */}
          <button
            onClick={onToggleCollapse}
            className={`rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1 ${
              isCollapsed ? 'p-1 sm:px-2 py-0.5' : 'p-1.5'
            } ${
              isCollapsed
                ? 'border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title={
              isCollapsed
                ? 'Expandir cabecera hacia abajo'
                : 'Contraer cabecera hacia arriba para ampliar el mapa'
            }
            aria-label={isCollapsed ? 'Expandir cabecera' : 'Contraer cabecera'}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-bounce" />
                <span className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-300 hidden sm:inline">
                  Expandir
                </span>
              </>
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* Manual / Guía Didáctica Button */}
          <button
            onClick={onOpenManual}
            className={`items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer ${
              isCollapsed ? 'hidden sm:flex px-2 py-1 text-[11px]' : 'flex px-2.5 sm:px-3 py-1.5'
            }`}
            title="Abrir Manual del Juego y Guía Didáctica"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Manual</span>
          </button>

          {/* Printable Map Generator Button */}
          <button
            onClick={onOpenPrintable}
            className={`items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? 'hidden md:flex px-2 py-1 text-[11px]' : 'flex px-2.5 sm:px-3 py-1.5'
            }`}
            title="Generar examen o ficha imprimible de mapa mudo"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden xl:inline">Imprimir</span>
          </button>

          {/* User Profile / Achievements Badge */}
          <button
            onClick={onOpenAchievements}
            className={`items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer ${
              isCollapsed ? 'hidden sm:flex pl-2 pr-2.5 py-0.5' : 'flex pl-2 pr-2.5 sm:pr-3 py-1'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 leading-none">
                Nvl {stats.level}
              </span>
              <span className="text-xs font-black leading-tight">
                {stats.xp} <span className="hidden sm:inline">XP</span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
