import React, { useState, useRef, useMemo, useEffect } from 'react';
import { GeoElement, CategoryType } from '../../types/geography';
import { LAYERED_SPAIN_MAP, SvgMapPath } from '../../data/spainBaseMapData';
import { CompassRose } from './CompassRose';
import { ZoomIn, ZoomOut, RotateCcw, Pencil } from 'lucide-react';
import { VectorEditOverlay } from './VectorEditOverlay';

// Geographic coordinates remain unchanged. Only the displayed selector may move.
// The layout uses every feature, so toggling layers never moves another selector.
export const MIN_SELECTOR_DISTANCE = 36;
export const SELECTOR_HIT_RADIUS = 12;
export function getSeparatedMarkerPositions(elements: readonly GeoElement[]): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  const placed: { x: number; y: number }[] = [];
  const ordered = elements.filter(e => e.svgType === 'point').sort((a, b) =>
    Number(b.category === 'picos') - Number(a.category === 'picos') || a.id.localeCompare(b.id));
  const available = (x: number, y: number) => x >= 16 && x <= 1184 && y >= 16 && y <= 659
    && placed.every(p => Math.hypot(x - p.x, y - p.y) >= MIN_SELECTOR_DISTANCE);
  for (const elem of ordered) {
    let position: { x: number; y: number } | undefined;
    // Search nearest concentric rings rather than modifying the geographic data.
    for (let radius = 0; !position && radius <= 1400; radius += 2) {
      const steps = Math.max(1, Math.ceil(2 * Math.PI * radius / 3));
      for (let step = 0; step < steps; step++) {
        const angle = -Math.PI / 2 + 2 * Math.PI * step / steps;
        const x = elem.mapX + radius * Math.cos(angle);
        const y = elem.mapY + radius * Math.sin(angle);
        if (available(x, y)) { position = { x, y }; break; }
      }
    }
    if (!position) throw new Error(`No hay espacio para el selector ${elem.id}`);
    result[elem.id] = position;
    placed.push(position);
  }
  return result;
}

export interface MapLayers {
  rios: boolean;
  afluentes: boolean;
  montanas: boolean;
  picos: boolean;
  costas: boolean;
  mares: boolean;
  islas: boolean;
  unidades_relieve: boolean;
  showLabels: boolean;
  labelsByCategory?: Partial<Record<CategoryType, boolean>>;
  showCommunities?: boolean;
  showProvinces?: boolean;
}

export type MapTheme = 'clasico' | 'fisico_moderno' | 'nocturno';

interface SpainMapProps {
  controlsHidden?: boolean;
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
  // Vector Editor props:
  isVectorEditMode?: boolean;
  onToggleVectorEditMode?: () => void;
  editingElement?: GeoElement | null;
  onUpdateElementGeometry?: (updated: Partial<GeoElement>) => void;
}

export const SpainMap: React.FC<SpainMapProps> = ({
  controlsHidden = false,
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
  isVectorEditMode = false,
  onToggleVectorEditMode,
  editingElement,
  onUpdateElementGeometry,
}) => {
  const [hoveredElement, setHoveredElement] = useState<GeoElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const panGesture = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const didPan = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgElementRef = useRef<SVGSVGElement | null>(null);

  const markerPositions = useMemo(() => getSeparatedMarkerPositions(elements), [elements]);

  // The base framing depends only on the viewport and the mainland geometry, never on overlays.
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 1200, height: 675, scale: 1 });
  useEffect(() => {
    const container = containerRef.current;
    const mainland = svgElementRef.current?.querySelector<SVGPathElement>('[data-map-part="Relleno_Peninsula"]');
    if (!container || !mainland) return;
    const mainlandBounds = mainland.getBBox();
    const bounds = { x: mainlandBounds.x, y: mainlandBounds.y, width: mainlandBounds.width, height: mainlandBounds.height };
    // Portugal shares the source's neighbour layer with France and Africa. Include only
    // its mainland subpaths, contained in Spain's north/south extent and extending west.
    const neighbour = svgElementRef.current?.querySelector<SVGPathElement>('[data-map-part="Relleno_-_Portugal_Francia_África"]');
    if (neighbour) {
      const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      neighbour.parentElement?.appendChild(probe);
      for (const path of (neighbour.getAttribute('d') ?? '').split(/(?=M)/)) {
        probe.setAttribute('d', path);
        const part = probe.getBBox();
        if (part.width > 0 && part.x < mainlandBounds.x && part.y >= mainlandBounds.y &&
            part.y + part.height <= mainlandBounds.y + mainlandBounds.height) {
          bounds.width += bounds.x - Math.min(bounds.x, part.x);
          bounds.x = Math.min(bounds.x, part.x);
        }
      }
      probe.remove();
    }
    // Include the coastal stroke as well as the land fill.
    bounds.x -= 2;
    bounds.y -= 2;
    bounds.width += 4;
    bounds.height += 4;
    const sourceScale = LAYERED_SPAIN_MAP.sourceScale;
    const fit = (width: number, height: number) => {
      if (width <= 32 || height <= 32) return;
      const scale = Math.min((width - 32) / (bounds.width * sourceScale), (height - 32) / (bounds.height * sourceScale));
      const viewWidth = width / scale;
      const viewHeight = height / scale;
      const centerX = (bounds.x + bounds.width / 2) * sourceScale;
      const centerY = (bounds.y + bounds.height / 2) * sourceScale;
      // A fixed portrait bias keeps the peninsula higher for touch gameplay, regardless of panel visibility.
      const verticalCenter = width < height ? Math.max(.42, (bounds.height * sourceScale * scale / 2 + 16) / height) : .5;
      setFrame({ x: centerX - viewWidth / 2, y: centerY - viewHeight * verticalCenter,
        width: viewWidth, height: viewHeight, scale });
    };
    const initial = container.getBoundingClientRect();
    fit(initial.width, initial.height);
    const observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width, entry.contentRect.height));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    panGesture.current = null;
    didPan.current = false;
    setIsDragging(false);
  }, [currentMode, isVectorEditMode]);
  const viewWidth = frame.width / zoomLevel;
  const viewHeight = frame.height / zoomLevel;
  const viewX = frame.x + (frame.width - viewWidth) / 2 - panOffset.x / (frame.scale * zoomLevel);
  const viewY = frame.y + (frame.height - viewHeight) / 2 - panOffset.y / (frame.scale * zoomLevel);

  // Theme styling definitions
  const themeStyles = {
    clasico: {
      seaBg: '#e3edf0',
      coastShadow: '#87cdde',
      landBg: '#e9ecdc',
      landBorder: '#708c88',
      communityStroke: '#a4b3a7',
      portugalBg: '#dce5e7',
      portugalBorder: '#94a3b8',
      reliefHigh: '#d97706',
      reliefStroke: '#92400e',
      riverStroke: '#0284c7',
      textPrimary: '#1e293b',
      insetBackground: '#f0f9ff',
    },
    fisico_moderno: {
      seaBg: '#dbeafe',
      coastShadow: '#87cdde',
      landBg: '#f0fdf4',
      landBorder: '#16a34a',
      communityStroke: '#86efac',
      portugalBg: '#f8fafc',
      portugalBorder: '#cbd5e1',
      reliefHigh: '#ca8a04',
      reliefStroke: '#854d0e',
      riverStroke: '#0284c7',
      textPrimary: '#0f172a',
      insetBackground: '#f8fafc',
    },
    nocturno: {
      seaBg: '#09151e',
      coastShadow: '#123b52',
      landBg: '#20383e',
      landBorder: '#63949f',
      communityStroke: '#45626a',
      portugalBg: '#132730',
      portugalBorder: '#1e293b',
      reliefHigh: '#455e57',
      reliefStroke: '#6f8d7c',
      riverStroke: '#38bdf8',
      textPrimary: '#f8fafc',
      insetBackground: '#0d1527',
    },
  }[theme];

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(0.5, Math.min(3, prev + delta));
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    didPan.current = false;
    if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('button, #vector-editor-overlay')) return;
    panGesture.current = { x: event.clientX, y: event.clientY, panX: panOffset.x, panY: panOffset.y };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = panGesture.current;
    if (!gesture) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!didPan.current && Math.hypot(dx, dy) < 6) return;
    didPan.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanOffset({ x: gesture.panX + dx, y: gesture.panY + dy });
  };
  const finishPan = () => {
    panGesture.current = null;
    setIsDragging(false);
  };

  const handleElementHover = (elem: GeoElement) => {
    if (isVectorEditMode) return;
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

  // In 'explorar' mode, challenge target highlights and feedback markers must never be shown
  const effectiveTargetHighlightId = currentMode !== 'explorar' ? targetHighlightId : null;
  const effectiveFeedbackElementId = currentMode !== 'explorar' ? feedbackElementId : null;

  // Filter elements by layer visibility, but ALWAYS ensure targetHighlightId and feedbackElementId are visible in quiz modes
  const visibleElements = elements.filter((elem) => {
    const isLayerActive = layers[elem.category as keyof MapLayers] ?? true;
    const isTarget = effectiveTargetHighlightId === elem.id;
    const isFeedback = effectiveFeedbackElementId === elem.id;
    return isLayerActive || isTarget || isFeedback;
  });

  const showElementLabel = (element: GeoElement) => layers.showLabels && !blankMode &&
    layers.labelsByCategory?.[element.category] !== false;

  const targetHighlightElement = effectiveTargetHighlightId
    ? elements.find((e) => e.id === effectiveTargetHighlightId)
    : null;

  // Optional flags preserve the previous appearance when callers omit them.
  const showCommunities = layers.showCommunities ?? true;
  const showProvinces = layers.showProvinces ?? false;
  const renderMapPaths = (paths: SvgMapPath[], boundaryLayer = false) => paths.map((part, index) => {
    const sourceFill = part.fill.toLowerCase();
    const isSea = sourceFill === '#cbeaf1';
    const isNeighbour = sourceFill === '#f7d3aa';
    const isLand = sourceFill === '#ffffd0' || sourceFill === '#e6e6e6';
    const isCoast = sourceFill === '#000000';
    // In the source some boundaries are filled ribbons, not stroked lines.
    // Keep those fills: replacing every fill with "none" would erase them.
    const fill = boundaryLayer
      ? sourceFill === 'none' ? 'none' : isLand ? themeStyles.landBg : themeStyles.communityStroke
      : isSea ? themeStyles.seaBg : isNeighbour ? themeStyles.portugalBg
      : isLand ? themeStyles.landBg : isCoast ? themeStyles.landBorder : part.fill;
    const stroke = part.stroke === 'none' ? 'none'
      : boundaryLayer ? themeStyles.communityStroke
      : (isCoast || part.stroke === '#000000') ? themeStyles.landBorder
      : part.stroke === '#87cdde' ? themeStyles.coastShadow : part.stroke;
    return <path data-map-part={part.id} key={`${part.id}-${index}`} d={part.d} fill={fill} stroke={stroke}
      strokeWidth={part.strokeWidth} fillRule={part.fillRule}
      strokeLinecap="round" strokeLinejoin="round" />;
  });

  return (
    <div
      ref={containerRef}
      className="immersive-map relative w-full h-full select-none"
      style={{
        backgroundColor: themeStyles.seaBg,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPan}
      onPointerCancel={finishPan}
      onPointerLeave={event => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) finishPan();
        setHoveredElement(null);
      }}
      onClickCapture={event => {
        if (didPan.current && !(event.target as Element).closest('button')) event.stopPropagation();
        didPan.current = false;
      }}
    >

      {/* Zoom / Pan Controls Overlay */}
      <div id="map-tools" className="map-tools absolute top-3 right-3 z-20 flex flex-col gap-2" hidden={controlsHidden}>
        <button
          onClick={() => handleZoom(0.32)}
          aria-label="Acercar mapa"
          title="Acercar mapa"
          className="w-10 h-10 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface dark:text-white flex items-center justify-center shadow-[0_3px_0_#d3e4fe] dark:shadow-none active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
        >
          <ZoomIn className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={() => handleZoom(-0.32)}
          aria-label="Alejar mapa"
          title="Alejar mapa · Permite ver los archipiélagos"
          disabled={zoomLevel <= 0.5}
          className="w-10 h-10 rounded-full bg-surface-container-lowest dark:bg-slate-800 text-on-surface dark:text-white flex items-center justify-center shadow-[0_3px_0_#d3e4fe] dark:shadow-none active:translate-y-0.5 active:scale-95 disabled:opacity-30 transition-all cursor-pointer"
        >
          <ZoomOut className="w-5 h-5 text-on-surface-variant" />
        </button>
        {(zoomLevel !== 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
          <button
            onClick={handleResetZoom}
            aria-label="Recentrar mapa"
            title="Recuperar el encuadre inicial de la península"
            className="w-10 h-10 rounded-full bg-primary-fixed dark:bg-blue-950 text-on-primary-fixed dark:text-blue-300 flex items-center justify-center shadow-[0_3px_0_#b4c5ff] dark:shadow-none active:translate-y-0.5 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-primary dark:text-blue-400" />
          </button>
        )}
      </div>

      {/* Decorative Classical Compass Rose (Rosa de los vientos náutica) */}
      <div hidden={controlsHidden}
        className="map-chrome map-compass absolute top-4 left-4 z-10 pointer-events-none hidden md:block opacity-90 transition-opacity hover:opacity-100">
        <CompassRose theme={theme} size={84} />
      </div>      

      {/* Vector Editor Toggle & Panel Toggle Buttons (Desktop & Tablet only, located in bottom-right corner) */}
      <div hidden={controlsHidden}
        className="map-chrome map-editor-control absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-2">

        <button
          onClick={onToggleVectorEditMode}
          aria-label={isVectorEditMode ? 'Desactivar modo edición vectorial' : 'Activar modo edición vectorial'}
          title={isVectorEditMode ? 'Desactivar modo edición vectorial' : 'Modo edición vectorial de accidentes'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isVectorEditMode
              ? 'bg-amber-500 text-white shadow-[0_3px_0_#b45309] ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900 active:translate-y-0.5'
              : 'bg-surface-container-lowest dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-[0_3px_0_#d3e4fe] dark:shadow-none hover:bg-slate-100 dark:hover:bg-slate-700 active:translate-y-0.5 active:scale-95'
          }`}
        >
          <Pencil className={`w-5 h-5 ${isVectorEditMode ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
        </button>

      </div>

      {/* SVG Map Canvas */}
      <svg
        data-map-canvas="true"
        ref={svgElementRef}
        viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
        className="w-full h-full"
      >
        <defs>
          <pattern id="seaGridReal" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-300/30 dark:text-slate-700/30" />
          </pattern>
        </defs>

        {/* Layer 0: source coastlines, neighbours and all islands. Always visible. */}
        <rect width="1200" height="675" fill={themeStyles.seaBg} pointerEvents="none" />
        <g id="map-base" pointerEvents="none" transform={`scale(${LAYERED_SPAIN_MAP.sourceScale})`}>
          {renderMapPaths(LAYERED_SPAIN_MAP.base)}
        </g>
        <rect {...LAYERED_SPAIN_MAP.canariasInsetBox} fill="none"
          stroke={themeStyles.portugalBorder} strokeWidth="1" rx="5" pointerEvents="none" />
        {/* Layers 1 and 2 are independent of geographic feature layers. */}
        {showCommunities && <g id="spain-communities" pointerEvents="none"
          transform={`scale(${LAYERED_SPAIN_MAP.sourceScale})`}>
          {renderMapPaths(LAYERED_SPAIN_MAP.communities, true)}
        </g>}
        {showProvinces && <g id="spain-provinces" pointerEvents="none" opacity="0.65"
          transform={`scale(${LAYERED_SPAIN_MAP.sourceScale})`}>
          {renderMapPaths(LAYERED_SPAIN_MAP.provinces, true)}
        </g>}
        {layers.showLabels && !blankMode && <g pointerEvents="none"
          fill={themeStyles.textPrimary} fontSize="11" fontWeight="bold" opacity="0.6">
          <text x="440" y="295" textAnchor="middle" transform="rotate(-80 440 295)">PORTUGAL</text>
          <text x="820" y="50">FRANCIA</text>
          <text x="820" y="590">NORTE DE ÁFRICA</text>
          <text x="165" y="545">ISLAS CANARIAS</text>
        </g>}

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
              const isTargetHighlight = effectiveTargetHighlightId === elem.id;
              const isFeedback = effectiveFeedbackElementId === elem.id;
              const isAggregateRange = elem.id === 'cordilleras-beticas';
              const isNestedRange = elem.id === 'sierra-nevada';
              const positionAdjustment = elem.id === 'sistema-central'
                ? 'translate(15 0)'
                : elem.id === 'montes-de-toledo'
                ? 'translate(-15 0)'
                : elem.id === 'cordillera-cantabrica'
                ? 'translate(0 -12)'
                : undefined;

              return (
                <g key={elem.id} transform={positionAdjustment} className="cursor-pointer" onClick={(e) => handleItemClick(elem, e)}>
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
                        : isAggregateRange
                        ? themeStyles.reliefHigh
                        : isNestedRange
                        ? 'transparent'
                        : themeStyles.reliefHigh
                    }
                      opacity={isTargetHighlight ? 0.9 : isSelected || isHovered ? 0.85 : isAggregateRange ? 0.28 : isNestedRange ? 1 : 0.65}
                    stroke={isTargetHighlight ? '#be123c' : isSelected || isHovered ? '#78350f' : themeStyles.reliefStroke}
                    strokeWidth={isTargetHighlight ? 3.5 : isSelected || isHovered ? 2.5 : 1.4}
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    onMouseEnter={() => handleElementHover(elem)}
                    onMouseLeave={() => setHoveredElement(null)}
                  />

                  {/* Stylized mountain ridges */}
                  {!isAggregateRange && !isNestedRange && (
                    <path
                      d={elem.svgPath}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeDasharray="4 6"
                      opacity={0.5}
                      pointerEvents="none"
                    />
                  )}

                  {/* Mountain Name Label */}
                  {showElementLabel(elem) && (
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

        {/* 2. RÍOS Y AFLUENTES (Los afluentes nuevos usan trazados didácticos simplificados.) */}
        {(layers.rios || layers.afluentes || targetHighlightElement?.category === 'rios' || targetHighlightElement?.category === 'afluentes') &&
          visibleElements
            .filter((e) => (e.category === 'rios' || e.category === 'afluentes') && e.svgType === 'polyline')
            .map((elem) => {
              const isSelected = selectedElement?.id === elem.id;
              const isHovered = hoveredElement?.id === elem.id;
              const isTargetHighlight = effectiveTargetHighlightId === elem.id;
              const isFeedback = effectiveFeedbackElementId === elem.id;

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
                    strokeWidth={isTargetHighlight ? 6 : isSelected || isHovered ? 4.5 : elem.category === 'afluentes' ? 2.5 : 3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    pointerEvents="none"
                  />

                  {/* River Label */}
                  {showElementLabel(elem) && (
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
        {visibleElements.filter(e => e.svgType === 'point').map((elem) => {
            const markerPosition = markerPositions[elem.id];
            const markerMoved = Math.hypot(markerPosition.x - elem.mapX, markerPosition.y - elem.mapY) > 1;
            const isSelected = selectedElement?.id === elem.id;
            const isHovered = hoveredElement?.id === elem.id;
            const isTargetHighlight = effectiveTargetHighlightId === elem.id;
            const isFeedback = effectiveFeedbackElementId === elem.id;

            const categoryColors: Record<CategoryType, string> = {
              picos: '#ef4444',
              costas: '#0d9488',
              mares: '#2563eb',
              islas: '#16a34a',
              unidades_relieve: '#8b5cf6',
              rios: '#0284c7',
              afluentes: '#0891b2',
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
                data-geo-id={elem.id}
                pointerEvents="none"
                className="cursor-pointer group"
                transform={`translate(${markerPosition.x}, ${markerPosition.y})`}
                onClick={(e) => handleItemClick(elem, e)}
                onMouseEnter={() => handleElementHover(elem)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Connect a displaced selector to its true geographic anchor. */}
                {markerMoved && <g pointerEvents="none">
                  <line x1="0" y1="0" x2={elem.mapX - markerPosition.x} y2={elem.mapY - markerPosition.y}
                    stroke={markerColor} strokeWidth="1" opacity="0.7" />
                  <circle cx={elem.mapX - markerPosition.x} cy={elem.mapY - markerPosition.y}
                    r="2.5" fill={markerColor} stroke={themeStyles.landBg} strokeWidth="0.8" />
                </g>}
                {/* Only this disk captures input; halos, labels and lines never block other selectors. */}
                <circle data-selector-hit={elem.id} cx="0" cy="0" r={SELECTOR_HIT_RADIUS}
                  fill="transparent" pointerEvents="all" />

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
                {(elem.category === 'picos' || elem.category === 'montanas') ? (
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
                ) : (elem.category === 'mares' || elem.category === 'rios' || elem.category === 'afluentes') ? (
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

                {/* River and range labels are already rendered alongside their paths. */}
                {elem.svgType === 'point' && showElementLabel(elem) && (
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

        {/* 4. DEDICATED HIGH-CONTRAST TARGET BEACON (For "Identificar" & "Contrarreloj" Challenge Modes) */}
        {currentMode !== 'explorar' && targetHighlightElement && (() => {
          let beaconText = '¿QUÉ ES?';
          if (currentMode === 'contrarreloj') {
            beaconText = '¿ES ESTE?';
          } else if (targetHighlightElement.category === 'afluentes') beaconText = '¿QUÉ AFLUENTE ES?';
          else if (targetHighlightElement.category === 'rios') beaconText = '¿QUÉ RÍO ES?';
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
              transform={`translate(${markerPositions[targetHighlightElement.id]?.x ?? targetHighlightElement.mapX}, ${markerPositions[targetHighlightElement.id]?.y ?? targetHighlightElement.mapY})`}
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

        {/* Vector Editing Interactive Overlay */}
        {isVectorEditMode && editingElement && onUpdateElementGeometry && (
          <VectorEditOverlay
            key={`${editingElement.id}-${editingElement.svgType}`}
            element={editingElement}
            onUpdateElementGeometry={onUpdateElementGeometry}
            svgRef={svgElementRef}
            zoomLevel={zoomLevel}
          />
        )}
      </svg>

      {/* Floating Hover Tooltip (Disabled during vector edit mode) */}
      {hoveredElement && showElementLabel(hoveredElement) && !isVectorEditMode && (
        <div
          className="pointer-events-none absolute bottom-18 right-4 z-30 flex items-center gap-3 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700 animate-fadeIn"
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
        </div>
      )}
    </div>
  );
};
