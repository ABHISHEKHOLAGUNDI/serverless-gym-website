import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Flame, TrendingUp } from 'lucide-react';

const MyAttendance = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetch('/api/portal/attendance').then(r => r.json()).then(setRecords).catch(console.error);
    }, []);

    // Calculate streak
    const calculateStreak = () => {
        const sorted = [...records].filter(r => r.status === 'present').sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < sorted.length; i++) {
            const d = new Date(sorted[i].date);
            const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
            if (diff <= i + 1) streak++;
            else break;
        }
        return streak;
    };

    const totalPresent = records.filter(r => r.status === 'present').length;
    const streak = calculateStreak();

    // Get current month dates for calendar view
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleString('default', { month: 'long' });

    const presentDates = new Set(
        records.filter(r => r.status === 'present' && r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
            .map(r => parseInt(r.date.split('-')[2]))
    );

    return (
        <div className="space-y-6 pb-6">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider">MY ATTENDANCE</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-4 border border-white/[0.06] text-center">
                    <Flame className="mx-auto text-orange-400 mb-2" size={28} />
                    <div className="text-2xl font-display font-bold text-white">{streak}</div>
                    <div className="text-[10px] font-tech text-gray-500 tracking-wider">DAY STREAK</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl p-4 border border-white/[0.06] text-center">
                    <TrendingUp className="mx-auto text-green-400 mb-2" size={28} />
                    <div className="text-2xl font-display font-bold text-white">{totalPresent}</div>
                    <div className="text-[10px] font-tech text-gray-500 tracking-wider">TOTAL VISITS</div>
                </motion.div>
            </div>

            {/* Calendar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-5 border border-white/[0.06]">
                <h3 className="text-sm font-tech font-bold text-gray-300 tracking-wider mb-4">{monthName.toUpperCase()} {year}</h3>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-tech text-gray-500">{d}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isPresent = presentDates.has(day);
                        const isToday = day === now.getDate();
                        return (
                            <div key={day}
                                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-tech transition-all ${isPresent
                                    ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                                    : isToday
                                        ? 'border border-gold-400/30 text-gold-400'
                                        : 'text-gray-500'
                                    }`}
                                style={isPresent ? { boxShadow: '0 0 8px rgba(34,197,94,0.15)' } : {}}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-[10px] font-tech text-gray-500">
                        <div className="w-3 h-3 rounded bg-green-500/20 border border-green-400/30"></div> Present
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-tech text-gray-500">
                        <div className="w-3 h-3 rounded border border-gold-400/30"></div> Today
                    </div>
                </div>
            </motion.div>

            {/* Recent Records */}
            <div className="glass-card rounded-2xl p-5 border border-white/[0.06]">
                <h3 className="text-sm font-tech font-bold text-gray-300 tracking-wider mb-3">RECENT RECORDS</h3>
                {records.length === 0 ? (
                    <p className="text-gray-500 text-sm font-tech text-center py-4">No attendance records yet</p>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {records.slice(0, 20).map(r => (
                            <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                                <span className="text-sm font-tech text-gray-300">{r.date}</span>
                                <span className={`text-xs font-tech px-2 py-0.5 rounded-full ${r.status === 'present' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                    {r.status?.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAttendance;
