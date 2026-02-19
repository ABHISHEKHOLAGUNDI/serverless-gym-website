import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Search, UserCheck, UserX } from 'lucide-react';

const DUMMY_ATTENDANCE = [
    { id: 1, name: 'John Doe', status: 'present', time: '07:30 AM' },
    { id: 2, name: 'Jane Smith', status: 'absent', time: '-' },
    { id: 3, name: 'Mike Ross', status: 'present', time: '06:45 AM' },
    { id: 4, name: 'Sarah Connor', status: 'present', time: '08:15 AM' },
    { id: 5, name: 'Tony Stark', status: 'absent', time: '-' },
];

const Attendance = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceData, setAttendanceData] = useState(DUMMY_ATTENDANCE);

    const toggleStatus = (id) => {
        setAttendanceData(prev => prev.map(record => {
            if (record.id === id) {
                return {
                    ...record,
                    status: record.status === 'present' ? 'absent' : 'present',
                    time: record.status === 'present' ? '-' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            }
            return record;
        }));
    };

    const filteredAttendance = attendanceData.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats
    const presentCount = attendanceData.filter(r => r.status === 'present').length;
    const totalCount = attendanceData.length;
    const percentage = Math.round((presentCount / totalCount) * 100) || 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24 px-4 space-y-6 pt-4 relative min-h-screen"
        >
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance</h1>
                    <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Present</span>
                    <span className="text-2xl font-black text-blue-600">{presentCount}/{totalCount}</span>
                </div>
            </div>

            {/* Date Picker & Stats Card */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 flex justify-between items-center">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1 mr-4">
                    <CalendarIcon size={18} className="text-blue-500" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-gray-700 font-medium focus:outline-none w-full text-sm"
                    />
                </div>
                <div className="w-16 h-16 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="#2563eb" strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * percentage) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xs font-bold text-gray-700">{percentage}%</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search member..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredAttendance.map(record => (
                    <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-2xl flex justify-between items-center border transition-all ${record.status === 'present'
                                ? 'bg-blue-50/50 border-blue-100 shadow-sm'
                                : 'bg-white/60 border-gray-100'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${record.status === 'present' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {record.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className={`font-semibold text-base ${record.status === 'present' ? 'text-gray-900' : 'text-gray-500'}`}>{record.name}</h3>
                                <p className="text-xs text-gray-400 font-medium">Check-in: {record.time}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleStatus(record.id)}
                            className={`p-2 rounded-xl transition-all shadow-sm ${record.status === 'present'
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-red-50 text-red-400 hover:bg-red-100'
                                }`}
                        >
                            {record.status === 'present' ? <UserCheck size={20} /> : <UserX size={20} />}
                        </button>
                    </motion.div>
                ))}

                {filteredAttendance.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-gray-500">No members found</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Attendance;
