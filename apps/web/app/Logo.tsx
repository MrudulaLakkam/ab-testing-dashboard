'use client';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Flask Shape */}
          <defs>
            <linearGradient id="flaskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#A855F7', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Flask Top */}
          <path
            d="M 25 20 Q 15 20 15 30 Q 15 35 25 35 L 75 35 Q 85 35 85 30 Q 85 20 75 20 Z"
            fill="url(#flaskGradient)"
          />

          {/* Flask Neck */}
          <rect x="35" y="35" width="30" height="15" fill="url(#flaskGradient)" />

          {/* Flask Body */}
          <path
            d="M 30 50 Q 20 55 20 70 Q 20 85 35 88 L 65 88 Q 80 85 80 70 Q 80 55 70 50 Z"
            fill="url(#flaskGradient)"
          />

          {/* Chart Bars */}
          <g>
            {/* Bar 1 */}
            <rect x="32" y="68" width="8" height="10" fill="url(#flaskGradient)" rx="2" />
            {/* Bar 2 */}
            <rect x="44" y="62" width="8" height="16" fill="url(#flaskGradient)" rx="2" />
            {/* Bar 3 */}
            <rect x="56" y="56" width="8" height="22" fill="url(#flaskGradient)" rx="2" />
          </g>

          {/* Trend Arrow */}
          <path
            d="M 25 65 Q 40 50 60 45"
            stroke="url(#flaskGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 55 40 L 65 45 L 60 55"
            fill="url(#flaskGradient)"
          />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AB Test Pro
        </h1>
      </div>
    </div>
  );
}
