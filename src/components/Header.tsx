import React, { useState, useRef, useEffect } from 'react';
import { GameMode, PlayerStats, GeoElement } from '../types/geography';
import { GEO_ELEMENTS } from '../data/geographyData';
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
  Volume2, 
  VolumeX, 
  BookOpen, 
  Tv, 
  Flame, 
  GraduationCap, 
  Search, 
  X,
  Palette,
  Check
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
  onSearchSelect?: (query: string) => void;
  onSelectElement?: (element: GeoElement) => void;
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
  onSearchSelect,
  onSelectElement,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingElements = searchQuery.trim().length > 0
    ? GEO_ELEMENTS.filter((e) => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.subCategory && e.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleSelectSearchItem = (elem: GeoElement) => {
    if (onSelectElement) {
      onSelectElement(elem);
    }
    setSearchQuery(elem.name);
    setIsSearchOpen(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
    }
  };

  const currentLevel = stats.level || 1;
  const currentXp = stats.xp || 0;
  const xpInCurrentLevel = currentXp % 500;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-container-low/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-outline-variant/40 dark:border-slate-800 shadow-sm transition-all duration-200">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* LEFT: Brand Logo & Classroom Pill (Only icon on mobile for single-line fit) */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-DEFAULT bg-primary flex items-center justify-center text-on-primary shadow-[0_3px_0_#003ea8] shrink-0"
              title="GeoEspaña Junior: Mapa Mudo Interactivo"
            >
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            {/* Title & subtitle hidden on mobile and tablet, visible from desktop (lg) onwards */}
            <div className="hidden lg:flex flex-col min-w-0">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-headline-md text-base sm:text-lg text-primary tracking-tight">GeoEspaña</span>
                <span className="font-headline-md text-base sm:text-lg text-secondary-container">Junior</span>
              </div>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider truncate">
                1º ESO Geografía Física
              </span>
            </div>
          </div>

          {/* Classroom / Aula LOMLOE Badge (Oculto cuando se muestra el buscador en modo Explorar) */}
          {currentMode !== 'explorar' && (
            <div className="hidden xl:flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full shadow-[0_2px_0_#cbd5e1] dark:shadow-none">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="font-body-bold text-xs text-on-surface">1º ESO - Aula A</span>
              <span className="font-label-caps text-[9px] bg-success-emerald text-on-primary px-1.5 py-0.2 rounded-full uppercase">
                LOMLOE
              </span>
            </div>
          )}

          {/* Quick Search Bar (Solo visible en modo Explorar y selecciona el accidente directamente en el mapa) */}
          {currentMode === 'explorar' && (
            <div className="hidden md:flex items-center relative w-56 lg:w-64" ref={searchContainerRef}>
              <Search className="w-4 h-4 absolute left-3 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  if (onSearchSelect) onSearchSelect(e.target.value);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && matchingElements.length > 0) {
                    handleSelectSearchItem(matchingElements[0]);
                  }
                }}
                placeholder="Buscar río, pico, cabo..."
                className="w-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface font-body-base text-xs pl-9 pr-7 py-1.5 rounded-full shadow-[0_2px_0_#cbd5e1] dark:shadow-none outline-none focus:ring-2 focus:ring-primary border border-slate-200/60 dark:border-slate-700"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                    if (onSearchSelect) onSearchSelect('');
                  }}
                  className="absolute right-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Dropdown interactivo con los accidentes coincidentes */}
              {isSearchOpen && matchingElements.length > 0 && (
                <div className="absolute top-10 left-0 w-72 bg-surface-container-lowest dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-DEFAULT shadow-xl py-1 z-50 max-h-64 overflow-y-auto scrollbar-thin animate-fadeIn">
                  <div className="px-3 py-1 text-[10px] font-label-caps text-on-surface-variant uppercase border-b border-slate-100 dark:border-slate-800 font-bold">
                    Accidentes ({matchingElements.length})
                  </div>
                  {matchingElements.map((elem) => (
                    <button
                      key={elem.id}
                      onClick={() => handleSelectSearchItem(elem)}
                      className="w-full px-3 py-2 text-left hover:bg-surface-container dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-headline-md text-xs font-bold text-on-surface dark:text-white truncate">
                          {elem.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant truncate">
                          {elem.subCategory || elem.category}
                        </span>
                      </div>
                      {elem.elevationOrLength && (
                        <span className="font-label-caps text-[9px] text-primary shrink-0">
                          {elem.elevationOrLength}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CENTER: Tactile Game Mode Switcher HUD (Hidden on mobile/tablet where bottom nav is active) */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-container dark:bg-slate-800 p-1 rounded-full shadow-[0_2px_0_#cbd5e1] dark:shadow-none justify-center">
          {/* 1. Explorar / Atlas */}
          <button
            onClick={() => onModeChange('explorar')}
            className={`px-3 py-1.5 rounded-full font-body-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentMode === 'explorar'
                ? 'bg-primary text-on-primary shadow-[0_2px_0_#003ea8] active:translate-y-0.5'
                : 'text-primary hover:bg-surface-container-lowest'
            }`}
          >
            <Compass className={`w-4 h-4 ${
              currentMode === 'explorar' ? 'text-on-primary' : 'text-primary'
            }`} />
            <span>Explorar</span>
          </button>

          {/* 2. Ubicar (¿Dónde está?) */}
          <button
            onClick={() => onModeChange('reto_localizar')}
            className={`px-3 py-1.5 rounded-full font-body-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentMode === 'reto_localizar'
                ? 'bg-primary text-on-primary shadow-[0_2px_0_#003ea8] active:translate-y-0.5'
                : 'text-red-500 hover:bg-surface-container-lowest'
            }`}
          >
            <Target className={`w-4 h-4 ${
              currentMode === 'reto_localizar' ? 'text-on-primary' : 'text-red-500'
            }`} />
            <span>Ubicar</span>
          </button>

          {/* 3. Quiz Curricular (Test) */}
          <button
            onClick={() => onModeChange('reto_identificar')}
            className={`px-3 py-1.5 rounded-full font-body-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentMode === 'reto_identificar'
                ? 'bg-primary text-on-primary shadow-[0_2px_0_#003ea8] active:translate-y-0.5'
                : 'text-blue-500 hover:bg-surface-container-lowest'
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${
              currentMode === 'reto_identificar' ? 'text-on-primary' : 'text-blue-500'
            }`} />
            <span>Quiz Rápido</span>
          </button>

          {/* 4. 60s Contrarreloj */}
          <button
            onClick={() => onModeChange('contrarreloj')}
            className={`px-3 py-1.5 rounded-full font-body-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentMode === 'contrarreloj'
                ? 'bg-adventure-orange text-white shadow-[0_2px_0_#c2410c] active:translate-y-0.5'
                : 'text-adventure-orange hover:bg-surface-container-lowest'
            }`}
          >
            <Timer className={`w-4 h-4 ${
              currentMode === 'contrarreloj' ? 'text-white' : 'text-adventure-orange'
            }`} />
            <span>60s Contrarreloj</span>
          </button>
        </nav>

        {/* RIGHT: Live Gamified Telemetry & Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* ACTION BUTTON: Capas y Filtros (Hidden on mobile where bottom nav has it) */}
          <button
            onClick={onOpenAccidentFilter}
            className="hidden lg:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
            title="Capas del mapa y personalización curricular"
          >
            <Layers className="w-4 h-4 text-primary" />
          </button>

          {/* ACTION BUTTON: PDI / Proyector Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
            title={isFullScreen ? 'Salir de pantalla completa' : 'Modo Pantalla Completa Proyector PDI'}
          >
            <Tv className="w-4 h-4 text-tertiary" />
          </button>

          {/* ACTION BUTTON: Theme selector (Clásico / Físico / Nocturno) */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
              title="Cambiar tema visual del mapa"
            >
              <Palette className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 top-11 bg-surface-container-lowest dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-DEFAULT shadow-xl p-2 w-48 z-50 flex flex-col gap-1 animate-fadeIn">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase px-2 py-1">
                  Estilo Cartográfico
                </span>
                <button
                  onClick={() => {
                    onThemeChange('clasico');
                    setThemeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-body-bold text-left cursor-pointer transition-colors ${
                    theme === 'clasico' ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'
                  }`}
                >
                  <span>Atlas Clásico</span>
                  {theme === 'clasico' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    onThemeChange('fisico_moderno');
                    setThemeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-body-bold text-left cursor-pointer transition-colors ${
                    theme === 'fisico_moderno' ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'
                  }`}
                >
                  <span>Relieve Moderno</span>
                  {theme === 'fisico_moderno' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    onThemeChange('nocturno');
                    setThemeDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-body-bold text-left cursor-pointer transition-colors ${
                    theme === 'nocturno' ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'
                  }`}
                >
                  <span>Modo Nocturno 🌙</span>
                  {theme === 'nocturno' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* ACTION BUTTON: Audio toggle */}
          <button
            onClick={onToggleSound}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
            title={soundEnabled ? 'Silenciar sonidos del aula' : 'Activar efectos de audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-danger-rose" />
            )}
          </button>

          {/* ACTION BUTTON: Printable Map Sheets */}
          <button
            onClick={onOpenPrintable}
            className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
            title="Imprimir mapa mudo y fichas de clase"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* ACTION BUTTON: Didactic Manual */}
          <button
            onClick={onOpenManual}
            className="flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
            title="Manual didáctico y guía del profesor"
          >
            <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* ACTION BUTTON: Achievements / Logros Modal (Hidden on mobile where bottom nav has it) */}
          <button
            onClick={onOpenAchievements}
            className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-[0_2px_0_#cbd5e1] dark:shadow-none cursor-pointer"
            title="Insignias y logros desbloqueados"
          >
            <Trophy className="w-4 h-4 text-secondary-container" />
          </button>

          {/* Flame Streak Chip (Racha Máxima idéntica a la tarjeta de logros) */}
          <button
            onClick={onOpenAchievements}
            title={`Racha Máxima: ${stats.maxStreak || 0} aciertos consecutivos. Haz clic para ver el panel de logros.`}
            className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-slate-800 px-2.5 sm:px-3 py-1 rounded-full shadow-[0_2px_0_#cbd5e1] dark:shadow-none hover:bg-orange-50 dark:hover:bg-slate-700/60 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-orange-900/40"
          >
            <Flame className={`w-4 h-4 text-orange-500 fill-orange-500 ${(stats.maxStreak || 0) >= 3 ? 'animate-bounce' : ''}`} />
            <span className="font-stat-lg text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-bold">
              {stats.maxStreak || 0}
            </span>
            <span className="font-label-caps text-[9px] text-slate-500 dark:text-slate-400 hidden sm:inline font-bold">
              Racha Máx.
            </span>
          </button>

          {/* XP Score Chip */}
          <button
            onClick={onOpenAchievements}
            title={`Puntos XXXXX: ${stats.xp || 0} puntos XXXXXX. Haz clic para ver el panel de logros.`}
            className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-slate-800 px-2.5 sm:px-3 py-1 rounded-full shadow-[0_2px_0_#cbd5e1] dark:shadow-none hover:bg-orange-50 dark:hover:bg-slate-700/60 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-orange-200 dark:hover:border-orange-900/40"
          >
            <Trophy className="w-4 h-4 text-secondary-container" />
            <span className="font-stat-lg text-xs sm:text-sm text-on-surface dark:text-white font-bold">
              {stats.xp}
            </span>
            <span className="font-label-caps text-[9px] text-on-surface-variant hidden sm:inline">
              XP
            </span>
          </button>

          {/* Level Progress Mini Track (Desktop) */}
          <div className="hidden xl:flex flex-col gap-0.5 w-20">
            <div className="flex justify-between items-center text-[9px] font-label-caps text-on-surface-variant">
              <span>NV. {currentLevel}</span>
              <span className="text-primary font-bold">{xpInCurrentLevel}/500</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-success-emerald rounded-full transition-all duration-300"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
