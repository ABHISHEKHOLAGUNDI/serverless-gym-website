import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, Share2, Activity, TrendingUp, TrendingDown, Calendar, ArrowLeft, BarChart3, FileText } from 'lucide-react';
import { useGymContext } from '../context/GymContext';

const Reports = () => {
    const { members } = useGymContext();
    const [selectedMember, setSelectedMember] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        if (!selectedMember) { setReportData(null); return; }
        const fetchReport = async () => {
            setLoadingReport(true);
            try {
                const res = await fetch(`/api/reports?id=${selectedMember.id}&v=${Date.now()}`);
                if (res.ok) { setReportData(await res.json()); }
            } catch (e) {
                console.error("Failed to fetch report", e);
            } finally {
                setLoadingReport(false);
            }
        };
        fetchReport();
    }, [selectedMember]);

    const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const calculateBMI = (weight, heightCm) => {
        if (!weight || !heightCm) return { value: '-', status: 'Unknown', color: 'text-gray-500' };
        const bmi = (parseFloat(weight) / ((parseFloat(heightCm) / 100) ** 2)).toFixed(1);
        let status = 'Normal', color = 'text-emerald-400';
        if (bmi < 18.5) { status = 'Underweight'; color = 'text-blue-400'; }
        else if (bmi >= 25 && bmi < 30) { status = 'Overweight'; color = 'text-amber-400'; }
        else if (bmi >= 30) { status = 'Obese'; color = 'text-red-400'; }
        return { value: bmi, status, color };
    };

    const calculateProgress = (current, initial) => {
        const diff = (current - initial).toFixed(1);
        if (diff < 0) return { text: `Lost ${Math.abs(diff)} kg`, icon: <TrendingDown className="text-emerald-400" size={20} />, color: 'text-emerald-400' };
        if (diff > 0) return { text: `Gained ${diff} kg`, icon: <TrendingUp className="text-blue-400" size={20} />, color: 'text-blue-400' };
        return { text: 'No Change', icon: <Activity className="text-gray-500" size={20} />, color: 'text-gray-500' };
    };

    const height = 175;
    const currentWeight = reportData?.stats?.currentWeight || 0;
    const initialWeight = reportData?.stats?.initialWeight || 0;
    const bmiData = calculateBMI(currentWeight, height);
    const weightProgress = calculateProgress(currentWeight, initialWeight);
    const attendancePercentage = reportData ? Math.round((reportData.stats.attendance / reportData.stats.totalDays) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <div>
                <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Results & Reports</h1>
                <div className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full mt-1"></div>
            </div>

            {!selectedMember ? (
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="text-gray-600 group-focus-within:text-gold-400 transition-colors" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="cosmic-input pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredMembers.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => setSelectedMember(member)}
                                className="glass-card p-4 flex justify-between items-center cursor-pointer group border-l-2 border-l-gold-500/30 hover:border-l-gold-500/60 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-gold-500/15 to-transparent border border-gold-400/20 rounded-xl flex items-center justify-center text-gold-400 font-bold text-sm font-display">
                                        {member.name.charAt(0)}
                                    </div>
                                    <span className="font-tech font-semibold text-gray-300 group-hover:text-gold-400 tracking-wider transition-colors">{member.name}</span>
                                </div>
                                <span className="text-xs bg-gold-500/10 text-gold-500 border border-gold-500/20 px-2.5 py-1 rounded-md font-tech">ID: {member.id}</span>
                            </motion.div>
                        ))}
                        {filteredMembers.length === 0 && (
                            <div className="empty-state">
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                    <FileText className="w-14 h-14 mx-auto mb-3 text-gold-500/30" />
                                </motion.div>
                                <p className="text-gray-500 font-tech tracking-wider">No members found</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-400 font-tech tracking-wider transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-gold-400/20"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div className="flex gap-2">
                            <button className="p-2.5 bg-gold-500/10 border border-gold-400/20 text-gold-400 rounded-xl hover:bg-gold-500/20 transition-all">
                                <Share2 size={16} />
                            </button>
                            <button onClick={() => window.print()} className="p-2.5 bg-white/5 border border-white/5 text-gray-500 rounded-xl hover:bg-white/10 transition-all">
                                <Printer size={16} />
                            </button>
                        </div>
                    </div>

                    {loadingReport ? (
                        <div className="empty-state">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                <BarChart3 className="w-10 h-10 text-gold-500/30" />
                            </motion.div>
                            <p className="text-gray-600 font-tech tracking-wider mt-3">Generating Report...</p>
                        </div>
                    ) : (
                        <div id="report-card" className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden">
                            {/* Gold top strip */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-60"></div>

                            {/* Header Info */}
                            <div className="flex justify-between items-end border-b border-gold-400/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gold-500/20 to-amber-600/10 border border-gold-400/25 rounded-xl flex items-center justify-center text-gold-400 font-bold text-xl font-display shadow-[0_0_15px_rgba(184,151,42,0.1)]">
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-display font-bold text-white">{selectedMember.name}</h2>
                                        <p className="text-gray-500 text-xs font-tech mt-0.5">Joined: {selectedMember.startDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-tech text-gold-500 uppercase tracking-widest">Report Date</p>
                                    <p className="font-tech text-gray-300 text-sm">{new Date().toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>

                            {/* Attendance Score */}
                            <div className="glass-card p-4 flex items-center justify-between border-l-2 border-l-gold-500/50">
                                <div>
                                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={11} /> Attendance Score
                                    </p>
                                    <p className="text-3xl font-display font-black text-gold-400 mt-1">{attendancePercentage}%</p>
                                    <p className="text-[10px] text-gray-600 font-tech mt-0.5">
                                        Attended <span className="font-bold text-gray-400">{reportData?.stats?.attendance}</span>/{reportData?.stats?.totalDays} days
                                    </p>
                                </div>
                                <div className="w-16 h-16 relative flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="#1a1f2e" strokeWidth="5" fill="transparent" />
                                        <circle cx="32" cy="32" r="28" stroke="url(#reportGoldGrad)" strokeWidth="5" fill="transparent"
                                            strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * attendancePercentage) / 100}
                                            strokeLinecap="round" className="transition-all duration-700" />
                                        <defs>
                                            <linearGradient id="reportGoldGrad" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#b8972a" />
                                                <stop offset="100%" stopColor="#d4a935" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <Activity size={18} className="absolute text-gold-500" />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4 border-l-2 border-l-emerald-500/40">
                                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest">BMI Score</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <span className={`text-2xl font-display font-black ${bmiData.color}`}>{bmiData.value}</span>
                                        <span className={`text-xs font-tech font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/5 ${bmiData.color}`}>{bmiData.status}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1.5 font-tech">
                                        {bmiData.status === 'Unknown' ? "Update height to see BMI" : "Based on weight & height"}
                                    </p>
                                </div>
                                <div className="glass-card p-4 border-l-2 border-l-blue-500/40">
                                    <p className="text-[10px] font-tech text-gray-600 uppercase tracking-widest">Progress</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {weightProgress.icon}
                                        <span className="font-display font-bold text-white text-base">{weightProgress.text}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1.5 font-tech">
                                        Initial: {initialWeight}kg → Now: {currentWeight}kg
                                    </p>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <p className="cosmic-label mb-2">Trainer's Remarks</p>
                                <textarea
                                    className="cosmic-input resize-none"
                                    rows="3"
                                    placeholder="Add specific feedback for the member..."
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Reports;
