import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowDownCircle, ArrowUpCircle, IndianRupee } from 'lucide-react';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetch('/api/portal/payments').then(r => r.json()).then(setPayments).catch(console.error);
        fetch('/api/portal/profile').then(r => r.json()).then(setProfile).catch(console.error);
    }, []);

    return (
        <div className="space-y-6 pb-6">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider">MY PAYMENTS</h2>

            {/* Current Plan Card */}
            {profile && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-5 border border-gold-400/20"
                    style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(8,13,26,0.9))' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-tech text-gray-500 tracking-wider mb-1">CURRENT PLAN</div>
                            <div className="text-lg font-display font-bold text-gold-400">{profile.planType || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-tech text-gray-500 tracking-wider mb-1">AMOUNT</div>
                            <div className="text-lg font-display font-bold text-white flex items-center gap-1">
                                <IndianRupee size={16} className="text-gold-400" />{profile.amount || '0'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                        <span className="text-xs font-tech text-gray-500">Start: {profile.startDate || 'N/A'}</span>
                        <span className="text-xs font-tech text-gray-500">Expiry: {profile.expiry || 'N/A'}</span>
                    </div>
                </motion.div>
            )}

            {/* Payment History */}
            <div className="glass-card rounded-2xl p-5 border border-white/[0.06]">
                <h3 className="text-sm font-tech font-bold text-gray-300 tracking-wider mb-4">PAYMENT HISTORY</h3>

                {payments.length === 0 ? (
                    <div className="text-center py-8">
                        <CreditCard className="mx-auto text-gray-600 mb-3" size={36} />
                        <p className="text-sm font-tech text-gray-500">No payment records found</p>
                        <p className="text-[10px] font-tech text-gray-600 mt-1">Your payment history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {payments.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.type === 'Income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {p.type === 'Income' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-tech text-white">{p.category || p.description || 'Payment'}</div>
                                        <div className="text-[10px] font-tech text-gray-500">{p.date}</div>
                                    </div>
                                </div>
                                <span className={`text-sm font-tech font-bold ${p.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                                    ₹{p.amount}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPayments;
