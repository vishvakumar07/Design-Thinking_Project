import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';

const EmergencyOverlay = () => {
  const emergencyMode   = useAppStore(s => s.emergencyMode);
  const emergencyWorker = useAppStore(s => s.emergencyWorker);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (emergencyMode) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [emergencyMode]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Corner warning pulse strips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 8000,
              background: 'linear-gradient(135deg, rgba(255,31,31,0.12) 0%, transparent 50%, rgba(255,31,31,0.08) 100%)',
            }}
          />
          {/* Top emergency bar */}
          <motion.div
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            exit={{ y: -80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0,
              background: 'linear-gradient(90deg, #FF1F1F, #CC0000, #FF1F1F)',
              backgroundSize: '200% 100%',
              animation: 'border-spin 2s linear infinite',
              zIndex: 9000,
              padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 4px 40px rgba(255,31,31,0.8)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ fontSize: 22 }}
            >⚠️</motion.div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.15em', color: '#fff' }}>
              EMERGENCY ALERT — {emergencyWorker?.zone?.toUpperCase() || 'UNKNOWN ZONE'} — IMMEDIATE RESPONSE REQUIRED
            </span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
              style={{ fontSize: 22, marginLeft: 'auto' }}
            >🚨</motion.div>
          </motion.div>

          {/* Siren rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [0, 4], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: 'easeOut' }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 120, height: 120,
                borderRadius: '50%',
                border: '2px solid rgba(255,31,31,0.7)',
                pointerEvents: 'none', zIndex: 7999,
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyOverlay;
