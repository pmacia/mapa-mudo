import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeoElement } from '../../types/geography';
import {
  Point2D,
  parseSvgPathToPoints,
  pointsToSvgPath,
  calculateCentroid,
  calculateBoundingBox,
  translatePoints,
  rotatePoints,
  insertPointAt,
  removePointAt,
} from '../../utils/vectorEditorUtils';

interface VectorEditOverlayProps {
  element: GeoElement;
  onUpdateElementGeometry: (updated: Partial<GeoElement>) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  zoomLevel: number;
}

type DragMode =
  | { type: 'vertex'; index: number; startPoint: Point2D }
  | { type: 'translate'; startSvg: Point2D; initialPoints: Point2D[]; initialMapX: number; initialMapY: number }
  | { type: 'rotate'; startAngle: number; initialPoints: Point2D[]; center: Point2D }
  | { type: 'point_center'; startSvg: Point2D; initialMapX: number; initialMapY: number };

export const VectorEditOverlay: React.FC<VectorEditOverlayProps> = ({
  element,
  onUpdateElementGeometry,
  svgRef,
  zoomLevel,
}) => {
  const isPolygon = element.svgType === 'polygon';
  const isPolyline = element.svgType === 'polyline';
  const isPoint = element.svgType === 'point';

  // Parse points from svgPath if polygon/polyline
  const points = React.useMemo(() => {
    if (isPoint) return [];
    if (!element.svgPath) return [];
    return parseSvgPathToPoints(element.svgPath);
  }, [element.svgPath, isPoint]);

  const centroid = React.useMemo(() => {
    if (isPoint) return { x: element.mapX, y: element.mapY };
    return calculateCentroid(points);
  }, [points, isPoint, element.mapX, element.mapY]);

  const bbox = React.useMemo(() => {
    if (isPoint) {
      return {
        minX: element.mapX - 10,
        maxX: element.mapX + 10,
        minY: element.mapY - 10,
        maxY: element.mapY + 10,
        width: 20,
        height: 20,
        centerX: element.mapX,
        centerY: element.mapY,
      };
    }
    return calculateBoundingBox(points);
  }, [points, isPoint, element.mapX, element.mapY]);

  const [activeDrag, setActiveDrag] = useState<DragMode | null>(null);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

  // Helper to convert screen coordinates to SVG coordinates
  const getSvgCoordinates = useCallback(
    (clientX: number, clientY: number): Point2D => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };

      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;

      const ctm = svg.getScreenCTM();
      if (ctm) {
        const svgPoint = pt.matrixTransform(ctm.inverse());
        return {
          x: Number(svgPoint.x.toFixed(2)),
          y: Number(svgPoint.y.toFixed(2)),
        };
      }

      const rect = svg.getBoundingClientRect();
      return {
        x: Number((((clientX - rect.left) / rect.width) * 1200).toFixed(2)),
        y: Number((((clientY - rect.top) / rect.height) * 675).toFixed(2)),
      };
    },
    [svgRef]
  );

  // Global window mousemove/mouseup while dragging handles
  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      const currentSvg = getSvgCoordinates(e.clientX, e.clientY);

      if (activeDrag.type === 'vertex') {
        const nextPoints = [...points];
        nextPoints[activeDrag.index] = currentSvg;
        const newPath = pointsToSvgPath(nextPoints, isPolygon);
        const newCentroid = calculateCentroid(nextPoints);
        onUpdateElementGeometry({
          svgPath: newPath,
          mapX: newCentroid.x,
          mapY: newCentroid.y,
        });
      } else if (activeDrag.type === 'translate') {
        const dx = currentSvg.x - activeDrag.startSvg.x;
        const dy = currentSvg.y - activeDrag.startSvg.y;
        const nextPoints = translatePoints(activeDrag.initialPoints, dx, dy);
        const newPath = pointsToSvgPath(nextPoints, isPolygon);
        onUpdateElementGeometry({
          svgPath: newPath,
          mapX: Number((activeDrag.initialMapX + dx).toFixed(2)),
          mapY: Number((activeDrag.initialMapY + dy).toFixed(2)),
        });
      } else if (activeDrag.type === 'rotate') {
        const currentAngle =
          Math.atan2(currentSvg.y - activeDrag.center.y, currentSvg.x - activeDrag.center.x) *
          (180 / Math.PI);
        const diffAngle = currentAngle - activeDrag.startAngle;
        const nextPoints = rotatePoints(activeDrag.initialPoints, diffAngle, activeDrag.center);
        const newPath = pointsToSvgPath(nextPoints, isPolygon);
        onUpdateElementGeometry({
          svgPath: newPath,
        });
      } else if (activeDrag.type === 'point_center') {
        const dx = currentSvg.x - activeDrag.startSvg.x;
        const dy = currentSvg.y - activeDrag.startSvg.y;
        onUpdateElementGeometry({
          mapX: Number((activeDrag.initialMapX + dx).toFixed(2)),
          mapY: Number((activeDrag.initialMapY + dy).toFixed(2)),
        });
      }
    };

    const handlePointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, getSvgCoordinates, points, isPolygon, onUpdateElementGeometry]);

  // Handle vertex drag start
  const handleVertexPointerDown = (e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedVertexIndex(index);
    const svgPt = getSvgCoordinates(e.clientX, e.clientY);
    setActiveDrag({ type: 'vertex', index, startPoint: svgPt });
  };

  // Handle vertex delete on double-click
  const handleVertexDoubleClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (points.length <= (isPolygon ? 3 : 2)) return;
    const nextPoints = removePointAt(points, index);
    const newPath = pointsToSvgPath(nextPoints, isPolygon);
    const newCentroid = calculateCentroid(nextPoints);
    onUpdateElementGeometry({
      svgPath: newPath,
      mapX: newCentroid.x,
      mapY: newCentroid.y,
    });
    setSelectedVertexIndex(null);
  };

  // Handle midpoint click to insert vertex
  const handleMidpointClick = (e: React.MouseEvent, index: number, midX: number, midY: number) => {
    e.stopPropagation();
    e.preventDefault();
    const nextPoints = insertPointAt(points, index, { x: midX, y: midY });
    const newPath = pointsToSvgPath(nextPoints, isPolygon);
    onUpdateElementGeometry({
      svgPath: newPath,
    });
    setSelectedVertexIndex(index + 1);
  };

  // Handle translate drag start
  const handleTranslatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startSvg = getSvgCoordinates(e.clientX, e.clientY);
    if (isPoint) {
      setActiveDrag({
        type: 'point_center',
        startSvg,
        initialMapX: element.mapX,
        initialMapY: element.mapY,
      });
    } else {
      setActiveDrag({
        type: 'translate',
        startSvg,
        initialPoints: [...points],
        initialMapX: element.mapX,
        initialMapY: element.mapY,
      });
    }
  };

  // Handle rotation drag start
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startSvg = getSvgCoordinates(e.clientX, e.clientY);
    const startAngle =
      Math.atan2(startSvg.y - centroid.y, startSvg.x - centroid.x) * (180 / Math.PI);
    setActiveDrag({
      type: 'rotate',
      startAngle,
      initialPoints: [...points],
      center: centroid,
    });
  };

  // Handle scale buttons (scale in SVG coordinate units)
  const rotationHandlePos = {
    x: bbox.centerX,
    y: bbox.minY - 26,
  };

  // Compute midpoints for edges
  const midpoints = React.useMemo(() => {
    if (isPoint || points.length < 2) return [];
    const list: { x: number; y: number; index: number }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      list.push({
        x: Number(((points[i].x + points[i + 1].x) / 2).toFixed(2)),
        y: Number(((points[i].y + points[i + 1].y) / 2).toFixed(2)),
        index: i,
      });
    }
    if (isPolygon && points.length >= 3) {
      const last = points.length - 1;
      list.push({
        x: Number(((points[last].x + points[0].x) / 2).toFixed(2)),
        y: Number(((points[last].y + points[0].y) / 2).toFixed(2)),
        index: last,
      });
    }
    return list;
  }, [points, isPolygon, isPoint]);

  return (
    <g id="vector-editor-overlay" className="pointer-events-auto select-none">
      {/* 1. BOUNDING BOX & TRANSLATION HINT FOR POLYGONS */}
      {!isPoint && (
        <>
          {/* Bounding box dashes */}
          <rect
            x={bbox.minX}
            y={bbox.minY}
            width={bbox.width}
            height={bbox.height}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.45"
            pointerEvents="none"
          />

          {/* Stalk to rotation handle */}
          <line
            x1={bbox.centerX}
            y1={bbox.minY}
            x2={rotationHandlePos.x}
            y2={rotationHandlePos.y}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            pointerEvents="none"
          />

          {/* ROTATION HANDLE */}
          <g
            transform={`translate(${rotationHandlePos.x}, ${rotationHandlePos.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handleRotatePointerDown}
          >
            <circle
              r="7.5"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="2"
              className="drop-shadow-md hover:scale-125 transition-transform"
            />
            {/* Rotation symbol */}
            <path
              d="M -3 -1 A 3.5 3.5 0 1 1 3 1"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              pointerEvents="none"
            />
          </g>

          {/* Active Outline Highlighting of polygon */}
          <path
            d={element.svgPath}
            fill="rgba(245, 158, 11, 0.12)"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="cursor-move"
            onPointerDown={handleTranslatePointerDown}
          />
        </>
      )}

      {/* 2. TRANSLATE CENTER PIVOT (MOVE HANDLE) */}
      <g
        transform={`translate(${centroid.x}, ${centroid.y})`}
        className="cursor-move group"
        onPointerDown={handleTranslatePointerDown}
      >
        <circle
          r="10"
          fill="#3b82f6"
          fillOpacity="0.25"
          stroke="#2563eb"
          strokeWidth="1.5"
          className="group-hover:scale-125 transition-transform"
        />
        <circle r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
        {/* Crosshair arrows */}
        <path
          d="M -8 0 L 8 0 M 0 -8 L 0 8"
          stroke="#ffffff"
          strokeWidth="1.2"
          pointerEvents="none"
        />
        <title>Arrastra para mover todo el accidente</title>
      </g>

      {/* 3. POINT-SPECIFIC RETICLE (for svgType === 'point') */}
      {isPoint && (
        <g
          transform={`translate(${element.mapX}, ${element.mapY})`}
          className="cursor-move"
          onPointerDown={handleTranslatePointerDown}
        >
          <circle
            r="16"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 3"
            className="animate-spin"
            style={{ animationDuration: '8s' }}
          />
          <circle r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <circle r="2" fill="#ffffff" />
          <text
            x="0"
            y="-22"
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="10"
            fontWeight="bold"
            className="drop-shadow-sm pointer-events-none"
          >
            {element.name}
          </text>
        </g>
      )}

      {/* 4. MIDPOINT "+" HANDLES (Click to add vertex) */}
      {!isPoint &&
        midpoints.map((mid) => (
          <g
            key={`mid-${mid.index}`}
            transform={`translate(${mid.x}, ${mid.y})`}
            className="cursor-pointer group"
            onClick={(e) => handleMidpointClick(e, mid.index, mid.x, mid.y)}
          >
            <circle
              r="4.5"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="drop-shadow group-hover:scale-135 transition-transform"
            />
            {/* Plus sign */}
            <path
              d="M -2.2 0 L 2.2 0 M 0 -2.2 L 0 2.2"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              pointerEvents="none"
            />
            <title>Haz clic para añadir un vértice</title>
          </g>
        ))}

      {/* 5. VERTEX HANDLES (Drag to move, double-click to remove) */}
      {!isPoint &&
        points.map((pt, index) => {
          const isSelected = selectedVertexIndex === index;
          return (
            <g
              key={`vertex-${index}`}
              transform={`translate(${pt.x}, ${pt.y})`}
              className="cursor-grab active:cursor-grabbing group"
              onPointerDown={(e) => handleVertexPointerDown(e, index)}
              onDoubleClick={(e) => handleVertexDoubleClick(e, index)}
            >
              <circle
                r={isSelected ? 7.5 : 5.5}
                fill={isSelected ? '#f59e0b' : '#ffffff'}
                stroke={isSelected ? '#b45309' : '#2563eb'}
                strokeWidth={isSelected ? 2.5 : 2}
                className="drop-shadow group-hover:scale-125 transition-transform"
              />
              <title>
                Vértice #{index + 1} ({pt.x}, {pt.y}). Doble clic para eliminar.
              </title>
            </g>
          );
        })}
    </g>
  );
};
