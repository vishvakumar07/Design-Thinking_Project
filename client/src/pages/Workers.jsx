import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import WorkerCard from '../components/ui/WorkerCard';

const ZONES    = ['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
const STATUSES = ['All', 'SAFE', 'WARNING', 'CRITICAL'];

const Workers = () => {
  const workers = useAppStore(s => s.workers);
  const [search, setSearch]   = useState('');
  const [zone, setZone]       = useState('All');
  const [status, setStatus]   = useState('All');
  const [sortBy, setSortBy]   = useState('risk');

  const filtered = workers
    .filter(w => {
      const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
                          w.id.toLowerCase().includes(search.toLowerCase());
      const matchZone   = zone   === 'All' || w.zone   === zone;
      const matchStatus = status === 'All' || w.status === status;
      return matchSearch && matchZone && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'risk')   return b.riskScore - a.riskScore;
      if (sortBy === 'name')   return a.name.localeCompare(b.name);
      if (sortBy === 'status') return ['CRITICAL','WARNING','SAFE'].indexOf(a.status) - ['CRITICAL','WARNING','SAFE'].indexOf(b.status);
      return 0;
    });

  const TabBtn = ({ val, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 6,
      background: active ? 'rgba(255,107,43,0.15)' : 'transparent',
      border: `1px solid ${active ? 'rgba(255,107,43,0.4)' : 'rgba(255,255,255,0.08)'}`,
      color: active ? 'var(--neon-orange)' : 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
      cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.2s',
    }}>{val}</button>
  );

  return (
    <div style={{ padding: '24px 28px' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.1em', color: '#fff' }}>WORKER MONITORING</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {filtered.length} workers shown · Click any card to view full biometric profile
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={13} color="var(--text-secondary)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search worker or ID..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '7px 10px 7px 30px',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Zone filter */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {ZONES.map(z => <TabBtn key={z} val={z} active={zone === z} onClick={() => setZone(z)} />)}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 5 }}>
          {STATUSES.map(s => <TabBtn key={s} val={s} active={status === s} onClick={() => setStatus(s)} />)}
        </div>

        {/* Sort */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center' }}>
          <Filter size={12} color="var(--text-secondary)" />
          {[['risk','Risk'], ['name','Name'], ['status','Status']].map(([v, l]) => (
            <TabBtn key={v} val={l} active={sortBy === v} onClick={() => setSortBy(v)} />
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(w => (
            <motion.div key={w.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <WorkerCard worker={w} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              No workers match your filters
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Workers;
