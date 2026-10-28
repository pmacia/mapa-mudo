/**
 * Configuración centralizada para el mapa de España (zoom, límites y navegación).
 * Elimina números mágicos y facilita el ajuste de la escala inicial y la interacción.
 */

export const MAP_CONFIG = {
  ZOOM: {
    INITIAL: 0.75, // Zoom inicial al cargar el mapa o cambiar de modo
    RESET: 0.75,   // Nivel de zoom aplicado al pulsar el botón de recentrado
    MIN: 0.5,      // Límite mínimo de zoom (alejamiento máximo)
    MAX: 4.0,      // Límite máximo de zoom (acercamiento máximo)
    STEP: 0.16,    // Incremento o decremento por cada pulsación en los botones +/-
  },
} as const;

/**
 * Constantes directas para facilitar su importación y uso en componentes.
 */
export const DEFAULT_MAP_ZOOM: number = MAP_CONFIG.ZOOM.INITIAL;
export const MIN_MAP_ZOOM: number = MAP_CONFIG.ZOOM.MIN;
export const MAX_MAP_ZOOM: number = MAP_CONFIG.ZOOM.MAX;
export const ZOOM_STEP: number = MAP_CONFIG.ZOOM.STEP;
