import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertTriangle, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/alerts');
                setAlerts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const resolveAlert = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/alerts/${id}/resolve`);
            setAlerts(alerts.map(a => a._id === id ? { ...a, resolved: true } : a));
        } catch (err) {
            console.error(err);
        }
    }

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'All') return true;
        if (filter === 'Active') return !alert.resolved;
        if (filter === 'Resolved') return alert.resolved;
        return true;
    });

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]"></div>
            </div>

            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
                <div className="flex items-center cursor-pointer group" onClick={() => navigate('/supervisor')}>
                    <div className="p-2 bg-slate-800 rounded-lg mr-3 group-hover:bg-slate-700 transition-colors border border-slate-700/50">
                        <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300 tracking-wider">INCIDENT LOGS</span>
                        <span className="block text-xs text-red-400/60 font-mono tracking-widest uppercase">Historical Database</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 shadow-inner">
                        Total Records: <span className="text-white">{alerts.length}</span>
                    </span>
                </div>
            </nav>

            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500"></div>
                    <div className="p-5 border-b border-slate-800/80 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-lg font-black tracking-wider uppercase flex items-center text-slate-100">
                            <List className="h-5 w-5 mr-3 text-red-400" /> Database Query
                        </h2>
                        <div className="flex gap-3">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-slate-300 text-sm font-bold uppercase tracking-wider rounded-lg focus:ring-red-500/50 focus:border-red-500 block p-2.5 outline-none shadow-inner"
                            >
                                <option value="All">ALL STATUS</option>
                                <option value="Active">ACTIVE ONLY</option>
                                <option value="Resolved">RESOLVED</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-slate-800/50 font-medium tracking-widest">Timestamp</th>
                                    <th className="p-4 border-b border-slate-800/50 font-medium tracking-widest">Protocol Type</th>
                                    <th className="p-4 border-b border-slate-800/50 font-medium tracking-widest">Severity</th>
                                    <th className="p-4 border-b border-slate-800/50 font-medium tracking-widest">Event Description</th>
                                    <th className="p-4 border-b border-slate-800/50 font-medium tracking-widest">Subject</th>
                                    <th className="p-4 border-b border-slate-800/50 font-medium tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading && alerts.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-mono text-sm tracking-widest uppercase">Querying Database...</td></tr>
                                ) : filteredAlerts.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-mono text-sm tracking-widest uppercase">No Records Found Matching Criteria</td></tr>
                                ) : filteredAlerts.map(alert => (
                                    <tr key={alert._id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="p-4 text-slate-400 font-mono text-xs">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="uppercase tracking-widest text-xs font-black text-slate-300 bg-slate-800 px-2 py-1 rounded shadow-inner border border-slate-700">
                                                {alert.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider shadow-sm
                                                ${alert.severity === 'Danger' ? 'bg-red-950/50 border-red-900/50 text-red-400'
                                                    : alert.severity === 'Warning' ? 'bg-yellow-950/50 border-yellow-900/50 text-yellow-400'
                                                        : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-200">{alert.message}</td>
                                        <td className="p-4 text-slate-400 font-bold">{alert.workerId?.name || 'UNKNOWN'}</td>
                                        <td className="p-4 text-right">
                                            {!alert.resolved ? (
                                                <button
                                                    onClick={() => resolveAlert(alert._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-emerald-500/50 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] text-xs font-black uppercase tracking-widest rounded-lg text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50 hover:border-emerald-500 transition-all duration-300"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Mark clear
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-500 opacity-50">
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Verified
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alerts;
