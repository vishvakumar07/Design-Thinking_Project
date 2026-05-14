import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const TYPES = ['All', 'Heat', 'Toxic Gas', 'Oxygen Drop', 'SOS', 'Heart Rate Spike', 'Communication Loss'];
const SEVS  = ['All', 'CRITICAL', 'WARNING', 'INFO'];

const severityColor = {
  CRITICAL: 'var(--emergency-red)',
  WARNING:  'var(--hazard-amber)',
  INFO:     'var(--electric-blue)',
};

const relTime = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return new Date(ts).toLocaleTimeString();
};

const AlertsPage = () => {
  const alerts           = useAppStore(s => s.alerts);
  const acknowledgeAlert = useAppStore(s => s.acknowledgeAlert);
  const resolveAlert     = useAppStore(s => s.resolveAlert);
  const [search, setSearch] = useState('');
  const [type,   setType]   = useState('All');
  const [sev,    setSev]    = useState('All');
  const [showResolved, setShowResolved] = useState(false);

  const filtered = alerts.filter(a => {
    if (!showResolved && a.resolved) return false;
    if (type !== 'All' && a.type !== type) return false;
    if (sev  !== 'All' && a.severity !== sev) return false;
    if (search && !a.message.toLowerCase().includes(search.toLowerCase()) && !(a.workerName || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active   = alerts.filter(a => !a.resolved).length;
  const critical = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>ALERT CENTER</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {active} active · {critical} critical · Live feed updates every 3s
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['Active', active, 'var(--emergency-red)'], ['Acknowledged', alerts.filter(a => a.acknowledged && !a.resolved).length, 'var(--hazard-amber)'], ['Resolved', alerts.filter(a => a.resolved).length, 'var(--safety-green)']].map(([l, v, c]) => (
            <div key={l} style={{ padding: '8px 16px', background: `${c}12`, border: `1px solid ${c}35`, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.58rem', color: 'var(--text-secondary)' }}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 240 }}>
          <Search size={12} color="var(--text-secondary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '6px 10px 6px 28px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.75rem', outline: 'none' }} />
        </div>
        {SEVS.map(s => (
          <button key={s} onClick={() => setSev(s)} style={{
            padding: '5px 11px', borderRadius: 6,
            background: sev === s ? `${severityColor[s] || 'var(--neon-orange)'}18` : 'transparent',
            border: `1px solid ${sev === s ? (severityColor[s] || 'var(--neon-orange)') + '50' : 'rgba(255,255,255,0.08)'}`,
            color: sev === s ? (severityColor[s] || 'var(--neon-orange)') : 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', cursor: 'pointer', letterSpacing: '0.05em',
          }}>{s}</button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} style={{ accentColor: 'var(--neon-orange)' }} />
          Show resolved
        </label>
      </motion.div>

      {/* Alert feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence mode="popLayout">
          {filtered.slice(0, 80).map(alert => {
            const c = severityColor[alert.severity] || 'var(--electric-blue)';
            return (
              <motion.div key={alert.id} layout
                initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, x: 20, height: 0 }}
                style={{
                  background: alert.resolved ? 'rgba(255,255,255,0.02)' : `${c}08`,
                  border: `1px solid ${alert.resolved ? 'rgba(255,255,255,0.06)' : c + '35'}`,
                  borderLeft: `3px solid ${alert.resolved ? 'rgba(255,255,255,0.15)' : c}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  opacity: alert.resolved ? 0.5 : 1,
                  animation: alert.severity === 'CRITICAL' && !alert.acknowledged ? `badge-flash 1.2s ease-in-out infinite` : 'none',
                }}
              >
                <div style={{ fontSize: 20, flexShrink: 0 }}>{alert.icon || '⚠️'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: c, letterSpacing: '0.1em' }}>{alert.severity}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)' }}>{alert.type}</span>
                    {alert.zone && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>{alert.zone}</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: alert.resolved ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.4 }}>{alert.message}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {relTime(alert.timestamp)}</div>
                    {alert.acknowledged && <div style={{ color: 'var(--hazard-amber)', marginTop: 2 }}>ACK'd</div>}
                  </div>
                  {!alert.resolved && (
                    <>
                      {!alert.acknowledged && (
                        <button onClick={() => acknowledgeAlert(alert.id)}
                          style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)', color: 'var(--hazard-amber)', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', cursor: 'pointer' }}>
                          ACK
                        </button>
                      )}
                      <button onClick={() => resolveAlert(alert.id)}
                        style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', color: 'var(--safety-green)', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', cursor: 'pointer' }}>
                        RESOLVE
                      </button>
                    </>
                  )}
                  {alert.resolved && <CheckCircle size={16} color="var(--safety-green)" />}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              {alerts.length === 0 ? '✅ No alerts generated yet — system is monitoring.' : 'No alerts match filters.'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsPage;
