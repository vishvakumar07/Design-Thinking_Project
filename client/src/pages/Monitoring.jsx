import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Monitoring = () => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [sensorData, setSensorData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/workers').then(res => {
            setWorkers(res.data);
            if (res.data.length > 0) setSelectedWorker(res.data[0]._id);
        });
    }, []);

    useEffect(() => {
        if (selectedWorker) {
            axios.get(`http://localhost:5000/api/sensor/${selectedWorker}`).then(res => {
                // Ensure data is sorted chronological for charts
                setSensorData(res.data.reverse());
            });

            // For a production app, we would use Socket.io here to append new data in realtime
            // Setting up an interval poll here for simplicity during review
            const interval = setInterval(() => {
                axios.get(`http://localhost:5000/api/sensor/${selectedWorker}`).then(res => setSensorHistory(res.data.reverse())); // Updated to sensorHistory
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedWorker]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800 with opacity
                titleColor: '#e2e8f0', // slate-200
                bodyColor: '#cbd5e1', // slate-300
                borderColor: '#475569', // slate-600
                borderWidth: 1,
                cornerRadius: 4,
                padding: 10,
            }
        },
        scales: {
            x: {
                display: true, // Changed to true for better context
                grid: { color: 'rgba(71, 85, 105, 0.3)' }, // slate-600 with opacity
                ticks: { color: '#94a3b8' }, // slate-400
                title: {
                    display: true,
                    text: 'Time',
                    color: '#94a3b8'
                }
            },
            y: {
                grid: { color: 'rgba(71, 85, 105, 0.3)' }, // slate-600 with opacity
                ticks: { color: '#94a3b8' }, // slate-400
                title: {
                    display: true,
                    text: 'Value',
                    color: '#94a3b8'
                }
            }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 2 }
        }
    };

    // Removed getGasData and getTempData as they are now inline in the JSX

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px]"></div>
            </div>

            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
                <div className="flex items-center cursor-pointer group" onClick={() => navigate('/supervisor')}>
                    <div className="p-2 bg-slate-800 rounded-lg mr-3 group-hover:bg-slate-700 transition-colors border border-slate-700/50">
                        <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 tracking-wider">TELEMETRY DATA</span>
                        <span className="block text-xs text-emerald-400/60 font-mono tracking-widest uppercase">Live Sensor Analytics</span>
                    </div>
                </div>
            </nav>

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-cyan-500"></div>
                    <div className="p-5 border-b border-slate-800/80 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-lg font-black tracking-wider uppercase flex items-center text-slate-100">
                            <Activity className="h-5 w-5 mr-3 text-emerald-400" /> Target Selection
                        </h2>
                        <select
                            value={selectedWorker || ''} // Ensure value is controlled
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-sm font-bold tracking-wider rounded-lg focus:ring-emerald-500/50 focus:border-emerald-500 block p-2.5 outline-none shadow-inner min-w-[250px]"
                        >
                            <option value="">SELECT OPERATIVE DATASTREAM</option>
                            {workers.map(w => (
                                <option key={w._id} value={w._id}>{w.name} (ID: {w._id.slice(-6).toUpperCase()})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!selectedWorker ? (
                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-16 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
                        <LineChart className="h-20 w-20 mb-6 opacity-20" />
                        <h2 className="text-xl font-black tracking-widest uppercase mb-2">Awaiting Telemetry Feed</h2>
                        <p className="font-mono text-sm max-w-md text-center opacity-60">Select an active operative from the dropdown above to initialize live sensor datastream analysis.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gas Readings */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-5 border-b border-slate-800/80 bg-slate-900/80">
                                <h3 className="text-lg font-black tracking-wider uppercase flex items-center text-slate-100">
                                    <LineChart className="h-5 w-5 mr-3 text-orange-400" /> Toxic Gas Analysis (CH4/CO)
                                </h3>
                            </div>
                            <div className="p-6 bg-slate-950/50 h-[350px]">
                                <Line
                                    data={{
                                        labels: sensorHistory.map(d => new Date(d.createdAt).toLocaleTimeString()), // Changed timestamp to createdAt
                                        datasets: [{
                                            label: 'Atmospheric Gas (ppm)',
                                            data: sensorHistory.map(d => d.gasLevel),
                                            borderColor: '#f97316',
                                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                            borderWidth: 3,
                                            tension: 0.4,
                                            fill: true,
                                            pointBackgroundColor: '#fff',
                                            pointBorderColor: '#f97316',
                                            pointRadius: 4,
                                        }]
                                    }}
                                    options={chartOptions}
                                />
                            </div>
                        </div>

                        {/* Temperature Readings */}
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-5 border-b border-slate-800/80 bg-slate-900/80">
                                <h3 className="text-lg font-black tracking-wider uppercase flex items-center text-slate-100">
                                    <LineChart className="h-5 w-5 mr-3 text-red-400" /> Thermal Imprint (°C)
                                </h3>
                            </div>
                            <div className="p-6 bg-slate-950/50 h-[350px]">
                                <Line
                                    data={{
                                        labels: sensorHistory.map(d => new Date(d.createdAt).toLocaleTimeString()), // Changed timestamp to createdAt
                                        datasets: [{
                                            label: 'Core / Ambient Temp (°C)',
                                            data: sensorHistory.map(d => d.temperature),
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            borderWidth: 3,
                                            tension: 0.4,
                                            fill: true,
                                            pointBackgroundColor: '#fff',
                                            pointBorderColor: '#ef4444',
                                            pointRadius: 4,
                                        }]
                                    }}
                                    options={chartOptions}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Monitoring;
