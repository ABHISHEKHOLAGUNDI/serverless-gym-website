import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, CalendarCheck, Settings, LogOut, FileText, DollarSign, Activity, Dumbbell, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymContext } from '../context/GymContext';

const Layout = () => {
    const { dbError } = useGymContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
                <div className="bg-[#050816]/85 backdrop-blur-xl px-5 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center space-x-3">
                        <button onClick={toggleSidebar} className="p-2 text-gold-400 hover:text-white hover:bg-gold-400/10 rounded-xl transition-all border border-gold-400/15 hover:border-gold-400/40 active:scale-95">
                            <Menu size={20} />
                        </button>
                        <span className="text-2xl font-display font-bold bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            PARSEC<span className="text-white/70 text-xs font-tech tracking-[0.15em] ml-2">GYM</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-center w-9 h-9 border border-gold-400/30 rounded-full text-gold-400 bg-gold-400/5 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                        <Shield size={16} />
                    </div>
                </div>
                {/* Gold accent line */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"></div>
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-[68px] p-4 overflow-y-auto">
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
                                background: 'linear-gradient(180deg, rgba(10, 13, 20, 0.98) 0%, rgba(5, 8, 22, 0.99) 100%)',
                                borderRight: '1px solid rgba(251, 191, 36, 0.15)',
                                boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(251, 191, 36, 0.05)'
                            }}
                        >
                            {/* Sidebar Header */}
                            <div className="p-5 flex justify-between items-center border-b border-gold-400/15">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                                        <Shield size={16} className="text-black" />
                                    </div>
                                    <div>
                                        <span className="font-display font-bold text-gold-400 tracking-[0.15em] text-sm">ADMIN</span>
                                        <div className="text-[10px] font-tech text-gray-600 tracking-wider">COMMANDER</div>
                                    </div>
                                </div>
                                <button onClick={toggleSidebar} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
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
                                                ? 'bg-gold-400/10 text-gold-400'
                                                : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.03]'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-gold-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                            )}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive
                                                ? 'bg-gold-400/15 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                                                : 'bg-white/[0.03]'
                                                }`}>
                                                {item.icon}
                                            </div>
                                            <span className="font-medium">{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.04]">
                                <div className="text-[10px] font-tech text-gray-700 tracking-wider text-center">
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
