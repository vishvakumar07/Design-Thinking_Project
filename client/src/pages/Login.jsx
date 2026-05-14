import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HardHat, Activity } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [role, setRole] = useState('worker');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role === 'worker') {
                const res = await axios.post('http://localhost:5000/api/workers', {
                    name: name || 'Demo Worker',
                    role: 'Miner',
                    contact: '123-456-7890'
                });
                localStorage.setItem('workerId', res.data._id);
                navigate('/worker');
            } else {
                navigate('/supervisor');
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10 blur-3xl opacity-30 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter pb-8"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-2xl">
                        <ShieldCheck className="h-16 w-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                    </div>
                </div>
                <h2 className="mt-4 text-center text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight drop-shadow-sm">
                    Mine Safety AI
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-slate-400 uppercase tracking-widest">
                    Next-Gen Intelligent Companion
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
                <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl border border-slate-700/50 sm:px-10 transition-all duration-300 hover:border-slate-600/50">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                                Access Level
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('worker')}
                                    className={`relative overflow-hidden flex justify-center items-center px-4 py-4 rounded-xl shadow-lg text-sm font-bold transition-all duration-300
                                        ${role === 'worker'
                                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] border border-emerald-500/50 scale-105'
                                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 hover:border-slate-600'}
                                    `}
                                >
                                    <HardHat className={`mr-2 h-5 w-5 ${role === 'worker' ? 'animate-bounce-slight' : ''}`} /> Worker
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('supervisor')}
                                    className={`relative overflow-hidden flex justify-center items-center px-4 py-4 rounded-xl shadow-lg text-sm font-bold transition-all duration-300
                                        ${role === 'supervisor'
                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500/50 scale-105'
                                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 hover:border-slate-600'}
                                    `}
                                >
                                    <Activity className={`mr-2 h-5 w-5 ${role === 'supervisor' ? 'animate-pulse' : ''}`} /> Supervisor
                                </button>
                            </div>
                        </div>

                        <div className={`transition-all duration-500 overflow-hidden ${role === 'worker' ? 'max-h-24 opacity-100 mt-6' : 'max-h-0 opacity-0 m-0'}`}>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Operator Name
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={role === 'worker'}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-inner placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm bg-slate-950/80 text-white transition-colors"
                                    placeholder="Enter authorization ID or Name"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-sm font-bold text-white uppercase tracking-wider overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300
                                    ${role === 'worker'
                                        ? 'hover:shadow-[0_0_30px_rgba(5,150,105,0.5)] focus:ring-emerald-500'
                                        : 'hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] focus:ring-blue-500'
                                    }
                                `}
                            >
                                <div className={`absolute inset-0 w-full h-full transition-all duration-300 ease-out ${role === 'worker' ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}></div>
                                <div className={`absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out ${role === 'worker' ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}></div>
                                <span className="relative flex items-center">
                                    {loading ? (
                                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Initializing Protocol...</>
                                    ) : (
                                        role === 'worker' ? 'Enter Dashboard' : 'Access Command Center'
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
