import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import ParticleCanvas from '../effects/ParticleCanvas';
import EmergencyOverlay from '../effects/EmergencyOverlay';
import LiveAlertTicker from '../common/LiveAlertTicker';
import useAppStore from '../../store/useAppStore';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const AppShell = () => {
  const { pathname } = useLocation();
  const emergencyMode = useAppStore(s => s.emergencyMode);
  const isCommandCenter = pathname === '/command-center';

  return (
    <div className={`ambient-bg ${emergencyMode ? 'emergency-bg' : ''}`} style={{
      display: 'flex', minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Scanlines */}
      <div className="scanlines" />

      {/* Particles */}
      <ParticleCanvas count={60} emergency={emergencyMode} />

      {/* Emergency overlay */}
      <EmergencyOverlay />

      {/* Sidebar — hidden in command center */}
      {!isCommandCenter && <Sidebar />}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {!isCommandCenter && <Header />}

        <main style={{ flex: 1, overflow: 'auto', paddingBottom: 40 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ minHeight: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Alert ticker */}
      {!isCommandCenter && <LiveAlertTicker />}
    </div>
  );
};

export default AppShell;
