import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Minimize2, Shield, Activity, AlertTriangle, Users, Wind, Thermometer } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ParticleCanvas from '../components/effects/ParticleCanvas';
import CircularGauge from '../components/ui/CircularGauge';

const LiveClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
      <div style={{ fontSize: '2.8rem', color: 'var(--electric-blue)', letterSpacing: '0.08em', textShadow: '0 0 20px rgba(0,200,255,0.5)', lineHeight: 1 }}>
        {t.toLocaleTimeString('en-US', { hour12: false })}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 4 }}>
        {t.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
};

const MiniWorkerRow = ({ worker }) => {
  const c = worker.status === 'SAFE' ? 'var(--safety-green)' : worker.status === 'WARNING' ? 'var(--hazard-amber)' : 'var(--emergency-red)';
  return (
    <motion.div layout
      animate={worker.status === 'CRITICAL' ? { borderColor: ['rgba(255,31,31,0.2)', 'rgba(255,31,31,0.6)', 'rgba(255,31,31,0.2)'] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: `1px solid ${c}25`, marginBottom: 4 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${c}18`, border: `1px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: c, flexShrink: 0 }}>
        {worker.avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{worker.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{worker.zone} · {worker.depth}m</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--electric-blue)' }}>{worker.vitals.oxygen.toFixed(0)}%</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: c, padding: '1px 5px', background: `${c}15`, borderRadius: 3 }}>{worker.status}</span>
      </div>
    </motion.div>
  );
};

const CommandCenter = () => {
  const navigate       = useNavigate();
  const workers        = useAppStore(s => s.workers);
  const alerts         = useAppStore(s => s.alerts);
  const emergencyMode  = useAppStore(s => s.emergencyMode);
  const [panelIdx, setPanelIdx] = useState(0);

  // Auto-rotate right panel every 8s
  useEffect(() => {
    const id = setInterval(() => setPanelIdx(p => (p + 1) % 3), 8000);
    return () => clearInterval(id);
  }, []);

  const activeAlerts  = alerts.filter(a => !a.resolved);
  const critWorkers   = workers.filter(w => w.status === 'CRITICAL');
  const warnWorkers   = workers.filter(w => w.status === 'WARNING');
  const avgO2         = workers.reduce((s, w) => s + w.vitals.oxygen, 0) / workers.length;
  const avgTemp       = workers.reduce((s, w) => s + w.vitals.bodyTemp, 0) / workers.length;
  const avgMeth       = workers.reduce((s, w) => s + w.vitals.methane, 0) / workers.length;
  const avgRisk       = workers.reduce((s, w) => s + w.riskScore, 0) / workers.length;

  const trendData = workers[0]?.history?.map((h, i) => ({ i, o2: h.oxygen, hr: h.heartRate })) || [];

  const rightPanels = [
    {
      label: 'O₂ & VITALS',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
            <CircularGauge value={avgO2} min={88} max={100} size={90} strokeWidth={7} color="var(--electric-blue)" label="AVG O₂" unit="%" warning={95} critical={92} />
            <CircularGauge value={avgTemp} min={36} max={40} size={90} strokeWidth={7} color="var(--hazard-amber)" label="AVG TEMP" unit="°C" />
            <CircularGauge value={avgMeth} min={0} max={10} size={90} strokeWidth={7} color="var(--neon-orange)" label="AVG CH₄" unit="ppm" warning={2} critical={5} />
          </div>
          {trendData.length > 2 && (
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="cco2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--electric-blue)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--electric-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis hide /> <YAxis hide />
                <Area type="monotone" dataKey="o2" stroke="var(--electric-blue)" strokeWidth={1.5} fill="url(#cco2)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      ),
    },
    {
      label: 'ZONE STATUS',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map(zone => {
            const zw = workers.filter(w => w.zone === zone);
            const crit = zw.filter(w => w.status === 'CRITICAL').length;
            const warn = zw.filter(w => w.status === 'WARNING').length;
            const zRisk = zw.length ? Math.round(zw.reduce((s, w) => s + w.riskScore, 0) / zw.length) : 0;
            const c = crit > 0 ? 'var(--emergency-red)' : warn > 0 ? 'var(--hazard-amber)' : 'var(--safety-green)';
            return (
              <div key={zone} style={{ padding: '10px 14px', background: `${c}10`, border: `1px solid ${c}30`, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: c, letterSpacing: '0.08em' }}>{zone}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: c }}>RISK {zRisk}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: 4, borderRadius: 999 }}>
                  <div style={{ width: `${zRisk}%`, height: '100%', background: c, borderRadius: 999, transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {zw.length} workers · {crit} critical · {warn} warning
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      label: 'ACTIVE ALERTS',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
          {activeAlerts.slice(0, 10).map(a => (
            <div key={a.id} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderLeft: `2px solid ${a.severity === 'CRITICAL' ? 'var(--emergency-red)' : 'var(--hazard-amber)'}`, borderRadius: '0 6px 6px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', color: a.severity === 'CRITICAL' ? 'var(--emergency-red)' : 'var(--hazard-amber)', letterSpacing: '0.08em', marginBottom: 2 }}>{a.severity} · {a.type}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.message}</div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--safety-green)' }}>✅ All clear — no active alerts</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleCanvas count={50} emergency={emergencyMode} />
      <div className="scanlines" />

      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,107,43,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', padding: '10px 24px', borderBottom: `1px solid ${emergencyMode ? 'rgba(255,31,31,0.3)' : 'rgba(255,255,255,0.06)'}`, background: 'rgba(3,3,5,0.95)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.15em', color: 'var(--neon-orange)' }}>
          DEEP<span style={{ color: '#fff' }}>SHIELD</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)', marginLeft: 12, letterSpacing: '0.15em' }}>COMMAND CENTER</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {emergencyMode && (
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.7, repeat: Infinity }}
              style={{ padding: '4px 20px', background: 'rgba(255,31,31,0.15)', border: '1px solid rgba(255,31,31,0.5)', borderRadius: 4, fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--emergency-red)', letterSpacing: '0.2em' }}>
              ⚠ EMERGENCY ACTIVE
            </motion.div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* KPI pills */}
          {[
            { label: 'WORKERS', val: workers.length, c: 'var(--electric-blue)' },
            { label: 'CRITICAL', val: critWorkers.length, c: critWorkers.length > 0 ? 'var(--emergency-red)' : 'var(--text-secondary)' },
            { label: 'ALERTS', val: activeAlerts.length, c: activeAlerts.length > 0 ? 'var(--hazard-amber)' : 'var(--text-secondary)' },
          ].map(({ label, val, c }) => (
            <div key={label} style={{ padding: '3px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: c }}>{val}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.48rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{label}</div>
            </div>
          ))}
          <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem' }}>
            <Minimize2 size={12} /> Exit
          </button>
        </div>
      </div>

      {/* 3-column body */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: 0, overflow: 'hidden' }}>

        {/* LEFT: Worker list */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '14px 12px', overflowY: 'auto', background: 'rgba(7,7,16,0.6)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--neon-orange)', marginBottom: 10, paddingLeft: 4 }}>
            WORKER ROSTER
          </div>
          {[...workers].sort((a, b) => ['CRITICAL', 'WARNING', 'SAFE'].indexOf(a.status) - ['CRITICAL', 'WARNING', 'SAFE'].indexOf(b.status))
            .map(w => <MiniWorkerRow key={w.id} worker={w} />)}
        </div>

        {/* CENTER: Main status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: 24 }}>
          <LiveClock />

          {/* Center gauges */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            <CircularGauge value={avgO2} min={88} max={100} size={110} strokeWidth={8} color="var(--electric-blue)" label="AVG O₂" unit="%" warning={95} critical={92} />
            <CircularGauge value={Math.round(avgRisk)} min={0} max={100} size={130} strokeWidth={10}
              color={avgRisk > 70 ? 'var(--emergency-red)' : avgRisk > 40 ? 'var(--hazard-amber)' : 'var(--safety-green)'}
              label="MINE RISK" unit="%" />
            <CircularGauge value={avgMeth} min={0} max={10} size={110} strokeWidth={8} color="var(--neon-orange)" label="AVG CH₄" unit="ppm" warning={2} critical={5} />
          </div>

          {/* Status summary */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'SAFE', count: workers.filter(w => w.status === 'SAFE').length, color: 'var(--safety-green)' },
              { label: 'WARNING', count: warnWorkers.length, color: 'var(--hazard-amber)' },
              { label: 'CRITICAL', count: critWorkers.length, color: 'var(--emergency-red)' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ padding: '12px 24px', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10, textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color, letterSpacing: '0.12em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Mine shaft depth visual */}
          <div style={{ width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.12em' }}>
              SHAFT DEPTH MONITOR
            </div>
            {['Zone A ▸ -120m', 'Zone B ▸ -180m', 'Zone C ▸ -240m', 'Zone D ▸ -300m'].map((label, i) => {
              const zone = `Zone ${['A','B','C','D'][i]}`;
              const zw = workers.filter(w => w.zone === zone);
              const crit = zw.some(w => w.status === 'CRITICAL');
              const warn = zw.some(w => w.status === 'WARNING');
              const lc = crit ? 'var(--emergency-red)' : warn ? 'var(--hazard-amber)' : 'var(--safety-green)';
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: `${20 + i * 20}%`, height: 3, background: `linear-gradient(90deg, ${lc}40, ${lc})`, borderRadius: 999 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: lc, whiteSpace: 'nowrap' }}>{label}</span>
                  <div className={`pulse-dot pulse-dot-${crit ? 'red' : warn ? 'amber' : 'green'}`} style={{ marginLeft: 'auto' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Rotating panels */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '14px 14px', background: 'rgba(7,7,16,0.6)', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {/* Panel tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {rightPanels.map((p, i) => (
              <button key={i} onClick={() => setPanelIdx(i)} style={{
                flex: 1, padding: '4px 0', borderRadius: 4,
                background: panelIdx === i ? 'rgba(255,107,43,0.15)' : 'transparent',
                border: `1px solid ${panelIdx === i ? 'rgba(255,107,43,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: panelIdx === i ? 'var(--neon-orange)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', fontSize: '0.48rem', cursor: 'pointer', letterSpacing: '0.05em',
              }}>{p.label}</button>
            ))}
          </div>

          {/* Panel content */}
          <AnimatePresence mode="wait">
            <motion.div key={panelIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {rightPanels[panelIdx].content}
            </motion.div>
          </AnimatePresence>

          {/* Shift info at bottom */}
          <div style={{ marginTop: 'auto', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: 6 }}>SHIFT STATUS</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-primary)' }}>Day Shift · 06:00 – 14:00</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-primary)', marginTop: 3 }}>Night Shift · 22:00 – 06:00</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <div className="pulse-dot pulse-dot-green" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--safety-green)' }}>DEEPSHIELD OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
