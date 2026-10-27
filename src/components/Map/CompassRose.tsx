import React from 'react';
import type { MapTheme } from './SpainMap';

interface CompassRoseProps {
  theme: MapTheme;
  size?: number;
  className?: string;
}

export const CompassRose: React.FC<CompassRoseProps> = ({
  theme,
  size = 84,
  className = '',
}) => {
  const colors = theme === 'nocturno' ? {
    base: '#131c2e', border: '#334155', guide: '#243247', secondary: '#64748b',
    eastLight: '#7dd3fc', eastDark: '#38bdf8', westLight: '#94a3b8', westDark: '#64748b',
    southDark: '#475569', northLight: '#fda4af', northDark: '#fb7185', northTip: '#f87171',
    centerBorder: '#cbd5e1', centerDot: '#38bdf8', cardinal: '#cbd5e1',
  } : {
    base: '#ffffff', border: '#cbd5e1', guide: '#e2e8f0', secondary: '#94a3b8',
    eastLight: '#3b82f6', eastDark: '#1d4ed8', westLight: '#64748b', westDark: '#475569',
    southDark: '#334155', northLight: '#f87171', northDark: '#ef4444', northTip: '#dc2626',
    centerBorder: '#0f172a', centerDot: '#2563eb', cardinal: '#475569',
  };
  return (
  <div
    className={`pointer-events-none select-none shrink-0 transition-opacity duration-300 ${className}`}
    title="Rosa de los vientos (Orientación Norte geográfica)"
    style={{ width: size, height: size }}
  >
    <svg
      viewBox="0 0 140 140"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="block drop-shadow-md overflow-visible"
      role="img"
      aria-label="Rosa de los vientos minimalista: norte arriba, sur abajo, este a la derecha y oeste a la izquierda"
      fontFamily="Arial, sans-serif"
    >
      {/* Base y anillo de rumbo adaptados al tema */}
      <circle cx="70" cy="70" r="54" fill={colors.base} stroke={colors.border} strokeWidth="2.5" />
      <circle cx="70" cy="70" r="42" fill="none" stroke={colors.guide} strokeWidth="3" />
      <circle cx="70" cy="70" r="42" fill="none" stroke={colors.secondary} strokeWidth="1.5" strokeDasharray="2 4" />

      {/* Guías en cruz */}
      <line x1="70" y1="28" x2="70" y2="112" stroke={colors.guide} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="70" x2="112" y2="70" stroke={colors.guide} strokeWidth="1.5" strokeLinecap="round" />

      {/* Rumbos secundarios: NE, SE, SO y NO */}
      <g transform="rotate(45 70 70)">
        <polygon points="70,40 72,70 70,72 68,70" fill={colors.secondary} />
        <polygon points="70,100 72,70 70,68 68,70" fill={colors.border} />
        <polygon points="40,70 70,72 72,70 70,68" fill={colors.border} />
        <polygon points="100,70 70,72 68,70 70,68" fill={colors.secondary} />
      </g>

      {/* Este */}
      <polygon points="70,70 106,70 70,65" fill={colors.eastLight} />
      <polygon points="70,70 106,70 70,75" fill={colors.eastDark} />
      {/* Oeste */}
      <polygon points="70,70 34,70 70,75" fill={colors.westLight} />
      <polygon points="70,70 34,70 70,65" fill={colors.westDark} />
      {/* Sur */}
      <polygon points="70,70 70,106 65,70" fill={colors.westLight} />
      <polygon points="70,70 70,106 75,70" fill={colors.southDark} />
      {/* Norte */}
      <polygon points="70,70 70,26 64,70" fill={colors.northLight} />
      <polygon points="70,70 70,26 76,70" fill={colors.northDark} />
      <polygon points="70,18 76,28 70,25 64,28" fill={colors.northTip} />

      {/* Núcleo central */}
      <circle cx="70" cy="70" r="8" fill={colors.base} stroke={colors.centerBorder} strokeWidth="2.5" />
      <circle cx="70" cy="70" r="4" fill={colors.centerDot} />

      {/* Puntos cardinales */}
      <text x="70" y="14" textAnchor="middle" fontSize="13" fontWeight="900" fill={colors.northTip}>N</text>
      <text x="70" y="128" textAnchor="middle" fontSize="11" fontWeight="800" fill={colors.cardinal}>S</text>
      <text x="127" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill={colors.centerDot}>E</text>
      <text x="13" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill={colors.cardinal}>O</text>
    </svg>
  </div>
);
};
