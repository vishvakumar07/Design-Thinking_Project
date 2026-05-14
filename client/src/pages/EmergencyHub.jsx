import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Phone, Shield, Send } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const EmergencyHub = () => {
  const workers          = useAppStore(s => s.workers);
  const emergencyMode    = useAppStore(s => s.emergencyMode);
  const emergencyWorker  = useAppStore(s => s.emergencyWorker);
  const emergencyStart   = useAppStore(s => s.emergencyStartTime);
  const rescueDispatched = useAppStore(s => s.rescueDispatched);
  const rescueETA        = useAppStore(s => s.rescueETA);
  const logs             = useAppStore(s => s.logs);
  const triggerEmergency = useAppStore(s => s.triggerEmergency);
  const resolveEmergency = useAppStore(s => s.resolveEmergency);
  const dispatchRescue   = useAppStore(s => s.dispatchRescue);
  const addLog           = useAppStore(s => s.addLog);

  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding]           = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [etaLeft, setEtaLeft]           = useState(0);
  const holdRef  = useRef(null);
  const timerRef = useRef(null);

  // Hold-to-trigger SOS
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
        const critW = workers.find(w => w.status === 'CRITICAL') || workers[0];
        triggerEmergency(critW);
      }
    }, 50);
  };
  const endHold = () => {
    clearInterval(holdRef.current);
    setHolding(false);
    setHoldProgress(0);
  };

  // Elapsed timer
  useEffect(() => {
    if (!emergencyMode || !emergencyStart) return;
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - emergencyStart) / 1000)), 1000);
    return () => clearInterval(timerRef.current);
  }, [emergencyMode, emergencyStart]);

  // ETA countdown
  useEffect(() => {
    if (!rescueETA) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((rescueETA - Date.now()) / 1000));
      setEtaLeft(left);
    }, 1000);
    return () => clearInterval(t);
  }, [rescueETA]);

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const critWorkers = workers.filter(w => w.status === 'CRITICAL');

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: emergencyMode ? 'var(--emergency-red)' : '#fff' }}>
          EMERGENCY HUB
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          SOS response system · Rescue dispatch · Emergency protocols
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT: SOS + Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* SOS Button */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{ padding: '32px 24px', background: emergencyMode ? 'rgba(255,31,31,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${emergencyMode ? 'rgba(255,31,31,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: 24 }}>
              {emergencyMode ? '⚠ EMERGENCY IN PROGRESS' : 'HOLD 3 SECONDS TO TRIGGER SOS'}
            </div>

            {/* Giant SOS button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                {/* Pulse rings */}
                {emergencyMode && [1, 2, 3].map(i => (
                  <motion.div key={i}
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--emergency-red)' }}
                  />
                ))}

                {/* Hold progress ring */}
                {holding && (
                  <svg style={{ position: 'absolute', inset: -6, width: 172, height: 172 }}>
                    <circle cx={86} cy={86} r={80} fill="none" stroke="rgba(255,31,31,0.3)" strokeWidth={4} />
                    <circle cx={86} cy={86} r={80} fill="none" stroke="var(--emergency-red)" strokeWidth={4}
                      strokeDasharray={`${(holdProgress / 100) * 502} 502`}
                      strokeLinecap="round"
                      transform="rotate(-90 86 86)"
                      style={{ filter: 'drop-shadow(0 0 8px var(--emergency-red))' }}
                    />
                  </svg>
                )}

                <button
                  className="btn-emergency"
                  onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
                  onTouchStart={startHold} onTouchEnd={endHold}
                  style={{ width: 160, height: 160, fontSize: 'clamp(2rem, 4vw, 2.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  SOS
                </button>
              </div>
            </div>

            {emergencyMode && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--emergency-red)', marginBottom: 16 }}>
                🚨 EMERGENCY ACTIVE · {fmtTime(elapsed)} elapsed
                {emergencyWorker && <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Worker: {emergencyWorker.name} · {emergencyWorker.zone}</div>}
              </motion.div>
            )}

            {/* Action buttons */}
            {emergencyMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!rescueDispatched && (
                  <button onClick={dispatchRescue} style={{ background: 'linear-gradient(90deg, rgba(255,107,43,0.2), rgba(255,107,43,0.1))', border: '1px solid rgba(255,107,43,0.5)', color: 'var(--neon-orange)', padding: '10px 20px', borderRadius: 8, fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Send size={14} /> DISPATCH RESCUE TEAM
                  </button>
                )}
                {rescueDispatched && etaLeft > 0 && (
                  <div style={{ padding: '10px', background: 'rgba(255,107,43,0.08)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--neon-orange)', textAlign: 'center' }}>
                    🚁 RESCUE ETA: {fmtTime(etaLeft)}
                  </div>
                )}
                <button onClick={() => addLog({ type: 'CALL', message: `📞 Voice contact attempted with ${emergencyWorker?.name}`, severity: 'INFO' })}
                  style={{ background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.3)', color: 'var(--electric-blue)', padding: '10px', borderRadius: 8, fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Phone size={14} /> CALL WORKER
                </button>
                <button onClick={resolveEmergency}
                  style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--safety-green)', padding: '10px', borderRadius: 8, fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CheckCircle size={14} /> MARK RESOLVED
                </button>
              </div>
            )}
          </motion.div>

          {/* Critical workers */}
          {critWorkers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ padding: '16px', background: 'rgba(255,31,31,0.06)', border: '1px solid rgba(255,31,31,0.25)', borderRadius: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--emergency-red)', letterSpacing: '0.1em', marginBottom: 10 }}>
                CRITICAL WORKERS ({critWorkers.length})
              </div>
              {critWorkers.map(w => (
                <div key={w.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#fff' }}>{w.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--emergency-red)' }}>CRITICAL</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {w.zone} · O₂: {w.vitals.oxygen.toFixed(1)}% · HR: {Math.round(w.vitals.heartRate)} bpm
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* RIGHT: Live Logs */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse-dot pulse-dot-green" />
            LIVE EMERGENCY LOG
          </div>
          <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AnimatePresence>
              {logs.slice(0, 30).map(log => (
                <motion.div key={log.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, borderLeft: `2px solid ${log.severity === 'CRITICAL' ? 'var(--emergency-red)' : log.severity === 'WARNING' ? 'var(--hazard-amber)' : 'rgba(255,255,255,0.2)'}` }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', marginBottom: 3 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: log.severity === 'CRITICAL' ? 'var(--emergency-red)' : log.severity === 'WARNING' ? 'var(--hazard-amber)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                    {log.message}
                  </div>
                </motion.div>
              ))}
              {logs.length === 0 && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>
                  No emergency events recorded.<br />System monitoring active.
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyHub;
