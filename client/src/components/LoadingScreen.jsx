import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SEQUENCE = [
  { text: 'DEEPSHIELD CORE v4.1.0', delay: 0 },
  { text: 'Initializing AI Threat Engine...', delay: 400 },
  { text: 'Loading Sensor Array [12/12]', delay: 900 },
  { text: 'Synchronizing Mine Network...', delay: 1400 },
  { text: 'AI Risk Model: ONLINE', delay: 1900 },
  { text: 'Emergency Protocols: ARMED', delay: 2300 },
  { text: '✓ ALL SYSTEMS OPERATIONAL', delay: 2700 },
];

const LoadingScreen = ({ onComplete }) => {
  const [lines,    setLines]    = useState([]);
  const [progress, setProgress] = useState(0);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    SEQUENCE.forEach(({ text, delay }) => {
      setTimeout(() => setLines(prev => [...prev, text]), delay);
    });
    const prog = setInterval(() => setProgress(p => Math.min(p + 2, 100)), 35);
    setTimeout(() => {
      clearInterval(prog);
      setDone(true);
      setTimeout(onComplete, 600);
    }, 3400);
    return () => clearInterval(prog);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'var(--bg-void)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 32,
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              letterSpacing: '0.18em',
              color: 'var(--neon-orange)',
              textShadow: '0 0 40px rgba(255,107,43,0.7), 0 0 80px rgba(255,107,43,0.3)',
              lineHeight: 1,
            }}>
              DEEP<span style={{ color: '#fff' }}>SHIELD</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--text-secondary)', letterSpacing: '0.3em',
              marginTop: 6, textTransform: 'uppercase',
            }}>
              Mine Safety Intelligence Platform
            </div>
          </motion.div>

          {/* Terminal lines */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,107,43,0.2)',
            borderRadius: 8,
            padding: '20px 28px',
            minWidth: 380,
            maxWidth: 480,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            lineHeight: 1.8,
          }}>
            {lines.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  color: l.startsWith('✓') ? 'var(--safety-green)' :
                         l.includes('AI') || l.includes('Emergency') ? 'var(--neon-orange)' :
                         'rgba(255,255,255,0.7)',
                }}
              >
                {!l.startsWith('✓') && <span style={{ color: 'var(--electric-blue)', marginRight: 8 }}>{'>'}</span>}
                {l}
              </motion.div>
            ))}
            {/* Cursor */}
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ color: 'var(--neon-orange)' }}
              >▋</motion.span>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ width: 380 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-secondary)', marginBottom: 6,
            }}>
              <span>SYSTEM BOOT</span>
              <span style={{ color: 'var(--neon-orange)' }}>{progress}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <motion.div
                className="progress-orange"
                style={{ height: '100%', borderRadius: 999 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
