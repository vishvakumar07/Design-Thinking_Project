import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, Flame, Thermometer, Droplets, Activity, MapPin, PhoneCall, BrainCircuit, Zap } from 'lucide-react';

const WorkerDashboard = () => {
    const [sensorData, setSensorData] = useState({
        gasLevel: 0, temperature: 0, humidity: 0, heartRate: 0,
        status: 'SAFE', risk_score: 0, explanation: 'Systems nominal.'
    });
    const [alerts, setAlerts] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isEmergency, setIsEmergency] = useState(false);

    // Simulate inactivity tracker
    const [lastMoveTimestamp, setLastMoveTimestamp] = useState(Date.now());
    const [inactivityWarning, setInactivityWarning] = useState(false);

    // Fallback if no worker is set
    const workerId = localStorage.getItem('workerId') || 'WKR-ALPHA-01';

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('sensorData', (data) => {
            // Check if this data payload matches our worker OR if it's the demo worker
            const payloadWorkerId = data.workerId?._id || data.workerId;

            if (payloadWorkerId === workerId || workerId === 'WKR-ALPHA-01') {
                setSensorData({
                    gasLevel: data.gasLevel,
                    temperature: data.temperature,
                    humidity: data.humidity,
                    heartRate: data.heartRate,
                    status: data.status,
                    risk_score: data.risk_score || 0,
                    explanation: data.explanation || 'Processing telemetry...'
                });

                // Track simulated movement bounds to reset inactivity timer
                if (Math.random() > 0.3) {
                    setLastMoveTimestamp(Date.now());
                }
            }
        });

        newSocket.on('systemLog', (log) => {
            setAlerts(prev => [log, ...prev].slice(0, 5));
        });

        return () => newSocket.disconnect();
    }, [workerId]);

    // Inactivity Simulator
    useEffect(() => {
        const interval = setInterval(() => {
            if (Date.now() - lastMoveTimestamp > 10000) {
                setInactivityWarning(true);
            } else {
                setInactivityWarning(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lastMoveTimestamp]);

    const handleSOS = () => {
        if (socket && !isEmergency) {
            socket.emit('sosAlert', { workerId: workerId, location: { lat: 34.0200, lng: -118.1500 } });
            setIsEmergency(true);
            setTimeout(() => setIsEmergency(false), 8000); // UI reset after 8 seconds 
        }
    };

    const getPanelGlow = (status) => {
        if (status === 'CRITICAL') return 'glow-critical text-neon-red border-red-500/80';
        if (status === 'WARNING') return 'glow-warning text-neon-yellow border-yellow-500/80';
        return 'glow-safe text-neon-green border-green-500/50';
    };

    const StatusIcon = sensorData.status === 'CRITICAL' ? AlertTriangle : sensorData.status === 'WARNING' ? Zap : Activity;

    return (
        <div className={`relative min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8 overflow-hidden font-inter transition-colors duration-500 ${isEmergency ? 'bg-red-950/20' : 'bg-slate-950'}`}>
            <div className="scanline"></div>

            {/* Header Overlay */}
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-2 border-slate-700/50 pb-4 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-slate-900 border border-slate-700 flex items-center justify-center rounded-sm">
                        <BrainCircuit className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-orbitron font-black tracking-widest uppercase text-slate-100">PERSONAL SAFETY CONSOLE</h1>
                        <p className="text-sm font-mono tracking-widest uppercase text-slate-400 flex items-center mt-1">
                            <span className="relative flex h-3 w-3 mr-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sensorData.status === 'SAFE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${sensorData.status === 'SAFE' ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
                            </span>
                            UPLINK ACTIVE | OPERATIVE: <span className="ml-2 font-bold text-white">{workerId}</span>
                        </p>
                    </div>
                </div>

                {/* Master AI Status Array */}
                <div className={`mt-4 md:mt-0 px-8 py-4 border-2 backdrop-blur-md rounded-sm flex items-center font-orbitron uppercase tracking-widest text-xl shadow-2xl transition-all duration-300 ${getPanelGlow(sensorData.status)}`}>
                    <StatusIcon className={`mr-4 h-8 w-8 ${sensorData.status === 'CRITICAL' ? 'animate-bounce' : ''}`} />
                    <div className="flex flex-col">
                        <span className="text-xs opacity-70">AI OVERSEER STATUS</span>
                        <span className="font-black">{sensorData.status}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-20">

                {/* Left Column: Biometrics & AI */}
                <div className="lg:col-span-3 space-y-6 flex flex-col">

                    {/* Biometrics Panel */}
                    <div className="nasa-panel">
                        <h3 className="font-orbitron text-xs text-slate-400 flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                            BIOMETRIC TELEMETRY
                            <Activity className="h-4 w-4 text-emerald-500" />
                        </h3>

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <span className="text-xs font-orbitron uppercase tracking-wide text-slate-500 block">HEART RATE</span>
                                <div className={`text-5xl font-inter font-semibold ${sensorData.heartRate > 110 ? 'text-neon-red animate-pulse' : 'text-slate-100'}`}>
                                    {sensorData.heartRate} <span className="text-lg text-slate-600 font-inter">BPM</span>
                                </div>
                            </div>
                            <div className="flex h-12 items-end space-x-1">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`w-2 rounded-t-sm transition-all duration-300 ${sensorData.heartRate > 110 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Inactivity Tracker */}
                        <div className={`p-3 border rounded-sm ${inactivityWarning ? 'bg-red-900/30 border-red-500 glow-critical text-neon-red' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                            <span className="text-xs font-mono block mb-1">MOTION SENSOR</span>
                            <div className="font-bold flex items-center font-orbitron text-sm">
                                {inactivityWarning ? (
                                    <><AlertTriangle className="h-4 w-4 mr-2 animate-bounce" /> INACTIVITY WARNING!</>
                                ) : (
                                    <>NOMINAL TRACKING</>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Hazard Predictor */}
                    <div className={`nasa-panel flex-1 border-t-4 transition-colors duration-300 ${sensorData.status === 'SAFE' ? 'border-t-emerald-500' : sensorData.status === 'WARNING' ? 'border-t-yellow-500' : 'border-t-red-500'}`}>
                        <h3 className="font-orbitron text-xs text-slate-400 flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                            AI HAZARD ANALYSIS
                            <BrainCircuit className="h-4 w-4 text-indigo-400" />
                        </h3>

                        <div className="mb-4">
                            <span className="text-xs font-orbitron uppercase tracking-wide text-slate-500 mb-1 block">CALCULATED RISK SCORE</span>
                            <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden border border-slate-700">
                                <div className={`h-4 transition-all duration-500 ${sensorData.risk_score > 70 ? 'bg-red-600' : sensorData.risk_score > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${sensorData.risk_score}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs font-orbitron font-bold uppercase tracking-widest">
                                <span className={sensorData.risk_score < 40 ? 'text-neon-green' : 'text-slate-600'}>SAFE</span>
                                <span className={sensorData.risk_score >= 40 && sensorData.risk_score < 70 ? 'text-neon-yellow' : 'text-slate-600'}>WARN</span>
                                <span className={sensorData.risk_score >= 70 ? 'text-neon-red' : 'text-slate-600'}>CRIT</span>
                            </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-sm">
                            <span className="text-xs font-orbitron uppercase tracking-wide text-slate-500 block mb-1">DIAGNOSTIC OUTPUT</span>
                            <p className="text-sm text-slate-300 leading-relaxed font-inter">
                                &gt; {sensorData.explanation}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Center Column: Environments */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-6 h-full">
                    {/* Gas Level */}
                    <div className="nasa-panel flex flex-col items-center justify-center col-span-2 sm:col-span-1 group">
                        <Flame className={`h-12 w-12 mb-4 transition-transform group-hover:scale-110 ${sensorData.gasLevel > 20 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-orange-500'}`} />
                        <span className="text-xs font-orbitron uppercase tracking-wide text-slate-400 mb-2">CH4/CO GAS LEVEL</span>
                        <div className="text-5xl font-inter font-semibold text-slate-100 drop-shadow-lg">
                            {Number(sensorData.gasLevel).toFixed(1)} <span className="text-xl text-slate-600 font-inter">ppm</span>
                        </div>
                    </div>

                    {/* Temperature */}
                    <div className="nasa-panel flex flex-col items-center justify-center col-span-2 sm:col-span-1 group">
                        <Thermometer className={`h-12 w-12 mb-4 transition-transform group-hover:scale-110 ${sensorData.temperature > 40 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-rose-500'}`} />
                        <span className="text-xs font-orbitron uppercase tracking-wide text-slate-400 mb-2">AMBIENT TEMP</span>
                        <div className="text-5xl font-inter font-semibold text-slate-100 drop-shadow-lg">
                            {Number(sensorData.temperature).toFixed(1)} <span className="text-xl text-slate-600 font-inter">°C</span>
                        </div>
                    </div>

                    {/* Humidity */}
                    <div className="nasa-panel flex flex-col items-center justify-center col-span-2 group pt-8 border-t border-slate-800">
                        <Droplets className="h-10 w-10 mb-4 text-cyan-500 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-orbitron uppercase tracking-wide text-slate-400 mb-2">RELATIVE HUMIDITY</span>
                        <div className="text-4xl font-inter font-semibold text-slate-100">
                            {Number(sensorData.humidity).toFixed(1)} <span className="text-xl text-slate-600 font-inter">%</span>
                        </div>
                        <div className="w-2/3 h-2 bg-slate-800 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${sensorData.humidity}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Emergency & Logs */}
                <div className="lg:col-span-3 space-y-6 flex flex-col">

                    {/* Emergency Control */}
                    <div className={`nasa-panel ${isEmergency ? 'glow-critical animate-pulse bg-red-900/40 border-red-500' : ''}`}>
                        <button
                            onClick={handleSOS}
                            className={`w-full py-8 px-4 rounded-sm font-orbitron tracking-[0.2em] font-black text-xl flex flex-col items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden relative group
                                ${isEmergency ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.8)]' : 'bg-red-950/80 border border-red-500/50 text-red-500 hover:bg-red-900 hover:text-white'}`}
                        >
                            <PhoneCall className={`h-12 w-12 mb-4 relative z-10 ${isEmergency ? 'animate-bounce text-white' : 'text-red-500 group-hover:text-white'}`} />
                            <span className="relative z-10">{isEmergency ? 'SOS TRANSMITTING' : 'INITIATE SOS'}</span>
                            <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </button>
                    </div>

                    {/* Live Event Feed */}
                    <div className="nasa-panel flex-1 flex flex-col">
                        <h3 className="font-orbitron font-bold text-lg text-slate-400 flex justify-between items-center border-b border-slate-800 pb-2 mb-4 uppercase tracking-wide">
                            SYSTEM FEED
                            <MapPin className="h-4 w-4 text-emerald-500" />
                        </h3>
                        <div className="flex-1 overflow-hidden">
                            <div className="space-y-3 font-inter text-sm">
                                {alerts.length === 0 ? (
                                    <div className="opacity-50 text-center mt-10 text-slate-500">&gt; Awaiting server uplink...</div>
                                ) : (
                                    alerts.map((log, i) => (
                                        <div key={i} className={`p-2 border-l-2 ${log.type === 'CRITICAL' ? 'border-red-500 bg-red-950/30 text-red-200' : log.type === 'WARNING' ? 'border-yellow-500 bg-yellow-950/30 text-yellow-200' : 'border-slate-500 bg-slate-900 text-slate-400'}`}>
                                            <span className="opacity-50 font-mono block text-xs mb-1">[{log.timestamp && log.timestamp.length > 19 ? log.timestamp.slice(11, 19) : ''}]</span>
                                            <span className="break-words leading-relaxed">{log.message}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
