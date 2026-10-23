/**
 * Configuración centralizada de parámetros y constantes del juego.
 * Elimina números mágicos y facilita el ajuste pedagógico y de balanceo de juego.
 */

export const GAME_CONFIG = {
  // Puntos otorgados por acierto según el modo y si se ha solicitado pista
  POINTS: {
    LOCALIZAR_BASE: 30,
    LOCALIZAR_WITH_HINT: 20, // Penalización de 10 puntos por usar pista en ¿Dónde está?
    
    CONTRARRELOJ_BASE: 20,
    CONTRARRELOJ_WITH_HINT: 15, // Penalización de 5 puntos por usar pista en 60s
    
    IDENTIFICAR_BASE: 30,
    IDENTIFICAR_WITH_HINT: 20, // Puntos en identificar con pista
    
    CONTRARRELOJ_WRONG_PENALTY: 5, // Deducción de puntos en fallo en modo 60s (sin bajar de 0)
    
    ATLAS_DISCOVERY_XP: 10, // XP por cada accidente consultado por primera vez en el Atlas
    ATLAS_STAMP_BONUS_XP: 100, // Bonus al completar todos los accidentes del Atlas
    TOUR_COMPLETION_BONUS_XP: 150, // Bonus al superar la ronda de ¿Dónde está?
  },

  // Tiempos y duraciones en segundos / milisegundos
  TIMERS: {
    CONTRARRELOJ_INITIAL_SECONDS: 60,
    CONTRARRELOJ_TIME_BONUS_SECONDS: 2, // +2s por cada respuesta acertada en modo 60s
    CONTRARRELOJ_WARNING_SECONDS: 10, // Umbral para alerta visual de tiempo agotándose
    
    AUTO_ADVANCE_COUNTDOWN_SECONDS: 2, // Cuenta atrás en modo de avance automático
    AUTO_ADVANCE_FAST_CORRECT_MS: 400, // Avance rápido tras acierto en contrarreloj
    AUTO_ADVANCE_FAST_WRONG_MS: 650, // Avance tras error en contrarreloj para no perder tiempo
  },

  // Estructura de juego y vidas
  GAMEPLAY: {
    INITIAL_LIVES: 3,
    DEFAULT_ROUND_SIZE: 20,
    MIN_PASSING_RATIO: 0.5, // 50% de aciertos mínimos para superar una ronda
    PERFECT_PASSING_RATIO: 1.0, // 100% de aciertos para ronda perfecta
    LEVEL_XP_STEP: 100, // Cada 100 XP se sube un nivel
    STREAK_CELEBRATION_INTERVAL: 5, // Cada 5 aciertos seguidos se celebra la racha
  },

  // Umbrales para desbloqueo de medallas
  BADGE_REQUIREMENTS: {
    RIOS_COUNT: 5,
    MONTANAS_PICOS_COUNT: 5,
    COSTAS_COUNT: 5,
    ISLAS_COUNT: 4,
    STREAK_COUNT: 5,
    MASTER_XP: 500,
  },

  // Breakpoints de interfaz
  UI: {
    DESKTOP_BREAKPOINT_PX: 1024,
  },
} as const;
