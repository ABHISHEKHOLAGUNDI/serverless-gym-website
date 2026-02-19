import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, CalendarCheck, Settings, LogOut, FileText, DollarSign, Activity, MessageSquare, Utensils, Dumbbell, BarChart2 } from 'lucide-react';
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
        { icon: <Home size={24} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Users size={24} />, label: 'Manage Members', path: '/members' },
        { icon: <Dumbbell size={24} />, label: 'Trainers', path: '/trainers' },
        { icon: <Settings size={22} />, label: 'Maintenance', path: '/maintenance' },
        { icon: <CalendarCheck size={24} />, label: 'Attendance', path: '/attendance' },
        { icon: <DollarSign size={24} />, label: 'Manage Expenses', path: '/expenses' },
        { icon: <Activity size={24} />, label: 'Measurements', path: '/measurements' },
        { icon: <FileText size={24} />, label: 'Reports', path: '/reports' },
        { icon: <LogOut size={24} />, label: 'Logout', path: '/login', action: true },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-text-primary font-sans relative">
            {/* Alert Banner */}
            {dbError && (
                <div className="bg-red-900/90 border-b border-red-500 text-white text-center py-2 px-4 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-[60] font-bold animate-pulse font-tech tracking-wider">
                    ⚠️ {dbError} - CHECK CONFIG
                </div>
            )}

            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 bg-[#050816]/80 backdrop-blur-md border-b border-gold-400/30 px-5 py-3 flex items-center justify-between z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center space-x-3">
                    <button onClick={toggleSidebar} className="p-2 text-gold-400 hover:text-white hover:bg-gold-400/10 rounded-full transition-all border border-gold-400/20">
                        <Menu size={22} />
                    </button>
                    <span className="text-2xl font-display font-bold bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 bg-clip-text text-transparent tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        PARSEC<span className="text-white text-base font-tech tracking-normal ml-2 opacity-80">GYM</span>
                    </span>
                </div>
                <div className="flex items-center justify-center w-10 h-10 border border-gold-400/50 rounded-full text-gold-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] bg-black/40">
                    <Users size={18} />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow pt-20 p-4 overflow-y-auto">
                <Outlet />
            </main>

            {/* Side Drawer Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-[#02040a] z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-[#0a0d14]/95 border-r border-gold-400/30 z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gold-400/20 flex justify-between items-center bg-gradient-to-r from-gold-900/20 to-transparent">
                                <span className="font-display font-bold text-xl text-gold-400 tracking-widest">MENU</span>
                                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="py-4 space-y-1 px-2">
                                {menuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full flex items-center space-x-4 px-6 py-4 text-lg font-tech tracking-wide transition-all duration-300 border-l-2 ${location.pathname === item.path
                                            ? 'bg-gradient-to-r from-gold-400/20 to-transparent text-gold-400 border-gold-400 shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]'
                                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`${location.pathname === item.path ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : ''}`}>
                                            {item.icon}
                                        </div>
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
