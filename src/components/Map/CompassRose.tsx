import React from 'react';
import type { MapTheme } from './SpainMap';

interface CompassRoseProps {
  /** Se conserva para mantener la compatibilidad con los mapas existentes. */
  theme: MapTheme;
  size?: number;
  className?: string;
}

export const CompassRose: React.FC<CompassRoseProps> = ({
  size = 84,
  className = '',
}) => (
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
      {/* Base blanca y anillo de rumbo */}
      <circle cx="70" cy="70" r="54" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx="70" cy="70" r="42" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      <circle cx="70" cy="70" r="42" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 4" />

      {/* Guías en cruz */}
      <line x1="70" y1="28" x2="70" y2="112" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="70" x2="112" y2="70" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />

      {/* Rumbos secundarios: NE, SE, SO y NO */}
      <g transform="rotate(45 70 70)">
        <polygon points="70,40 72,70 70,72 68,70" fill="#94a3b8" />
        <polygon points="70,100 72,70 70,68 68,70" fill="#cbd5e1" />
        <polygon points="40,70 70,72 72,70 70,68" fill="#cbd5e1" />
        <polygon points="100,70 70,72 68,70 70,68" fill="#94a3b8" />
      </g>

      {/* Este */}
      <polygon points="70,70 106,70 70,65" fill="#3b82f6" />
      <polygon points="70,70 106,70 70,75" fill="#1d4ed8" />
      {/* Oeste */}
      <polygon points="70,70 34,70 70,75" fill="#64748b" />
      <polygon points="70,70 34,70 70,65" fill="#475569" />
      {/* Sur */}
      <polygon points="70,70 70,106 65,70" fill="#64748b" />
      <polygon points="70,70 70,106 75,70" fill="#334155" />
      {/* Norte */}
      <polygon points="70,70 70,26 64,70" fill="#f87171" />
      <polygon points="70,70 70,26 76,70" fill="#ef4444" />
      <polygon points="70,18 76,28 70,25 64,28" fill="#dc2626" />

      {/* Núcleo central */}
      <circle cx="70" cy="70" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
      <circle cx="70" cy="70" r="4" fill="#2563eb" />

      {/* Puntos cardinales */}
      <text x="70" y="14" textAnchor="middle" fontSize="13" fontWeight="900" fill="#dc2626">N</text>
      <text x="70" y="128" textAnchor="middle" fontSize="11" fontWeight="800" fill="#475569">S</text>
      <text x="127" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2563eb">E</text>
      <text x="13" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill="#475569">O</text>
    </svg>
  </div>
);
