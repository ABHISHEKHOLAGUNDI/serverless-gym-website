import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, Ruler, Dumbbell, CreditCard, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch('/api/portal/profile').then(r => r.json()).then(setProfile).catch(console.error);
    }, []);

    if (!profile) return <div className="flex items-center justify-center h-64 text-gray-500 font-tech">Loading profile...</div>;

    const daysLeft = profile.expiry ? Math.ceil((new Date(profile.expiry) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
        <div className="space-y-6 pb-6">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider">MY ID CARD</h2>

            {/* ID Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden border border-gold-400/30"
                style={{
                    background: 'linear-gradient(145deg, rgba(15,20,35,0.98), rgba(8,13,26,0.95))',
                    boxShadow: '0 0 40px rgba(251,191,36,0.1), 0 10px 40px rgba(0,0,0,0.5)'
                }}
            >
                {/* Card Header */}
                <div className="px-6 py-4 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.08))' }}>
                    <div>
                        <div className="text-lg font-display font-bold text-gold-400 tracking-[0.2em]">PARSEC GYM</div>
                        <div className="text-[9px] font-tech text-gray-400 tracking-[0.3em]">MEMBER IDENTITY CARD</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-tech text-gold-400/70 tracking-wider">ID</div>
                        <div className="text-lg font-tech font-bold text-gold-400"># {profile.id}</div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                    <div className="flex gap-5">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {profile.photo ? (
                                <img src={profile.photo} alt="" className="w-24 h-24 rounded-xl object-cover border border-gold-400/20" />
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gold-400/20 to-amber-600/10 flex items-center justify-center border border-gold-400/20">
                                    <User size={36} className="text-gold-400/50" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2.5">
                            <div>
                                <div className="text-[9px] font-tech text-gray-500 tracking-wider">NAME</div>
                                <div className="text-lg font-display font-bold text-white">{profile.name}</div>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <div className="text-[9px] font-tech text-gray-500 tracking-wider">PHONE</div>
                                    <div className="text-sm font-tech text-gray-300 flex items-center gap-1"><Phone size={11} /> {profile.phone}</div>
                                </div>
                                {profile.dob && (
                                    <div>
                                        <div className="text-[9px] font-tech text-gray-500 tracking-wider">DOB</div>
                                        <div className="text-sm font-tech text-gray-300 flex items-center gap-1"><Calendar size={11} /> {profile.dob}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Details Grid */}
                    <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
                        <div className="text-center">
                            <div className="text-[9px] font-tech text-gray-500 tracking-wider mb-1">PLAN</div>
                            <div className="text-sm font-tech font-bold text-gold-400">{profile.planType || 'N/A'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] font-tech text-gray-500 tracking-wider mb-1">EXPIRY</div>
                            <div className={`text-sm font-tech font-bold ${daysLeft > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {profile.expiry || 'N/A'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[9px] font-tech text-gray-500 tracking-wider mb-1">TRAINER</div>
                            <div className="text-sm font-tech font-bold text-blue-400">{profile.trainerName || 'None'}</div>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-tech tracking-wider ${profile.status === 'active' ? 'text-green-400 bg-green-500/10 border border-green-400/20' : 'text-red-400 bg-red-500/10 border border-red-400/20'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                            {profile.status?.toUpperCase()}
                        </div>
                        {daysLeft !== null && (
                            <span className={`text-xs font-tech tracking-wider ${daysLeft > 7 ? 'text-gray-400' : daysLeft > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Membership Expired'}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Personal Details */}
            <div className="glass-card rounded-2xl p-5 border border-white/[0.06] space-y-4">
                <h3 className="text-sm font-tech font-bold text-gray-300 tracking-wider">PERSONAL DETAILS</h3>
                {[
                    { label: 'Height', value: profile.height ? `${profile.height} cm` : 'Not set', icon: <Ruler size={14} /> },
                    { label: 'Plan Amount', value: profile.amount ? `₹${profile.amount}` : 'N/A', icon: <CreditCard size={14} /> },
                    { label: 'Start Date', value: profile.startDate || 'N/A', icon: <Calendar size={14} /> },
                    { label: 'Trainer', value: profile.trainerName || 'Not assigned', icon: <Dumbbell size={14} /> },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2 text-sm font-tech text-gray-400">
                            <span className="text-gold-400/50">{item.icon}</span> {item.label}
                        </div>
                        <span className="text-sm font-tech text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyProfile;
