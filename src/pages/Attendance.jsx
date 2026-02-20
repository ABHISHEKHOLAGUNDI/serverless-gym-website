import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Search, UserCheck, UserX, Users } from 'lucide-react';

const Attendance = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/attendance?date=${date}&v=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setAttendanceData(data);
                }
            } catch (err) {
                console.error("Failed to fetch attendance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [date]);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'present' ? 'absent' : 'present';
        setAttendanceData(prev => prev.map(record =>
            record.member_id === id ? { ...record, status: newStatus } : record
        ));
        try {
            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: id, status: newStatus, date })
            });
        } catch (err) {
            console.error("Failed to update status", err);
            setAttendanceData(prev => prev.map(record =>
                record.member_id === id ? { ...record, status: currentStatus } : record
            ));
        }
    };

    const filteredAttendance = attendanceData.filter(record =>
        record.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const presentCount = attendanceData.filter(r => r.status === 'present').length;
    const absentCount = attendanceData.filter(r => r.status !== 'present').length;
    const totalCount = attendanceData.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase" style={{ textShadow: '0 0 15px rgba(251, 191, 36, 0.25)' }}>Attendance</h1>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-gold-400 to-transparent rounded-full mt-1" style={{ boxShadow: '0 0 8px rgba(251, 191, 36, 0.3)' }}></div>
                    <p className="text-sm text-gray-500 font-tech mt-1.5">
                        {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center border-l-2 border-l-emerald-500/50">
                    <p className="text-[10px] font-tech text-gray-500 uppercase tracking-widest">Present</p>
                    <p className="text-xl font-display font-black text-emerald-400">{presentCount}</p>
                </div>
                <div className="glass-card p-3 text-center border-l-2 border-l-red-500/50">
                    <p className="text-[10px] font-tech text-gray-500 uppercase tracking-widest">Absent</p>
                    <p className="text-xl font-display font-black text-red-400">{absentCount}</p>
                </div>
                <div className="glass-card p-3 text-center border-l-2 border-l-gold-500/50">
                    <p className="text-[10px] font-tech text-gray-500 uppercase tracking-widest">Rate</p>
                    <p className="text-xl font-display font-black text-gold-400">{percentage}%</p>
                </div>
            </div>

            {/* Date Picker + Circle Stats */}
            <div className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3 bg-[#050816]/60 border border-gold-400/10 px-4 py-2.5 rounded-xl flex-1 mr-4">
                    <CalendarIcon size={18} className="text-gold-500" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-gray-300 font-tech focus:outline-none w-full text-sm"
                    />
                </div>
                <div className="w-16 h-16 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#1a1f2e" strokeWidth="5" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="url(#goldGrad)" strokeWidth="5" fill="transparent"
                            strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * percentage) / 100}
                            strokeLinecap="round" className="transition-all duration-700" />
                        <defs>
                            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#b8972a" />
                                <stop offset="100%" stopColor="#d4a935" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="absolute text-xs font-bold text-gold-400 font-tech">{percentage}%</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="text-gray-500 group-focus-within:text-gold-400 transition-colors" size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search member..."
                    className="cosmic-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="empty-state">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Users className="w-10 h-10 text-gold-500/30" />
                    </motion.div>
                    <p className="text-gray-600 font-tech tracking-wider mt-3">Loading attendance...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAttendance.map((record, index) => (
                        <motion.div
                            key={record.member_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`glass-card p-4 flex justify-between items-center transition-all ${record.status === 'present'
                                ? 'border-l-2 border-l-emerald-500/60'
                                : 'border-l-2 border-l-red-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-display border ${record.status === 'present'
                                    ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    : 'bg-white/5 text-gray-600 border-white/5'
                                    }`}>
                                    {record.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className={`font-tech font-semibold text-base tracking-wider ${record.status === 'present' ? 'text-white' : 'text-gray-500'}`}>
                                        {record.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-600 font-tech">ID: {record.member_id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleStatus(record.member_id, record.status)}
                                className={`p-2.5 rounded-xl transition-all border ${record.status === 'present'
                                    ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                                    : 'bg-red-950/30 text-red-500 hover:bg-red-950/50 border-red-500/15'
                                    }`}
                            >
                                {record.status === 'present' ? <UserCheck size={20} /> : <UserX size={20} />}
                            </button>
                        </motion.div>
                    ))}
                    {filteredAttendance.length === 0 && (
                        <div className="empty-state">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                <Users className="w-14 h-14 mx-auto mb-3 text-gold-500/30" />
                            </motion.div>
                            <p className="text-gray-500 font-tech tracking-wider">No active members found</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Attendance;
