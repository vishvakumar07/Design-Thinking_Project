import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Bell, BarChart3, Map, Brain, AlertTriangle,
  Settings, Monitor, Smartphone, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const NAV = [
  { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/workers',        icon: Users,           label: 'Workers' },
  { path: '/alerts',         icon: Bell,            label: 'Alerts' },
  { path: '/analytics',      icon: BarChart3,       label: 'Analytics' },
  { path: '/mine-map',       icon: Map,             label: 'Mine Map' },
  { path: '/ai-center',      icon: Brain,           label: 'AI Center' },
  { path: '/emergency',      icon: AlertTriangle,   label: 'Emergency Hub' },
  { path: '/command-center', icon: Monitor,         label: 'Command Center' },
  { path: '/worker-view',    icon: Smartphone,      label: 'Worker View' },
  { path: '/settings',       icon: Settings,        label: 'Settings' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const alerts = useAppStore(s => s.alerts);
  const emergencyMode = useAppStore(s => s.emergencyMode);
  const alertCount = alerts.filter(a => !a.resolved).length;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      style={{
        height: '100vh',
        background: 'rgba(7,7,16,0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${emergencyMode ? 'rgba(255,31,31,0.3)' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0,
        flexShrink: 0, zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 14px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.12em', color: 'var(--neon-orange)' }}>
              DEEP<span style={{ color: '#fff' }}>SHIELD</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--text-secondary)', letterSpacing: '0.2em' }}>
              SAFETY INTELLIGENCE
            </div>
          </motion.div>
        )}
        {collapsed && <Shield size={22} color="var(--neon-orange)" />}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, marginLeft: 'auto' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, padding: collapsed ? '10px 20px' : '10px 20px',
                  margin: '2px 8px', borderRadius: 8,
                  background: isActive ? 'rgba(255,107,43,0.12)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--neon-orange)' : '2px solid transparent',
                  position: 'relative', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <Icon
                  size={18}
                  color={isActive ? 'var(--neon-orange)' :
                         path === '/emergency' && emergencyMode ? 'var(--emergency-red)' :
                         'var(--text-secondary)'}
                  style={isActive ? { filter: 'drop-shadow(0 0 6px var(--neon-orange))' } : {}}
                />
                {!collapsed && (
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                )}
                {/* Alert badge */}
                {label === 'Alerts' && alertCount > 0 && (
                  <div style={{
                    marginLeft: 'auto',
                    background: 'var(--emergency-red)',
                    color: '#fff',
                    borderRadius: 999,
                    minWidth: 18, height: 18,
                    fontSize: '0.6rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: '0 0 8px rgba(255,31,31,0.6)',
                  }}>
                    {alertCount > 99 ? '99+' : alertCount}
                  </div>
                )}
                {/* Emergency pulse */}
                {label === 'Emergency Hub' && emergencyMode && (
                  <div
                    className="pulse-dot pulse-dot-red"
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse-dot pulse-dot-green" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
              SYSTEM ONLINE
            </span>
          </div>
        )}
        {collapsed && <div className="pulse-dot pulse-dot-green" />}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
