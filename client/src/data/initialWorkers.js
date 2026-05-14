export const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
export const ZONE_DEPTHS = { 'Zone A': -120, 'Zone B': -180, 'Zone C': -240, 'Zone D': -300 };

export const initialWorkers = [
  {
    id: 'W-001', name: 'Marcus Chen', role: 'Lead Miner', zone: 'Zone A', depth: -120,
    avatar: 'MC', shiftStart: '06:00', shiftHours: 8,
    vitals: { heartRate: 72, oxygen: 98.2, bodyTemp: 36.8, humidity: 54, methane: 0.8, co: 12 },
    status: 'SAFE', lastPing: Date.now() - 12000, riskScore: 12,
    history: [], location: { x: 20, y: 30 },
  },
  {
    id: 'W-002', name: 'Raj Patel', role: 'Drill Operator', zone: 'Zone A', depth: -135,
    avatar: 'RP', shiftStart: '06:00', shiftHours: 8,
    vitals: { heartRate: 85, oxygen: 97.5, bodyTemp: 37.1, humidity: 58, methane: 1.1, co: 15 },
    status: 'SAFE', lastPing: Date.now() - 8000, riskScore: 18,
    history: [], location: { x: 35, y: 25 },
  },
  {
    id: 'W-003', name: 'Sofia Mendez', role: 'Safety Officer', zone: 'Zone B', depth: -185,
    avatar: 'SM', shiftStart: '06:00', shiftHours: 8,
    vitals: { heartRate: 68, oxygen: 96.8, bodyTemp: 36.5, humidity: 62, methane: 2.3, co: 22 },
    status: 'WARNING', lastPing: Date.now() - 5000, riskScore: 42,
    history: [], location: { x: 55, y: 40 },
  },
  {
    id: 'W-004', name: 'James Okafor', role: 'Explosives Tech', zone: 'Zone B', depth: -195,
    avatar: 'JO', shiftStart: '06:00', shiftHours: 8,
    vitals: { heartRate: 91, oxygen: 96.1, bodyTemp: 37.4, humidity: 67, methane: 2.8, co: 28 },
    status: 'WARNING', lastPing: Date.now() - 18000, riskScore: 55,
    history: [], location: { x: 60, y: 55 },
  },
  {
    id: 'W-005', name: 'Aleksei Volkov', role: 'Tunnel Engineer', zone: 'Zone C', depth: -248,
    avatar: 'AV', shiftStart: '14:00', shiftHours: 8,
    vitals: { heartRate: 78, oxygen: 95.4, bodyTemp: 37.2, humidity: 71, methane: 4.1, co: 35 },
    status: 'WARNING', lastPing: Date.now() - 3000, riskScore: 63,
    history: [], location: { x: 40, y: 65 },
  },
  {
    id: 'W-006', name: 'Layla Hassan', role: 'Geologist', zone: 'Zone C', depth: -255,
    avatar: 'LH', shiftStart: '14:00', shiftHours: 8,
    vitals: { heartRate: 102, oxygen: 94.2, bodyTemp: 37.9, humidity: 74, methane: 4.8, co: 42 },
    status: 'CRITICAL', lastPing: Date.now() - 2000, riskScore: 82,
    history: [], location: { x: 50, y: 70 },
  },
  {
    id: 'W-007', name: 'Diego Santos', role: 'Equipment Op.', zone: 'Zone A', depth: -115,
    avatar: 'DS', shiftStart: '06:00', shiftHours: 8,
    vitals: { heartRate: 74, oxygen: 98.5, bodyTemp: 36.7, humidity: 51, methane: 0.6, co: 10 },
    status: 'SAFE', lastPing: Date.now() - 7000, riskScore: 8,
    history: [], location: { x: 25, y: 20 },
  },
  {
    id: 'W-008', name: 'Nadia Kowalski', role: 'Surveyor', zone: 'Zone D', depth: -305,
    avatar: 'NK', shiftStart: '22:00', shiftHours: 8,
    vitals: { heartRate: 88, oxygen: 93.8, bodyTemp: 38.1, humidity: 78, methane: 5.9, co: 51 },
    status: 'CRITICAL', lastPing: Date.now() - 25000, riskScore: 91,
    history: [], location: { x: 30, y: 80 },
  },
  {
    id: 'W-009', name: 'Tariq Mohammed', role: 'Lead Miner', zone: 'Zone D', depth: -295,
    avatar: 'TM', shiftStart: '22:00', shiftHours: 8,
    vitals: { heartRate: 79, oxygen: 94.5, bodyTemp: 37.6, humidity: 75, methane: 5.2, co: 47 },
    status: 'WARNING', lastPing: Date.now() - 11000, riskScore: 71,
    history: [], location: { x: 70, y: 85 },
  },
  {
    id: 'W-010', name: 'Chen Wei', role: 'Drill Operator', zone: 'Zone B', depth: -178,
    avatar: 'CW', shiftStart: '14:00', shiftHours: 8,
    vitals: { heartRate: 70, oxygen: 97.1, bodyTemp: 36.9, humidity: 60, methane: 1.8, co: 18 },
    status: 'SAFE', lastPing: Date.now() - 4000, riskScore: 24,
    history: [], location: { x: 65, y: 45 },
  },
  {
    id: 'W-011', name: 'Amara Diallo', role: 'Safety Monitor', zone: 'Zone C', depth: -238,
    avatar: 'AD', shiftStart: '14:00', shiftHours: 8,
    vitals: { heartRate: 75, oxygen: 95.9, bodyTemp: 37.0, humidity: 69, methane: 3.5, co: 31 },
    status: 'SAFE', lastPing: Date.now() - 6000, riskScore: 38,
    history: [], location: { x: 45, y: 60 },
  },
  {
    id: 'W-012', name: 'Ivan Petrov', role: 'Ventilation Tech', zone: 'Zone D', depth: -312,
    avatar: 'IP', shiftStart: '22:00', shiftHours: 8,
    vitals: { heartRate: 83, oxygen: 93.1, bodyTemp: 38.3, humidity: 80, methane: 6.2, co: 55 },
    status: 'CRITICAL', lastPing: Date.now() - 35000, riskScore: 94,
    history: [], location: { x: 80, y: 90 },
  },
];

export const THRESHOLDS = {
  heartRate: { warning: 90, critical: 110 },
  oxygen: { warning: 95, critical: 92 },
  bodyTemp: { warning: 37.8, critical: 38.5 },
  methane: { warning: 2.0, critical: 5.0 },
  co: { warning: 25, critical: 50 },
  humidity: { warning: 70, critical: 85 },
};
