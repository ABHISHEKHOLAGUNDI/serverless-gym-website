import React from 'react';
import { motion } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { Users, UserX, Clock, AlertTriangle, Calendar, Cake, Wallet, TrendingUp, DollarSign, ArrowUpRight, BarChart3, Minus } from 'lucide-react';

const Dashboard = () => {
    const { stats } = useGymContext();
    const navigate = useNavigate();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3
        }).format(amount);
    };

    const handleCardClick = (path) => {
        if (path) navigate(path);
    };

    const cardGroups = [
        {
            title: 'MEMBERS',
            cards: [
                { title: 'LIVE MEMBERS', value: stats.liveMembers, icon: <Users size={20} />, color: 'emerald', path: '/members?filter=active' },
                { title: 'TOTAL USERS', value: stats.totalUsers, icon: <Users size={20} />, color: 'blue', path: '/members?filter=all' },
                { title: 'EXPIRED', value: stats.expired, icon: <UserX size={20} />, color: 'red', path: '/members?filter=expired' },
            ]
        },
        {
            title: 'EXPIRY ALERTS',
            cards: [
                { title: 'EXPIRING SOON', value: stats.expiringSoon, icon: <AlertTriangle size={20} />, color: 'orange', path: '/members?filter=expiring_soon' },
                { title: 'IN 4-7 DAYS', value: stats.in4to7Days, icon: <Clock size={20} />, color: 'amber', path: '/members?filter=expiring_week' },
                { title: 'IN 8-15 DAYS', value: stats.in8to15Days, icon: <Calendar size={20} />, color: 'yellow', path: '/members?filter=expiring_15' },
            ]
        },
        {
            title: 'FINANCES',
            cards: [
                { title: 'BIRTHDAYS', value: stats.birthdaysToday, icon: <Cake size={20} />, color: 'pink', path: '/members?filter=birthday' },
                { title: 'DUE AMOUNT', value: formatCurrency(stats.dueAmount), icon: <Wallet size={20} />, color: 'teal', path: '/members?filter=due' },
                { title: "TODAY'S CASH", value: formatCurrency(stats.todaysCash), icon: <DollarSign size={20} />, color: 'green', path: '/expenses?filter=income&date=today' },
            ]
        },
        {
            title: 'OVERVIEW',
            cards: [
                { title: 'TOTAL INCOME', value: formatCurrency(stats.totalIncome), icon: <TrendingUp size={20} />, color: 'cyan', path: '/expenses?filter=income' },
                { title: 'EXPENSES', value: formatCurrency(stats.expenses), icon: <ArrowUpRight size={20} />, color: 'rose', path: '/expenses?filter=expenses' },
                { title: 'BALANCE', value: formatCurrency(stats.balance), icon: <BarChart3 size={20} />, color: 'purple', path: '/expenses?filter=all' },
            ]
        }
    ];

    const colorMap = {
        emerald: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
        blue: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)' },
        red: { bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.15)' },
        orange: { bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.2)', text: '#f97316', glow: 'rgba(249, 115, 22, 0.15)' },
        amber: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' },
        yellow: { bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.2)', text: '#eab308', glow: 'rgba(234, 179, 8, 0.15)' },
        pink: { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.2)', text: '#ec4899', glow: 'rgba(236, 72, 153, 0.15)' },
        teal: { bg: 'rgba(20, 184, 166, 0.08)', border: 'rgba(20, 184, 166, 0.2)', text: '#14b8a6', glow: 'rgba(20, 184, 166, 0.15)' },
        green: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', glow: 'rgba(34, 197, 94, 0.15)' },
        cyan: { bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4', glow: 'rgba(6, 182, 212, 0.15)' },
        rose: { bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e', glow: 'rgba(244, 63, 94, 0.15)' },
        purple: { bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.2)', text: '#a855f7', glow: 'rgba(168, 85, 247, 0.15)' },
    };

    return (
        <motion.div className="pb-24 px-1 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl p-6" style={{
                background: 'linear-gradient(135deg, rgba(10, 13, 20, 0.9) 0%, rgba(15, 20, 35, 0.8) 50%, rgba(10, 13, 20, 0.9) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.15)',
                boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)'
            }}>
                <div className="relative z-10">
                    <h1 className="text-3xl font-display font-bold tracking-[0.12em] text-gold-400 mb-1">
                        WELCOME COMMANDER
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
                        <p className="text-gray-500 font-tech tracking-wider text-sm">System Status: <span className="text-green-400">ONLINE</span></p>
                    </div>
                </div>
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/[0.06] rounded-full blur-[80px] -mt-16 -mr-16"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/[0.04] rounded-full blur-[60px] -mb-12 -ml-12"></div>
            </div>

            {/* Card Groups */}
            {cardGroups.map((group, gi) => (
                <div key={gi} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-3.5 rounded-full bg-gold-400/40"></div>
                        <span className="text-[10px] font-tech font-semibold text-gray-600 tracking-[0.2em] uppercase">{group.title}</span>
                        <div className="flex-1 h-px bg-white/[0.04]"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {group.cards.map((card, ci) => {
                            const c = colorMap[card.color];
                            return (
                                <motion.div
                                    key={ci}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: gi * 0.08 + ci * 0.04 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleCardClick(card.path)}
                                    className="cursor-pointer rounded-xl p-3.5 flex flex-col items-center text-center gap-2.5 relative overflow-hidden group"
                                    style={{
                                        background: `linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(10, 15, 30, 0.4) 100%)`,
                                        border: `1px solid rgba(251, 191, 36, 0.08)`,
                                        boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
                                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = c.border;
                                        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.08)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)';
                                    }}
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                                        style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                                        {card.icon}
                                    </div>

                                    {/* Title */}
                                    <span className="text-[9px] font-tech font-semibold uppercase tracking-[0.15em] text-gray-500 group-hover:text-gray-300 transition-colors leading-tight">
                                        {card.title}
                                    </span>

                                    {/* Value */}
                                    <span className="text-xl font-display font-bold tracking-wider" style={{ color: c.text }}>
                                        {card.value}
                                    </span>

                                    {/* Bottom accent */}
                                    <div className="w-8 h-[2px] rounded-full bg-white/[0.06] group-hover:w-12 transition-all duration-300" style={{ '--tw-hover-bg': c.border }}></div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default Dashboard;
