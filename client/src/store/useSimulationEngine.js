import { useEffect, useRef } from 'react';
import useAppStore from './useAppStore';
import { THRESHOLDS } from '../data/initialWorkers';

// Gaussian noise for realistic sensor drift
const gaussian = (mean, std) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * std;
};

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const checkThresholds = (worker, addAlert, triggerEmergency) => {
  const { vitals, zone, id, name, status } = worker;
  const T = THRESHOLDS;
  const ts = Date.now();

  if (vitals.oxygen < T.oxygen.critical && status !== 'CRITICAL') {
    addAlert({ type: 'Oxygen Drop', severity: 'CRITICAL', workerId: id, workerName: name, zone, message: `Critical O₂ level (${vitals.oxygen.toFixed(1)}%) for ${name}`, icon: '🫁' });
    if (Math.random() < 0.3) triggerEmergency(worker);
  } else if (vitals.oxygen < T.oxygen.warning) {
    addAlert({ type: 'Oxygen Drop', severity: 'WARNING', workerId: id, workerName: name, zone, message: `Low O₂ detected (${vitals.oxygen.toFixed(1)}%) for ${name}`, icon: '⚠️' });
  }

  if (vitals.methane > T.methane.critical) {
    addAlert({ type: 'Toxic Gas', severity: 'CRITICAL', workerId: id, workerName: name, zone, message: `CRITICAL methane spike (${vitals.methane.toFixed(2)} ppm) in ${zone}`, icon: '☠️' });
  } else if (vitals.methane > T.methane.warning) {
    addAlert({ type: 'Toxic Gas', severity: 'WARNING', workerId: id, workerName: name, zone, message: `Methane elevated (${vitals.methane.toFixed(2)} ppm) — ${name}`, icon: '💨' });
  }

  if (vitals.heartRate > T.heartRate.critical) {
    addAlert({ type: 'Heart Rate Spike', severity: 'CRITICAL', workerId: id, workerName: name, zone, message: `Heart rate critical (${Math.round(vitals.heartRate)} bpm) — ${name}`, icon: '❤️' });
  } else if (vitals.heartRate > T.heartRate.warning) {
    addAlert({ type: 'Heart Rate Spike', severity: 'WARNING', workerId: id, workerName: name, zone, message: `Elevated heart rate (${Math.round(vitals.heartRate)} bpm) — ${name}`, icon: '💓' });
  }

  if (vitals.co > T.co.critical) {
    addAlert({ type: 'Toxic Gas', severity: 'CRITICAL', workerId: id, workerName: name, zone, message: `CO at dangerous level (${Math.round(vitals.co)} ppm) — ${name}`, icon: '☠️' });
  }

  if (vitals.bodyTemp > T.bodyTemp.critical) {
    addAlert({ type: 'Heat', severity: 'CRITICAL', workerId: id, workerName: name, zone, message: `Heat stress critical (${vitals.bodyTemp.toFixed(1)}°C) — ${name}`, icon: '🌡️' });
  } else if (vitals.bodyTemp > T.bodyTemp.warning) {
    addAlert({ type: 'Heat', severity: 'WARNING', workerId: id, workerName: name, zone, message: `Body temp elevated (${vitals.bodyTemp.toFixed(1)}°C) — ${name}`, icon: '🔥' });
  }
};

const deriveStatus = (vitals) => {
  const T = THRESHOLDS;
  if (
    vitals.oxygen < T.oxygen.critical ||
    vitals.methane > T.methane.critical ||
    vitals.heartRate > T.heartRate.critical ||
    vitals.co > T.co.critical ||
    vitals.bodyTemp > T.bodyTemp.critical
  ) return 'CRITICAL';
  if (
    vitals.oxygen < T.oxygen.warning ||
    vitals.methane > T.methane.warning ||
    vitals.heartRate > T.heartRate.warning ||
    vitals.co > T.co.warning ||
    vitals.bodyTemp > T.bodyTemp.warning
  ) return 'WARNING';
  return 'SAFE';
};

const deriveRisk = (vitals) => {
  let score = 0;
  if (vitals.oxygen < 92)  score += 40;
  else if (vitals.oxygen < 95) score += 20;
  if (vitals.methane > 5)  score += 35;
  else if (vitals.methane > 2) score += 15;
  if (vitals.heartRate > 110) score += 20;
  else if (vitals.heartRate > 90) score += 10;
  if (vitals.co > 50)  score += 25;
  else if (vitals.co > 25) score += 12;
  if (vitals.bodyTemp > 38.5) score += 15;
  else if (vitals.bodyTemp > 37.8) score += 8;
  return clamp(score, 0, 100);
};

// Simulate one tick per worker
const tickWorker = (worker, alertFreq) => {
  const rand = Math.random();
  let { vitals } = worker;

  // Gradual drift with realistic Gaussian noise
  let newVitals = {
    heartRate:  clamp(gaussian(vitals.heartRate, 1.2), 55, 150),
    oxygen:     clamp(gaussian(vitals.oxygen, 0.15), 88, 100),
    bodyTemp:   clamp(gaussian(vitals.bodyTemp, 0.06), 36, 40),
    humidity:   clamp(gaussian(vitals.humidity, 0.4), 40, 100),
    methane:    clamp(gaussian(vitals.methane, 0.08), 0, 10),
    co:         clamp(gaussian(vitals.co, 0.6), 0, 80),
  };

  // 3% chance of warning event
  if (rand < 0.03 * alertFreq) {
    newVitals.oxygen  = clamp(newVitals.oxygen - gaussian(1.5, 0.5), 88, 100);
    newVitals.methane = clamp(newVitals.methane + gaussian(0.8, 0.3), 0, 10);
    newVitals.heartRate = clamp(newVitals.heartRate + gaussian(10, 3), 55, 150);
  }

  // 0.5% chance of critical spike
  if (rand < 0.005 * alertFreq) {
    newVitals.oxygen  = clamp(newVitals.oxygen - gaussian(3, 1), 88, 100);
    newVitals.methane = clamp(newVitals.methane + gaussian(2.5, 0.8), 0, 10);
    newVitals.heartRate = clamp(newVitals.heartRate + gaussian(25, 5), 55, 150);
    newVitals.co = clamp(newVitals.co + gaussian(15, 4), 0, 80);
  }

  const status   = deriveStatus(newVitals);
  const riskScore = deriveRisk(newVitals);

  // Keep rolling history (last 30 readings)
  const histEntry = { t: Date.now(), ...newVitals };
  const history = [...(worker.history || []), histEntry].slice(-30);

  return { ...worker, vitals: newVitals, status, riskScore, history, lastPing: Date.now() };
};

// ── Hook: useSimulationEngine ──────────────────────────────
const useSimulationEngine = () => {
  const workers         = useAppStore(s => s.workers);
  const updateAllWorkers = useAppStore(s => s.updateAllWorkers);
  const addAlert         = useAppStore(s => s.addAlert);
  const triggerEmergency = useAppStore(s => s.triggerEmergency);
  const emergencyMode    = useAppStore(s => s.emergencyMode);
  const settings         = useAppStore(s => s.settings);
  const intervalRef      = useRef(null);
  const alertCooldown    = useRef({});

  useEffect(() => {
    const TICK = settings.simSpeed || 3000;

    const runTick = () => {
      const now = Date.now();
      const updatedWorkers = workers.map(w => tickWorker(w, 1));

      // Alert throttling: one alert per worker per 20s
      updatedWorkers.forEach(w => {
        const lastAlert = alertCooldown.current[w.id] || 0;
        if (now - lastAlert > 20000 && (w.status === 'WARNING' || w.status === 'CRITICAL')) {
          checkThresholds(w, addAlert, (wkr) => {
            if (!emergencyMode) triggerEmergency(wkr);
          });
          alertCooldown.current[w.id] = now;
        }
      });

      updateAllWorkers(updatedWorkers);
    };

    intervalRef.current = setInterval(runTick, TICK);
    return () => clearInterval(intervalRef.current);
  }, [settings.simSpeed, emergencyMode]);
};

export default useSimulationEngine;
