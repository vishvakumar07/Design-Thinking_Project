import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Users, Activity, AlertOctagon, Map, Server, ShieldAlert, Cpu, Radio, ChevronRight, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SupervisorDashboard = () => {
    // Map worker ID to full object
    const [workersMap, setWorkersMap] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [systemLogs, setSystemLogs] = useState([]);
    const [systemStatus, setSystemStatus] = useState('OPTIMAL');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch initial static data
        const fetchData = async () => {
            try {
                // Ignore DB errors if offline, just init empty
                const wRes = await axios.get('http://localhost:5000/api/workers').catch(() => ({ data: [] }));

                const wMap = {};
                // Pre-populate with known demo worker if not found
                if (wRes.data.length === 0) {
                    wMap['WKR-ALPHA-01'] = { _id: 'WKR-ALPHA-01', name: 'DEMO OP-1', role: 'Excavator Alpha', isOnline: true };
                } else {
                    wRes.data.forEach(w => wMap[w._id] = w);
                }
                setWorkersMap(wMap);

                const aRes = await axios.get('http://localhost:5000/api/alerts').catch(() => ({ data: [] }));
                setAlerts(aRes.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch initial data");
            }
        };
        fetchData();

        // Socket listeners
        const socket = io('http://localhost:5000');

        socket.on('sensorData', (data) => {
            setWorkersMap(prev => {
                const wId = data.workerId?._id || data.workerId;
                const existing = prev[wId] || { _id: wId, name: wId, role: 'Field Operator', isOnline: true };
                return {
                    ...prev,
                    [wId]: {
                        ...existing,
                        latestSensor: data
                    }
                };
            });
        });

        socket.on('newAlert', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 5));
            setSystemStatus(alert.severity || 'CRITICAL');
            setTimeout(() => setSystemStatus('OPTIMAL'), 15000); // Reset UI after 15s
        });

        socket.on('systemLog', (log) => {
            setSystemLogs(prev => [log, ...prev].slice(0, 15));
        });

        socket.on('emergencySOS', (data) => {
            alert(`CRITICAL: SOS received! Ensure emergency teams are dispatched!`);
            setSystemStatus('CRITICAL');
        });

        return () => socket.disconnect();
    }, []);

    const workers = Object.values(workersMap);

    // Status visual helpers
    const getStatusColor = (status) => {
        if (status === 'CRITICAL') return 'text-red-500 glow-critical';
        if (status === 'WARNING') return 'text-yellow-500 glow-warning';
        return 'text-emerald-500 glow-safe';
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-inter">
            <div className="scanline"></div>

            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-2xl">
                <div className="flex items-center group cursor-pointer mb-4 md:mb-0">
                    <div className="relative flex items-center justify-center p-2 rounded-sm bg-blue-500/10 mr-4 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <ShieldAlert className="h-7 w-7 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                    </div>
                    <div>
                        <span className="block text-2xl font-black font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">COMMAND CENTER</span>
                        <span className="block text-[10px] text-blue-400/60 font-mono tracking-widest uppercase">Global Surveillance Alpha Active</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className={`px-5 py-2 rounded-sm text-lg font-black font-orbitron tracking-[0.2em] uppercase border shadow-lg flex items-center transition-all duration-500
                        ${systemStatus === 'OPTIMAL' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 glow-safe'
                            : systemStatus === 'CRITICAL' ? 'bg-red-950/80 border-red-500 text-red-500 animate-pulse glow-critical'
                                : 'bg-yellow-950/40 border-yellow-500/50 text-yellow-400 glow-warning'}`}>
                        <div className={`w-3 h-3 mr-3 ${systemStatus === 'OPTIMAL' ? 'bg-emerald-400' : systemStatus === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                        SYSTEM: {systemStatus}
                    </div>
                </div>
            </nav>

            <div className="p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto relative z-20">

                {/* Global Data Table */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="nasa-panel overflow-hidden">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                            <h2 className="text-sm font-orbitron font-black tracking-widest uppercase flex items-center text-slate-100">
                                <Users className="h-4 w-4 mr-3 text-blue-400" /> ACTIVE MINE PERSONNEL
                            </h2>
                            <span className="text-[10px] font-bold font-inter px-3 py-1 bg-blue-950/50 border border-blue-900/50 text-blue-400 rounded shadow-inner">
                                {workers.length} DETECTED
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-mono text-xs">
                                <thead className="bg-slate-900 text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                    <tr>
                                        <th className="p-4 py-3 border-r border-slate-800/50">Operative ID</th>
                                        <th className="p-4 py-3 border-r border-slate-800/50">AI Status</th>
                                        <th className="p-4 py-3 border-r border-slate-800/50 text-center">CH4/CO</th>
                                        <th className="p-4 py-3 border-r border-slate-800/50 text-center">BPM</th>
                                        <th className="p-4 py-3 border-r border-slate-800/50 text-center">Temp(°C)</th>
                                        <th className="p-4 py-3">Telemetry Connection</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                                    {workers.map((w) => {
                                        const sd = w.latestSensor || {};
                                        const status = sd.status || 'OFFLINE';
                                        return (
                                            <tr key={w._id} className="hover:bg-slate-800/40 transition-colors group">
                                                <td className="p-4 border-r border-slate-800/50">
                                                    <div className="font-bold font-inter text-slate-100 group-hover:text-blue-300 transition-colors">{w.name}</div>
                                                    <div className="text-[10px] font-inter text-slate-500">[{w._id.slice(-6).toUpperCase()}]</div>
                                                </td>
                                                <td className="p-4 border-r border-slate-800/50 uppercase font-black tracking-widest">
                                                    {status === 'OFFLINE' ? (
                                                        <span className="text-slate-600">NO SIGNAL</span>
                                                    ) : (
                                                        <span className={`${getStatusColor(status)} px-2 py-1 rounded-sm border ${status === 'CRITICAL' ? 'border-red-500 bg-red-950/50' : status === 'WARNING' ? 'border-yellow-500 bg-yellow-950/50' : 'border-emerald-500/50 bg-emerald-950/30'}`}>
                                                            {status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`p-4 border-r border-slate-800/50 text-center text-lg font-inter font-semibold ${sd.gasLevel > 15 ? 'text-neon-red' : 'text-slate-300'}`}>
                                                    {sd.gasLevel !== undefined ? Number(sd.gasLevel).toFixed(1) : '-'}
                                                </td>
                                                <td className={`p-4 border-r border-slate-800/50 text-center text-lg font-inter font-semibold ${sd.heartRate > 110 || sd.heartRate < 50 ? 'text-neon-red' : 'text-slate-300'}`}>
                                                    {sd.heartRate !== undefined ? Math.round(sd.heartRate) : '-'}
                                                </td>
                                                <td className={`p-4 border-r border-slate-800/50 text-center text-lg font-inter font-semibold ${sd.temperature > 40 ? 'text-neon-red' : 'text-slate-300'}`}>
                                                    {sd.temperature !== undefined ? Number(sd.temperature).toFixed(1) : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Radio className={`h-4 w-4 ${w.isOnline ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
                                                        <span className={w.isOnline ? 'text-emerald-500' : 'text-slate-500'}>{w.isOnline ? 'Active' : 'Offline'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Infrastructure & Heatmap */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Server Cluster */}
                        <div className="nasa-panel">
                            <h3 className="font-orbitron font-black text-xs text-slate-400 flex justify-between items-center border-b border-slate-800 pb-2 mb-4 uppercase tracking-widest">
                                NODE CLUSTER STATUS
                                <Server className="h-4 w-4 text-emerald-500" />
                            </h3>
                            <div className="space-y-4 font-mono text-xs">
                                <div>
                                    <div className="flex justify-between mb-1"><span className="text-slate-500">Node-Alpha [AI]</span><span className="text-emerald-400 text-[10px]">99.8% UPTIME</span></div>
                                    <div className="w-full bg-slate-900 h-1.5"><div className="bg-emerald-500 h-1.5 w-[99%]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span className="text-slate-500">Node-Beta [Ingress]</span><span className="text-emerald-400 text-[10px]">99.9% UPTIME</span></div>
                                    <div className="w-full bg-slate-900 h-1.5"><div className="bg-emerald-500 h-1.5 w-[100%]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1"><span className="text-slate-500">Node-Gamma [DB]</span><span className="text-yellow-500 text-[10px]">FALLBACK MOCK</span></div>
                                    <div className="w-full bg-slate-900 h-1.5"><div className="bg-yellow-500 h-1.5 w-[40%] animate-pulse"></div></div>
                                </div>
                            </div>
                        </div>

                        {/* Simulated Heatmap */}
                        <div className="nasa-panel relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-900/5 mix-blend-screen pointer-events-none"></div>
                            <h3 className="font-orbitron font-black text-xs text-slate-400 flex justify-between items-center border-b border-slate-800 pb-2 mb-4 uppercase tracking-widest relative z-10">
                                MINE SECTOR HEATMAP
                                <Map className="h-4 w-4 text-indigo-400" />
                            </h3>

                            <div className="relative w-full h-40 bg-slate-950 border border-slate-800 rounded flex items-center justify-center overflow-hidden">
                                {/* SVG Grid lines */}
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-20">
                                    <defs>
                                        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                                        </pattern>
                                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <rect width="40" height="40" fill="url(#smallGrid)" />
                                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="1" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>

                                {/* Glowing Hazardous Zones (Simulated) */}
                                <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-yellow-500/20 rounded-full blur-xl"></div>
                                <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-red-500/10 rounded-full blur-2xl"></div>

                                {/* Plot Workers on SVG Map */}
                                {workers.map((w, idx) => {
                                    // Make up a deterministic but visually pleasing position if no GPS
                                    const lat = w.latestSensor?.location?.lat || (34.0200 + (idx * 0.005));
                                    const lng = w.latestSensor?.location?.lng || (-118.1500 - (idx * 0.005));

                                    // Scale to percentages roughly
                                    const x = ((lng + 118.1600) / 0.0200) * 100;
                                    const y = ((lat - 34.0100) / 0.0200) * 100;
                                    const status = w.latestSensor?.status || 'SAFE';

                                    return (
                                        <div
                                            key={w._id}
                                            className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-ping' : status === 'WARNING' ? 'bg-yellow-400 shadow-[0_0_10px_#eab308]' : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'}`}
                                            // Clamp positions for safety
                                            style={{ left: `${Math.min(Math.max(x, 5), 95)}%`, top: `${Math.min(Math.max(y, 5), 95)}%` }}
                                            title={w.name}
                                        >
                                            <div className="absolute text-[8px] font-mono -top-4 w-20 text-center -ml-8 opacity-70 bg-slate-900 border border-slate-800 rounded px-1">{w._id.slice(-4)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Global Feeds */}
                <div className="xl:col-span-4 space-y-6 flex flex-col h-full">

                    {/* Critical Alerts panel */}
                    <div className="nasa-panel border-t-4 border-t-red-600 h-1/2 flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                            <h2 className="text-sm font-orbitron font-black tracking-widest uppercase flex items-center text-slate-100">
                                <AlertOctagon className="h-4 w-4 mr-3 text-red-500" /> ACTIVE ALERTS
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-xs">
                            {alerts.length === 0 ? (
                                <div className="text-center font-inter opacity-50 py-10">&gt; 0 ACTIVE PROTOCOLS</div>
                            ) : (
                                alerts.map((a, i) => (
                                    <div key={i} className={`p-3 rounded border font-inter ${a.severity === 'CRITICAL' || a.severity === 'Danger' ? 'bg-red-950/30 border-red-900/50 text-red-200' : 'bg-yellow-950/30 border-yellow-900/50 text-yellow-200'}`}>
                                        <div className="flex justify-between uppercase font-black opacity-80 text-[10px] mb-1">
                                            <span>[{a.type}] {a.workerId?.name || a.workerId || 'UNKNOWN'}</span>
                                            <span>{new Date(a.createdAt || Date.now()).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="leading-relaxed text-sm font-semibold">{a.message || 'Anomaly detected'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* System Log */}
                    <div className="nasa-panel h-1/2 flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                            <h2 className="text-sm font-orbitron font-black tracking-widest uppercase flex items-center text-slate-100">
                                <Cpu className="h-4 w-4 mr-3 text-emerald-500" /> SYSTEM LOGS
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 font-inter text-[11px] tracking-wide">
                            {systemLogs.length === 0 ? (
                                <div className="text-center opacity-50 py-10">&gt; INTERFACE INITIALIZED</div>
                            ) : (
                                systemLogs.map((log, i) => (
                                    <div key={i} className={`flex items-start break-words border-l-2 pl-2 ${log.type === 'CRITICAL' ? 'border-red-500 text-red-300 bg-red-950/20' : log.type === 'WARNING' ? 'border-yellow-500 text-yellow-300' : 'border-slate-600 text-slate-400'}`}>
                                        <ChevronRight className="h-3 w-3 mr-1 mt-[2px] opacity-50 shrink-0" />
                                        <span>
                                            <span className="opacity-50 mr-2 font-mono">[{log.timestamp && log.timestamp.length > 19 ? log.timestamp.slice(11, 19) : ''}]</span>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {/* CSS Animation definitions */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    from { background-position: 200vw 0; }
                    to { background-position: -200vw 0; }
                }
            `}} />
        </div>
    );
};

export default SupervisorDashboard;
