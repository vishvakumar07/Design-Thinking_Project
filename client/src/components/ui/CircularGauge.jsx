import React, { useRef, useEffect, useState } from 'react';

const CircularGauge = ({
  value = 0,
  min = 0,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = 'var(--neon-orange)',
  label = '',
  unit = '%',
  warning,
  critical,
  animate = true,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circ   = 2 * Math.PI * radius;
  const pct    = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const dash   = pct * circ;

  const [displayVal, setDisplayVal] = useState(min);
  useEffect(() => {
    if (!animate) { setDisplayVal(value); return; }
    let start = null;
    const from = displayVal;
    const to   = value;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 600, 1);
      setDisplayVal(from + (to - from) * p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  const isCritical = critical !== undefined && value <= critical;
  const isWarning  = warning  !== undefined && value <= warning && !isCritical;
  const activeColor = isCritical ? 'var(--emergency-red)' :
                      isWarning  ? 'var(--hazard-amber)' : color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Value arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${activeColor})`,
              transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s',
            }}
          />
        </svg>
        {/* Center value */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: size > 70 ? '0.85rem' : '0.7rem',
            fontWeight: 700,
            color: activeColor,
            textShadow: `0 0 8px ${activeColor}`,
            lineHeight: 1,
          }}>
            {typeof displayVal === 'number' ? displayVal.toFixed(displayVal % 1 === 0 ? 0 : 1) : displayVal}
          </span>
          {unit && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-secondary)', marginTop: 1 }}>
              {unit}
            </span>
          )}
        </div>
      </div>
      {label && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textAlign: 'center', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default CircularGauge;
