import type { CategoryType, GeoElement } from '../types/geography';

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Parses SVG path strings into an array of 2D points.
 * Supports M, L, C, Q, Z and coordinate pairs.
 */
export function parseSvgPathToPoints(d: string): Point2D[] {
  if (!d || typeof d !== 'string') return [];

  // Match all numbers including scientific notation and signs
  const numbers = d.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
  if (!numbers || numbers.length < 2) return [];

  const points: Point2D[] = [];
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = parseFloat(numbers[i]);
    const y = parseFloat(numbers[i + 1]);
    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
    }
  }

  // Remove consecutive duplicates
  return points.filter((pt, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    return Math.hypot(pt.x - prev.x, pt.y - prev.y) > 0.001;
  });
}

/**
 * Reconstructs an SVG path string from an array of 2D points.
 */
export function pointsToSvgPath(points: Point2D[], isClosed: boolean): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  }

  const parts = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`);
  }

  if (isClosed && points.length >= 3) {
    parts.push('Z');
  }

  return parts.join(' ');
}

/**
 * Calculates the geometric centroid (average of points) or polygon center.
 */
export function calculateCentroid(points: Point2D[]): Point2D {
  if (!points || points.length === 0) return { x: 600, y: 350 };
  let sumX = 0;
  let sumY = 0;
  for (const pt of points) {
    sumX += pt.x;
    sumY += pt.y;
  }
  return {
    x: Number((sumX / points.length).toFixed(2)),
    y: Number((sumY / points.length).toFixed(2)),
  };
}

/**
 * Computes bounding box of a set of points.
 */
export function calculateBoundingBox(points: Point2D[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: Number(((minX + maxX) / 2).toFixed(2)),
    centerY: Number(((minY + maxY) / 2).toFixed(2)),
  };
}

/**
 * Translates all points by (dx, dy).
 */
export function translatePoints(points: Point2D[], dx: number, dy: number): Point2D[] {
  return points.map((pt) => ({
    x: Number((pt.x + dx).toFixed(2)),
    y: Number((pt.y + dy).toFixed(2)),
  }));
}

/**
 * Rotates all points around an origin by degrees.
 */
export function rotatePoints(points: Point2D[], degrees: number, origin: Point2D): Point2D[] {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return points.map((pt) => {
    const dx = pt.x - origin.x;
    const dy = pt.y - origin.y;
    return {
      x: Number((origin.x + dx * cos - dy * sin).toFixed(2)),
      y: Number((origin.y + dx * sin + dy * cos).toFixed(2)),
    };
  });
}

/**
 * Scales all points from an origin by scale factors.
 */
export function scalePoints(
  points: Point2D[],
  scaleX: number,
  scaleY: number,
  origin: Point2D
): Point2D[] {
  return points.map((pt) => ({
    x: Number((origin.x + (pt.x - origin.x) * scaleX).toFixed(2)),
    y: Number((origin.y + (pt.y - origin.y) * scaleY).toFixed(2)),
  }));
}

/**
 * Inserts a new point between index and index + 1.
 */
export function insertPointAt(points: Point2D[], index: number, newPoint: Point2D): Point2D[] {
  const next = [...points];
  next.splice(index + 1, 0, {
    x: Number(newPoint.x.toFixed(2)),
    y: Number(newPoint.y.toFixed(2)),
  });
  return next;
}

/**
 * Deletes a point at a given index.
 */
export function removePointAt(points: Point2D[], index: number): Point2D[] {
  if (points.length <= 2) return points; // Don't allow reducing below minimum
  return points.filter((_, idx) => idx !== index);
}

/**
 * Creates default polygon shape around a center coordinate.
 */
export function createDefaultPolygon(centerX = 600, centerY = 350, radius = 40): Point2D[] {
  const sides = 6;
  const pts: Point2D[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    pts.push({
      x: Number((centerX + radius * Math.cos(angle)).toFixed(2)),
      y: Number((centerY + radius * Math.sin(angle) * 0.7).toFixed(2)),
    });
  }
  return pts;
}

/**
 * Creates default river/polyline path around a center coordinate.
 */
export function createDefaultPolyline(centerX = 600, centerY = 350, length = 80): Point2D[] {
  return [
    { x: centerX - length / 2, y: centerY - 15 },
    { x: centerX - length / 6, y: centerY + 10 },
    { x: centerX + length / 6, y: centerY - 10 },
    { x: centerX + length / 2, y: centerY + 15 },
  ];
}

/** Match the map's category renderers, keeping compatible geometry intact. */
export function geometryForCategory(
  element: Pick<GeoElement, 'mapX' | 'mapY' | 'svgType' | 'svgPath'>,
  category: CategoryType
): Pick<GeoElement, 'mapX' | 'mapY' | 'svgType' | 'svgPath'> {
  const svgType = (category === 'rios' || category === 'afluentes') ? 'polyline' : category === 'montanas' ? 'polygon' : 'point';
  const { mapX, mapY } = element;
  if (svgType === element.svgType) return { ...element };
  const points = svgType === 'polygon' ? createDefaultPolygon(mapX, mapY)
    : svgType === 'polyline' ? createDefaultPolyline(mapX, mapY) : [];
  return { mapX, mapY, svgType, svgPath: points.length ? pointsToSvgPath(points, svgType === 'polygon') : undefined };
}
