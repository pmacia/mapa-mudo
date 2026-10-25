import { useState, useEffect, useCallback } from 'react';
import { GeoElement } from '../types/geography';
import { GEO_ELEMENTS } from '../data/geographyData';
import { createDefaultPolygon } from '../utils/vectorEditorUtils';

const STORAGE_KEY_CUSTOM_ELEMENTS = 'geoespana_elements_v2';

export function useCustomElements() {
  const [elements, setElements] = useState<GeoElement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_ELEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return GEO_ELEMENTS;
  });

  // Save to localStorage whenever elements change
  const persistElements = useCallback((nextElements: GeoElement[]) => {
    setElements(nextElements);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_ELEMENTS, JSON.stringify(nextElements));
    } catch (err) {
      console.error('Failed to persist elements to localStorage', err);
    }
  }, []);

  // Update existing element or add if new
  const saveElement = useCallback(
    (updatedElement: GeoElement) => {
      const exists = elements.some((e) => e.id === updatedElement.id);
      let next: GeoElement[];
      if (exists) {
        next = elements.map((e) => (e.id === updatedElement.id ? updatedElement : e));
      } else {
        next = [updatedElement, ...elements];
      }
      persistElements(next);
      return updatedElement;
    },
    [elements, persistElements]
  );

  // Delete an element by ID
  const deleteElement = useCallback(
    (id: string) => {
      const next = elements.filter((e) => e.id !== id);
      persistElements(next);
    },
    [elements, persistElements]
  );

  // Duplicate an element
  const duplicateElement = useCallback(
    (source: GeoElement): GeoElement => {
      const newId = `${source.id}-copia-${Date.now().toString(36)}`;
      const newName = `${source.name} (Copia)`;
      // Slightly offset coordinates so user sees both
      const newX = Math.min(1150, source.mapX + 25);
      const newY = Math.min(640, source.mapY + 20);

      let newSvgPath = source.svgPath;
      if (newSvgPath) {
        // Shift path coordinates slightly
        newSvgPath = newSvgPath.replace(
          /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,
          (_, x, y) => `${(parseFloat(x) + 25).toFixed(2)} ${(parseFloat(y) + 20).toFixed(2)}`
        );
      }

      const clone: GeoElement = {
        ...source,
        id: newId,
        name: newName,
        mapX: newX,
        mapY: newY,
        svgPath: newSvgPath,
      };

      const next = [clone, ...elements];
      persistElements(next);
      return clone;
    },
    [elements, persistElements]
  );

  // Create a brand new element with default polygon
  const createNewElement = useCallback((): GeoElement => {
    const defaultCenter = { x: 600, y: 350 };
    const defaultPolyPoints = createDefaultPolygon(defaultCenter.x, defaultCenter.y, 45);
    const svgPath =
      `M ${defaultPolyPoints[0].x} ${defaultPolyPoints[0].y} ` +
      defaultPolyPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') +
      ' Z';

    const newElement: GeoElement = {
      id: `nuevo-accidente-${Date.now().toString(36)}`,
      name: 'Nuevo Accidente Geográfico',
      category: 'montanas',
      subCategory: 'Sistema Montañoso',
      vertiente: 'interior',
      difficulty: 'facil',
      elevationOrLength: '1.200 m',
      description: 'Descripción didáctica del nuevo accidente geográfico para estudiantes de ESO.',
      curiosity: 'Curiosidad o dato fascinante para recordar este accidente.',
      mapX: defaultCenter.x,
      mapY: defaultCenter.y,
      svgType: 'polygon',
      svgPath,
    };

    const next = [newElement, ...elements];
    persistElements(next);
    return newElement;
  }, [elements, persistElements]);

  // Reset all elements back to original dataset
  const resetToDefaults = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_ELEMENTS);
    } catch {
      // Ignore
    }
    setElements(GEO_ELEMENTS);
  }, []);

  return {
    elements,
    saveElement,
    deleteElement,
    duplicateElement,
    createNewElement,
    resetToDefaults,
  };
}
