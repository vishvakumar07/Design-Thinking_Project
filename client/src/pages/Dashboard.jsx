import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Thermometer, Droplets, Wind, AlertTriangle, Shield, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import KPICard from '../components/ui/KPICard';
import WorkerCard from '../components/ui/WorkerCard';

const avg = (arr, fn) => arr.length ? arr.reduce((s, x) => s + fn(x), 0) / arr.length : 0;
const buildSpark = (arr, fn) => arr.slice(-10).map((x, i) => ({ v: fn(x), i }));

const Dashboard = () => {
  const workers     = useAppStore(s => s.workers);
  const alerts      = useAppStore(s => s.alerts);
  const emergencyMode = useAppStore(s => s.emergencyMode);
  const navigate    = useNavigate();

  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const critCount    = workers.filter(w => w.status === 'CRITICAL').length;
  const warnCount    = workers.filter(w => w.status === 'WARNING').length;
  const safeCount    = workers.filter(w => w.status === 'SAFE').length;

  const avgTemp   = avg(workers, w => w.vitals.bodyTemp);
  const avgHumid  = avg(workers, w => w.vitals.humidity);
  const avgO2     = avg(workers, w => w.vitals.oxygen);
  const avgMeth   = avg(workers, w => w.vitals.methane);
  const safetyIdx = useMemo(() => Math.max(0, 100 - avg(workers, w => w.riskScore)).toFixed(0), [workers]);

  // Spark data from first worker's history
  const firstW = workers[0];
  const o2Spark   = firstW?.history?.length ? buildSpark(firstW.history, h => h.oxygen)   : [];
  const tempSpark = firstW?.history?.length ? buildSpark(firstW.history, h => h.bodyTemp) : [];

  const KPIs = [
    { title: 'Active Workers',  value: workers.length, unit: '',     accent: 'blue',  icon: Users,          subtitle: `${safeCount} safe · ${warnCount} warn · ${critCount} critical` },
    { title: 'Avg Temperature', value: avgTemp,        unit: '°C',   decimals: 1, accent: 'amber', icon: Thermometer, sparkData: tempSpark },
    { title: 'Avg Humidity',    value: avgHumid,       unit: '%',    decimals: 0, accent: 'blue',  icon: Droplets },
    { title: 'Oxygen Level',    value: avgO2,          unit: '%',    decimals: 1, accent: avgO2 < 95 ? 'red' : 'green', icon: Activity, sparkData: o2Spark },
    { title: 'Methane (avg)',   value: avgMeth,        unit: 'ppm',  decimals: 1, accent: avgMeth > 3 ? 'red' : avgMeth > 2 ? 'amber' : 'green', icon: Wind },
    { title: 'Safety Index',    value: safetyIdx,      unit: '%',    decimals: 0, accent: Number(safetyIdx) > 70 ? 'green' : 'red', icon: Shield },
    { title: 'Active Alerts',   value: activeAlerts,   unit: '',     accent: activeAlerts > 0 ? 'red' : 'green', icon: AlertTriangle, subtitle: activeAlerts > 0 ? 'Immediate attention required' : 'All clear' },
    { title: 'Emergency Status',value: emergencyMode ? 1 : 0, unit: '', accent: emergencyMode ? 'red' : 'green', icon: Zap, subtitle: emergencyMode ? '⚠ CRISIS MODE ACTIVE' : 'Systems nominal' },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>
          OPERATIONS DASHBOARD
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          DEEPSHIELD · Real-time mine safety intelligence · Auto-refreshing every 3s
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
        {KPIs.map((k, i) => (
          <motion.div key={k.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <KPICard {...k} />
          </motion.div>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.08em', color: '#fff' }}>LIVE WORKER GRID</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {workers.length} workers monitored · Click any card to view profile
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['SAFE', safeCount, 'var(--safety-green)'], ['WARN', warnCount, 'var(--hazard-amber)'], ['CRIT', critCount, 'var(--emergency-red)']].map(([l, v, c]) => (
            <div key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ color: c }}>{v}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, paddingBottom: 20 }}>
        {workers.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
            <WorkerCard worker={w} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
