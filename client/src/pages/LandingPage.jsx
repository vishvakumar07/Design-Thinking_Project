import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, Zap, Eye, ChevronRight } from 'lucide-react';
import ParticleCanvas from '../components/effects/ParticleCanvas';

const STATS = [
  { label: 'Active Sensors',  value: '2,847', color: 'var(--electric-blue)' },
  { label: 'Workers Protected', value: '12',   color: 'var(--safety-green)' },
  { label: 'AI Predictions',  value: '99.4%',  color: 'var(--neon-orange)' },
  { label: 'Response Time',   value: '< 2s',   color: 'var(--hazard-amber)' },
];

const FEATURES = [
  { icon: Activity, title: 'Real-Time Biometrics', desc: 'Live heart rate, O₂, temperature monitoring with millisecond precision via IoT sensor mesh.', color: 'var(--electric-blue)' },
  { icon: AlertTriangle, title: 'AI Hazard Prediction', desc: 'Neural models predict gas leaks, heat stress, and tunnel instability 15–30 minutes in advance.', color: 'var(--hazard-amber)' },
  { icon: Zap, title: 'Instant Emergency Response', desc: 'Sub-2-second SOS detection triggers automated rescue dispatch and evacuation routing.', color: 'var(--emergency-red)' },
  { icon: Eye, title: '3D Mine Visualization', desc: 'Isometric mine map with live worker positions, heat zones, and gas spread overlays.', color: 'var(--safety-green)' },
];

const TunnelSVG = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="tunnel" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#FF6B2B" stopOpacity="0.08" />
        <stop offset="40%"  stopColor="#00C8FF" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#030305"  stopOpacity="0.9" />
      </radialGradient>
      <linearGradient id="rail" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="rgba(255,107,43,0)" />
        <stop offset="50%"  stopColor="rgba(255,107,43,0.4)" />
        <stop offset="100%" stopColor="rgba(255,107,43,0)" />
      </linearGradient>
    </defs>
    {/* Tunnel rings */}
    {[1, 0.85, 0.7, 0.55, 0.4, 0.28, 0.18].map((s, i) => (
      <ellipse key={i} cx="400" cy="200" rx={380 * s} ry={190 * s}
        fill="none" stroke={`rgba(255,107,43,${0.06 - i * 0.005})`} strokeWidth={1.5} />
    ))}
    {/* Floor rails */}
    <line x1="0" y1="380" x2="800" y2="380" stroke="url(#rail)" strokeWidth="2" />
    <line x1="120" y1="370" x2="680" y2="370" stroke="url(#rail)" strokeWidth="1" />
    {/* Center glow */}
    <ellipse cx="400" cy="200" rx="60" ry="40" fill="url(#tunnel)" />
    {/* Ambient fill */}
    <rect width="800" height="400" fill="url(#tunnel)" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', position: 'relative', overflow: 'hidden' }}>
      <div className="scanlines" />
      <ParticleCanvas count={100} />

      {/* Ambient radial glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,107,43,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>
        {/* Tunnel background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><TunnelSVG /></div>

        {/* Logo badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 999, marginBottom: 24 }}>
          <Shield size={14} color="var(--neon-orange)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--neon-orange)', letterSpacing: '0.2em' }}>DEEPSHIELD v4.1 · OPERATIONAL</span>
          <div className="pulse-dot pulse-dot-green" />
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 7vw, 6rem)', lineHeight: 1.05, letterSpacing: '0.04em', color: '#fff', maxWidth: 860, marginBottom: 20 }}>
          AI-POWERED SAFETY <br />
          <span style={{ color: 'var(--neon-orange)', textShadow: '0 0 40px rgba(255,107,43,0.5)' }}>INTELLIGENCE</span>
          {' '}FOR MODERN<br />MINING OPERATIONS
        </motion.h1>

        {/* Sub */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 40, lineHeight: 1.7 }}>
          Protect workers. Predict hazards. Respond instantly.
          Real-time underground monitoring powered by neural AI.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
          <button className="btn-solid-orange" onClick={() => navigate('/dashboard')} style={{ padding: '14px 28px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Launch Dashboard</span><ChevronRight size={16} />
          </button>
          <button className="btn-neon" onClick={() => navigate('/command-center')} style={{ padding: '14px 28px', fontSize: '0.85rem' }}>
            <span>Command Center</span>
          </button>
          <button className="btn-ghost" onClick={() => navigate('/emergency')} style={{ padding: '14px 28px', fontSize: '0.85rem', borderColor: 'rgba(255,31,31,0.3)', color: 'var(--emergency-red)' }}>
            Emergency Demo
          </button>
        </motion.div>

        {/* Floating stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: '12px 24px', margin: 4,
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: s.color, textShadow: `0 0 10px ${s.color}` }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--neon-orange)', letterSpacing: '0.25em', marginBottom: 12 }}>PLATFORM CAPABILITIES</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff', letterSpacing: '0.06em' }}>
            BUILT FOR THE UNDERGROUND
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                padding: '28px 24px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                position: 'relative', overflow: 'hidden',
              }}
              className="scan-sweep"
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}18`, border: `1px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={22} color={f.color} style={{ filter: `drop-shadow(0 0 6px ${f.color})` }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fff', letterSpacing: '0.06em', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 20px 100px' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', color: '#fff', letterSpacing: '0.08em', marginBottom: 12 }}>
            READY TO PROTECT YOUR CREW?
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
            Deploy DEEPSHIELD and monitor every worker in real time.
          </div>
          <button className="btn-solid-orange" onClick={() => navigate('/dashboard')} style={{ padding: '16px 36px', fontSize: '1rem' }}>
            Enter Mission Control →
          </button>
        </motion.div>
        {/* Bottom gradient */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg-void))', pointerEvents: 'none' }} />
      </section>
    </div>
  );
};

export default LandingPage;
