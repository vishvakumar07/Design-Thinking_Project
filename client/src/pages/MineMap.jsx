import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';

const ZONES = [
  { id: 'A', label: 'Zone A', depth: -120, x: 15, y: 10, w: 35, h: 25, color: '#00FF88' },
  { id: 'B', label: 'Zone B', depth: -180, x: 55, y: 10, w: 35, h: 25, color: '#FFB800' },
  { id: 'C', label: 'Zone C', depth: -240, x: 15, y: 45, w: 35, h: 30, color: '#FF6B2B' },
  { id: 'D', label: 'Zone D', depth: -300, x: 55, y: 45, w: 35, h: 30, color: '#FF1F1F' },
];

const MineMap = () => {
  const workers     = useAppStore(s => s.workers);
  const emergencyMode = useAppStore(s => s.emergencyMode);
  const [selected, setSelected] = useState(null);

  const zoneWorkers = (zoneLabel) => workers.filter(w => w.zone === zoneLabel);
  const zoneDanger  = (zoneLabel) => {
    const zw = zoneWorkers(zoneLabel);
    if (!zw.length) return 'SAFE';
    if (zw.some(w => w.status === 'CRITICAL')) return 'CRITICAL';
    if (zw.some(w => w.status === 'WARNING'))  return 'WARNING';
    return 'SAFE';
  };

  const dangerColor = { SAFE: '#00FF88', WARNING: '#FFB800', CRITICAL: '#FF1F1F' };

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>3D MINE MAP</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Isometric shaft visualization · Live worker positions · Environmental overlays
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Map viewport */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}
        >
          {/* Depth gradient background */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,200,255,0.05) 0%, rgba(255,107,43,0.08) 50%, rgba(255,31,31,0.12) 100%)' }} />

          {/* Radar sweep */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 300, height: 300, marginLeft: -150, marginTop: -150, borderRadius: '50%', border: '1px solid rgba(0,200,255,0.1)', overflow: 'hidden' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 0deg, rgba(0,200,255,0.15) 0deg, transparent 60deg)', transformOrigin: 'center' }}
            />
          </div>

          {/* SVG map */}
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            {/* Grid lines */}
            {[20, 40, 60, 80].map(x => (
              <line key={`vl${x}`} x1={x} y1="0" x2={x} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            ))}
            {[20, 40, 60, 80].map(y => (
              <line key={`hl${y}`} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            ))}

            {/* Tunnel connections */}
            <line x1="32" y1="22" x2="55" y2="22" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="32" y1="22" x2="32" y2="45" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="72" y1="22" x2="72" y2="45" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2,2" />

            {/* Zones */}
            {ZONES.map(zone => {
              const danger = zoneDanger(zone.label);
              const dc     = dangerColor[danger];
              const zw     = zoneWorkers(zone.label);
              const isSelected = selected === zone.id;
              return (
                <g key={zone.id} onClick={() => setSelected(isSelected ? null : zone.id)} style={{ cursor: 'pointer' }}>
                  {/* Zone rect */}
                  <rect
                    x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="2"
                    fill={`${dc}12`}
                    stroke={dc}
                    strokeWidth={isSelected ? 1 : 0.5}
                    opacity={isSelected ? 1 : 0.8}
                  />
                  {/* Label */}
                  <text x={zone.x + zone.w / 2} y={zone.y + 6} textAnchor="middle" fill={dc} fontSize="3.5" fontFamily="var(--font-display)" letterSpacing="0.5">{zone.label}</text>
                  <text x={zone.x + zone.w / 2} y={zone.y + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="2.5" fontFamily="monospace">{zone.depth}m</text>

                  {/* Worker dots */}
                  {zw.map((w, i) => {
                    const wc = w.status === 'CRITICAL' ? '#FF1F1F' : w.status === 'WARNING' ? '#FFB800' : '#00FF88';
                    const wx = zone.x + 4 + (i % 4) * 7;
                    const wy = zone.y + 14 + Math.floor(i / 4) * 7;
                    return (
                      <g key={w.id}>
                        <circle cx={wx} cy={wy} r="2.5" fill={wc} opacity={0.9} />
                        {w.status === 'CRITICAL' && (
                          <circle cx={wx} cy={wy} r="4" fill="none" stroke={wc} strokeWidth="0.5" opacity={0.5}>
                            <animate attributeName="r" values="2.5;5;2.5" dur="1.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Gas/Heat overlays */}
                  {danger === 'CRITICAL' && (
                    <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="2" fill="rgba(255,31,31,0.12)">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}
                </g>
              );
            })}

            {/* Depth scale on right */}
            {[-120, -180, -240, -300].map((d, i) => (
              <text key={d} x="97" y={22 + i * 27} textAnchor="end" fill="rgba(0,200,255,0.5)" fontSize="2.5" fontFamily="monospace">{d}m</text>
            ))}
          </svg>

          {/* Emergency scan overlay */}
          {emergencyMode && (
            <motion.div
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(255,31,31,0.08)', pointerEvents: 'none' }}
            />
          )}
        </motion.div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Legend */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#fff', marginBottom: 12 }}>MAP LEGEND</div>
            {[['#00FF88','Safe zone — all nominal'], ['#FFB800','Warning — elevated readings'], ['#FF1F1F','Critical — immediate action']].map(([c, l]) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c, boxShadow: `0 0 6px ${c}` }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{l}</span>
              </div>
            ))}
          </motion.div>

          {/* Zone panels */}
          {ZONES.map((zone, i) => {
            const danger = zoneDanger(zone.label);
            const dc     = dangerColor[danger];
            const zw     = zoneWorkers(zone.label);
            return (
              <motion.div key={zone.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                onClick={() => setSelected(selected === zone.id ? null : zone.id)}
                style={{
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                  background: selected === zone.id ? `${dc}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected === zone.id ? dc + '50' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: dc, letterSpacing: '0.08em' }}>{zone.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: dc, padding: '2px 6px', background: `${dc}18`, borderRadius: 4 }}>{danger}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                  Depth: {zone.depth}m · {zw.length} workers
                </div>
                {selected === zone.id && zw.length > 0 && (
                  <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    {zw.map(w => (
                      <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{w.name}</span>
                        <span style={{ color: w.status === 'SAFE' ? 'var(--safety-green)' : w.status === 'WARNING' ? 'var(--hazard-amber)' : 'var(--emergency-red)' }}>{w.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MineMap;
