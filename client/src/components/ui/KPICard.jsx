import React from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import AnimatedCounter from './AnimatedCounter';

const colorMap = {
  orange: { color: 'var(--neon-orange)', bg: 'rgba(255,107,43,0.08)', border: 'var(--border-orange)', glow: 'rgba(255,107,43,' },
  red:    { color: 'var(--emergency-red)', bg: 'rgba(255,31,31,0.08)', border: 'var(--border-red)',    glow: 'rgba(255,31,31,' },
  blue:   { color: 'var(--electric-blue)', bg: 'rgba(0,200,255,0.07)', border: 'var(--border-blue)',   glow: 'rgba(0,200,255,' },
  green:  { color: 'var(--safety-green)', bg: 'rgba(0,255,136,0.07)', border: 'var(--border-green)',   glow: 'rgba(0,255,136,' },
  amber:  { color: 'var(--hazard-amber)', bg: 'rgba(255,184,0,0.07)', border: 'rgba(255,184,0,0.35)', glow: 'rgba(255,184,0,' },
};

const KPICard = ({ title, value, unit = '', decimals = 0, accent = 'orange', icon: Icon, trend, sparkData, subtitle }) => {
  const c = colorMap[accent] || colorMap.orange;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 30px ${c.glow}0.15)` }}
      transition={{ duration: 0.25 }}
      style={{
        background: c.bg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      className="scan-sweep"
    >
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        borderRadius: '0 14px 0 80px',
        background: `radial-gradient(circle at top right, ${c.glow}0.12), transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: c.color, textShadow: `0 0 12px ${c.glow}0.5)`, lineHeight: 1 }}>
              <AnimatedCounter value={Number(value) || 0} decimals={decimals} />
            </span>
            {unit && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {subtitle}
            </div>
          )}
        </div>
        {Icon && (
          <div style={{
            padding: 10,
            background: `${c.glow}0.1)`,
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            color: c.color,
          }}>
            <Icon size={20} style={{ filter: `drop-shadow(0 0 6px ${c.color})` }} />
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && sparkData.length > 1 && (
        <div style={{ height: 40, marginTop: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${accent}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={c.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={c.color} strokeWidth={1.5}
                fill={`url(#grad-${accent})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: '0.65rem', color: trend >= 0 ? 'var(--safety-green)' : 'var(--emergency-red)' }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>vs last hour</span>
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
