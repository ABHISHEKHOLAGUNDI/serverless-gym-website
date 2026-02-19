import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Search, UserCheck, UserX } from 'lucide-react';

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
                    <h1 className="text-2xl font-display font-bold text-gold-400 tracking-widest uppercase">Attendance</h1>
                    <p className="text-sm text-gray-500 font-tech mt-0.5">
                        {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-tech text-gray-600 uppercase tracking-widest">Present</span>
                    <span className="text-2xl font-display font-black text-gold-400">{presentCount}/{totalCount}</span>
                </div>
            </div>

            {/* Date Picker + Circle Stats */}
            <div className="bg-[#0c1220]/70 border border-gold-400/15 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3 bg-[#050816]/60 border border-gold-400/10 px-4 py-2 rounded-xl flex-1 mr-4">
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
                        <circle cx="32" cy="32" r="28" stroke="#1a1f2e" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="#b8972a" strokeWidth="6" fill="transparent"
                            strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * percentage) / 100}
                            strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xs font-bold text-gold-400 font-tech">{percentage}%</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-600 group-focus-within:text-gold-400 transition-colors" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search member..."
                    className="block w-full pl-10 pr-3 py-3 bg-[#0c1220]/70 border border-gold-400/20 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-gold-400 transition-all font-tech"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-10 text-gray-600 font-tech tracking-wider">Loading attendance...</div>
            ) : (
                <div className="space-y-3">
                    {filteredAttendance.map(record => (
                        <motion.div
                            key={record.member_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl flex justify-between items-center border transition-all ${record.status === 'present'
                                    ? 'bg-emerald-950/30 border-emerald-500/20'
                                    : 'bg-[#0c1220]/50 border-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-display border ${record.status === 'present'
                                        ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30'
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
                                className={`p-2 rounded-xl transition-all border ${record.status === 'present'
                                        ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 border-emerald-500/20'
                                        : 'bg-red-950/30 text-red-500 hover:bg-red-950/50 border-red-500/15'
                                    }`}
                            >
                                {record.status === 'present' ? <UserCheck size={20} /> : <UserX size={20} />}
                            </button>
                        </motion.div>
                    ))}
                    {filteredAttendance.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-gray-600 font-tech tracking-wider">No active members found</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Attendance;
