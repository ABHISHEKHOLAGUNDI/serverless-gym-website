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

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3
        }).format(amount);
    };

    const handleCardClick = (path) => {
        if (path) {
            navigate(path);
        }
    };

    return (
        <motion.div
            // ... (keep existing props)
            className="pb-24 px-1 space-y-5"
        >
            {/* Modern Glass Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-xl text-white">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Welcome Back, Manager! 👋</h1>
                        <p className="text-blue-100 font-medium">Here's what's happening in your gym today.</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500 opacity-20 rounded-full blur-2xl"></div>
            </div>

            {/* Futuristic Grid Matrix */}
            <div className="grid grid-cols-3 gap-3">
                <GridCard title="Live Members" value={stats.liveMembers} color="bg-gradient-to-br from-cyan-400 to-blue-500" iconSrc={activeMembersIcon} delay={0.05} onClick={() => handleCardClick('/members?filter=active')} />
                <GridCard title="Total Users" value={stats.totalUsers} color="bg-gradient-to-br from-blue-500 to-indigo-600" iconSrc={activeMembersIcon} delay={0.1} onClick={() => handleCardClick('/members?filter=all')} />
                <GridCard title="Expired" value={stats.expired} color="bg-gradient-to-br from-orange-400 to-red-500" iconSrc={expiredMembersIcon} delay={0.15} onClick={() => handleCardClick('/members?filter=expired')} />

                <GridCard title="Expiring Soon (1-3 Days)" value={stats.expiringSoon} color="bg-gradient-to-br from-rose-400 to-red-600" iconSrc={expiringIcon} delay={0.2} onClick={() => handleCardClick('/members?filter=expiring_soon')} />
                <GridCard title="In 4-7 Days" value={stats.in4to7Days} color="bg-gradient-to-br from-orange-400 to-amber-500" iconSrc={expiringIcon} delay={0.25} onClick={() => handleCardClick('/members?filter=expiring_week')} />
                <GridCard title="In 8-15 Days" value={stats.in8to15Days} color="bg-gradient-to-br from-yellow-400 to-lime-500" iconSrc={expiringIcon} delay={0.3} onClick={() => handleCardClick('/members?filter=expiring_15')} />

                <GridCard title="Birthdays Today" value={stats.birthdaysToday} color="bg-gradient-to-br from-pink-400 to-rose-500" iconSrc={cakeIcon} delay={0.35} onClick={() => handleCardClick('/members?filter=birthday')} />
                <GridCard title="Due Amount" value={formatCurrency(stats.dueAmount)} color="bg-gradient-to-br from-teal-500 to-emerald-700" iconSrc={walletIcon} delay={0.4} onClick={() => handleCardClick('/members?filter=due')} />
                <GridCard title="Today's Cash" value={formatCurrency(stats.todaysCash)} color="bg-gradient-to-br from-green-400 to-emerald-600" iconSrc={monthlyIncomeIcon} delay={0.45} onClick={() => handleCardClick('/expenses?filter=income&date=today')} />

                <GridCard title="Total Income" value={formatCurrency(stats.totalIncome)} color="bg-gradient-to-br from-teal-500 to-cyan-700" iconSrc={totalIncomeIcon} delay={0.5} onClick={() => handleCardClick('/expenses?filter=income')} />
                <GridCard title="Expenses" value={formatCurrency(stats.expenses)} color="bg-gradient-to-br from-pink-500 to-rose-600" iconSrc={revenueIcon} delay={0.55} onClick={() => handleCardClick('/expenses?filter=expenses')} />
                <GridCard title="Balance" value={formatCurrency(stats.balance)} color="bg-gradient-to-br from-violet-600 to-purple-800" iconSrc={balanceSheetIcon} delay={0.6} onClick={() => handleCardClick('/expenses?filter=all')} />
            </div>
        </motion.div>
    );
};

const GridCard = ({ title, value, color, iconSrc, icon, delay, onClick }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
            duration: 0.4,
            delay: delay,
            type: "spring",
            stiffness: 200,
            damping: 15
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="glass-card p-4 rounded-2xl flex flex-col items-center justify-between text-center h-[200px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden cursor-pointer"
    >

        {/* Subtle decorative circle in bg */}
        <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-10 ${color}`}></div>

        <div className="flex flex-col items-center gap-3 mt-4 w-full relative z-10">
            <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: Math.random() }}
                className="w-12 h-12 flex items-center justify-center filter drop-shadow-sm"
            >
                {iconSrc ? (
                    <img src={iconSrc} alt={title} className="w-full h-full object-contain" />
                ) : (
                    icon
                )}
            </motion.div>
            <span className="text-lg text-gray-800 font-extrabold leading-tight line-clamp-2 h-14 flex items-center justify-center px-1">{title}</span>
        </div>

        <div className={`
            w-full py-3 px-3 rounded-xl ${color} 
            flex items-center justify-center text-white 
            text-base font-black shadow-lg shadow-blue-500/20 
            mt-auto relative z-10 tracking-wider
        `}>
            {value}
        </div>
    </motion.div>
);

export default Dashboard;
