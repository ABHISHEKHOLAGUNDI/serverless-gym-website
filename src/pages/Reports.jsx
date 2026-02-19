import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, Share2, Activity, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

// Mock Data (In real app, fetch from Context/DB)
const DUMMY_MEMBERS = [
    { id: 1, name: 'John Doe', age: 28, height: 175, weight: 80, attendance: 22, totalDays: 30, initialWeight: 85 },
    { id: 2, name: 'Jane Smith', age: 24, height: 162, weight: 60, attendance: 15, totalDays: 30, initialWeight: 62 },
];

const Reports = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [remarks, setRemarks] = useState('');

    const filteredMembers = DUMMY_MEMBERS.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Calculations
    const calculateBMI = (weight, heightCm) => {
        if (!weight || !heightCm) return { value: '-', status: 'Unknown', color: 'text-gray-400' };
        const heightM = heightCm / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);

        let status = 'Normal';
        let color = 'text-green-600';
        if (bmi < 18.5) { status = 'Underweight'; color = 'text-blue-500'; }
        else if (bmi >= 25 && bmi < 29.9) { status = 'Overweight'; color = 'text-yellow-500'; }
        else if (bmi >= 30) { status = 'Obese'; color = 'text-red-500'; }

        return { value: bmi, status, color };
    };

    const calculateProgress = (current, initial) => {
        const diff = (current - initial).toFixed(1);
        if (diff < 0) return { text: `Lost ${Math.abs(diff)} kg`, type: 'loss', icon: <TrendingUp className="text-green-500" /> };
        if (diff > 0) return { text: `Gained ${diff} kg`, type: 'gain', icon: <TrendingUp className="text-blue-500" /> };
        return { text: 'No Change', type: 'neutral', icon: <Activity className="text-gray-400" /> };
    };

    const bmiData = selectedMember ? calculateBMI(selectedMember.weight, selectedMember.height) : {};
    const weightProgress = selectedMember ? calculateProgress(selectedMember.weight, selectedMember.initialWeight) : {};
    const attendancePercentage = selectedMember ? Math.round((selectedMember.attendance / selectedMember.totalDays) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Results & Reports</h1>

            {!selectedMember ? (
                // Member Selector
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredMembers.map(member => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className="p-4 bg-white rounded-xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-800">{member.name}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">ID: {member.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Report Card View
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center">
                        <button onClick={() => setSelectedMember(null)} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
                        <div className="flex gap-2">
                            <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"><Share2 size={18} /></button>
                            <button onClick={() => window.print()} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Printer size={18} /></button>
                        </div>
                    </div>

                    {/* Report Card Container */}
                    <div id="report-card" className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-6 relative overflow-hidden">
                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>

                        {/* Header Info */}
                        <div className="relative flex justify-between items-end border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2>
                                <p className="text-gray-500 text-sm">Age: {selectedMember.age} • Height: {selectedMember.height} cm</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Report Date</p>
                                <p className="font-medium text-gray-800">{new Date().toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>

                        {/* Attendance Score */}
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Calendar size={12} /> Attendance Score</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{attendancePercentage}%</p>
                                <p className="text-xs text-gray-500">Attended <span className="font-bold text-gray-800">{selectedMember.attendance}</span>/{selectedMember.totalDays} days</p>
                            </div>
                            {/* Mini Visual Chart (CSS Circle) */}
                            <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent transform -rotate-45" style={{ clipPath: `inset(0 0 0 0)` }}></div>
                                <Activity size={24} className="text-blue-500" />
                            </div>
                        </div>

                        {/* Physical Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* BMI Card */}
                            <div className={`p-4 rounded-2xl border ${bmiData.status === 'Normal' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                <p className="text-xs font-bold text-gray-500 uppercase">BMI Score</p>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className={`text-2xl font-black ${bmiData.color}`}>{bmiData.value}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 ${bmiData.color}`}>{bmiData.status}</span>
                                </div>
                            </div>

                            {/* Weight Progress Card */}
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-gray-500 uppercase">Progress</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {weightProgress.icon}
                                    <span className="font-bold text-gray-800 text-lg">{weightProgress.text}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Since Joining</p>
                            </div>
                        </div>

                        {/* Trainer Remarks */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Trainer's Remarks</p>
                            <textarea
                                className="w-full bg-yellow-50/50 border border-yellow-200 rounded-xl p-3 text-sm text-gray-700 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                                rows="3"
                                placeholder="Add specific feedback for the member..."
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Reports;
