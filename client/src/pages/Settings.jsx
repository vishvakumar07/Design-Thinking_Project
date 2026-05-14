import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Bell, Shield, Zap, Eye } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { THRESHOLDS } from '../data/initialWorkers';

const SliderRow = ({ label, value, min, max, step = 0.1, unit, color, onChange }) => (
  <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: color || 'var(--neon-orange)', fontWeight: 700 }}>
        {value}{unit}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: color || 'var(--neon-orange)', cursor: 'pointer' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{min}{unit}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{max}{unit}</span>
    </div>
  </div>
);

const ToggleRow = ({ label, sub, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-primary)' }}>{label}</div>
      {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: value ? 'var(--safety-green)' : 'rgba(255,255,255,0.1)',
      border: 'none', cursor: 'pointer', position: 'relative',
      transition: 'background 0.25s', flexShrink: 0,
    }}>
      <motion.div animate={{ x: value ? 20 : 2 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff' }}
      />
    </button>
  </div>
);

const PanelCard = ({ title, icon: Icon, color = 'var(--neon-orange)', children }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', color: '#fff' }}>{title}</span>
    </div>
    {children}
  </motion.div>
);

const Settings = () => {
  const settings       = useAppStore(s => s.settings);
  const updateSettings = useAppStore(s => s.updateSettings);
  const [saved, setSaved] = useState(false);

  const T = settings.thresholds || THRESHOLDS;

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    updateSettings({ thresholds: THRESHOLDS, simSpeed: 3000, alertVolume: true, emergencySound: true, autoAcknowledge: false });
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>SETTINGS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Platform configuration · Alert thresholds · Simulation parameters
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={reset} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={save} className="btn-solid-orange" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={13} /> {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Simulation speed */}
        <PanelCard title="SIMULATION ENGINE" icon={Zap} delay={0}>
          <SliderRow label="Update Interval" value={settings.simSpeed / 1000} min={1} max={10} step={0.5} unit="s"
            onChange={v => updateSettings({ simSpeed: v * 1000 })} />
          <div style={{ padding: '10px 0', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Controls how frequently sensor data updates. Lower = more responsive, higher = lighter CPU load.
          </div>
        </PanelCard>

        {/* Notifications */}
        <PanelCard title="NOTIFICATIONS" icon={Bell} color="var(--electric-blue)" delay={0.05}>
          <ToggleRow label="Alert Volume" sub="Play sound on new critical alerts"
            value={settings.alertVolume} onChange={v => updateSettings({ alertVolume: v })} />
          <ToggleRow label="Emergency Sound" sub="Siren on emergency mode activation"
            value={settings.emergencySound} onChange={v => updateSettings({ emergencySound: v })} />
          <ToggleRow label="Auto-Acknowledge" sub="Auto-acknowledge low-severity alerts after 60s"
            value={settings.autoAcknowledge} onChange={v => updateSettings({ autoAcknowledge: v })} />
        </PanelCard>

        {/* Gas thresholds */}
        <PanelCard title="GAS THRESHOLDS" icon={Shield} color="var(--hazard-amber)" delay={0.1}>
          <SliderRow label="Methane Warning" value={T.methane.warning} min={0.5} max={4} step={0.1} unit=" ppm"
            color="var(--hazard-amber)" onChange={v => updateSettings({ thresholds: { ...T, methane: { ...T.methane, warning: v } } })} />
          <SliderRow label="Methane Critical" value={T.methane.critical} min={2} max={8} step={0.1} unit=" ppm"
            color="var(--emergency-red)" onChange={v => updateSettings({ thresholds: { ...T, methane: { ...T.methane, critical: v } } })} />
          <SliderRow label="CO Warning" value={T.co.warning} min={10} max={40} step={1} unit=" ppm"
            color="var(--hazard-amber)" onChange={v => updateSettings({ thresholds: { ...T, co: { ...T.co, warning: v } } })} />
          <SliderRow label="CO Critical" value={T.co.critical} min={30} max={70} step={1} unit=" ppm"
            color="var(--emergency-red)" onChange={v => updateSettings({ thresholds: { ...T, co: { ...T.co, critical: v } } })} />
        </PanelCard>

        {/* Biometric thresholds */}
        <PanelCard title="BIOMETRIC THRESHOLDS" icon={Eye} color="var(--safety-green)" delay={0.15}>
          <SliderRow label="O₂ Warning" value={T.oxygen.warning} min={90} max={98} step={0.1} unit="%"
            color="var(--hazard-amber)" onChange={v => updateSettings({ thresholds: { ...T, oxygen: { ...T.oxygen, warning: v } } })} />
          <SliderRow label="O₂ Critical" value={T.oxygen.critical} min={88} max={95} step={0.1} unit="%"
            color="var(--emergency-red)" onChange={v => updateSettings({ thresholds: { ...T, oxygen: { ...T.oxygen, critical: v } } })} />
          <SliderRow label="Heart Rate Warning" value={T.heartRate.warning} min={80} max={120} step={1} unit=" bpm"
            color="var(--hazard-amber)" onChange={v => updateSettings({ thresholds: { ...T, heartRate: { ...T.heartRate, warning: v } } })} />
          <SliderRow label="Body Temp Warning" value={T.bodyTemp.warning} min={37} max={39} step={0.1} unit="°C"
            color="var(--hazard-amber)" onChange={v => updateSettings({ thresholds: { ...T, bodyTemp: { ...T.bodyTemp, warning: v } } })} />
        </PanelCard>
      </div>

      {/* System info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 12 }}>SYSTEM INFORMATION</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            ['Platform', 'DEEPSHIELD v4.1.0'], ['Engine', 'Neural Sensor AI'],
            ['Workers Online', '12 / 12'], ['Data Store', 'LocalStorage'],
            ['Update Rate', `${settings.simSpeed / 1000}s intervals`], ['Status', 'FULLY OPERATIONAL'],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', marginBottom: 3 }}>{k}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
