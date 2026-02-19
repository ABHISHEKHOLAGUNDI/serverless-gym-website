import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, Share2, Activity, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
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
        if (diff < 0) return { text: `Lost ${Math.abs(diff)} kg`, icon: <TrendingUp className="text-emerald-400" size={20} /> };
        if (diff > 0) return { text: `Gained ${diff} kg`, icon: <TrendingUp className="text-blue-400" size={20} /> };
        return { text: 'No Change', icon: <Activity className="text-gray-500" size={20} /> };
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
            <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase mb-4">Results & Reports</h1>

            {!selectedMember ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-600" size={20} />
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="w-full pl-10 pr-4 py-3 bg-[#0c1220]/70 border border-gold-400/20 focus:border-gold-400 rounded-xl text-white outline-none font-tech placeholder-gray-700 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredMembers.map(member => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className="p-4 bg-[#0c1220]/70 border border-gold-400/10 hover:border-gold-400/40 rounded-xl flex justify-between items-center cursor-pointer transition-all group"
                            >
                                <span className="font-tech font-semibold text-gray-300 group-hover:text-gold-400 tracking-wider transition-colors">{member.name}</span>
                                <span className="text-xs bg-gold-500/10 text-gold-500 border border-gold-500/20 px-2 py-1 rounded font-tech">ID: {member.id}</span>
                            </div>
                        ))}
                        {filteredMembers.length === 0 && (
                            <div className="text-center py-4 text-gray-600 font-tech tracking-wider">No members found</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-400 font-tech tracking-wider transition-colors"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="flex gap-2">
                            <button className="p-2 bg-gold-500/10 border border-gold-400/20 text-gold-400 rounded-lg hover:bg-gold-500/20 transition-all">
                                <Share2 size={18} />
                            </button>
                            <button onClick={() => window.print()} className="p-2 bg-white/5 border border-white/5 text-gray-500 rounded-lg hover:bg-white/10 transition-all">
                                <Printer size={18} />
                            </button>
                        </div>
                    </div>

                    {loadingReport ? (
                        <div className="p-10 text-center text-gray-600 font-tech tracking-wider">Generating Report...</div>
                    ) : (
                        <div id="report-card" className="bg-[#0a0d14]/90 border border-gold-400/20 p-6 rounded-2xl space-y-6 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                            {/* Gold top strip */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-60"></div>

                            {/* Header Info */}
                            <div className="flex justify-between items-end border-b border-gold-400/10 pb-4">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-white">{selectedMember.name}</h2>
                                    <p className="text-gray-500 text-sm font-tech mt-0.5">Join Date: {selectedMember.startDate}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-tech text-gold-500 uppercase tracking-widest">Report Date</p>
                                    <p className="font-tech text-gray-300">{new Date().toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>

                            {/* Attendance Score */}
                            <div className="bg-[#050816]/60 border border-gold-400/10 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={12} /> Attendance Score
                                    </p>
                                    <p className="text-3xl font-display font-black text-gold-400 mt-1">{attendancePercentage}%</p>
                                    <p className="text-xs text-gray-600 font-tech mt-0.5">
                                        Attended <span className="font-bold text-gray-400">{reportData?.stats?.attendance}</span>/{reportData?.stats?.totalDays} days
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-[#1a1f2e] flex items-center justify-center relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-gold-500 border-t-transparent transform -rotate-45"></div>
                                    <Activity size={22} className="text-gold-500" />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#050816]/60 border border-gold-400/10 p-4 rounded-xl">
                                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest">BMI Score</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <span className={`text-2xl font-display font-black ${bmiData.color}`}>{bmiData.value}</span>
                                        <span className={`text-xs font-tech font-bold px-2 py-0.5 rounded-full bg-white/5 ${bmiData.color}`}>{bmiData.status}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1 font-tech">
                                        {bmiData.status === 'Unknown' ? "Update height to see BMI" : "Based on weight & height"}
                                    </p>
                                </div>
                                <div className="bg-[#050816]/60 border border-gold-400/10 p-4 rounded-xl">
                                    <p className="text-xs font-tech text-gray-600 uppercase tracking-widest">Progress</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {weightProgress.icon}
                                        <span className="font-display font-bold text-white text-base">{weightProgress.text}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-1 font-tech">
                                        Initial: {initialWeight}kg → Now: {currentWeight}kg
                                    </p>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div>
                                <p className="text-xs font-tech text-gray-600 uppercase tracking-widest mb-2">Trainer's Remarks</p>
                                <textarea
                                    className="w-full bg-[#050816]/60 border border-gold-400/15 focus:border-gold-400 rounded-xl p-3 text-sm text-gray-300 font-tech outline-none resize-none transition-all placeholder-gray-700"
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
