import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-8', size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill="none"
      aria-label="LiquiMind"
    >
      <defs>
        {/* Dynamic brand gradients that use var(--brand-primary) and dark contrasting core */}
        <linearGradient id="liquiGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-primary, #c4f24e)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--brand-primary, #c4f24e)" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="liquiWave" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--brand-primary, #c4f24e)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--brand-primary, #c4f24e)" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Rounded futuristic Squircle base */}
      <rect
        x="6"
        y="6"
        width="108"
        height="108"
        rx="30"
        className="fill-neutral-900 dark:fill-[#121215] stroke-neutral-800 dark:stroke-neutral-800/80"
        strokeWidth="2.5"
      />

      {/* Neural Liquid Streams (Mind Synapses + Liquidity Flow) */}
      <path
        d="M32 68 C 32 46, 46 32, 60 22 C 74 32, 88 46, 88 68 C 88 84, 76 96, 60 96 C 44 96, 32 84, 32 68 Z"
        fill="url(#liquiGlow)"
        className="opacity-95"
      />

      {/* Liquid Wave Ripple inside the drop */}
      <path
        d="M36 68 C 44 60, 52 74, 60 67 C 68 60, 76 72, 84 66 C 87 76, 78 92, 60 92 C 43 92, 35 78, 36 68 Z"
        fill="#101011"
        className="opacity-45"
      />

      {/* Intelligent Mind Neural Pulse Nodes */}
      <circle cx="60" cy="46" r="4.5" fill="#101011" />
      <circle cx="48" cy="62" r="3.5" fill="#101011" />
      <circle cx="72" cy="62" r="3.5" fill="#101011" />
      <circle cx="60" cy="76" r="3.5" fill="#101011" />

      {/* Synapse links */}
      <line x1="60" y1="46" x2="48" y2="62" stroke="#101011" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="60" y1="46" x2="72" y2="62" stroke="#101011" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="48" y1="62" x2="60" y2="76" stroke="#101011" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="72" y1="62" x2="60" y2="76" stroke="#101011" strokeWidth="2.2" strokeLinecap="round" />

      {/* Outer energy arc */}
      <path
        d="M26 38 C 34 24, 50 16, 70 16"
        stroke="var(--brand-primary, #c4f24e)"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="opacity-80"
      />
    </svg>
  );
};
