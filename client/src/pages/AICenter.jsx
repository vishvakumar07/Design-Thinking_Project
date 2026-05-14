import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Wind, Thermometer, Activity, AlertTriangle } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import CircularGauge from '../components/ui/CircularGauge';

const PREDICTIONS = (workers) => {
  const avgMeth  = workers.reduce((s, w) => s + w.vitals.methane, 0) / workers.length;
  const avgO2    = workers.reduce((s, w) => s + w.vitals.oxygen,  0) / workers.length;
  const avgTemp  = workers.reduce((s, w) => s + w.vitals.bodyTemp,0) / workers.length;
  const avgRisk  = workers.reduce((s, w) => s + w.riskScore,      0) / workers.length;
  const critCount = workers.filter(w => w.status === 'CRITICAL').length;

  return [
    {
      icon: Wind,
      title: 'Methane Escalation',
      zone: 'Zone D',
      prob: Math.min(98, Math.round(avgMeth * 12 + critCount * 8)),
      eta: '8–14 min',
      color: 'var(--neon-orange)',
      desc: `Methane trending upward at ${avgMeth.toFixed(2)} ppm avg. Zone D approaching critical threshold.`,
      confidence: 87,
    },
    {
      icon: Activity,
      title: 'Worker Fatigue Risk',
      zone: 'Zone C/D',
      prob: Math.min(95, Math.round(avgRisk * 0.9 + 15)),
      eta: '20–35 min',
      color: 'var(--hazard-amber)',
      desc: `Elevated heart rates combined with high humidity suggest fatigue accumulation in deep zones.`,
      confidence: 74,
    },
    {
      icon: Thermometer,
      title: 'Heat Stress Index',
      zone: 'Zone C',
      prob: Math.min(90, Math.round((avgTemp - 36.5) * 40 + 30)),
      eta: '15–25 min',
      color: 'var(--emergency-red)',
      desc: `Body temp trend at ${avgTemp.toFixed(1)}°C avg. Humidity compounding thermal load.`,
      confidence: 81,
    },
    {
      icon: AlertTriangle,
      title: 'O₂ Level Drop',
      zone: 'Zone D',
      prob: Math.min(88, Math.round((100 - avgO2) * 8 + 10)),
      eta: '18–30 min',
      color: 'var(--electric-blue)',
      desc: `Oxygen averaging ${avgO2.toFixed(1)}% — below optimal in Zone D deepest shafts.`,
      confidence: 69,
    },
  ];
};

const AI_MESSAGES = [
  'Neural hazard model running continuous inference on sensor array.',
  'Predictive analysis active — scanning for anomaly patterns.',
  'Environmental correlation model updated with latest readings.',
  'Worker fatigue algorithm processing biometric sequences.',
];

const AICenter = () => {
  const workers = useAppStore(s => s.workers);
  const preds   = useMemo(() => PREDICTIONS(workers), [workers]);
  const [msgIdx, setMsgIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % AI_MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const overallRisk = Math.round(workers.reduce((s, w) => s + w.riskScore, 0) / workers.length);

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>AI PREDICTION CENTER</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          DEEPSHIELD Neural Engine v4.1 · Predictive hazard analysis · Real-time inference
        </div>
      </motion.div>

      {/* AI status bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ padding: '12px 20px', background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}
        className="scan-sweep"
      >
        <Brain size={18} color="var(--electric-blue)" style={{ filter: 'drop-shadow(0 0 6px var(--electric-blue))' }} />
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--electric-blue)', flex: 1 }}
        >
          {AI_MESSAGES[msgIdx]}
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pulse-dot pulse-dot-green" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--safety-green)' }}>AI ONLINE</span>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Overall risk gauge */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#fff', marginBottom: 20 }}>MINE RISK SCORE</div>
          <CircularGauge
            value={overallRisk} min={0} max={100} size={140} strokeWidth={10}
            color={overallRisk > 70 ? 'var(--emergency-red)' : overallRisk > 40 ? 'var(--hazard-amber)' : 'var(--safety-green)'}
            label="OVERALL RISK" unit="%"
          />
          <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Based on {workers.length} active sensors across 4 zones.
            AI confidence: <span style={{ color: 'var(--electric-blue)' }}>87%</span>
          </div>
        </motion.div>

        {/* Prediction cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {preds.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
              style={{ padding: '18px 20px', background: `${p.color}08`, border: `1px solid ${p.color}30`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${p.color}18`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <p.icon size={18} color={p.color} style={{ filter: `drop-shadow(0 0 4px ${p.color})` }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#fff', letterSpacing: '0.06em' }}>{p.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {p.zone} · ETA: {p.eta}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: p.color, lineHeight: 1 }}>{p.prob}%</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-secondary)' }}>PROBABILITY</div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                {p.desc}
              </div>

              {/* Probability bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)' }}>AI CONFIDENCE: {p.confidence}%</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: p.color }}>HAZARD PROBABILITY: {p.prob}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', height: 5, borderRadius: 999 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.prob}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${p.color}80, ${p.color})`, borderRadius: 999 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AICenter;
