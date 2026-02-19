import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, CalendarCheck, Settings, LogOut, FileText, DollarSign, Activity, MessageSquare, Utensils, Dumbbell, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
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
        <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">

            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-lg border-b border-white/50 px-5 py-3 flex items-center justify-between z-50 shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={toggleSidebar} className="p-2 bg-white/50 hover:bg-white rounded-full transition-all shadow-sm border border-gray-100/50 text-gray-700">
                        <Menu size={22} />
                    </button>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Gym<span className="font-extrabold">Manager</span>
                    </span>
                </div>
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white shadow-md shadow-blue-500/30">
                    <Users size={18} />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow pt-16 p-4 overflow-y-auto bg-background">
                <Outlet />
            </main>

            {/* Side Drawer Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="fixed inset-0 bg-black z-50"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl overflow-y-auto"
                        >
                            <div className="p-4 bg-primary-blue text-white flex justify-between items-center">
                                <span className="font-bold text-lg">Menu</span>
                                <button onClick={toggleSidebar}><X size={24} /></button>
                            </div>

                            <div className="py-2">
                                {menuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full flex items-center space-x-3 px-6 py-4 text-lg font-medium transition-colors ${location.pathname === item.path
                                            ? 'bg-blue-50 text-primary-blue border-r-4 border-primary-blue'
                                            : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                                            }`}
                                    >
                                        {item.icon}
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
