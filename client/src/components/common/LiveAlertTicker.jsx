import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';

const LiveAlertTicker = () => {
  const alerts = useAppStore(s => s.alerts);
  const recent = alerts.filter(a => !a.resolved).slice(0, 10);

  if (recent.length === 0) return null;

  const items = [...recent, ...recent];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 32, zIndex: 900,
      background: 'rgba(3,3,5,0.95)',
      borderTop: '1px solid rgba(255,107,43,0.2)',
      display: 'flex', alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'linear-gradient(90deg, #FF6B2B, #FF4500)',
        padding: '0 12px',
        height: '100%',
        display: 'flex', alignItems: 'center',
        flexShrink: 0,
        zIndex: 1,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.15em', color: '#000' }}>
          LIVE ALERTS
        </span>
      </div>
      <div className="ticker-wrap" style={{ flex: 1 }}>
        <div className="ticker-track" style={{ display: 'inline-flex', gap: 48, paddingLeft: 24 }}>
          {items.map((a, i) => (
            <span key={`${a.id}-${i}`} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: a.severity === 'CRITICAL' ? 'var(--emergency-red)' :
                     a.severity === 'WARNING'  ? 'var(--hazard-amber)' : 'var(--electric-blue)',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <span>{a.icon || '⚠'}</span>
              <span>[{a.zone}]</span>
              <span>{a.message}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveAlertTicker;
