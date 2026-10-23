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
  ExternalLink
} from 'lucide-react';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { GEO_ELEMENTS } from '../../data/geographyData';

interface GameManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: 'explorar' | 'reto_localizar' | 'reto_identificar' | 'contrarreloj') => void;
}

type ManualSection = 'modos' | 'pistas_puntos' | 'progresion' | 'mapa_capas' | 'imprimibles' | 'trucos_estudio' | 'configuracion';

export const GameManualModal: React.FC<GameManualModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  const [activeSection, setActiveSection] = useState<ManualSection>('modos');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sections = [
    { id: 'modos' as ManualSection, label: 'Modos de Juego', icon: Compass },
    { id: 'pistas_puntos' as ManualSection, label: 'Puntuación y Pistas', icon: Lightbulb },
    { id: 'progresion' as ManualSection, label: 'Niveles y Medallas', icon: Trophy },
    { id: 'mapa_capas' as ManualSection, label: 'Capas y Estilos', icon: Layers },
    { id: 'imprimibles' as ManualSection, label: 'Fichas Imprimibles', icon: Printer },
    { id: 'trucos_estudio' as ManualSection, label: 'Guía de Estudio', icon: Sparkles },
    { id: 'configuracion' as ManualSection, label: 'Configuración Técnica', icon: Sliders },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Manual del Juego y Guía Didáctica</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  GeoEspaña Junior
                </span>
              </div>
              <p className="text-xs text-blue-100 hidden sm:block">
                Reglas, mecánicas pedagógicas, sistema de puntuación y consejos didácticos
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

        {/* Navigation Tabs Bar */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto flex items-center gap-1.5 scrollbar-thin shrink-0">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-700 dark:text-slate-300">
          
          {/* SECTION: MODOS DE JUEGO */}
          {activeSection === 'modos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Cuatro Modos de Aprendizaje Adaptativo
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Desde la memorización exploratoria con pronunciación sonora hasta retos de velocidad en mapa mudo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Atlas Interactivo */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">1. Atlas Interactivo</h4>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Exploración Libre & Fichas</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Sin límite
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      Haz clic en cualquier punto, río o cordillera para ver su ficha enciclopédica detallada: longitud, altitud, vertiente, comunidad autónoma, descripción curricular y curiosidades geográficas.
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400 mb-3">
                      <li className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                        <strong>Locución por voz:</strong> Escucha la pronunciación correcta del accidente.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <strong>+{GAME_CONFIG.POINTS.ATLAS_DISCOVERY_XP} XP</strong> por cada accidente descubierto por primera vez.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <strong>Sello de Oro:</strong> Completa los {GEO_ELEMENTS.length} accidentes para sellar tu Pasaporte.
                      </li>
                    </ul>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('explorar'); onClose(); }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2"
                    >
                      Ir al Atlas Interactivo
                    </button>
                  )}
                </div>

                {/* 2. ¿Dónde está? (Localizar) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">2. ¿Dónde está?</h4>
                          <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">Localización en Mapa Mudo</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                        3 Vidas
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      Aparece el nombre de un accidente geográfico y debes pulsar directamente sobre su elemento en el mapa mudo de España. ¡Demuestra tu memoria espacial y precisión!
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400 mb-3">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <strong>+{GAME_CONFIG.POINTS.LOCALIZAR_BASE} pts</strong> por acierto directo sin pista.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <strong>+{GAME_CONFIG.POINTS.LOCALIZAR_WITH_HINT} pts</strong> si utilizas el botón de pista.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        Comienzas con {GAME_CONFIG.GAMEPLAY.INITIAL_LIVES} vidas. Si las pierdes, finaliza la partida.
                      </li>
                    </ul>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('reto_localizar'); onClose(); }}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2"
                    >
                      Jugar a ¿Dónde está?
                    </button>
                  )}
                </div>

                {/* 3. Identificar (Quiz) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">3. Identificar</h4>
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Test de 4 Opciones</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        3 Vidas
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      Un accidente geográfico parpadea con brillo dorado en el mapa interactivo. Selecciona la opción correcta de entre 4 botones de respuesta posibles.
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400 mb-3">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <strong>+{GAME_CONFIG.POINTS.IDENTIFICAR_BASE} pts</strong> por respuesta acertada.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        Botón de pista: descarta 2 opciones erróneas (50/50).
                      </li>
                    </ul>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('reto_identificar'); onClose(); }}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2"
                    >
                      Jugar a Identificar
                    </button>
                  )}
                </div>

                {/* 4. Contrarreloj 60s */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                          <Timer className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">4. Contrarreloj 60s</h4>
                          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">Velocidad & Reflejos</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                        60 Segundos
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      ¡Máxima adrenalina! Tienes 60 segundos para acertar tantos accidentes como puedas en el mapa. 
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400 mb-3">
                      <li className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-500 font-bold" />
                        <strong>+{GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s de tiempo extra</strong> acumulado por CADA acierto.
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <strong>+{GAME_CONFIG.POINTS.CONTRARRELOJ_BASE} pts</strong> por acierto directo ({GAME_CONFIG.POINTS.CONTRARRELOJ_WITH_HINT} pts con pista).
                      </li>
                      <li className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        Penalización leve por fallo: -{GAME_CONFIG.POINTS.CONTRARRELOJ_WRONG_PENALTY} pts (sin bajar de 0).
                      </li>
                    </ul>
                  </div>
                  {onSelectMode && (
                    <button
                      onClick={() => { onSelectMode('contrarreloj'); onClose(); }}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2"
                    >
                      Jugar al Contrarreloj
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PUNTUACIÓN Y PISTAS */}
          {activeSection === 'pistas_puntos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Reglas de Puntuación, Pistas y Bonificaciones
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  El sistema recompensa el conocimiento sin pistas y la precisión rápida, pero ofrece ayudas equilibradas para que ningún estudiante se quede bloqueado.
                </p>
              </div>

              {/* Table of Scores */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-black tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Modo de Juego</th>
                      <th className="p-3">Acierto Directo</th>
                      <th className="p-3">Acierto con Pista</th>
                      <th className="p-3">Efecto Especial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> ¿Dónde está?
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.LOCALIZAR_BASE} XP</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">+{GAME_CONFIG.POINTS.LOCALIZAR_WITH_HINT} XP</td>
                      <td className="p-3 text-slate-500">Pista: Centra el mapa e ilumina la zona</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Identificar
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.IDENTIFICAR_BASE} XP</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">+{GAME_CONFIG.POINTS.IDENTIFICAR_WITH_HINT} XP</td>
                      <td className="p-3 text-slate-500">Pista: 50/50 (descarta 2 opciones falsas)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5" /> Contrarreloj 60s
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.CONTRARRELOJ_BASE} XP</td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">+{GAME_CONFIG.POINTS.CONTRARRELOJ_WITH_HINT} XP</td>
                      <td className="p-3 text-orange-600 dark:text-orange-400 font-bold">+{GAME_CONFIG.TIMERS.CONTRARRELOJ_TIME_BONUS_SECONDS}s al temporizador</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <MapIcon className="w-3.5 h-3.5" /> Atlas Interactivo
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+{GAME_CONFIG.POINTS.ATLAS_DISCOVERY_XP} XP</td>
                      <td className="p-3 text-slate-400">—</td>
                      <td className="p-3 text-purple-600 dark:text-purple-400 font-bold">+{GAME_CONFIG.POINTS.ATLAS_STAMP_BONUS_XP} XP al completar {GEO_ELEMENTS.length}/{GEO_ELEMENTS.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Explaining Hint Button */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    ¿Cómo funciona el botón "Pedir Pista"?
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-2">
                    Si dudas de la ubicación de un accidente geográfico en "¿Dónde está?" o "Contrarreloj", puedes activar la pista. El mapa enfocará suavemente la región concreta y dibujará una aureola luminosa de guía.
                  </p>
                  <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold">
                    ⚖️ Penalización equitativa: Recibirás 20 puntos en vez de 30 (en ¿Dónde está?) o 15 en vez de 20 (en Contrarreloj).
                  </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Rachas de Aciertos Consecutivos (Streak)
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mb-2">
                    Acertar varias preguntas seguidas sin fallos activa el contador de racha con efectos de animación de fuego. Cada {GAME_CONFIG.GAMEPLAY.STREAK_CELEBRATION_INTERVAL} aciertos continuos se desbloquean hitos especiales para medallas.
                  </p>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
                    🔥 Si cometes un error o se agota una vida, la racha actual vuelve a 0, pero tu racha máxima queda registrada.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: PROGRESIÓN Y MEDALLAS */}
          {activeSection === 'progresion' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Gamificación: Niveles, Rangos y Medallas de Honor
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tu progreso se guarda automáticamente en tu navegador. Puedes volver en cualquier momento y continuar subiendo de nivel.
                </p>
              </div>

              {/* Ranks list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Escala de Rangos Geográficos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[
                    { rank: 'Novato', xp: '0 - 99 XP', color: 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200' },
                    { rank: 'Junior', xp: '100 - 249 XP', color: 'border-blue-300 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
                    { rank: 'Cartógrafo', xp: '250 - 499 XP', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
                    { rank: 'Gran Explorador', xp: '500 - 999 XP', color: 'border-purple-300 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' },
                    { rank: 'Catedrático', xp: '1.000+ XP', color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200' },
                  ].map((r, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex flex-col text-center ${r.color}`}>
                      <span className="text-xs font-black">{r.rank}</span>
                      <span className="text-[10px] opacity-80">{r.xp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key badges */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Insignias Desbloqueables</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { icon: '🌊', title: 'Maestro de Ríos', desc: `Acierta al menos ${GAME_CONFIG.BADGE_REQUIREMENTS.RIOS_COUNT} ríos de diferentes vertientes` },
                    { icon: '🏔️', title: 'Conquistador de Cumbres', desc: `Ubica ${GAME_CONFIG.BADGE_REQUIREMENTS.MONTANAS_PICOS_COUNT} cordilleras o picos principales` },
                    { icon: '🏖️', title: 'Centinela Costero', desc: `Identifica ${GAME_CONFIG.BADGE_REQUIREMENTS.COSTAS_COUNT} cabos, golfos o rías del litoral` },
                    { icon: '🏝️', title: 'Navegante Insular', desc: `Domina Baleares y Canarias con ${GAME_CONFIG.BADGE_REQUIREMENTS.ISLAS_COUNT} aciertos de islas` },
                    { icon: '⚡', title: 'Racha Imparable', desc: `Consigue una racha continua de ${GAME_CONFIG.BADGE_REQUIREMENTS.STREAK_COUNT} aciertos sin fallos` },
                    { icon: '📜', title: 'Sello del Explorador', desc: `Explora los ${GEO_ELEMENTS.length} accidentes geográficos en el Atlas` },
                  ].map((b, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                      <span className="text-2xl">{b.icon}</span>
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

          {/* SECTION: CAPAS Y MAPAS */}
          {activeSection === 'mapa_capas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Cartografía Vectorial, Capas y Estilos de Mapa
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Personaliza tanto la apariencia como los accidentes geográficos mostrados según tus necesidades de clase o estudio.
                </p>
              </div>

              {/* 3 Themes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">3 Temas Visuales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-amber-50/70 dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">📜 Atlas Clásico</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tono cálido pergamino, con relieve sutil y trazos contrastados. Ideal para estudio tradicional y proyección en pizarras digitales.
                    </p>
                  </div>
                  <div className="p-3.5 bg-blue-50/70 dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">🏔️ Físico Moderno</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Elevación topográfica en relieve verde/tierra, mares celestes vivos y sombreado tridimensional de cordilleras.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-700">
                    <span className="text-xs font-bold text-purple-400 block mb-1">🌙 Modo Gamer / Satélite</span>
                    <p className="text-xs text-slate-300">
                      Modo oscuro de alto contraste, elementos fluorescentes y estilo satelital nocturno para reducir la fatiga visual.
                    </p>
                  </div>
                </div>
              </div>

              {/* Territorial Hierarchy & Layers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Jerarquía de Capas Cartográficas</h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="font-extrabold text-emerald-950 dark:text-emerald-200 block mb-0.5">
                      🗺️ Capa 0: Contorno Geográfico Base (Siempre Activa)
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Silueta física continental continua de España peninsular, Portugal contiguo, el sur de Francia pirenaico, la costa norte de África (Marruecos y Estrecho de Gibraltar), las Islas Baleares y el recuadro cartográfico de las Islas Canarias. Sin rótulos ni nombres distractores para un mapa mudo limpio.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                      <span className="font-extrabold text-amber-950 dark:text-amber-200 block mb-0.5">
                        🏛️ Capa 1: Comunidades Autónomas (17 CC.AA.)
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Activa o desactiva las líneas fronterizas de las 17 Comunidades Autónomas y las Ciudades Autónomas de Ceuta y Melilla.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                      <span className="font-extrabold text-blue-950 dark:text-blue-200 block mb-0.5">
                        📍 Capa 2: Provincias de España (50 Provincias)
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Muestra la subdivisión provincial con trazo fino delimitador para memorizar la organización territorial completa de España.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Accident Layers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Capas de Accidentes Geográficos Físicos ({GEO_ELEMENTS.length} elementos)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/40 font-medium">
                    🌊 <strong>Ríos</strong> (Ebro, Duero, Tajo, Guadiana, Guadalquivir, Miño, Júcar, Segura...)
                  </div>
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/40 font-medium">
                    🏔️ <strong>Cordilleras</strong> (Pirineos, Sistema Central, Ibérico, Béticas, Cantábrica...)
                  </div>
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40 font-medium">
                    ⛰️ <strong>Picos y Volcanes</strong> (Teide, Mulhacén, Aneto, Torre Cerredo, Moncayo...)
                  </div>
                  <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-900/40 font-medium">
                    🏖️ <strong>Costas y Cabos</strong> (Cabo de Gata, Finisterre, Creus, Golfos, Rías...)
                  </div>
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/40 font-medium">
                    🌊 <strong>Mares y Océanos</strong> (Mediterráneo, Cantábrico, Océano Atlántico)
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/40 font-medium">
                    🏝️ <strong>Archipiélagos e Islas</strong> (Canarias y Baleares completas)
                  </div>
                  <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/40 rounded-xl border border-yellow-200 dark:border-yellow-900/40 font-medium">
                    🏞️ <strong>Unidades de Relieve</strong> (Meseta Norte/Sur, Depresiones Ebro/Guadalquivir)
                  </div>
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/40 font-medium">
                    🏷️ <strong>Rótulos de Nombres</strong> (Activa o desactiva para examen o reto mudo)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FICHAS IMPRIMIBLES */}
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
                      💡 Consejo pedagógico: Ideal para evaluación inicial diagnóstica al inicio de curso y para pruebas sumativas de Geografía física.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: GUÍA DE ESTUDIO */}
          {activeSection === 'trucos_estudio' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Estrategias y Trucos para Memorizar el Mapa de España
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Reglas nemotécnicas y agrupaciones lógicas para alumnado de 1º y 2º de la ESO.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ríos */}
                <div className="bg-blue-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-blue-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-2">🌊 La Regla de los Ríos</h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>Vertiente Atlántica (De Norte a Sur):</strong>
                      <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Miño → Duero → Tajo → Guadiana → Guadalquivir</p>
                      <span className="text-[11px] text-slate-500">Recuerda: Los 3 centrales nacen en el Sistema Ibérico y desembocan en el Atlántico.</span>
                    </li>
                    <li>
                      <strong>Vertiente Mediterránea:</strong>
                      <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Ebro (el más caudaloso), Turia, Júcar y Segura.</p>
                    </li>
                  </ul>
                </div>

                {/* Relieve */}
                <div className="bg-amber-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300 mb-2">🏔️ El Relieve en 3 Bloques</h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>1. La Meseta Central:</strong> Dividida en dos por el <em>Sistema Central</em> y los <em>Montes de Toledo</em>.
                    </li>
                    <li>
                      <strong>2. Rebordes de la Meseta:</strong> Montes de León, Cordillera Cantábrica, Sistema Ibérico y Sierra Morena.
                    </li>
                    <li>
                      <strong>3. Sistemas Exteriores:</strong> Pirineos, Cordillera Costero-Catalana y Sistemas Béticos (Subbética y Penibética).
                    </li>
                  </ul>
                </div>

                {/* Costas */}
                <div className="bg-emerald-50/60 dark:bg-slate-800/80 p-4 rounded-2xl border border-emerald-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 mb-2">🏖️ Cabos y Picos Clave</h4>
                  <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    <li>
                      <strong>Los 3 grandes picos:</strong>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                        1º <strong>Teide (3.718m)</strong> en Tenerife.<br/>
                        2º <strong>Mulhacén (3.479m)</strong> en Sierra Nevada (Península).<br/>
                        3º <strong>Aneto (3.404m)</strong> en Pirineos.
                      </p>
                    </li>
                    <li>
                      <strong>Cabos extremos:</strong> Estaca de Bares (más al Norte), Finisterre (Oeste), Creus (Este peninsular), Tarifa (más al Sur).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CONFIGURACIÓN TÉCNICA */}
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
                      <span className="text-slate-500">POINTS.LOCALIZAR_WITH_HINT</span>
                      <span className="font-bold text-amber-600">{GAME_CONFIG.POINTS.LOCALIZAR_WITH_HINT} pts</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">POINTS.CONTRARRELOJ_WITH_HINT</span>
                      <span className="font-bold text-amber-600">{GAME_CONFIG.POINTS.CONTRARRELOJ_WITH_HINT} pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">¿Cómo personalizar para tu centro escolar?</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs mb-3">
                      Cualquier parámetro del juego se modifica directamente en el archivo <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">/src/constants/gameConfig.ts</code>. Los cambios se reflejan de inmediato en la interfaz, el cálculo del temporizador, los puntajes y la visualización de preguntas.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Por ejemplo, para una ronda rápida de 10 preguntas basta con cambiar <code className="font-mono text-[10px]">DEFAULT_ROUND_SIZE: 10</code>.
                    </p>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900">
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
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <strong>GeoEspaña Junior</strong> · Geografía física interactiva de España
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
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
