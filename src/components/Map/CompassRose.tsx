import React from 'react';
import { MapTheme } from './SpainMap';

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
  // Theme color palettes calibrated to authentic maritime navigation charts
  const colors = {
    clasico: {
      ringOuter: '#78716c',
      ringInner: '#b45309',
      tickColor: '#92400e',
      northLight: '#ef4444',
      northDark: '#b91c1c',
      cardinalLight: '#ffffff',
      cardinalDark: '#1e293b',
      ordinalLight: '#fef3c7',
      ordinalDark: '#78350f',
      centerRing: '#d97706',
      centerJewel: '#b91c1c',
      textColor: '#1e293b',
      textNorth: '#dc2626',
    },
    fisico_moderno: {
      ringOuter: '#475569',
      ringInner: '#0284c7',
      tickColor: '#0369a1',
      northLight: '#2563eb',
      northDark: '#1e40af',
      cardinalLight: '#ffffff',
      cardinalDark: '#334155',
      ordinalLight: '#e2e8f0',
      ordinalDark: '#475569',
      centerRing: '#0284c7',
      centerJewel: '#1d4ed8',
      textColor: '#0f172a',
      textNorth: '#1d4ed8',
    },
    nocturno: {
      ringOuter: '#334155',
      ringInner: '#38bdf8',
      tickColor: '#38bdf8',
      northLight: '#38bdf8',
      northDark: '#0284c7',
      cardinalLight: '#94a3b8',
      cardinalDark: '#0f172a',
      ordinalLight: '#64748b',
      ordinalDark: '#1e293b',
      centerRing: '#38bdf8',
      centerJewel: '#38bdf8',
      textColor: '#f8fafc',
      textNorth: '#38bdf8',
    },
  }[theme];

  return (
    <div
      className={`pointer-events-none select-none transition-opacity duration-300 ${className}`}
      title="Rosa de los vientos (Orientación Norte geográfica)"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="drop-shadow-md overflow-visible"
      >
        <defs>
          <filter id="compassShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 1. Outer Nautical Graduation Rings */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={colors.ringOuter}
          strokeWidth="0.8"
          strokeDasharray="1.5 2"
          opacity="0.65"
        />
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke={colors.ringOuter}
          strokeWidth="1.2"
          opacity="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r="40.5"
          fill="none"
          stroke={colors.ringInner}
          strokeWidth="0.6"
          opacity="0.7"
        />

        {/* Compass Cardinal Degree Ticks (Every 30 degrees) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const isCardinal = deg % 90 === 0;
          const r1 = 40.5;
          const r2 = isCardinal ? 45.5 : 43;
          const rad = ((deg - 90) * Math.PI) / 180;
          const x1 = (50 + r1 * Math.cos(rad)).toFixed(2);
          const y1 = (50 + r1 * Math.sin(rad)).toFixed(2);
          const x2 = (50 + r2 * Math.cos(rad)).toFixed(2);
          const y2 = (50 + r2 * Math.sin(rad)).toFixed(2);
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isCardinal ? colors.textNorth : colors.tickColor}
              strokeWidth={isCardinal ? '1.4' : '0.8'}
              opacity={isCardinal ? '0.9' : '0.6'}
            />
          );
        })}

        {/* 2. Secondary Intercardinal Star Points (NE, SE, SO, NO - 45 deg) */}
        {/* NE */}
        <polygon points="50,50 47,47 71,29" fill={colors.ordinalLight} />
        <polygon points="50,50 53,47 71,29" fill={colors.ordinalDark} />
        {/* SE */}
        <polygon points="50,50 53,47 71,71" fill={colors.ordinalLight} />
        <polygon points="50,50 53,53 71,71" fill={colors.ordinalDark} />
        {/* SO / SW */}
        <polygon points="50,50 53,53 29,71" fill={colors.ordinalLight} />
        <polygon points="50,50 47,53 29,71" fill={colors.ordinalDark} />
        {/* NO / NW */}
        <polygon points="50,50 47,53 29,29" fill={colors.ordinalLight} />
        <polygon points="50,50 47,47 29,29" fill={colors.ordinalDark} />

        {/* 3. Primary Cardinal Star Points (N, S, E, O) with 3D Beveled Facets */}
        {/* SUR (South) */}
        <polygon points="50,50 46,55 50,91" fill={colors.cardinalLight} />
        <polygon points="50,50 54,55 50,91" fill={colors.cardinalDark} />

        {/* ESTE (East) */}
        <polygon points="50,50 55,46 91,50" fill={colors.cardinalLight} />
        <polygon points="50,50 55,54 91,50" fill={colors.cardinalDark} />

        {/* OESTE (West) */}
        <polygon points="50,50 45,54 9,50" fill={colors.cardinalLight} />
        <polygon points="50,50 45,46 9,50" fill={colors.cardinalDark} />

        {/* NORTE (North arrow - distinctive crimson/fleur-de-lis motif) */}
        <polygon points="50,50 46,45 50,8" fill={colors.northLight} />
        <polygon points="50,50 54,45 50,8" fill={colors.northDark} />
        {/* Fleur-de-lis / Crown decorative finial on North */}
        <path
          d="M50,4 L52,9 L50,8 L48,9 Z"
          fill={colors.northDark}
        />

        {/* 4. Center Nautical Brass Hub */}
        <circle
          cx="50"
          cy="50"
          r="6.5"
          fill={colors.centerRing}
          stroke={colors.ringOuter}
          strokeWidth="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r="4.5"
          fill={colors.cardinalLight}
          stroke={colors.centerJewel}
          strokeWidth="0.8"
        />
        <circle cx="50" cy="50" r="2" fill={colors.centerJewel} />

        {/* 5. Cardinal Lettering */}
        {/* N */}
        <text
          x="50"
          y="18"
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.textNorth}
          fontSize="8.5"
          fontWeight="900"
          fontFamily="serif"
          className="drop-shadow-xs"
        >
          N
        </text>

        {/* S */}
        <text
          x="50"
          y="83"
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.textColor}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="serif"
          opacity="0.85"
        >
          S
        </text>

        {/* E */}
        <text
          x="83"
          y="50.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.textColor}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="serif"
          opacity="0.85"
        >
          E
        </text>

        {/* O (Oeste) */}
        <text
          x="17"
          y="50.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill={colors.textColor}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="serif"
          opacity="0.85"
        >
          O
        </text>
      </svg>
    </div>
  );
};
