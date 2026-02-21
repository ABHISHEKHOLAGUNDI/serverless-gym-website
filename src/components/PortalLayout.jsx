import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, CalendarCheck, Dumbbell, UtensilsCrossed, CreditCard, MessageCircle, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PortalLayout = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
        setIsSidebarOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: <Home size={20} />, label: 'Dashboard', path: '/portal' },
        { icon: <User size={20} />, label: 'My Profile', path: '/portal/profile' },
        { icon: <CalendarCheck size={20} />, label: 'Attendance', path: '/portal/attendance' },
        { icon: <Dumbbell size={20} />, label: 'Workout Plan', path: '/portal/workouts' },
        { icon: <UtensilsCrossed size={20} />, label: 'Diet Plan', path: '/portal/diet' },
        { icon: <CreditCard size={20} />, label: 'Payments', path: '/portal/payments' },
        { icon: <MessageCircle size={20} />, label: 'Chat', path: '/portal/chat' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-text-primary font-sans relative">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 z-50">
                <div className="px-5 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
                    style={{
                        background: 'linear-gradient(180deg, rgba(8, 13, 26, 0.95) 0%, rgba(8, 13, 26, 0.85) 100%)',
                        backdropFilter: 'blur(20px)'
                    }}>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-gold-400 hover:text-white rounded-xl transition-all border border-gold-400/25 hover:border-gold-400/50 active:scale-95"
                            style={{ background: 'rgba(251, 191, 36, 0.08)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.1)' }}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <span className="text-lg font-display font-bold tracking-[0.15em]"
                                style={{
                                    background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 40%, #f59e0b 70%, #d97706 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))'
                                }}>
                                MEMBER PORTAL
                            </span>
                            <div className="text-[10px] font-tech text-gray-500 tracking-wider">Welcome, {user?.name || 'Member'}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="p-2.5 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-white/10 hover:border-red-400/30"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <LogOut size={18} />
                    </button>
                </div>
                <div className="h-[2px]" style={{
                    background: 'linear-gradient(90deg, transparent 5%, rgba(251, 191, 36, 0.6) 50%, transparent 95%)',
                    boxShadow: '0 0 12px rgba(251, 191, 36, 0.3)'
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
                            onClick={() => setIsSidebarOpen(false)}
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
                                boxShadow: '0 0 60px rgba(0,0,0,0.9)'
                            }}
                        >
                            {/* Sidebar Header */}
                            <div className="p-5 flex justify-between items-center border-b border-gold-400/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                            boxShadow: '0 0 18px rgba(251, 191, 36, 0.4)'
                                        }}>
                                        <User size={17} className="text-black" />
                                    </div>
                                    <div>
                                        <span className="font-display font-bold text-gold-400 tracking-[0.1em] text-sm">{user?.name || 'MEMBER'}</span>
                                        <div className="text-[10px] font-tech text-gray-500 tracking-wider">MEMBER #{user?.memberId}</div>
                                    </div>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
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
                                            className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-tech tracking-wider transition-all duration-200 rounded-xl relative ${isActive ? 'text-gold-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'}`}
                                            style={isActive ? { background: 'rgba(251, 191, 36, 0.1)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.08)' } : {}}
                                        >
                                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-gold-400 rounded-r-full" style={{ boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)' }}></div>}
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={isActive ? { background: 'rgba(251, 191, 36, 0.15)', boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)' } : { background: 'rgba(255, 255, 255, 0.05)' }}>
                                                {item.icon}
                                            </div>
                                            <span className="font-medium">{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Logout at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-tech text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5">
                                    <LogOut size={16} /> LOGOUT
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortalLayout;
