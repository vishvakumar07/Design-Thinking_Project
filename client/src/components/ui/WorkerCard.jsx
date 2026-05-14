import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Wind, Thermometer, Droplets, Clock, MapPin } from 'lucide-react';
import CircularGauge from './CircularGauge';

const statusConfig = {
  SAFE:     { color: 'var(--safety-green)',  bg: 'rgba(0,255,136,0.05)',  border: 'rgba(0,255,136,0.2)',  glow: 'rgba(0,255,136,0.1)',  pulse: '#00FF88' },
  WARNING:  { color: 'var(--hazard-amber)',  bg: 'rgba(255,184,0,0.06)',  border: 'rgba(255,184,0,0.25)', glow: 'rgba(255,184,0,0.1)',  pulse: '#FFB800' },
  CRITICAL: { color: 'var(--emergency-red)', bg: 'rgba(255,31,31,0.08)',  border: 'rgba(255,31,31,0.4)',  glow: 'rgba(255,31,31,0.15)', pulse: '#FF1F1F' },
};

const timeSince = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
};

const Vitals = ({ icon: Icon, label, value, unit, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
    <Icon size={11} color={color || 'var(--text-secondary)'} />
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: color || 'var(--text-primary)', fontWeight: 700 }}>
      {value}{unit}
    </span>
  </div>
);

const WorkerCard = ({ worker }) => {
  const navigate = useNavigate();
  const cfg = statusConfig[worker.status] || statusConfig.SAFE;
  const { vitals, id, name, role, zone, depth, avatar, riskScore, lastPing } = worker;

  const isCritical = worker.status === 'CRITICAL';

  return (
    <motion.div
      layout
      whileHover={{ y: -4, boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 40px ${cfg.glow}` }}
      whileTap={{ scale: 0.98 }}
      animate={isCritical ? { boxShadow: [`0 0 0 1px ${cfg.border}`, `0 0 0 2px ${cfg.border}, 0 0 30px ${cfg.glow}`, `0 0 0 1px ${cfg.border}`] } : {}}
      transition={isCritical ? { duration: 0.9, repeat: Infinity } : { duration: 0.25 }}
      onClick={() => navigate(`/workers/${id}`)}
      style={{
        background: cfg.bg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Status aura */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: `linear-gradient(135deg, ${cfg.color}33, ${cfg.color}11)`,
          border: `2px solid ${cfg.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '0.9rem',
          color: cfg.color, flexShrink: 0,
          boxShadow: `0 0 12px ${cfg.glow}`,
          position: 'relative',
        }}>
          {avatar}
          {/* Heartbeat pulse ring */}
          {isCritical && (
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              style={{
                position: 'absolute', inset: -4,
                borderRadius: '50%',
                border: `1px solid ${cfg.color}`,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {id} · {role}
          </div>
        </div>
        {/* Status badge */}
        <div style={{
          padding: '3px 8px', borderRadius: 4,
          background: `${cfg.color}18`,
          border: `1px solid ${cfg.color}50`,
          fontFamily: 'var(--font-display)', fontSize: '0.6rem',
          color: cfg.color, letterSpacing: '0.08em',
          flexShrink: 0,
        }}>
          {worker.status}
        </div>
      </div>

      {/* O2 gauge + vitals */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <CircularGauge
          value={vitals.oxygen} min={88} max={100} size={68} strokeWidth={5}
          color="var(--electric-blue)" label="O₂" unit="%"
          warning={95} critical={92}
        />
        <div style={{ flex: 1 }}>
          <Vitals icon={Heart}       label="Heart" value={Math.round(vitals.heartRate)} unit=" bpm"
            color={vitals.heartRate > 100 ? 'var(--emergency-red)' : vitals.heartRate > 90 ? 'var(--hazard-amber)' : 'var(--safety-green)'} />
          <Vitals icon={Thermometer} label="Temp"  value={vitals.bodyTemp.toFixed(1)}  unit="°C"
            color={vitals.bodyTemp > 38 ? 'var(--emergency-red)' : vitals.bodyTemp > 37.5 ? 'var(--hazard-amber)' : 'var(--text-primary)'} />
          <Vitals icon={Wind}        label="CH₄"   value={vitals.methane.toFixed(1)}   unit=" ppm"
            color={vitals.methane > 5 ? 'var(--emergency-red)' : vitals.methane > 2 ? 'var(--hazard-amber)' : 'var(--text-primary)'} />
          <Vitals icon={Droplets}    label="Humid"  value={Math.round(vitals.humidity)} unit="%" />
        </div>
      </div>

      {/* Risk bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)' }}>RISK SCORE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: cfg.color }}>{riskScore}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-bar ${riskScore > 70 ? 'progress-red' : riskScore > 40 ? 'progress-amber' : 'progress-green'}`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={10} color="var(--text-secondary)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)' }}>
            {zone} · {depth}m
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className={`pulse-dot pulse-dot-${worker.status === 'SAFE' ? 'green' : worker.status === 'WARNING' ? 'amber' : 'red'}`} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)' }}>
            {timeSince(lastPing)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkerCard;
