import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Map as MapIcon, 
  Target, 
  HelpCircle, 
  Timer, 
  Lightbulb, 
  Trophy, 
  Printer, 
  Layers, 
  Volume2, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Palette, 
  Sliders, 
  Compass,
  Search,
  Flame,
  GraduationCap,
  Zap,
  Pencil
} from 'lucide-react';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { GEO_ELEMENTS } from '../../data/geographyData';

interface GameManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: 'explorar' | 'reto_localizar' | 'reto_identificar' | 'contrarreloj') => void;
}

type ManualSection = 'modos' | 'pistas_puntos' | 'progresion' | 'mapa_capas' | 'imprimibles' | 'trucos_estudio' | 'configuracion';

const SECTIONS: { id: ManualSection; label: string; icon: React.FC<{ className?: string }>; badge: string }[] = [
  { id: 'modos', label: 'Modos de Juego', icon: Compass, badge: '4 Modos' },
  { id: 'pistas_puntos', label: 'Puntuación y Pistas', icon: Lightbulb, badge: 'Reglas' },
  { id: 'progresion', label: 'Niveles y Medallas', icon: Trophy, badge: 'Gamificación' },
  { id: 'mapa_capas', label: 'Capas y Cartografía', icon: Layers, badge: `${GEO_ELEMENTS.length} Elementos` },
  { id: 'imprimibles', label: 'Fichas Imprimibles', icon: Printer, badge: 'Docentes' },
  { id: 'trucos_estudio', label: 'Guía Didáctica ESO', icon: Sparkles, badge: 'Nemotecnia' },
  { id: 'configuracion', label: 'Ajustes Técnicos', icon: Sliders, badge: 'gameConfig' },
];

const QUICK_SEARCHES: { label: string; section: ManualSection }[] = [
  { label: 'Contrarreloj v2', section: 'modos' },
  { label: 'Atajos Teclado', section: 'modos' },
  { label: 'Rachas y Fuego', section: 'pistas_puntos' },
  { label: 'Nueva Rosa Náutica', section: 'mapa_capas' },
  { label: 'Exámenes A4', section: 'imprimibles' },
  { label: 'Reglas de Ríos', section: 'trucos_estudio' },
];

export const GameManualModal: React.FC<GameManualModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  const [activeSection, setActiveSection] = useState<ManualSection>('modos');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[92vh] max-h-[850px] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Manual del Juego y Guía Didáctica</h2>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-xs">
                  Versión 2.0
                </span>
              </div>
              <p className="text-xs text-blue-100/90 hidden sm:block">
                GeoEspaña Junior · Reglas pedagógicas, controles de teclado, sistema de puntuación y cartografía
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search and Navigation Tabs */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          {/* Scrollable Tabs */}
          <div className="overflow-x-auto flex items-center gap-1.5 scrollbar-thin py-0.5">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-700 dark:text-slate-300">
          
          {/* SECTION 1: MODOS DE JUEGO */}
          {activeSection === 'modos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Añadimos min-w-0 para que el contenedor de texto respete los límites del Flexbox */}
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Cuatro Modos de Aprendizaje Adaptativo
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Diseñados para un aprendizaje progresivo: desde la exploración libre con locución hasta el desafío de alta velocidad.
                  </p>
                </div>
                
                {/* Añadimos shrink-0 y whitespace-nowrap para proteger el tamaño de la cápsula */}
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 self-start sm:self-auto border border-blue-200 dark:border-blue-900 shrink-0 whitespace-nowrap">
                  {GEO_ELEMENTS.length} Accidentes Evaluables
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Atlas Interactivo */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">1. Atlas Interactivo</h4>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Exploración Libre & Fichas</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Sin límite
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      Haz clic en cualquier elemento geográfico para abrir su ficha enciclopédica detallada: longitud, altitud, comunidad autónoma, vertiente hidrográfica y curiosidades curriculares.
                    </p>
                    <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>Locución por voz:</strong> Escucha la pronunciación en español nativo.</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span><strong>+{GAME_CONFIG.POINTS.ATLAS_DISCOVERY_XP} XP</strong> por cada accidente descubierto por primera vez.</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span><strong>Sello Dorado:</strong> Bonificación de +{GAME_CONFIG.POINTS.ATLAS_STAMP_BONUS_XP} XP al descubrir los {GEO_ELEMENTS.length} elementos.</span>
                      </div>
                    </div>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('explorar'); onClose(); }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Abrir Atlas Interactivo</span>
                    </button>
                  )}
                </div>

                {/* 2. ¿Dónde está? (Localizar) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:border-red-300 dark:hover:border-red-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">2. ¿Dónde está?</h4>
                          <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">Localización en Mapa Mudo</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                        {GAME_CONFIG.GAMEPLAY.INITIAL_LIVES} Vidas
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      Se te pide encontrar un accidente concreto (ej. <em>"Localiza el Río Ebro"</em>) y debes hacer clic directamente sobre él en el mapa físico mudo.
                    </p>
                    <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>+{GAME_CONFIG.POINTS.LOCALIZAR_BASE} pts</strong> por acierto directo ({GAME_CONFIG.POINTS.LOCALIZAR_WITH_HINT} pts con pista).</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span><strong>Botón Pista:</strong> Centra el mapa e ilumina el sector con una aureola.</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Empiezas con {GAME_CONFIG.GAMEPLAY.INITIAL_LIVES} vidas; si cometes {GAME_CONFIG.GAMEPLAY.INITIAL_LIVES} fallos termina la ronda.</span>
                      </div>
                    </div>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('reto_localizar'); onClose(); }}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Jugar a ¿Dónde está?</span>
                    </button>
                  )}
                </div>

                {/* 3. Identificar (Quiz) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">3. Identificar</h4>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Test de 4 Opciones</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {GAME_CONFIG.GAMEPLAY.INITIAL_LIVES} Vidas
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      El mapa ilumina un accidente con el marcador dorado objetivo. Debes elegir su nombre oficial entre 4 opciones con botones táctiles.
                    </p>
                    <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span><strong>+{GAME_CONFIG.POINTS.IDENTIFICAR_BASE} pts</strong> por acierto directo ({GAME_CONFIG.POINTS.IDENTIFICAR_WITH_HINT} pts con pista).</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span><strong>Pista 50/50:</strong> Descarta al instante dos respuestas incorrectas.</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Acumula rachas consecutivas para subir nota en el informe escolar.</span>
                      </div>
                    </div>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('reto_identificar'); onClose(); }}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Jugar a Identificar</span>
                    </button>
                  )}
                </div>

                {/* 4. Contrarreloj 60s (v2.0) */}
                <div className="bg-orange-50/70 dark:bg-orange-950/30 p-4 rounded-2xl border-2 border-orange-300 dark:border-orange-800/80 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                          <Timer className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">4. Contrarreloj 60s</h4>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-orange-500 text-white">v2.0</span>
                          </div>
                          <span className="text-[11px] text-orange-700 dark:text-orange-300 font-bold">Verdadero / Falso & Teclado</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-orange-200 dark:bg-orange-900/80 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full">
                        60s + Bonos
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                      El mapa resalta un accidente con la señal <span className="font-bold text-orange-600 dark:text-orange-400">"¿ES ESTE?"</span> y te pregunta: <em>"¿Es este el [Nombre]?"</em>. ¡Responde a toda velocidad si la afirmación es verdadera o falsa!
                    </p>

                    {/* Keyboard Controls Callout */}
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-orange-200 dark:border-orange-900/50 mb-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" /> Atajos de Teclado:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded border border-emerald-300 dark:border-emerald-700">←</kbd>
                            <span className="text-[11px] font-bold text-emerald-600">SÍ</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 rounded border border-rose-300 dark:border-rose-700">→</kbd>
                            <span className="text-[11px] font-bold text-rose-600">NO</span>
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> +{GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s por acierto
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> -{GAME_CONFIG.POINTS.CONTRARRELOJ_WRONG_PENALTY} pts por fallo
                        </span>
                      </div>
                    </div>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('contrarreloj'); onClose(); }}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>Jugar al Contrarreloj 60s</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PISTAS Y PUNTUACIÓN */}
          {activeSection === 'pistas_puntos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Sistema de Puntuación, Bonos y Calificación Escolar
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Recompensa la memoria sin pistas, la rapidez y la regularidad con rachas continuas.
                </p>
              </div>

              {/* Score Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Modo de Juego</th>
                      <th className="p-3">Acierto Directo</th>
                      <th className="p-3">Con Pista</th>
                      <th className="p-3">Penalización</th>
                      <th className="p-3">Bonificación Especial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> ¿Dónde está?
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.LOCALIZAR_BASE} XP</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">+{GAME_CONFIG.POINTS.LOCALIZAR_WITH_HINT} XP</td>
                      <td className="p-3 text-rose-500">-1 Vida</td>
                      <td className="p-3 text-slate-500">Aureola luminosa en el mapa</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Identificar
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.IDENTIFICAR_BASE} XP</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">+{GAME_CONFIG.POINTS.IDENTIFICAR_WITH_HINT} XP</td>
                      <td className="p-3 text-rose-500">-1 Vida</td>
                      <td className="p-3 text-slate-500">Pista 50/50 (elimina 2 falsas)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-orange-50/40 dark:bg-orange-950/20">
                      <td className="p-3 font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5" /> Contrarreloj 60s
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.CONTRARRELOJ_BASE} XP</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">+{GAME_CONFIG.POINTS.CONTRARRELOJ_WITH_HINT} XP</td>
                      <td className="p-3 text-rose-500 font-semibold">-{GAME_CONFIG.POINTS.CONTRARRELOJ_WRONG_PENALTY} pts</td>
                      <td className="p-3 text-orange-600 dark:text-orange-400 font-bold">
                        +{GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s de tiempo al reloj
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <MapIcon className="w-3.5 h-3.5" /> Atlas Interactivo
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.ATLAS_DISCOVERY_XP} XP</td>
                      <td className="p-3 text-slate-400">—</td>
                      <td className="p-3 text-slate-400">—</td>
                      <td className="p-3 text-purple-600 dark:text-purple-400 font-bold">+{GAME_CONFIG.POINTS.ATLAS_STAMP_BONUS_XP} XP por {GEO_ELEMENTS.length}/{GEO_ELEMENTS.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Streaks and Academic Grading */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Rachas de Fuego y Registro de Racha Máxima
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-2">
                    Cada acierto sin interrupción aumenta tu contador de racha (<span className="font-bold">Streak</span>). Al alcanzar múltiplos de {GAME_CONFIG.GAMEPLAY.STREAK_CELEBRATION_INTERVAL} aciertos se activan fuegos artificiales y reconocimientos sonoros.
                  </p>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300">
                    <strong>Novedad v2.0:</strong> La aplicación registra de forma independiente tu <em>racha actual</em> y tu <em>racha máxima histórica</em> de la sesión para calcular tu medalla de maestría geográfica.
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    Calificación Escolar Oficial (1 a 10)
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mb-2">
                    Al terminar cualquier ronda o partida de contrarreloj, el sistema computa tu nota sobre 10 con la escala académica estándar española:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900">
                      <span className="text-emerald-600 dark:text-emerald-400">9 - 10:</span> Sobresaliente 🌟
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900">
                      <span className="text-blue-600 dark:text-blue-400">7 - 8.9:</span> Notable 👏
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900">
                      <span className="text-amber-600 dark:text-amber-400">6 - 6.9:</span> Bien 👍
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900">
                      <span className="text-orange-600 dark:text-orange-400">5 - 5.9:</span> Suficiente 📝
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PROGRESIÓN Y MEDALLAS */}
          {activeSection === 'progresion' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Gamificación: Niveles, Rangos y Medallas de Honor
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tu progreso se guarda automáticamente en tu navegador. Puedes cerrar la ventana y continuar tu carrera de cartógrafo más tarde.
                </p>
              </div>

              {/* Ranks list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Escala de Rangos Geográficos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {[
                    { rank: 'Novato', xp: '0 - 99 XP', color: 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200' },
                    { rank: 'Junior', xp: '100 - 249 XP', color: 'border-blue-300 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
                    { rank: 'Cartógrafo', xp: '250 - 499 XP', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
                    { rank: 'Gran Explorador', xp: '500 - 999 XP', color: 'border-purple-300 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' },
                    { rank: 'Catedrático', xp: '1.000+ XP', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200' },
                  ].map((r, i) => (
                    <div key={i} className={`p-3 rounded-2xl border flex flex-col items-center text-center shadow-xs ${r.color}`}>
                      <span className="text-xs font-black">{r.rank}</span>
                      <span className="text-[10px] opacity-80 mt-0.5 font-medium">{r.xp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Badges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Medallas de Honor Desbloqueables</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { icon: '🌊', title: 'Maestro de Ríos', desc: `Acierta al menos ${GAME_CONFIG.BADGE_REQUIREMENTS.RIOS_COUNT} ríos o afluentes` },
                    { icon: '🏔️', title: 'Conquistador de Cumbres', desc: `Ubica ${GAME_CONFIG.BADGE_REQUIREMENTS.MONTANAS_PICOS_COUNT} cordilleras o picos principales` },
                    { icon: '🏖️', title: 'Centinela Costero', desc: `Identifica ${GAME_CONFIG.BADGE_REQUIREMENTS.COSTAS_COUNT} cabos, golfos o rías del litoral` },
                    { icon: '🏝️', title: 'Navegante Insular', desc: `Domina Baleares y Canarias con ${GAME_CONFIG.BADGE_REQUIREMENTS.ISLAS_COUNT} aciertos de islas` },
                    { icon: '⚡', title: 'Racha Imparable', desc: `Consigue una racha continua de ${GAME_CONFIG.BADGE_REQUIREMENTS.STREAK_COUNT} aciertos sin fallos` },
                    { icon: '📜', title: 'Sello del Explorador', desc: `Explora los ${GEO_ELEMENTS.length} accidentes geográficos en el Atlas` },
                  ].map((b, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-xs">
                      <span className="text-2xl shrink-0">{b.icon}</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CAPAS Y CARTOGRAFÍA */}
          {activeSection === 'mapa_capas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Cartografía Vectorial, Nueva Rosa Náutica y Capas ({GEO_ELEMENTS.length} Elementos)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Personaliza tanto la apariencia como los accidentes geográficos mostrados según tus necesidades pedagógicas.
                </p>
              </div>

              {/* 3 Themes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">3 Temas Visuales Profesionales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-amber-50/70 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">📜 Atlas Clásico</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tono cálido pergamino, con relieve sutil y trazos contrastados. Ideal para proyección en pizarras digitales interactivas (PDI).
                    </p>
                  </div>
                  <div className="p-3.5 bg-blue-50/70 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">🏔️ Físico Moderno</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Elevación topográfica en relieve verde/tierra, mares celestes vivos y sombreado tridimensional de cordilleras.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-700">
                    <span className="text-xs font-bold text-purple-400 block mb-1">🌙 Modo Satélite / Gamer</span>
                    <p className="text-xs text-slate-300">
                      Modo oscuro de alto contraste, elementos fluorescentes y estilo satelital nocturno para reducir la fatiga visual.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nueva Rosa de los Vientos & Herramientas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-2 mb-1">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    Nueva Rosa de los Vientos Náutica Minimalista
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Situada en la esquina inferior izquierda, incluye una aguja magnética estilizada con flor de lis orientada al Norte cartográfico, rumbos cardinales (N, E, S, O) y cuadrantes náuticos de orientación geográfica.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4 text-emerald-600" />
                    Filtro Desplegable Rápido en el Atlas
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    El panel del Atlas incorpora un selector compacto de categoría junto a la caja de búsqueda con botón de reseteo rápido para filtrar al instante por ríos, cordilleras o islas sin saturar la pantalla.
                  </p>
                </div>

                <div className="md:col-span-2 p-3.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800">
                  <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2 mb-1">
                    <Pencil className="w-4 h-4 text-amber-600" />
                    Modo Edición Vectorial de Accidentes (Escritorio y Tablet)
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Accede pulsando el botón con icono de lápiz situado en la esquina inferior izquierda del mapa. Permite seleccionar cualquier polígono o punto geográfico para desplazarlo, deformar sus vértices arrastrándolos, insertar nuevos puntos, eliminar vértices, rotar la figura, editar todos sus datos didácticos, duplicar, eliminar o crear nuevos accidentes geográficos con guardado persistente.
                  </p>
                </div>
              </div>

              {/* Physical Accident Layers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Desglose de Accidentes Geográficos ({GEO_ELEMENTS.length} Elementos)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 font-medium">
                    🌊 <strong>Ríos y afluentes:</strong> los ríos principales y sus tributarios se filtran por separado. Entre los afluentes están el Sil (Miño), Esla (Duero), Jarama (Tajo), Genil (Guadalquivir) y Segre (Ebro). El Cinca desemboca en el Segre. Los nuevos afluentes tienen recorridos didácticos simplificados que puedes ajustar en el editor.
                  </div>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/40 font-medium">
                    🏔️ <strong>16 Cordilleras:</strong> Pirineos, Sistema Central, Ibérico, Béticas, Subbética, Penibética, Sierra Nevada, Montes de León...
                  </div>
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/40 font-medium">
                    ⛰️ <strong>9 Picos:</strong> Teide, Mulhacén, Aneto, Torre Cerredo, Moncayo, Veleta, Almanzor, Peñalara, Urriellu...
                  </div>
                  <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl border border-cyan-200 dark:border-cyan-900/40 font-medium">
                    🏖️ <strong>10 Costas y Cabos:</strong> Cabo de Gata, Finisterre, Estaca de Bares, Creus, Peñas, Golfos de Valencia y Cádiz...
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 font-medium">
                    🏝️ <strong>10 Islas:</strong> Baleares (Mallorca, Menorca, Ibiza...) y Canarias (Tenerife, Gran Canaria, Lanzarote...)
                  </div>
                  <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/40 rounded-2xl border border-yellow-200 dark:border-yellow-900/40 font-medium">
                    🏞️ <strong>5 Unidades Relieve:</strong> Meseta Central, Submeseta Norte y Sur, Depresiones del Ebro y Guadalquivir.
                  </div>
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 font-medium">
                    🏛️ <strong>17 CC.AA. y Provincias:</strong> Líneas divisorias administrativas opcionales conmutables.
                  </div>
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/40 font-medium">
                    🏷️ <strong>Rótulos de Nombres:</strong> Activa o desactiva las etiquetas para convertir el mapa en mudo.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: FICHAS IMPRIMIBLES */}
          {activeSection === 'imprimibles' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  Generador de Fichas y Exámenes Imprimibles (Docentes y Alumnos)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Genera mapas mudos numerados listos para imprimir en A4 o exportar a PDF para controles de aula, deberes o repaso sin pantalla.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Características del Examen Imprimible</h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Optimizado para A4:</strong> Márgenes y escala perfectamente calculados para impresión en blanco y negro o color.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Encabezado Escolar:</strong> Campos para Nombre del Alumno, Curso/Grupo, Fecha y Calificación.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Plantilla de Respuestas:</strong> Columnas numeradas con líneas para que el estudiante escriba a mano.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Hoja de Soluciones Incluida:</strong> El profesor puede imprimir también la clave de corrección con las respuestas oficiales.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-2">¿Cómo generar una ficha?</h4>
                    <ol className="text-xs space-y-2 text-blue-800 dark:text-blue-300 list-decimal list-inside">
                      <li>Usa el filtro de <strong>Capas</strong> en la cabecera para elegir los accidentes que quieres evaluar (ej. solo ríos y cordilleras).</li>
                      <li>Pulsa el botón <strong>Imprimir</strong> en la barra superior.</li>
                      <li>Selecciona la cantidad de elementos o el modo de examen.</li>
                      <li>Haz clic en <strong>Imprimir / Guardar como PDF</strong> en tu navegador.</li>
                    </ol>
                  </div>
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-900">
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                      💡 Consejo pedagógico: Ideal para evaluación inicial diagnóstica al inicio de curso y para pruebas sumativas de Geografía física en 1º y 2º de ESO.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: GUÍA DIDÁCTICA Y TRUCOS NEMOTÉCNICOS */}
          {activeSection === 'trucos_estudio' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Estrategias Nemotécnicas para Memorizar el Mapa de España
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Reglas nemotécnicas y agrupaciones lógicas para estudiantes de 1º y 2º de la ESO.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ríos */}
                <div className="bg-blue-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-blue-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                    <span>🌊</span> La Regla de los Ríos
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>Vertiente Atlántica (Norte a Sur):</strong>
                      <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Miño → Duero → Tajo → Guadiana → Guadalquivir</p>
                      <span className="text-[11px] text-slate-500">Recuerda: El Tajo es el más largo y el Guadiana "aparece y desaparece".</span>
                    </li>
                    <li>
                      <strong>Vertiente Mediterránea:</strong>
                      <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Ebro → Turia → Júcar → Segura</p>
                      <span className="text-[11px] text-slate-500">El Ebro es el río más caudaloso de España y nace en Fontibre.</span>
                    </li>
                  </ul>
                </div>

                {/* Relieve */}
                <div className="bg-amber-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <span>🏔️</span> El Relieve en 3 Bloques
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>1. La Meseta Central:</strong> Dividida en dos por el <em>Sistema Central</em> y los <em>Montes de Toledo</em>.
                    </li>
                    <li>
                      <strong>2. Rebordes de la Meseta:</strong> Montes de León, Cordillera Cantábrica, Sistema Ibérico y Sierra Morena.
                    </li>
                    <li>
                      <strong>3. Sistemas Exteriores:</strong> Pirineos, Cordillera Costero-Catalana y Sistemas Béticos (Subbética y Penibética con Sierra Nevada).
                    </li>
                  </ul>
                </div>

                {/* Costas */}
                <div className="bg-emerald-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <span>🏖️</span> Puntos Extremos y Picos
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>Los 3 grandes gigantes:</strong>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                        1º <strong>Teide (3.718m)</strong> en Tenerife.<br/>
                        2º <strong>Mulhacén (3.479m)</strong> en Sierra Nevada.<br/>
                        3º <strong>Aneto (3.404m)</strong> en los Pirineos.
                      </p>
                    </li>
                    <li>
                      <strong>Cabos clave:</strong> Estaca de Bares (extremo norte), Finisterre (oeste atlántico), Cabo de Creus (extremo oriental) y Cabo de Gata (sureste).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: CONFIGURACIÓN TÉCNICA */}
          {activeSection === 'configuracion' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Parámetros Centralizados (gameConfig.ts)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Todos los números del juego están desacoplados del código para permitir ajustes inmediatos de balanceo y calibración pedagógica.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Constantes de Partida Actuales</h4>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">GAMEPLAY.INITIAL_LIVES</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{GAME_CONFIG.GAMEPLAY.INITIAL_LIVES} vidas</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">GAMEPLAY.DEFAULT_ROUND_SIZE</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{GAME_CONFIG.GAMEPLAY.DEFAULT_ROUND_SIZE} preguntas/ronda</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">TIMERS.CONTRARRELOJ_INITIAL_SECONDS</span>
                      <span className="font-bold text-orange-600">{GAME_CONFIG.TIMERS.CONTRARRELOJ_INITIAL_SECONDS}s</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS</span>
                      <span className="font-bold text-emerald-600">+{GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s / acierto</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">POINTS.LOCALIZAR_BASE</span>
                      <span className="font-bold text-emerald-600">{GAME_CONFIG.POINTS.LOCALIZAR_BASE} pts</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">POINTS.CONTRARRELOJ_WRONG_PENALTY</span>
                      <span className="font-bold text-rose-600">-{GAME_CONFIG.POINTS.CONTRARRELOJ_WRONG_PENALTY} pts</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">POINTS.ATLAS_STAMP_BONUS_XP</span>
                      <span className="font-bold text-purple-600">+{GAME_CONFIG.POINTS.ATLAS_STAMP_BONUS_XP} pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">¿Cómo personalizar para tu centro escolar?</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs mb-3">
                      Cualquier parámetro del juego se modifica directamente en el archivo <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">/src/constants/gameConfig.ts</code>. Los cambios se reflejan de inmediato en la interfaz, el temporizador, las bonificaciones y la longitud de las rondas.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Por ejemplo, para una ronda rápida de 10 preguntas basta con cambiar <code className="font-mono text-[10px]">DEFAULT_ROUND_SIZE: 10</code>.
                    </p>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold block">
                      Arquitectura Modular y Sin Dependencias Externas
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400">
                      Funciona 100% en cliente con React, Tailwind CSS y Web Speech API sin necesidad de servidor de backend ni bases de datos complejas.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <strong>GeoEspaña Junior</strong> · Geografía física interactiva de España (v2.0)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Guía
            </button>
            {onSelectMode && (
              <button
                onClick={() => { onSelectMode('reto_localizar'); onClose(); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>¡Jugar Ahora!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
