import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CalendarCheck, Dumbbell, UtensilsCrossed, CreditCard, MessageCircle, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PortalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch('/api/portal/profile').then(r => r.json()).then(setProfile).catch(console.error);
    }, []);

    const quickLinks = [
        { icon: <User size={24} />, label: 'My Profile', desc: 'View your ID card', path: '/portal/profile', color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
        { icon: <CalendarCheck size={24} />, label: 'Attendance', desc: 'Track your visits', path: '/portal/attendance', color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400' },
        { icon: <Dumbbell size={24} />, label: 'Workout Plan', desc: 'Your exercise routine', path: '/portal/workouts', color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400' },
        { icon: <UtensilsCrossed size={24} />, label: 'Diet Plan', desc: 'Your meal plan', path: '/portal/diet', color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400' },
        { icon: <CreditCard size={24} />, label: 'Payments', desc: 'Payment history', path: '/portal/payments', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
        { icon: <MessageCircle size={24} />, label: 'Chat', desc: 'Message the owner', path: '/portal/chat', color: 'from-pink-500/20 to-pink-600/10', iconColor: 'text-pink-400' },
    ];

    const daysUntilExpiry = profile?.expiry ? Math.ceil((new Date(profile.expiry) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="space-y-6 pb-6">
            {/* Welcome Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-gold-400/20"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(8,13,26,0.9))' }}
            >
                <div className="flex items-center gap-4">
                    {profile?.photo ? (
                        <img src={profile.photo} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gold-400/30" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl">
                            {user?.name?.charAt(0) || 'M'}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-display font-bold text-gold-400 tracking-wider">Hello, {user?.name || 'Member'}!</h1>
                        <p className="text-sm font-tech text-gray-400 tracking-wider">Member #{user?.memberId}</p>
                    </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-3 mt-4">
                    {profile?.planType && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-tech tracking-wider border border-gold-400/20"
                            style={{ background: 'rgba(251,191,36,0.08)' }}>
                            <Activity size={12} className="text-gold-400" />
                            <span className="text-gold-400">{profile.planType}</span>
                        </div>
                    )}
                    {profile?.status && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-tech tracking-wider border ${profile.status === 'active' ? 'border-green-400/20 text-green-400' : 'border-red-400/20 text-red-400'}`}
                            style={{ background: profile.status === 'active' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
                            <div className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            {profile.status?.toUpperCase()}
                        </div>
                    )}
                    {daysUntilExpiry !== null && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-tech tracking-wider border ${daysUntilExpiry > 7 ? 'border-blue-400/20 text-blue-400' : daysUntilExpiry > 0 ? 'border-yellow-400/20 text-yellow-400' : 'border-red-400/20 text-red-400'}`}
                            style={{ background: daysUntilExpiry > 7 ? 'rgba(59,130,246,0.08)' : daysUntilExpiry > 0 ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.08)' }}>
                            <Clock size={12} />
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expired'}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(link.path)}
                        className="glass-card rounded-2xl p-5 border border-white/[0.06] text-left transition-all hover:border-gold-400/20"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 ${link.iconColor}`}>
                            {link.icon}
                        </div>
                        <h3 className="text-sm font-tech font-bold text-white tracking-wider mb-1">{link.label}</h3>
                        <p className="text-[10px] font-tech text-gray-500 tracking-wider">{link.desc}</p>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default PortalDashboard;
