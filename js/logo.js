/**
 * TravelFix - Custom Vector Logo Component
 * Renders an animated SVG mark featuring an orbital trajectory looping
 * through a geodesic destination compass beacon.
 */

export function getTravelFixLogoSvg(size = 40, showText = true) {
  return `
    <div class="travelfix-brand-container" style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
      <svg class="travelfix-logo-mark" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tf-cyan-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="50%" stop-color="#00f2fe" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
          <linearGradient id="tf-ring-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2" />
            <stop offset="50%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.9" />
          </linearGradient>
          <filter id="tf-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Outer Atmospheric Orbit Pulse -->
        <circle cx="50" cy="50" r="44" stroke="url(#tf-cyan-emerald)" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4" class="logo-orbit-ring" />

        <!-- Planetary Spherical Wireframe Grid -->
        <circle cx="50" cy="50" r="34" fill="#0b1329" stroke="#1e293b" stroke-width="2" />
        <ellipse cx="50" cy="50" rx="34" ry="14" stroke="#334155" stroke-width="1" stroke-dasharray="2 4" />
        <ellipse cx="50" cy="50" rx="14" ry="34" stroke="#334155" stroke-width="1" stroke-dasharray="2 4" />
        <line x1="16" y1="50" x2="84" y2="50" stroke="#334155" stroke-width="1" stroke-opacity="0.5" />

        <!-- Dynamic Tilted Orbital Flight Path (The "Fix" Loop) -->
        <ellipse cx="50" cy="50" rx="42" ry="18" stroke="url(#tf-ring-grad)" stroke-width="3" transform="rotate(-30 50 50)" filter="url(#tf-glow)" />

        <!-- Orbiting Fix Satellite / Compass Pulse -->
        <circle cx="78" cy="34" r="4.5" fill="#ffffff" filter="url(#tf-glow)" />
        <circle cx="78" cy="34" r="8" stroke="#38bdf8" stroke-width="1.5" opacity="0.75" class="logo-beacon-ping" />

        <!-- Central Pin Core (Destination Fix) -->
        <path d="M50 28 C43 28 38 33.5 38 41 C38 49 50 63 50 63 C50 63 62 49 62 41 C62 33.5 57 28 50 28 Z" fill="url(#tf-cyan-emerald)" filter="url(#tf-glow)" />
        <circle cx="50" cy="40" r="4.5" fill="#080c14" />
        <circle cx="50" cy="40" r="2" fill="#38bdf8" />
      </svg>
      ${showText ? `
        <div class="travelfix-brand-text">
          <span class="brand-travel">TRAVEL</span><span class="brand-fix">FIX</span>
          <span class="brand-tagline">EARTH DISCOVERY</span>
        </div>
      ` : ''}
    </div>
  `;
}
