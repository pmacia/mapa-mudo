import React, { useState, useRef, useEffect } from 'react';
import { GameMode, PlayerStats, GeoElement } from '../types/geography';
import { GEO_ELEMENTS } from '../data/geographyData';
import type { MapTheme } from './Map/SpainMap';
import { Compass, Target, CircleHelp, Timer, Search, X, Palette, Check, MoreHorizontal, Printer,
  Trophy, Layers, Volume2, VolumeX, BookOpen, Maximize2, Minimize2, Save, Download,
  Flame, GripHorizontal, ArrowLeft } from 'lucide-react';
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
  onSearchSelect?: (query: string) => void;
  onSelectElement?: (element: GeoElement) => void;
  // Vector Edit Mode Props
  isVectorEditMode?: boolean;
  onSaveVectorEdit?: () => void;
  onExportConfiguration?: () => void;
  onCancelVectorEdit?: () => void;
  hasUnsavedChanges?: boolean;
  editingElementName?: string;
}

const MODES = [
  { id: 'explorar', label: 'Explorar', icon: Compass },
  { id: 'reto_localizar', label: 'Ubicar', icon: Target },
  { id: 'reto_identificar', label: 'Quiz', icon: CircleHelp },
  { id: 'contrarreloj', label: '60 s', icon: Timer },
] as const;

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange, activeCount,
  onOpenAccidentFilter, theme, onThemeChange, stats, onOpenAchievements, onOpenPrintable,
  onOpenManual, soundEnabled, onToggleSound, onSearchSelect, onSelectElement, isVectorEditMode,
  onSaveVectorEdit, onExportConfiguration,
  onCancelVectorEdit, hasUnsavedChanges, editingElementName }) => {
  const [popup, setPopup] = useState<'tools' | 'theme' | 'search' | null>(null);
  const [query, setQuery] = useState('');
  const isCurrentlyFullscreen = () => typeof document !== 'undefined' && !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (window.navigator as any).standalone ||
    (typeof window.matchMedia === 'function' && (
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: standalone)').matches
    ))
  );
  const [isFullScreen, setIsFullScreen] = useState(isCurrentlyFullscreen);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isSmallScreen = window.innerWidth < 1024;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    return isSmallScreen || (isTouch && isCoarse && Math.max(window.innerWidth, window.innerHeight) <= 1366);
  });
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchOffset, setSearchOffset] = useState({ x: 0, y: 0 });
  const searchDrag = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number; rect: DOMRect } | null>(null);

  useEffect(() => {
    const checkTabletOrMobile = () => {
      const isSmallScreen = window.innerWidth < 1024;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
      setIsTabletOrMobile(isSmallScreen || (isTouch && isCoarse && Math.max(window.innerWidth, window.innerHeight) <= 1366));
    };
    checkTabletOrMobile();
    window.addEventListener('resize', checkTabletOrMobile);
    window.addEventListener('orientationchange', checkTabletOrMobile);
    return () => {
      window.removeEventListener('resize', checkTabletOrMobile);
      window.removeEventListener('orientationchange', checkTabletOrMobile);
    };
  }, []);

  useEffect(() => {
    searchDrag.current = null;
    if (popup !== 'search') return;
    let frame = 0;
    const keepOnScreen = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = menuRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dx = Math.max(12, Math.min(rect.x, window.innerWidth - rect.width - 12)) - rect.x;
        const dy = Math.max(12, Math.min(rect.y, window.innerHeight - rect.height - 12)) - rect.y;
        if (Math.abs(dx) > .5 || Math.abs(dy) > .5) setSearchOffset(value => ({ x: value.x + dx, y: value.y + dy }));
      });
    };
    keepOnScreen();
    const observer = new ResizeObserver(keepOnScreen);
    if (menuRef.current) observer.observe(menuRef.current);
    window.addEventListener('resize', keepOnScreen);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', keepOnScreen); };
  }, [popup, query]);
  const moveSearch = (dx: number, dy: number) => {
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSearchOffset(value => ({
      x: value.x + Math.max(12 - rect.x, Math.min(dx, window.innerWidth - rect.right - 12)),
      y: value.y + Math.max(12 - rect.y, Math.min(dy, window.innerHeight - rect.bottom - 12)),
    }));
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setPopup(null);
    };
    const updateFullscreen = () => setIsFullScreen(isCurrentlyFullscreen());
    document.addEventListener('pointerdown', outside);
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('webkitfullscreenchange', updateFullscreen);
    window.addEventListener('resize', updateFullscreen);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('fullscreenchange', updateFullscreen);
      document.removeEventListener('webkitfullscreenchange', updateFullscreen);
      window.removeEventListener('resize', updateFullscreen);
    };
  }, []);
  useEffect(() => { if (popup === 'search') searchRef.current?.focus(); }, [popup]);
  const matches = query.trim() ? GEO_ELEMENTS.filter(e => `${e.name} ${e.subCategory || ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  const choose = (element: GeoElement) => { onSelectElement?.(element); setQuery(element.name); setPopup(null); };
  const action = (callback: () => void) => { setPopup(null); callback(); };
  const toggle = (value: typeof popup) => setPopup(current => current === value ? null : value);
  const fullscreen = () => {
    if (isFullScreen && isTabletOrMobile) return;
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen().catch?.(() => {});
    } else {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      else if ((document.documentElement as any).webkitRequestFullscreen) (document.documentElement as any).webkitRequestFullscreen().catch?.(() => {});
    }
  };
  const isFullscreenDisabled = isFullScreen && isTabletOrMobile;
  return (
    <header ref={headerRef} className="immersive-header" onKeyDown={event => {
      if (event.key === 'Escape' && popup) { event.stopPropagation(); setPopup(null); }
    }}>
      <div className="header-line">
        <div className="header-brand" title="GeoEspaña Junior: Mapa Mudo Interactivo">
          <span>geo<span>españa</span></span>
          <small>{isVectorEditMode ? 'EDICIÓN VECTORIAL' : 'EXPLORA. RECONOCE. DESCUBRE.'}</small>
        </div>
        {!isVectorEditMode ? <>
          <nav className="header-modes" aria-label="Modos de juego">
            {MODES.map(({id,label,icon:Icon}) => <button key={id} type="button" onClick={() => onModeChange(id)}
              aria-current={currentMode === id ? 'page' : undefined}><Icon size={15} /><span>{label}</span></button>)}
          </nav>
          <div className="header-actions">
            {currentMode === 'explorar' && <button type="button" className="ui-icon header-search-button" aria-label="Buscar accidentes" title="Buscar en el Atlas · Arrastra el título para mover la ventana"
              aria-expanded={popup === 'search'} onClick={() => toggle('search')}><Search size={17} /></button>}
            <button
              type="button"
              className="ui-icon"
              disabled={isFullscreenDisabled}
              aria-disabled={isFullscreenDisabled}
              aria-label={isFullScreen && !isTabletOrMobile ? 'Salir de pantalla completa' : 'Pantalla completa'}
              title={isFullscreenDisabled ? 'Pantalla completa activa en este dispositivo' : isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              onClick={isFullscreenDisabled ? undefined : fullscreen}
            >
              {isFullScreen && !isTabletOrMobile ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
            <button type="button" className="ui-icon" aria-label="Más herramientas" title="Más herramientas"
              aria-expanded={popup === 'tools'} onClick={() => toggle('tools')}><MoreHorizontal size={20} /></button>
          </div>
        </> : <>
          <span className="header-editing-name">{editingElementName || 'Selecciona un accidente'}</span>
          <div className="header-actions">
            <button type="button" className="ui-icon" onClick={onExportConfiguration} aria-label="Exportar configuración" title="Exportar configuración"><Download size={17} /></button>
            <button type="button" className="ui-icon" onClick={onSaveVectorEdit} disabled={!hasUnsavedChanges} aria-label="Guardar cambios" title="Guardar cambios"><Save size={17} /></button>

            <button type="button" className="ui-icon" onClick={onCancelVectorEdit} aria-label="Cancelar modo edición" title="Salir de edición"><X size={18} /></button>
          </div>
        </>}
      </div>
      {popup && <div ref={menuRef} className="header-menu ui-glass" role="dialog"
        style={popup === 'search' ? { transform: `translate(${searchOffset.x}px, ${searchOffset.y}px)` } : undefined} aria-label={popup === 'tools' ? 'Herramientas' : popup === 'theme' ? 'Apariencia' : 'Búsqueda de accidentes'}>
        <div className="header-menu-title">
          {popup === 'search' ? <button type="button" className="atlas-search-drag-handle" aria-label="Mover búsqueda del Atlas"
            title="Arrastra para mover · Flechas del teclado para ajustar"
            onPointerDown={event => {
              if (event.button !== 0 || !event.isPrimary || !menuRef.current) return;
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              searchDrag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
                offsetX: searchOffset.x, offsetY: searchOffset.y, rect: menuRef.current.getBoundingClientRect() };
            }}
            onPointerMove={event => {
              const drag = searchDrag.current;
              if (!drag || drag.pointerId !== event.pointerId) return;
              const dx = Math.max(12 - drag.rect.x, Math.min(event.clientX - drag.x, window.innerWidth - drag.rect.right - 12));
              const dy = Math.max(12 - drag.rect.y, Math.min(event.clientY - drag.y, window.innerHeight - drag.rect.bottom - 12));
              setSearchOffset({ x: drag.offsetX + dx, y: drag.offsetY + dy });
            }}
            onPointerUp={() => { searchDrag.current = null; }} onPointerCancel={() => { searchDrag.current = null; }}
            onKeyDown={event => {
              const direction = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[event.key];
              if (direction) { event.preventDefault(); moveSearch(direction[0], direction[1]); }
            }}>
            <GripHorizontal size={16} aria-hidden="true" /><span>Buscar en el Atlas</span>
          </button> : popup === 'theme' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button type="button" className="ui-icon" onClick={() => setPopup('tools')} aria-label="Volver a herramientas" title="Volver a herramientas"><ArrowLeft size={16} /></button>
              <span>Apariencia del mapa</span>
            </div>
          ) : <span>Herramientas</span>}
          <button type="button" className="ui-icon" onClick={() => setPopup(null)} aria-label={popup === 'search' ? 'Cerrar búsqueda' : popup === 'theme' ? 'Cerrar temas' : 'Cerrar herramientas'}><X size={16} /></button>
        </div>
        {popup === 'theme' && <div className="header-theme-options">
          {([{id:'clasico',name:'Clásico · Claro'},{id:'fisico_moderno',name:'Relieve Moderno · Claro'},{id:'nocturno',name:'Modo Nocturno'}] as const).map(item =>
            <button type="button" key={item.id} aria-pressed={theme === item.id} onClick={() => action(() => onThemeChange(item.id))}>
              <span className={`theme-swatch theme-${item.id}`} /><span>{item.name}</span>{theme === item.id && <Check size={16} />}</button>)}
        </div>}
        {popup === 'search' && <>
          <label className="header-search-field"><Search size={17} /><input ref={searchRef} value={query} aria-label="Buscar accidentes geográficos"
            placeholder="Río, pico, cabo…" onChange={event => { setQuery(event.target.value); onSearchSelect?.(event.target.value); }}
            onKeyDown={event => { if (event.key === 'Enter' && matches[0]) choose(matches[0]); }} />
            {query && <button type="button" className="ui-icon" aria-label="Borrar búsqueda" onClick={() => { setQuery(''); onSearchSelect?.(''); searchRef.current?.focus(); }}><X size={15} /></button>}</label>
          <div className="header-search-results">{matches.map(element => <button type="button" key={element.id} onClick={() => choose(element)}>
            <span>{element.name}<small>{element.subCategory || element.category}</small></span><span>{element.elevationOrLength}</span></button>)}
            {query && !matches.length && <p>No hay resultados para esta búsqueda.</p>}</div>
        </>}
        {popup === 'tools' && <>
          <div className="header-tool-grid">
            <button type="button" onClick={() => action(onOpenAccidentFilter)}><Layers size={18} />Capas y filtros<small>{activeCount} accidentes activos</small></button>
            <button type="button" onClick={() => action(onOpenAchievements)}><Trophy size={18} />Logros e insignias<small>{stats.xp || 0} XP · Nivel {stats.level || 1}</small></button>
            <button type="button" onClick={() => action(onOpenPrintable)}><Printer size={18} />Imprimir mapa<small>Ficha y soluciones</small></button>
            <button type="button" onClick={() => action(onOpenManual)}><BookOpen size={18} />Manual de juego<small>Controles, reglas y atajos</small></button>
            <button type="button" onClick={() => action(onToggleSound)}>{soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}{soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}<small>Audio de la aplicación</small></button>
            <button type="button" onClick={() => setPopup('theme')} aria-label="Cambiar tema visual del mapa"><Palette size={18} />Tema del mapa<small>{theme === 'clasico' ? 'Clásico · Claro' : theme === 'fisico_moderno' ? 'Relieve · Claro' : 'Modo Nocturno'}</small></button>
          </div>
          <button type="button" className="header-progress" onClick={() => action(onOpenAchievements)}>
            <Flame size={17} /><span>Mejor racha: {stats.maxStreak || 0}</span><span>{stats.xp || 0} XP</span>
            <span className="header-progress-track"><span style={{width:`${Math.min(100, ((stats.xp || 0) % 500) / 5)}%`}} /></span>
          </button>
        </>}
      </div>}
    </header>
  );
};
