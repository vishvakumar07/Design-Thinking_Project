import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Wind, Thermometer, Droplets, MapPin, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import useAppStore from '../store/useAppStore';
import CircularGauge from '../components/ui/CircularGauge';

const statusCfg = {
  SAFE:     { color: 'var(--safety-green)',  border: 'rgba(0,255,136,0.25)', bg: 'rgba(0,255,136,0.05)' },
  WARNING:  { color: 'var(--hazard-amber)',  border: 'rgba(255,184,0,0.3)',  bg: 'rgba(255,184,0,0.05)' },
  CRITICAL: { color: 'var(--emergency-red)', border: 'rgba(255,31,31,0.45)', bg: 'rgba(255,31,31,0.07)' },
};

const InfoRow = ({ label, value, color }) => (
  <div className="data-row">
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: color || 'var(--text-primary)', fontWeight: 700 }}>{value}</span>
  </div>
);

const WorkerDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const worker   = useAppStore(s => s.workers.find(w => w.id === id));

  if (!worker) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
      Worker not found. <button onClick={() => navigate('/workers')} style={{ color: 'var(--neon-orange)', background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button>
    </div>
  );

  const cfg = statusCfg[worker.status] || statusCfg.SAFE;
  const { vitals, history, name, id: wid, role, zone, depth, avatar, riskScore, shiftStart, shiftHours } = worker;

  const chartData = (history || []).map((h, i) => ({ i, hr: h.heartRate, o2: h.oxygen, temp: h.bodyTemp, meth: h.methane }));

  const aiTips = riskScore > 70
    ? [`🚨 CRITICAL: Immediate evacuation from ${zone} recommended.`, `Methane at ${vitals.methane.toFixed(1)} ppm — above safe threshold.`, 'Dispatch medic team for biometric assessment.']
    : riskScore > 40
    ? [`⚠️ Elevated risk detected in ${zone}.`, `Monitor O₂ closely — current ${vitals.oxygen.toFixed(1)}%.`, 'Recommend 15-min rest period before resuming work.']
    : [`✅ ${name} is within safe operating parameters.`, 'No immediate action required.', 'Continue routine 3-second monitoring.'];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Back */}
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/workers')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={14} /> BACK TO WORKERS
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT: Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px 24px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, textAlign: 'center' }}>
            <motion.div
              animate={{ boxShadow: [`0 0 20px ${cfg.color}33`, `0 0 50px ${cfg.color}66`, `0 0 20px ${cfg.color}33`] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${cfg.color}33, ${cfg.color}11)`, border: `3px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: cfg.color }}
            >
              {avatar}
            </motion.div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>{name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{wid} · {role}</div>
            <div style={{ display: 'inline-flex', padding: '4px 14px', background: `${cfg.color}18`, border: `1px solid ${cfg.color}50`, borderRadius: 999, fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: cfg.color, letterSpacing: '0.1em' }}>
              {worker.status}
            </div>
          </motion.div>

          {/* Location info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--neon-orange)', marginBottom: 12 }}>LOCATION & SHIFT</div>
            <InfoRow label="ZONE"        value={zone} />
            <InfoRow label="DEPTH"       value={`${depth}m`} color="var(--electric-blue)" />
            <InfoRow label="SHIFT START" value={shiftStart} />
            <InfoRow label="HOURS"       value={`${shiftHours}h shift`} />
            <InfoRow label="RISK SCORE"  value={`${riskScore}%`} color={riskScore > 70 ? 'var(--emergency-red)' : riskScore > 40 ? 'var(--hazard-amber)' : 'var(--safety-green)'} />
          </motion.div>

          {/* AI Recs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ padding: '16px 20px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--electric-blue)', marginBottom: 12 }}>AI RECOMMENDATIONS</div>
            {aiTips.map((tip, i) => (
              <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: i < aiTips.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', lineHeight: 1.5 }}>
                {tip}
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT: Gauges + Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Live biometrics gauges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#fff', marginBottom: 20 }}>LIVE BIOMETRICS</div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
              <CircularGauge value={vitals.oxygen}    min={88}  max={100} size={100} strokeWidth={7} color="var(--electric-blue)" label="O₂ SAT"    unit="%" warning={95} critical={92} />
              <CircularGauge value={vitals.heartRate} min={50}  max={150} size={100} strokeWidth={7} color="var(--safety-green)"  label="HEART RATE" unit="bpm" critical={110} warning={90} />
              <CircularGauge value={vitals.bodyTemp}  min={36}  max={40}  size={100} strokeWidth={7} color="var(--hazard-amber)"  label="BODY TEMP"  unit="°C" />
              <CircularGauge value={vitals.methane}   min={0}   max={10}  size={100} strokeWidth={7} color="var(--neon-orange)"   label="METHANE"    unit="ppm" warning={2} critical={5} />
              <CircularGauge value={vitals.co}        min={0}   max={80}  size={100} strokeWidth={7} color="var(--emergency-red)" label="CO"         unit="ppm" warning={25} critical={50} />
              <CircularGauge value={vitals.humidity}  min={40}  max={100} size={100} strokeWidth={7} color="var(--electric-blue)" label="HUMIDITY"   unit="%" />
            </div>
          </motion.div>

          {/* History charts */}
          {chartData.length > 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#fff', marginBottom: 16 }}>HISTORICAL READINGS (Last 30 ticks)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'hr',   label: 'Heart Rate (bpm)', color: 'var(--safety-green)', fill: 'rgba(0,255,136,0.15)' },
                  { key: 'o2',   label: 'Oxygen (%)',       color: 'var(--electric-blue)', fill: 'rgba(0,200,255,0.15)' },
                  { key: 'temp', label: 'Temp (°C)',        color: 'var(--hazard-amber)',  fill: 'rgba(255,184,0,0.15)' },
                  { key: 'meth', label: 'Methane (ppm)',    color: 'var(--neon-orange)',   fill: 'rgba(255,107,43,0.15)' },
                ].map(({ key, label, color, fill }) => (
                  <div key={key}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: `1px solid ${color}40`, borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }} />
                        <Area type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} fill={`url(#g-${key})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerDetail;
