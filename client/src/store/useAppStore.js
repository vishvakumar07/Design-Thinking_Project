import { create } from 'zustand';
import { initialWorkers, THRESHOLDS } from '../data/initialWorkers';

const LS_KEY_WORKERS = 'ds_workers';
const LS_KEY_ALERTS  = 'ds_alerts';
const LS_KEY_LOGS    = 'ds_logs';
const LS_KEY_SETTINGS = 'ds_settings';

const loadLS = (key, fallback) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
};
const saveLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const defaultSettings = {
  simSpeed: 3000,
  alertVolume: true,
  thresholds: THRESHOLDS,
  emergencySound: true,
  autoAcknowledge: false,
};

const useAppStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────
  workers:       loadLS(LS_KEY_WORKERS, initialWorkers),
  alerts:        loadLS(LS_KEY_ALERTS, []),
  logs:          loadLS(LS_KEY_LOGS, []),
  settings:      loadLS(LS_KEY_SETTINGS, defaultSettings),
  emergencyMode: false,
  emergencyWorker: null,
  emergencyStartTime: null,
  activeAlertCount: 0,
  systemHealth: 98,
  shaftStatus: 'OPERATIONAL',
  rescueETA: null,
  rescueDispatched: false,

  // ── Worker Actions ────────────────────────────────────────
  updateWorker: (id, updates) => set(state => {
    const workers = state.workers.map(w =>
      w.id === id ? { ...w, ...updates, lastPing: Date.now() } : w
    );
    saveLS(LS_KEY_WORKERS, workers);
    return { workers };
  }),

  updateAllWorkers: (updatedWorkers) => set(() => {
    saveLS(LS_KEY_WORKERS, updatedWorkers);
    return { workers: updatedWorkers };
  }),

  // ── Alert Actions ─────────────────────────────────────────
  addAlert: (alert) => set(state => {
    const newAlert = {
      id: `ALT-${Date.now()}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      ...alert,
    };
    const alerts = [newAlert, ...state.alerts].slice(0, 200);
    saveLS(LS_KEY_ALERTS, alerts);
    return { alerts, activeAlertCount: alerts.filter(a => !a.resolved).length };
  }),

  acknowledgeAlert: (id) => set(state => {
    const alerts = state.alerts.map(a =>
      a.id === id ? { ...a, acknowledged: true, acknowledgedAt: Date.now() } : a
    );
    saveLS(LS_KEY_ALERTS, alerts);
    return { alerts };
  }),

  resolveAlert: (id) => set(state => {
    const alerts = state.alerts.map(a =>
      a.id === id ? { ...a, resolved: true, resolvedAt: Date.now() } : a
    );
    saveLS(LS_KEY_ALERTS, alerts);
    return { alerts, activeAlertCount: alerts.filter(a => !a.resolved).length };
  }),

  // ── Emergency ─────────────────────────────────────────────
  triggerEmergency: (worker) => set(state => {
    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: Date.now(),
      type: 'EMERGENCY',
      message: `🚨 EMERGENCY TRIGGERED for ${worker?.name || 'Unknown Worker'} in ${worker?.zone || 'Unknown Zone'}`,
      severity: 'CRITICAL',
    };
    const logs = [log, ...state.logs];
    saveLS(LS_KEY_LOGS, logs);
    document.body.classList.add('emergency-mode');
    return {
      emergencyMode: true,
      emergencyWorker: worker,
      emergencyStartTime: Date.now(),
      rescueDispatched: false,
      rescueETA: null,
      logs,
    };
  }),

  resolveEmergency: () => set(state => {
    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: Date.now(),
      type: 'RESOLVED',
      message: `✅ Emergency resolved. All units stand down.`,
      severity: 'INFO',
    };
    const logs = [log, ...state.logs];
    saveLS(LS_KEY_LOGS, logs);
    document.body.classList.remove('emergency-mode');
    return {
      emergencyMode: false,
      emergencyWorker: null,
      emergencyStartTime: null,
      rescueDispatched: false,
      rescueETA: null,
      logs,
    };
  }),

  dispatchRescue: () => set(state => {
    const eta = Date.now() + 12 * 60 * 1000; // 12 minutes
    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: Date.now(),
      type: 'DISPATCH',
      message: `🚁 Rescue Team Alpha dispatched. ETA: 12 minutes.`,
      severity: 'WARNING',
    };
    const logs = [log, ...state.logs];
    saveLS(LS_KEY_LOGS, logs);
    return { rescueDispatched: true, rescueETA: eta, logs };
  }),

  // ── Logs ──────────────────────────────────────────────────
  addLog: (log) => set(state => {
    const newLog = { id: `LOG-${Date.now()}`, timestamp: Date.now(), ...log };
    const logs = [newLog, ...state.logs].slice(0, 500);
    saveLS(LS_KEY_LOGS, logs);
    return { logs };
  }),

  // ── Settings ─────────────────────────────────────────────
  updateSettings: (updates) => set(state => {
    const settings = { ...state.settings, ...updates };
    saveLS(LS_KEY_SETTINGS, settings);
    return { settings };
  }),

  // ── System ───────────────────────────────────────────────
  setSystemHealth: (v) => set({ systemHealth: v }),
  setShaftStatus: (v) => set({ shaftStatus: v }),
}));

export default useAppStore;
