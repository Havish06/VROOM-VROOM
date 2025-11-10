import React from 'react';

interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  icon: React.ReactNode;
}

const Gauge: React.FC<GaugeProps> = ({ value, maxValue, label, unit, icon }) => {
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const angle = percentage * 270 - 135; // 270 degrees arc, starts at -135

  const endX = 50 + 40 * Math.cos((angle * Math.PI) / 180);
  const endY = 50 + 40 * Math.sin((angle * Math.PI) / 180);

  const largeArcFlag = percentage > 0.5 ? 1 : 0;

  const pathData = `M ${50 + 40 * Math.cos((-135 * Math.PI) / 180)} ${50 + 40 * Math.sin((-135 * Math.PI) / 180)} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  const displayValue = unit === 'Kbps' ? value.toFixed(0) : value.toFixed(value < 10 ? 2 : 1);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-dark/50 rounded-2xl w-full h-full text-center">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <h3 className="font-semibold text-lg">{label}</h3>
      </div>
      <div className="relative w-48 h-32 mt-2">
        <svg viewBox="0 0 100 65" className="w-full h-full">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d={pathData}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#89CFF3" />
              <stop offset="100%" stopColor="#00A9FF" />
            </linearGradient>
          </defs>
          <g transform={`rotate(${angle} 50 50)`} style={{ transition: 'transform 0.5s ease' }}>
             <line x1="50" y1="50" x2="80" y2="50" stroke="#A0E9FF" strokeWidth="2" strokeLinecap="round" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#A0E9FF" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className="text-3xl font-bold text-white tracking-tighter">
            {displayValue}
          </span>
          <span className="text-lg text-gray-400 ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default Gauge;
