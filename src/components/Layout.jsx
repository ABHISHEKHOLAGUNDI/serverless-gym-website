import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, CalendarCheck, Settings, LogOut, FileText, DollarSign, Activity, Dumbbell, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';

const Layout = () => {
    const { dbError, resetAllData } = useGymContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleNavigation = (path) => {
        navigate(path);
        setIsSidebarOpen(false);
    };

    const menuItems = [
        { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Users size={20} />, label: 'Manage Members', path: '/members' },
        { icon: <Dumbbell size={20} />, label: 'Trainers', path: '/trainers' },
        { icon: <Settings size={20} />, label: 'Maintenance', path: '/maintenance' },
        { icon: <CalendarCheck size={20} />, label: 'Attendance', path: '/attendance' },
        { icon: <DollarSign size={20} />, label: 'Manage Expenses', path: '/expenses' },
        { icon: <Activity size={20} />, label: 'Measurements', path: '/measurements' },
        { icon: <FileText size={20} />, label: 'Reports', path: '/reports' },
        { icon: <LogOut size={20} />, label: 'Logout', path: '/login', action: true },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-text-primary font-sans relative">
            {/* DB Error Banner */}
            {dbError && (
                <div className="bg-red-900/90 border-b border-red-500 text-white text-center py-2 px-4 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-[60] font-bold animate-pulse font-tech tracking-wider text-sm">
                    ⚠️ {dbError} — CHECK CONFIG
                </div>
            )}

            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50">
                <div className="px-5 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
                    style={{
                        background: 'linear-gradient(180deg, rgba(8, 13, 26, 0.95) 0%, rgba(8, 13, 26, 0.85) 100%)',
                        backdropFilter: 'blur(20px)'
                    }}>
                    <div className="flex items-center space-x-3">
                        <button onClick={toggleSidebar} className="p-2.5 text-gold-400 hover:text-white rounded-xl transition-all border border-gold-400/25 hover:border-gold-400/50 active:scale-95"
                            style={{ background: 'rgba(251, 191, 36, 0.08)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.1)' }}>
                            <Menu size={20} />
                        </button>
                        <span className="text-2xl font-display font-bold tracking-[0.2em]"
                            style={{
                                background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 40%, #f59e0b 70%, #d97706 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))'
                            }}>
                            PARSEC<span style={{
                                WebkitTextFillColor: 'rgba(255,255,255,0.8)',
                                fontSize: '0.65rem',
                                fontFamily: "'Rajdhani', sans-serif",
                                letterSpacing: '0.15em',
                                marginLeft: '8px'
                            }}>GYM</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 border border-gold-400/35 rounded-full text-gold-400"
                        style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(251, 191, 36, 0.04))',
                            boxShadow: '0 0 18px rgba(251, 191, 36, 0.2), inset 0 0 8px rgba(251, 191, 36, 0.05)'
                        }}>
                        <Shield size={17} />
                    </div>
                </div>
                {/* Gold accent line with glow */}
                <div className="h-[2px]" style={{
                    background: 'linear-gradient(90deg, transparent 5%, rgba(251, 191, 36, 0.6) 50%, transparent 95%)',
                    boxShadow: '0 0 12px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.1)'
                }}></div>
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-[72px] p-4 overflow-y-auto">
                <Outlet />
            </main>

            {/* Side Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.75 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-[#020408] z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] z-50 overflow-y-auto"
                            style={{
                                background: 'linear-gradient(180deg, rgba(10, 15, 28, 0.98) 0%, rgba(8, 13, 26, 0.99) 100%)',
                                borderRight: '1px solid rgba(251, 191, 36, 0.2)',
                                boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 40px rgba(251, 191, 36, 0.08)'
                            }}
                        >
                            {/* Sidebar Header */}
                            <div className="p-5 flex justify-between items-center border-b border-gold-400/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                            boxShadow: '0 0 18px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.1)'
                                        }}>
                                        <Shield size={17} className="text-black" />
                                    </div>
                                    <div>
                                        <span className="font-display font-bold text-gold-400 tracking-[0.15em] text-sm" style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.3)' }}>ADMIN</span>
                                        <div className="text-[10px] font-tech text-gray-500 tracking-wider">COMMANDER</div>
                                    </div>
                                </div>
                                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="py-3 space-y-0.5 px-2">
                                {menuItems.map((item, index) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <motion.button
                                            key={index}
                                            onClick={() => handleNavigation(item.path)}
                                            whileTap={{ scale: 0.97 }}
                                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-tech tracking-wider transition-all duration-200 rounded-xl relative ${isActive
                                                ? 'text-gold-400'
                                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                                }`}
                                            style={isActive ? {
                                                background: 'rgba(251, 191, 36, 0.1)',
                                                boxShadow: '0 0 15px rgba(251, 191, 36, 0.08)'
                                            } : {}}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-gold-400 rounded-r-full" style={{ boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)' }}></div>
                                            )}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}
                                                style={isActive ? {
                                                    background: 'rgba(251, 191, 36, 0.15)',
                                                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)'
                                                } : {
                                                    background: 'rgba(255, 255, 255, 0.05)'
                                                }}>
                                                {item.icon}
                                            </div>
                                            <span className="font-medium">{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Sidebar Footer with Hard Reset */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06] space-y-3">
                                <button
                                    disabled={resetLoading}
                                    onClick={async () => {
                                        if (!window.confirm('⚠️ WARNING: This will permanently delete ALL data — members, income, expenses, trainers, machines, attendance, and measurements.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?')) return;
                                        const typed = window.prompt('Type "RESET" to confirm:');
                                        if (typed !== 'RESET') { alert('Reset cancelled. You must type RESET exactly.'); return; }
                                        setResetLoading(true);
                                        const success = await resetAllData();
                                        setResetLoading(false);
                                        if (success) {
                                            alert('✅ All data has been cleared. The app is now fresh.');
                                            setIsSidebarOpen(false);
                                            navigate('/dashboard');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-tech font-bold tracking-wider transition-all duration-200 border"
                                    style={{
                                        background: 'rgba(220, 38, 38, 0.1)',
                                        borderColor: 'rgba(220, 38, 38, 0.35)',
                                        color: '#f87171',
                                        boxShadow: '0 0 15px rgba(220, 38, 38, 0.08)'
                                    }}
                                >
                                    <AlertTriangle size={16} />
                                    {resetLoading ? 'RESETTING...' : 'HARD RESET'}
                                </button>
                                <div className="text-[10px] font-tech text-gray-600 tracking-wider text-center">
                                    PARSEC GYM &copy; 2025
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
