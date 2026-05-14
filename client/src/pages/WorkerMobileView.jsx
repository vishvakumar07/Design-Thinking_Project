import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Wind, Thermometer, Droplets, CheckCircle, Wifi, WifiOff, Activity } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const SAFETY_TIPS = [
  '🪖 Always wear your helmet and safety harness.',
  '💨 If you smell gas, evacuate and report immediately.',
  '🫁 Check your oxygen sensor every 10 minutes.',
  '📡 Stay within communication range at all times.',
  '🌡️ Report if body temperature exceeds 38°C.',
  '🚨 In emergency, hold SOS button for 3 seconds.',
];

const WorkerMobileView = () => {
  const workers       = useAppStore(s => s.workers);
  const triggerEmergency = useAppStore(s => s.triggerEmergency);
  const addLog        = useAppStore(s => s.addLog);

  // For demo, use worker W-001 or let user pick
  const [selectedId, setSelectedId] = useState('W-001');
  const worker = workers.find(w => w.id === selectedId) || workers[0];

  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding]   = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [offline, setOffline]   = useState(false);
  const [tipIdx, setTipIdx]     = useState(0);
  const holdRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % SAFETY_TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const startHold = () => {
    setHolding(true);
    const start = Date.now();
    holdRef.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 3000) * 100);
      setHoldProgress(p);
      if (p >= 100) {
        clearInterval(holdRef.current);
        setHolding(false);
        setHoldProgress(0);
        triggerEmergency(worker);
        addLog({ type: 'SOS', message: `🆘 Worker SOS triggered by ${worker.name} from mobile view.`, severity: 'CRITICAL' });
      }
    }, 50);
  };
  const endHold = () => {
    clearInterval(holdRef.current);
    setHolding(false);
    setHoldProgress(0);
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    addLog({ type: 'CHECK_IN', message: `✅ ${worker.name} checked in from mobile. All vitals nominal.`, severity: 'INFO' });
    setTimeout(() => setCheckedIn(false), 4000);
  };

  if (!worker) return null;

  const { vitals, name, id, zone, depth, avatar, status, riskScore } = worker;
  const statusColor = status === 'SAFE' ? 'var(--safety-green)' : status === 'WARNING' ? 'var(--hazard-amber)' : 'var(--emergency-red)';

  const VitalBlock = ({ icon: Icon, label, value, unit, color }) => (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
      <Icon size={22} color={color || 'var(--text-secondary)'} style={{ marginBottom: 8 }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: color || 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: color || 'var(--text-secondary)', marginTop: 2 }}>{unit}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {/* Scanlines */}
      <div className="scanlines" />

      {/* Header */}
      <div style={{ background: 'rgba(7,7,16,0.98)', borderBottom: '1px solid rgba(255,107,43,0.2)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.12em', color: 'var(--neon-orange)' }}>DEEPSHIELD</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-secondary)', letterSpacing: '0.15em' }}>WORKER SAFETY TERMINAL</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setOffline(!offline)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: offline ? 'var(--hazard-amber)' : 'var(--safety-green)' }}>
            {offline ? <WifiOff size={18} /> : <Wifi size={18} />}
          </button>
          {offline && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--hazard-amber)' }}>OFFLINE</span>}
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 30 }}>
        {/* Worker selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {workers.slice(0, 6).map(w => (
            <button key={w.id} onClick={() => setSelectedId(w.id)} style={{
              padding: '5px 10px', borderRadius: 6, flexShrink: 0,
              background: selectedId === w.id ? 'rgba(255,107,43,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedId === w.id ? 'rgba(255,107,43,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: selectedId === w.id ? 'var(--neon-orange)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', cursor: 'pointer',
            }}>{w.avatar}</button>
          ))}
        </div>

        {/* Worker ID card */}
        <motion.div layout
          style={{ padding: '20px', background: `${statusColor}08`, border: `1px solid ${statusColor}30`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${statusColor}18`, border: `2px solid ${statusColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: statusColor, flexShrink: 0 }}>
            {avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: 2 }}>{id} · {zone} · {depth}m</div>
            <div style={{ marginTop: 6, display: 'inline-flex', padding: '3px 10px', background: `${statusColor}18`, border: `1px solid ${statusColor}40`, borderRadius: 999, fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: statusColor, letterSpacing: '0.1em' }}>
              {status}
            </div>
          </div>
        </motion.div>

        {/* Vitals grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <VitalBlock icon={Heart}       label="Heart Rate" value={Math.round(vitals.heartRate)} unit="bpm"
            color={vitals.heartRate > 100 ? 'var(--emergency-red)' : vitals.heartRate > 90 ? 'var(--hazard-amber)' : 'var(--safety-green)'} />
          <VitalBlock icon={Activity}    label="Oxygen Sat" value={vitals.oxygen.toFixed(1)}    unit="%"
            color={vitals.oxygen < 92 ? 'var(--emergency-red)' : vitals.oxygen < 95 ? 'var(--hazard-amber)' : 'var(--electric-blue)'} />
          <VitalBlock icon={Thermometer} label="Body Temp"  value={vitals.bodyTemp.toFixed(1)}  unit="°C"
            color={vitals.bodyTemp > 38 ? 'var(--emergency-red)' : vitals.bodyTemp > 37.5 ? 'var(--hazard-amber)' : 'var(--text-primary)'} />
          <VitalBlock icon={Wind}        label="Methane"    value={vitals.methane.toFixed(1)}    unit="ppm"
            color={vitals.methane > 5 ? 'var(--emergency-red)' : vitals.methane > 2 ? 'var(--hazard-amber)' : 'var(--text-primary)'} />
        </div>

        {/* Risk bar */}
        <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>PERSONAL RISK SCORE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: riskScore > 70 ? 'var(--emergency-red)' : riskScore > 40 ? 'var(--hazard-amber)' : 'var(--safety-green)' }}>{riskScore}%</span>
          </div>
          <div className="progress-track" style={{ height: 8 }}>
            <div className={`progress-bar ${riskScore > 70 ? 'progress-red' : riskScore > 40 ? 'progress-amber' : 'progress-green'}`} style={{ width: `${riskScore}%` }} />
          </div>
        </div>

        {/* Safety tip */}
        <AnimatePresence mode="wait">
          <motion.div key={tipIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ padding: '12px 16px', background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: 10 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--electric-blue)', letterSpacing: '0.1em', marginBottom: 5 }}>SAFETY TIP</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{SAFETY_TIPS[tipIdx]}</div>
          </motion.div>
        </AnimatePresence>

        {/* Check-in button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCheckIn}
          style={{
            padding: '14px', borderRadius: 12,
            background: checkedIn ? 'rgba(0,255,136,0.15)' : 'rgba(0,200,255,0.08)',
            border: `1px solid ${checkedIn ? 'rgba(0,255,136,0.4)' : 'rgba(0,200,255,0.3)'}`,
            color: checkedIn ? 'var(--safety-green)' : 'var(--electric-blue)',
            fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.12em',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.3s',
          }}>
          <CheckCircle size={18} />
          {checkedIn ? '✓ CHECKED IN — CONFIRMED' : 'TAP TO CHECK IN'}
        </motion.button>

        {/* SOS button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', textAlign: 'center' }}>
            HOLD 3 SECONDS TO TRIGGER EMERGENCY SOS
          </div>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            {/* SVG progress ring */}
            {holding && (
              <svg style={{ position: 'absolute', inset: -8, width: 156, height: 156 }}>
                <circle cx={78} cy={78} r={74} fill="none" stroke="rgba(255,31,31,0.2)" strokeWidth={5} />
                <circle cx={78} cy={78} r={74} fill="none" stroke="var(--emergency-red)" strokeWidth={5}
                  strokeDasharray={`${(holdProgress / 100) * 465} 465`}
                  strokeLinecap="round"
                  transform="rotate(-90 78 78)"
                  style={{ filter: 'drop-shadow(0 0 8px var(--emergency-red))' }}
                />
              </svg>
            )}
            <button className="btn-emergency"
              onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
              onTouchStart={startHold} onTouchEnd={endHold}
              style={{ width: 140, height: 140, fontSize: '2rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              SOS
            </button>
          </div>
          {holding && (
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--emergency-red)' }}>
              SENDING SOS... {Math.round(holdProgress)}%
            </motion.div>
          )}
        </div>

        {/* Offline mode indicator */}
        {offline && (
          <div style={{ padding: '10px 14px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--hazard-amber)', letterSpacing: '0.1em' }}>⚡ OFFLINE MODE</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              Data cached locally. Reconnecting when signal restored.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerMobileView;
