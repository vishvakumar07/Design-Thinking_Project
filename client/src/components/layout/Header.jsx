import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Wifi, Shield, AlertTriangle, Activity } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--electric-blue)', letterSpacing: '0.1em' }}>
      {time.toLocaleTimeString('en-US', { hour12: false })}
      <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 8px' }}>|</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
        {time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    </div>
  );
};

const Header = () => {
  const alerts        = useAppStore(s => s.alerts);
  const emergencyMode = useAppStore(s => s.emergencyMode);
  const systemHealth  = useAppStore(s => s.systemHealth);
  const shaftStatus   = useAppStore(s => s.shaftStatus);
  const [showBell, setShowBell] = useState(false);
  const alertCount = alerts.filter(a => !a.resolved).length;

  useEffect(() => {
    if (alertCount > 0) { setShowBell(true); setTimeout(() => setShowBell(false), 300); }
  }, [alertCount]);

  return (
    <header style={{
      height: 56,
      background: 'rgba(7,7,16,0.98)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${emergencyMode ? 'rgba(255,31,31,0.35)' : 'rgba(255,255,255,0.06)'}`,
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      position: 'sticky', top: 0, zIndex: 200,
      transition: 'border-color 0.3s',
    }}>
      {/* Shaft status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
      }}>
        <Wifi size={12} color="var(--safety-green)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
          SHAFT STATUS:
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--safety-green)', letterSpacing: '0.1em' }}>
          {shaftStatus}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live clock */}
      <LiveClock />

      {/* System health */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 12px',
        background: 'rgba(0,255,136,0.06)',
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 6,
      }}>
        <Activity size={12} color="var(--safety-green)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--safety-green)' }}>
          SYS {systemHealth}%
        </span>
      </div>

      {/* Emergency indicator */}
      <AnimatePresence>
        {emergencyMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [1, 0.4, 1], scale: 1 }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: 'rgba(255,31,31,0.15)',
              border: '1px solid rgba(255,31,31,0.5)',
              borderRadius: 6,
            }}
          >
            <AlertTriangle size={12} color="var(--emergency-red)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--emergency-red)', letterSpacing: '0.15em' }}>
              EMERGENCY
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification bell */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={showBell ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 6, color: 'var(--text-secondary)',
        }}
      >
        <Bell size={18} />
        {alertCount > 0 && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16,
            background: 'var(--emergency-red)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', color: '#fff',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 0 8px rgba(255,31,31,0.6)',
          }}>
            {alertCount > 9 ? '9+' : alertCount}
          </div>
        )}
      </motion.button>

      {/* Shield icon */}
      <div style={{ color: emergencyMode ? 'var(--emergency-red)' : 'var(--neon-orange)' }}>
        <Shield size={18} style={{ filter: `drop-shadow(0 0 6px ${emergencyMode ? 'rgba(255,31,31,0.7)' : 'rgba(255,107,43,0.5)'})` }} />
      </div>
    </header>
  );
};

export default Header;
