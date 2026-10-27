import React, { useState, useRef, useEffect } from 'react';
import { GameMode, PlayerStats, GeoElement } from '../types/geography';
import { GEO_ELEMENTS } from '../data/geographyData';
import type { MapTheme } from './Map/SpainMap';
import { Compass, Target, CircleHelp, Timer, Search, X, Palette, Check, MoreHorizontal, Printer,
  Trophy, Layers, Volume2, VolumeX, BookOpen, Maximize2, Minimize2, Save, Download,
  Flame } from 'lucide-react';
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setPopup(null);
    };
    const fullscreen = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('fullscreenchange', fullscreen);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('fullscreenchange', fullscreen); };
  }, []);
  useEffect(() => { if (popup === 'search') searchRef.current?.focus(); }, [popup]);
  const matches = query.trim() ? GEO_ELEMENTS.filter(e => `${e.name} ${e.subCategory || ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  const choose = (element: GeoElement) => { onSelectElement?.(element); setQuery(element.name); setPopup(null); };
  const action = (callback: () => void) => { setPopup(null); callback(); };
  const toggle = (value: typeof popup) => setPopup(current => current === value ? null : value);
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
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
            {currentMode === 'explorar' && <button type="button" className="ui-icon header-search-button" aria-label="Buscar accidentes" title="Buscar accidentes"
              aria-expanded={popup === 'search'} onClick={() => toggle('search')}><Search size={17} /></button>}
            <button type="button" className="ui-icon" aria-label="Cambiar tema visual del mapa" title="Cambiar tema visual del mapa"
              aria-expanded={popup === 'theme'} onClick={() => toggle('theme')}><Palette size={17} /></button>
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
      {popup && <div className="header-menu ui-glass" role="dialog" aria-label={popup === 'tools' ? 'Herramientas' : popup === 'theme' ? 'Apariencia' : 'Búsqueda de accidentes'}>
        <div className="header-menu-title"><span>{popup === 'tools' ? 'Herramientas' : popup === 'theme' ? 'Apariencia del mapa' : 'Buscar en el atlas'}</span>
          <button type="button" className="ui-icon" onClick={() => setPopup(null)} aria-label="Cerrar herramientas"><X size={16} /></button></div>
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
            <button type="button" onClick={() => action(onOpenManual)}><BookOpen size={18} />Manual de juego<small>Guía didáctica</small></button>
            <button type="button" onClick={() => action(onToggleSound)}>{soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}{soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}<small>Audio de la aplicación</small></button>
            <button type="button" onClick={() => action(fullscreen)}>{isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}{isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}<small>Proyector y aula</small></button>
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
