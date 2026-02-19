import React from 'react';
import { motion } from 'framer-motion';
import { useGymContext } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { Cake } from 'lucide-react';

// Import Custom Icons
import activeMembersIcon from '../assets/dashboard_icons/active-members.png';
import expiredMembersIcon from '../assets/dashboard_icons/expired-members.png';
import expiringIcon from '../assets/dashboard_icons/expiring.png';
import walletIcon from '../assets/dashboard_icons/wallet.png';
import monthlyIncomeIcon from '../assets/dashboard_icons/monthly-income.png';
import totalIncomeIcon from '../assets/dashboard_icons/total-income.png';
import revenueIcon from '../assets/dashboard_icons/revenue.png';

import balanceSheetIcon from '../assets/dashboard_icons/icon_chart_1771475588040.png';
import cakeIcon from '../assets/dashboard_icons/cake.png';

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

    return (
        <motion.div className="pb-24 px-1 space-y-6">
            {/* Cosmic Gold Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0d14] border border-gold-400/30 p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] text-white">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-display font-bold mb-2 tracking-wider text-gold-400 drop-shadow-md">
                            WELCOME COMMANDER 👋
                        </h1>
                        <p className="text-gray-400 font-tech tracking-wide text-lg">System Status: <span className="text-green-400 animate-pulse">ONLINE</span></p>
                    </div>
                </div>
                {/* Banner Background Effects */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gold-400/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-blue-900/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Dash Grid */}
            <div className="grid grid-cols-3 gap-4">
                <GridCard title="LIVE MEMBERS" value={stats.liveMembers} accentColor="text-cyan-400" glowColor="shadow-cyan-400/20" iconSrc={activeMembersIcon} delay={0.05} onClick={() => handleCardClick('/members?filter=active')} />
                <GridCard title="TOTAL USERS" value={stats.totalUsers} accentColor="text-blue-400" glowColor="shadow-blue-400/20" iconSrc={activeMembersIcon} delay={0.1} onClick={() => handleCardClick('/members?filter=all')} />
                <GridCard title="EXPIRED" value={stats.expired} accentColor="text-red-500" glowColor="shadow-red-500/20" iconSrc={expiredMembersIcon} delay={0.15} onClick={() => handleCardClick('/members?filter=expired')} />

                <GridCard title="EXPIRING SOON" value={stats.expiringSoon} accentColor="text-orange-400" glowColor="shadow-orange-400/20" iconSrc={expiringIcon} delay={0.2} onClick={() => handleCardClick('/members?filter=expiring_soon')} />
                <GridCard title="IN 4-7 DAYS" value={stats.in4to7Days} accentColor="text-amber-400" glowColor="shadow-amber-400/20" iconSrc={expiringIcon} delay={0.25} onClick={() => handleCardClick('/members?filter=expiring_week')} />
                <GridCard title="IN 8-15 DAYS" value={stats.in8to15Days} accentColor="text-yellow-400" glowColor="shadow-yellow-400/20" iconSrc={expiringIcon} delay={0.3} onClick={() => handleCardClick('/members?filter=expiring_15')} />

                <GridCard title="BIRTHDAYS" value={stats.birthdaysToday} accentColor="text-pink-400" glowColor="shadow-pink-400/20" iconSrc={cakeIcon} delay={0.35} onClick={() => handleCardClick('/members?filter=birthday')} />
                <GridCard title="DUE AMOUNT" value={formatCurrency(stats.dueAmount)} accentColor="text-emerald-400" glowColor="shadow-emerald-400/20" iconSrc={walletIcon} delay={0.4} onClick={() => handleCardClick('/members?filter=due')} />
                <GridCard title="TODAY'S CASH" value={formatCurrency(stats.todaysCash)} accentColor="text-green-400" glowColor="shadow-green-400/20" iconSrc={monthlyIncomeIcon} delay={0.45} onClick={() => handleCardClick('/expenses?filter=income&date=today')} />

                <GridCard title="TOTAL INCOME" value={formatCurrency(stats.totalIncome)} accentColor="text-teal-400" glowColor="shadow-teal-400/20" iconSrc={totalIncomeIcon} delay={0.5} onClick={() => handleCardClick('/expenses?filter=income')} />
                <GridCard title="EXPENSES" value={formatCurrency(stats.expenses)} accentColor="text-rose-400" glowColor="shadow-rose-400/20" iconSrc={revenueIcon} delay={0.55} onClick={() => handleCardClick('/expenses?filter=expenses')} />
                <GridCard title="BALANCE" value={formatCurrency(stats.balance)} accentColor="text-purple-400" glowColor="shadow-purple-400/20" iconSrc={balanceSheetIcon} delay={0.6} onClick={() => handleCardClick('/expenses?filter=all')} />
            </div>
        </motion.div>
    );
};

const GridCard = ({ title, value, accentColor, glowColor, iconSrc, delay, onClick }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: delay }}
        whileHover={{ scale: 1.03, translateY: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
            glass-card p-4 rounded-xl flex flex-col items-center justify-between text-center h-[220px] 
            cursor-pointer relative group overflow-hidden bg-[#0c1220]/60
        `}
    >
        {/* Hover Glow Effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-${accentColor.replace('text-', '')} to-transparent`}></div>

        {/* Icon */}
        <div className="relative z-10 mt-2 mb-2 w-14 h-14 flex items-center justify-center p-2 rounded-full border border-white/5 bg-white/5 shadow-inner">
            <img src={iconSrc} alt={title} className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
        </div>

        {/* Title */}
        <span className="text-sm font-tech uppercase tracking-widest text-gray-400 group-hover:text-gold-400 transition-colors">
            {title}
        </span>

        {/* Value */}
        <div className={`
            text-2xl font-display font-bold tracking-wider mt-auto mb-2
            ${accentColor} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]
        `}>
            {value}
        </div>

        {/* Bottom Decorative Line */}
        <div className={`w-12 h-1 rounded-full bg-white/10 group-hover:bg-gold-500 transition-all duration-300`}></div>
    </motion.div>
);

export default Dashboard;
