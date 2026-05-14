import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import useAppStore from '../store/useAppStore';

const ZONE_COLORS = { 'Zone A': '#00FF88', 'Zone B': '#FFB800', 'Zone C': '#FF6B2B', 'Zone D': '#FF1F1F' };

const Analytics = () => {
  const workers = useAppStore(s => s.workers);
  const alerts  = useAppStore(s => s.alerts);

  const zoneStats = useMemo(() => {
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    return zones.map(z => {
      const zw = workers.filter(w => w.zone === z);
      const avgRisk = zw.length ? zw.reduce((s, w) => s + w.riskScore, 0) / zw.length : 0;
      const critCount = zw.filter(w => w.status === 'CRITICAL').length;
      const alertCount = alerts.filter(a => a.zone === z && !a.resolved).length;
      return { zone: z, workers: zw.length, avgRisk: Math.round(avgRisk), critical: critCount, alerts: alertCount };
    });
  }, [workers, alerts]);

  const severityDist = useMemo(() => [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'CRITICAL').length, color: 'var(--emergency-red)' },
    { name: 'Warning',  value: alerts.filter(a => a.severity === 'WARNING').length,  color: 'var(--hazard-amber)' },
    { name: 'Info',     value: alerts.filter(a => a.severity === 'INFO').length,      color: 'var(--electric-blue)' },
  ].filter(x => x.value > 0), [alerts]);

  const workerRisk = [...workers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8)
    .map(w => ({ name: w.name.split(' ')[0], risk: w.riskScore, fill: w.riskScore > 70 ? '#FF1F1F' : w.riskScore > 40 ? '#FFB800' : '#00FF88' }));

  const trendData = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => {
      const base = Math.max(0, alerts.length - 12 + i);
      return { h: `${i}h`, incidents: Math.floor(Math.random() * 5 + base * 0.1), resolved: Math.floor(Math.random() * 4) };
    });
    return hours;
  }, [alerts.length]);

  const tooltipStyle = { background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' };

  const SectionTitle = ({ title, sub }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.08em', color: '#fff' }}>{title}</div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', marginTop: 3 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>ANALYTICS CENTER</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Incident trends · Zone heatmap · Worker risk leaderboard · Alert distribution
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Incident trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
          <SectionTitle title="INCIDENT TRENDS" sub="Last 12 time periods" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--emergency-red)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--emergency-red)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--safety-green)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--safety-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="h" tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="incidents" stroke="var(--emergency-red)" strokeWidth={2} fill="url(#gi)" dot={false} name="Incidents" />
              <Area type="monotone" dataKey="resolved"  stroke="var(--safety-green)"  strokeWidth={2} fill="url(#gr)"  dot={false} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Alert distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
          <SectionTitle title="ALERT DISTRIBUTION" sub="By severity level" />
          {severityDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={severityDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {severityDist.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              No alerts generated yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Worker risk leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 20 }}>
        <SectionTitle title="WORKER RISK LEADERBOARD" sub="Top 8 by current risk score — highest risk first" />
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={workerRisk} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={60} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
              {workerRisk.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Zone heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
        <SectionTitle title="ZONE SAFETY HEATMAP" sub="Current status by zone" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {zoneStats.map(z => {
            const c = ZONE_COLORS[z.zone];
            const dangerPct = z.avgRisk;
            return (
              <div key={z.zone} style={{ padding: '16px', background: `${c}10`, border: `1px solid ${c}30`, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: c, letterSpacing: '0.1em', marginBottom: 8 }}>{z.zone}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: c, marginBottom: 4 }}>{dangerPct}%</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-secondary)', marginBottom: 8 }}>AVG RISK</div>
                <div className="progress-track" style={{ marginBottom: 8 }}>
                  <div style={{ width: `${dangerPct}%`, height: '100%', background: c, borderRadius: 999, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                  {z.workers} workers · {z.alerts} alerts · {z.critical} critical
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
