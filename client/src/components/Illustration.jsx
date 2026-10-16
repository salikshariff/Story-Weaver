import { useMemo } from 'react';

import { BACKDROPS, SUBJECTS, PROPS, DEFAULT_BACKDROP } from '../data/illustrations.jsx';
import { composeScene } from '../lib/sceneMatcher.js';

/**
 * Renders one composed picture. Everything is local SVG — no network, no
 * image generation — so pages illustrate instantly as the reader turns them.
 */
export function Illustration({ scene, selectedWords, pageIndex }) {
  const spec = useMemo(
    () => composeScene({ scene, selectedWords, pageIndex }),
    [scene, selectedWords, pageIndex],
  );

  const backdrop = BACKDROPS[spec.backdropId] ?? BACKDROPS[DEFAULT_BACKDROP];
  const gradientId = `sky-${spec.backdropId}`;

  return (
    <svg
      className="illustration"
      viewBox="0 0 400 300"
      role="img"
      aria-label={scene ? `Illustration: ${scene}` : 'Story illustration'}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={backdrop.sky[0]} />
          <stop offset="100%" stopColor={backdrop.sky[1]} />
        </linearGradient>
        <clipPath id="frame">
          <rect x="0" y="0" width="400" height="300" rx="18" />
        </clipPath>
      </defs>

      <g clipPath="url(#frame)">
        <rect x="0" y="0" width="400" height="300" fill={`url(#${gradientId})`} />
        {backdrop.art}

        {spec.subjects.map((subject) => {
          const entry = SUBJECTS[subject.id];
          if (!entry) return null;
          return (
            <g
              key={subject.id}
              transform={`translate(${subject.x} ${subject.y}) scale(${subject.scale})`}
            >
              {entry.art}
            </g>
          );
        })}

        {spec.props.map((prop) => {
          const entry = PROPS[prop.id];
          if (!entry) return null;
          return (
            <g key={prop.id} transform={`translate(${prop.x} ${prop.y}) scale(${prop.scale})`}>
              {entry.art}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
