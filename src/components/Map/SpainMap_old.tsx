import React, { useState, useRef } from 'react';
import { GeoElement, CategoryType } from '../../types/geography';
import { REAL_SPAIN_MAP } from '../../data/realSpainMapData';
import {
  FRANCE_PATH,
  NORTH_AFRICA_PATH,
  PROVINCE_DIVIDERS_PATH,
  PORTUGAL_CONTOUR_PATH,
  SPAIN_MAINLAND_OUTLINE,
} from '../../data/supplementalMapData';
import { CompassRose } from './CompassRose';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface MapLayers {
  rios: boolean;
  montanas: boolean;
  picos: boolean;
  costas: boolean;
  mares: boolean;
  islas: boolean;
  unidades_relieve: boolean;
  showLabels: boolean;
  showCommunities?: boolean;
  showProvinces?: boolean;
}

export type MapTheme = 'clasico' | 'fisico_moderno' | 'nocturno';

interface SpainMapProps {
  elements: GeoElement[];
  layers: MapLayers;
  theme: MapTheme;
  selectedElement: GeoElement | null;
  onSelectElement: (element: GeoElement) => void;
  // Challenge props:
  targetHighlightId?: string | null;
  feedbackElementId?: string | null;
  feedbackStatus?: 'correct' | 'wrong' | null;
  onElementClick?: (element: GeoElement) => void;
  onElementHover?: (element: GeoElement) => void;
  visitedAtlasIds?: string[];
  atlasStampUnlocked?: boolean;
  onOpenStampModal?: () => void;
  currentMode?: string;
  isInteractive?: boolean;
  blankMode?: boolean; // When true, labels and hints are strictly hidden (authentic mapa mudo)
}

export const SpainMap: React.FC<SpainMapProps> = ({
  elements,
  layers,
  theme,
  selectedElement,
  onSelectElement,
  targetHighlightId,
  feedbackElementId,
  feedbackStatus,
  onElementClick,
  onElementHover,
  visitedAtlasIds,
  atlasStampUnlocked,
  onOpenStampModal,
  currentMode = 'explorar',
  isInteractive = true,
  blankMode = false,
}) => {
  const [hoveredElement, setHoveredElement] = useState<GeoElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme styling definitions
  const themeStyles = {
    clasico: {
      seaBg: '#e0f2fe',
      landBg: '#fef3c7',
      baseBorder: '#94a3b8',
      landBorder: '#94a3b8',
      communityStroke: '#d97706',
      provinceStroke: '#b45309',
      portugalBg: '#f1f5f9',
      portugalBorder: '#94a3b8',
      reliefHigh: '#d97706',
      reliefStroke: '#92400e',
      riverStroke: '#0284c7',
      textPrimary: '#1e293b',
      insetBackground: '#f0f9ff',
    },
    fisico_moderno: {
      seaBg: '#dbeafe',
      landBg: '#f0fdf4',
      baseBorder: '#64748b',
      landBorder: '#64748b',
      communityStroke: '#22c55e',
      provinceStroke: '#15803d',
      portugalBg: '#f8fafc',
      portugalBorder: '#64748b',
      reliefHigh: '#ca8a04',
      reliefStroke: '#854d0e',
      riverStroke: '#0284c7',
      textPrimary: '#0f172a',
      insetBackground: '#f8fafc',
    },
    nocturno: {
      seaBg: '#090d16',
      landBg: '#131c2e',
      baseBorder: '#334155',
      landBorder: '#38bdf8',
      communityStroke: '#38bdf8',
      provinceStroke: '#475569',
      portugalBg: '#0a0f1d',
      portugalBorder: '#334155',
      reliefHigh: '#78350f',
      reliefStroke: '#f59e0b',
      riverStroke: '#38bdf8',
      textPrimary: '#f8fafc',
      insetBackground: '#0d1527',
    },
  }[theme];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(1, Math.min(3, prev + delta));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleElementHover = (elem: GeoElement) => {
    setHoveredElement(elem);
    if (onElementHover) {
      onElementHover(elem);
    }
  };

  const handleItemClick = (elem: GeoElement, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isInteractive) return;
    if (feedbackStatus) return; // Lock map clicks while question feedback is active
    if (onElementHover) {
      onElementHover(elem);
    }
    if (onElementClick) {
      onElementClick(elem);
    } else {
      onSelectElement(elem);
    }
  };

  // Filter elements by layer visibility, but ALWAYS ensure targetHighlightId and feedbackElementId are visible
  const visibleElements = elements.filter((elem) => {
    const isLayerActive = layers[elem.category as keyof MapLayers] ?? true;
    const isTarget = targetHighlightId === elem.id;
    const isFeedback = feedbackElementId === elem.id;
    return isLayerActive || isTarget || isFeedback;
  });

  const targetHighlightElement = targetHighlightId
    ? elements.find((e) => e.id === targetHighlightId)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl"
      style={{
        backgroundColor: themeStyles.seaBg,
        cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setHoveredElement(null);
      }}
    >
      {/* Floating Atlas Explorer Progress Banner (In Explorer Mode) */}
      {currentMode === 'explorar' && visitedAtlasIds && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">🧭</span>
            <span className="hidden sm:inline">Atlas:</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold font-mono">
              {visitedAtlasIds.length}/65
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              ({visitedAtlasIds.length * 10} pts)
            </span>
          </div>

          {atlasStampUnlocked ? (
            <button
              onClick={onOpenStampModal}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs cursor-pointer transition-transform ml-1"
              title="¡Sello Real Conseguido! Pulsa para ver"
            >
              <span>🎖️ Sello Real</span>
            </button>
          ) : (
            <div
              className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-lg ml-1 font-semibold"
              title="Visita los 65 accidentes para ganar el Sello Real"
            >
              🎖️ Sello a los 65
            </div>
          )}
        </div>
      )}

      {/* Zoom / Pan Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => handleZoom(0.3)}
          title="Acercar mapa (+)"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom(-0.3)}
          title="Alejar mapa (-)"
          disabled={zoomLevel <= 1}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        {zoomLevel > 1 && (
          <button
            onClick={handleResetZoom}
            title="Centrar mapa"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Decorative Classical Compass Rose (Rosa de los vientos náutica) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none hidden md:block opacity-90 transition-opacity hover:opacity-100">
        <CompassRose theme={theme} size={84} />
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox={REAL_SPAIN_MAP.viewBox}
        className="w-full h-full transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <pattern id="seaGridReal" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-300/30 dark:text-slate-700/30" />
          </pattern>
        </defs>

        {/* Sea background subtle grid */}
        <rect width="1000" height="720" fill="url(#seaGridReal)" pointerEvents="none" />

        {/* ============================================================== */}
        {/* CAPA 0: BASE FÍSICA Y CONTORNO CONTINENTAL (Sin rótulos)       */}
        {/* Incluye España, Portugal, Sur de Francia y Norte de África     */}
        {/* ============================================================== */}

        {/* 1. Portugal (Masa sólida sin líneas divisorias internas de provincias + contorno exterior limpio) */}
        <path
          d={REAL_SPAIN_MAP.portugalPath}
          fill={themeStyles.portugalBg}
          stroke="none"
          className="transition-colors duration-300"
        />
        <path
          d={PORTUGAL_CONTOUR_PATH}
          fill="none"
          stroke={themeStyles.baseBorder}
          strokeWidth="1.2"
          strokeLinejoin="round"
          pointerEvents="none"
          className="transition-colors duration-300"
        />

        {/* 2. Sur de Francia (Litoral atlántico realista, Golfo de León y frontera pirenaica exacta con España) */}
        <path
          d={FRANCE_PATH}
          fill={themeStyles.portugalBg}
          stroke={themeStyles.baseBorder}
          strokeWidth="1.2"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* 3. Costa Norte de África (Marruecos a la altura real frente a Tarifa y contorneando Ceuta y Melilla) */}
        <path
          d={NORTH_AFRICA_PATH}
          fill={themeStyles.portugalBg}
          stroke={themeStyles.baseBorder}
          strokeWidth="1.2"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* 4. Masa Terrestre de España (Península e Islas Baleares) */}
        <g id="spain-communities" className="drop-shadow-sm">
          {REAL_SPAIN_MAP.communities.map((comm) => (
            <path
              key={comm.name}
              d={comm.d}
              fill={themeStyles.landBg}
              stroke={
                layers.showCommunities !== false
                  ? themeStyles.communityStroke
                  : 'none'
              }
              strokeWidth={layers.showCommunities !== false ? 1.4 : 0}
              strokeLinejoin="round"
              className="transition-colors duration-300"
            />
          ))}
        </g>

        {/* Contorno exterior unificado para Capa 0 de España peninsular y Baleares (cuando las comunidades están apagadas) */}
        {layers.showCommunities === false && (
          <>
            <path
              d={SPAIN_MAINLAND_OUTLINE}
              fill="none"
              stroke={themeStyles.baseBorder}
              strokeWidth="1.2"
              strokeLinejoin="round"
              pointerEvents="none"
              className="transition-colors duration-300"
            />
            <path
              d={REAL_SPAIN_MAP.communities.find((c) => c.name === 'Baleares')?.d || ''}
              fill="none"
              stroke={themeStyles.baseBorder}
              strokeWidth="1.2"
              strokeLinejoin="round"
              pointerEvents="none"
              className="transition-colors duration-300"
            />
          </>
        )}

        {/* ============================================================== */}
        {/* CAPA 2: LÍNEAS DIVISORIAS DE LAS 50 PROVINCIAS                */}
        {/* ============================================================== */}
        {layers.showProvinces !== false && (
          <path
            d={PROVINCE_DIVIDERS_PATH}
            fill="none"
            stroke={themeStyles.provinceStroke}
            strokeWidth="1.1"
            strokeDasharray="3 3"
            opacity="0.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
            className="transition-colors duration-300"
          />
        )}

        {/* Dedicated Canary Islands Inset Box */}
        <g id="canarias-inset">
          <rect
            x={REAL_SPAIN_MAP.canariasInsetBox.x}
            y={REAL_SPAIN_MAP.canariasInsetBox.y}
            width={REAL_SPAIN_MAP.canariasInsetBox.width}
            height={REAL_SPAIN_MAP.canariasInsetBox.height}
            fill={themeStyles.insetBackground}
            stroke={theme === 'nocturno' ? '#334155' : '#64748b'}
            strokeWidth="1.5"
            rx="8"
            className="drop-shadow-md"
          />
          <text
            x={REAL_SPAIN_MAP.canariasInsetBox.x + 12}
            y={REAL_SPAIN_MAP.canariasInsetBox.y + 20}
            fill={themeStyles.textPrimary}
            fontSize="11"
            fontWeight="bold"
            letterSpacing="1.5"
            opacity="0.75"
          >
            ISLAS CANARIAS
          </text>

          {/* Real Canary Islands Geometry - Con el mismo contorno limpio y neutro que la península y Baleares */}
          <path
            d={REAL_SPAIN_MAP.canariasPath}
            fill={themeStyles.landBg}
            stroke={
              layers.showCommunities !== false
                ? themeStyles.communityStroke
                : themeStyles.baseBorder
            }
            strokeWidth={layers.showCommunities !== false ? 1.4 : 1.2}
            strokeLinejoin="round"
            className="drop-shadow-sm transition-colors duration-300"
          />
        </g>


        {/* ============================================================== */}
        {/* INTERACTIVE GEOGRAPHIC ACCIDENTS */}
        {/* ============================================================== */}

        {/* 1. SISTEMAS MONTAÑOSOS (Cordilleras Reales) */}
        {(layers.montanas || targetHighlightElement?.category === 'montanas') &&
          visibleElements
            .filter((e) => e.category === 'montanas' && e.svgType === 'polygon')
            .map((elem) => {
              const isSelected = selectedElement?.id === elem.id;
              const isHovered = hoveredElement?.id === elem.id;
              const isTargetHighlight = targetHighlightId === elem.id;
              const isFeedback = feedbackElementId === elem.id;

              return (
                <g key={elem.id} className="cursor-pointer" onClick={(e) => handleItemClick(elem, e)}>
                  {/* Mountain Range Polygon */}
                  <path
                    d={elem.svgPath}
                    fill={
                      isFeedback
                        ? feedbackStatus === 'correct'
                          ? '#22c55e'
                          : '#ef4444'
                        : isTargetHighlight
                        ? '#f43f5e'
                        : isSelected
                        ? '#f59e0b'
                        : isHovered
                        ? '#ea580c'
                        : themeStyles.reliefHigh
                    }
                    opacity={isTargetHighlight ? 0.9 : isSelected || isHovered ? 0.85 : 0.65}
                    stroke={isTargetHighlight ? '#be123c' : isSelected || isHovered ? '#78350f' : themeStyles.reliefStroke}
                    strokeWidth={isTargetHighlight ? 3.5 : isSelected || isHovered ? 2.5 : 1.4}
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    onMouseEnter={() => handleElementHover(elem)}
                    onMouseLeave={() => setHoveredElement(null)}
                  />

                  {/* Stylized mountain ridges */}
                  <path
                    d={elem.svgPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeDasharray="4 6"
                    opacity={0.5}
                    pointerEvents="none"
                  />

                  {/* Mountain Name Label */}
                  {layers.showLabels && !blankMode && (
                    <text
                      x={elem.mapX}
                      y={elem.mapY}
                      textAnchor="middle"
                      fill={theme === 'nocturno' ? '#fef08a' : '#78350f'}
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-sm"
                      style={{ textShadow: theme === 'nocturno' ? '0 1px 3px #000' : '0 1px 2px #fff' }}
                    >
                      {elem.name}
                      {currentMode === 'explorar' && visitedAtlasIds?.includes(elem.id) ? ' ✓' : ''}
                    </text>
                  )}
                </g>
              );
            })}

        {/* 2. RÍOS (Trazos con su recorrido cartográfico real) */}
        {(layers.rios || targetHighlightElement?.category === 'rios') &&
          visibleElements
            .filter((e) => e.category === 'rios' && e.svgType === 'polyline')
            .map((elem) => {
              const isSelected = selectedElement?.id === elem.id;
              const isHovered = hoveredElement?.id === elem.id;
              const isTargetHighlight = targetHighlightId === elem.id;
              const isFeedback = feedbackElementId === elem.id;

              return (
                <g key={elem.id} className="cursor-pointer" onClick={(e) => handleItemClick(elem, e)}>
                  {/* Invisible wide hit path for comfortable clicking */}
                  <path
                    d={elem.svgPath}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="22"
                    strokeLinecap="round"
                    onMouseEnter={() => handleElementHover(elem)}
                    onMouseLeave={() => setHoveredElement(null)}
                  />

                  {/* Outer pulse/glow on selection or target */}
                  {(isSelected || isHovered || isTargetHighlight || isFeedback) && (
                    <path
                      d={elem.svgPath}
                      fill="none"
                      stroke={
                        isFeedback
                          ? feedbackStatus === 'correct'
                            ? '#22c55e'
                            : '#ef4444'
                          : isTargetHighlight
                          ? '#f43f5e'
                          : '#38bdf8'
                      }
                      strokeWidth={isTargetHighlight ? 14 : 10}
                      strokeLinecap="round"
                      opacity={isTargetHighlight ? 0.85 : 0.7}
                      className={isTargetHighlight ? 'animate-pulse' : 'animate-pulse'}
                    />
                  )}

                  {/* Main visible river line */}
                  <path
                    d={elem.svgPath}
                    fill="none"
                    stroke={
                      isFeedback
                        ? feedbackStatus === 'correct'
                          ? '#16a34a'
                          : '#dc2626'
                        : isTargetHighlight
                        ? '#e11d48'
                        : isSelected
                        ? '#0284c7'
                        : isHovered
                        ? '#0369a1'
                        : themeStyles.riverStroke
                    }
                    strokeWidth={isTargetHighlight ? 6 : isSelected || isHovered ? 4.5 : elem.subCategory?.includes('Afluente') ? 2.5 : 3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    pointerEvents="none"
                  />

                  {/* River Label */}
                  {layers.showLabels && !blankMode && (
                    <text
                      x={elem.mapX}
                      y={elem.mapY - 8}
                      textAnchor="middle"
                      fill={theme === 'nocturno' ? '#38bdf8' : '#0369a1'}
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none"
                      style={{ textShadow: theme === 'nocturno' ? '0 1px 3px #000' : '0 1px 2px #fff' }}
                    >
                      {elem.name}
                      {currentMode === 'explorar' && visitedAtlasIds?.includes(elem.id) ? ' ✓' : ''}
                    </text>
                  )}
                </g>
              );
            })}

        {/* 3. PUNTOS Y MARCADORES (Picos, Costas, Islas, Mesetas) */}
        {visibleElements
          .filter((e) => e.svgType === 'point')
          .map((elem) => {
            const isSelected = selectedElement?.id === elem.id;
            const isHovered = hoveredElement?.id === elem.id;
            const isTargetHighlight = targetHighlightId === elem.id;
            const isFeedback = feedbackElementId === elem.id;

            const categoryColors: Record<CategoryType, string> = {
              picos: '#ef4444',
              costas: '#0d9488',
              mares: '#2563eb',
              islas: '#16a34a',
              unidades_relieve: '#8b5cf6',
              rios: '#0284c7',
              montanas: '#d97706',
            };

            const markerColor = isFeedback
              ? feedbackStatus === 'correct'
                ? '#22c55e'
                : '#ef4444'
              : isTargetHighlight
              ? '#e11d48'
              : isSelected
              ? '#2563eb'
              : categoryColors[elem.category] || '#ef4444';

            return (
              <g
                key={elem.id}
                className="cursor-pointer group"
                transform={`translate(${elem.mapX}, ${elem.mapY})`}
                onClick={(e) => handleItemClick(elem, e)}
                onMouseEnter={() => handleElementHover(elem)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Generous hit circle */}
                <circle cx="0" cy="0" r="22" fill="transparent" />

                {/* Visited indicator ring in Atlas mode */}
                {currentMode === 'explorar' && visitedAtlasIds?.includes(elem.id) && (
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.6"
                    strokeDasharray="3 2"
                    opacity="0.85"
                  />
                )}

                {/* Animated halo if highlighted / target */}
                {isTargetHighlight ? (
                  <>
                    <circle
                      cx="0"
                      cy="0"
                      r="26"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      opacity="0.8"
                      className="animate-ping"
                      style={{ animationDuration: '1.2s' }}
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill="#f43f5e"
                      fillOpacity="0.3"
                      stroke="#e11d48"
                      strokeWidth="2"
                    />
                  </>
                ) : (isSelected || isFeedback) && (
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 18 : 22}
                    fill={markerColor}
                    opacity="0.35"
                    className="animate-ping"
                  />
                )}

                {/* Specific Shape based on Category */}
                {elem.category === 'picos' ? (
                  // Mountain Peak with Snow Cap
                  <g>
                    <polygon
                      points="0,-14 -10,8 10,8"
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      className="transition-transform group-hover:scale-125"
                    />
                    <polygon points="0,-14 -4,-6 4,-6" fill="#ffffff" />
                  </g>
                ) : elem.category === 'costas' ? (
                  // Coastal Beacon / Lighthouse Dot
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected || isHovered ? 8 : 6}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                  </g>
                ) : elem.category === 'mares' ? (
                  // Sea & Ocean Waves Marker
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected || isHovered ? 12 : 9.5}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      opacity="0.9"
                      className="transition-transform group-hover:scale-125 shadow-sm"
                    />
                    <path
                      d="M -5 1 Q -2.5 -2.5 0 1 T 5 1"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </g>
                ) : elem.category === 'islas' ? (
                  // Island Pin
                  <g>
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected || isHovered ? 8 : 6.5}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />
                    <circle cx="0" cy="0" r="2" fill="#ffffff" />
                  </g>
                ) : (
                  // Plateau / Depression Marker
                  <g>
                    <rect
                      x="-8"
                      y="-8"
                      width="16"
                      height="16"
                      rx="4"
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-transform group-hover:scale-125"
                    />
                  </g>
                )}

                {/* Label text */}
                {layers.showLabels && !blankMode && (
                  <text
                    x="0"
                    y={elem.category === 'picos' ? -18 : 18}
                    textAnchor="middle"
                    fill={themeStyles.textPrimary}
                    fontSize="11"
                    fontWeight="bold"
                    className="pointer-events-none select-none drop-shadow-sm"
                    style={{ textShadow: theme === 'nocturno' ? '0 1px 3px #000' : '0 1px 2px #fff' }}
                  >
                    {elem.name}
                    {currentMode === 'explorar' && visitedAtlasIds?.includes(elem.id) ? ' ✓' : ''}
                  </text>
                )}
              </g>
            );
          })}

        {/* 4. DEDICATED HIGH-CONTRAST TARGET BEACON (For "Identificar" Challenge Mode) */}
        {targetHighlightElement && (() => {
          let beaconText = '¿QUÉ ES?';
          if (targetHighlightElement.category === 'rios') beaconText = '¿QUÉ RÍO ES?';
          else if (targetHighlightElement.category === 'montanas') beaconText = '¿QUÉ CORDILLERA ES?';
          else if (targetHighlightElement.category === 'picos') beaconText = '¿QUÉ PICO ES?';
          else if (targetHighlightElement.category === 'islas') beaconText = '¿QUÉ ISLA ES?';
          else if (targetHighlightElement.category === 'mares') beaconText = '¿QUÉ MAR/OCÉANO?';
          else if (targetHighlightElement.category === 'costas') {
            beaconText = targetHighlightElement.subCategory === 'Golfo' 
              ? '¿QUÉ GOLFO ES?' 
              : targetHighlightElement.subCategory === 'Cabo'
              ? '¿QUÉ CABO ES?'
              : '¿QUÉ COSTA ES?';
          } else if (targetHighlightElement.category === 'unidades_relieve') {
            beaconText = '¿QUÉ RELIEVE ES?';
          }

          const badgeWidth = Math.max(76, beaconText.length * 6.8 + 18);

          return (
            <g
              className="pointer-events-none"
              transform={`translate(${targetHighlightElement.mapX}, ${targetHighlightElement.mapY})`}
            >
              {/* Concentric radar pulse ring */}
              <circle
                cx="0"
                cy="0"
                r="30"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                opacity="0.8"
                className="animate-ping"
                style={{ animationDuration: '1.5s' }}
              />
              {/* Persistent glowing radar circle */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill="#f43f5e"
                fillOpacity="0.25"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              {/* Solid high-contrast center bullseye */}
              <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />

              {/* Bouncing pointer pin with high-contrast category-specific badge */}
              <g className="animate-bounce" style={{ animationDuration: '0.9s' }}>
                <g transform="translate(0, -22)">
                  <rect
                    x={-badgeWidth / 2}
                    y="-18"
                    width={badgeWidth}
                    height="18"
                    rx="9"
                    fill="#e11d48"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-md"
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="900"
                    letterSpacing="0.4"
                  >
                    {beaconText}
                  </text>
                  <polygon points="-5,0 5,0 0,6" fill="#e11d48" />
                </g>
              </g>
            </g>
          );
        })()}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredElement && !blankMode && (
        <div
          className="pointer-events-none absolute bottom-4 right-4 z-30 flex items-center gap-3 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md border border-slate-700 animate-fadeIn"
        >
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-2">
              <span>{hoveredElement.subCategory || hoveredElement.category}</span>
              {currentMode === 'explorar' && (
                visitedAtlasIds?.includes(hoveredElement.id) ? (
                  <span className="text-[10px] bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                    ✓ Visitado (+10 pts)
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    ✨ ¡Nuevo! +10 XP
                  </span>
                )
              )}
            </span>
            <span className="text-base font-bold text-white">{hoveredElement.name}</span>
            {hoveredElement.elevationOrLength && (
              <span className="text-xs text-slate-300">
                📏 {hoveredElement.elevationOrLength}
              </span>
            )}
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
            Haz clic para detalles
          </span>
        </div>
      )}
    </div>
  );
};
