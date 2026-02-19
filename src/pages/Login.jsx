import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Access Denied');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-700/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                {/* Glass Card */}
                <div className="glass-card rounded-3xl p-8 text-center border border-gold-400/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">

                    {/* Header Icon */}
                    <div className="w-20 h-20 bg-gradient-to-tr from-gold-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/20 ring-4 ring-gold-500/10">
                        <Lock className="text-white" size={32} />
                    </div>

                    <h2 className="text-3xl font-display font-bold text-gold-400 mb-2 tracking-widest uppercase drop-shadow-md">Access Control</h2>
                    <p className="text-gray-400 mb-8 text-sm font-tech tracking-wider">SECURE TERMINAL LOGIN</p>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-900/30 border border-red-500/50 text-red-200 text-xs py-2 px-4 rounded-lg mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)] font-tech"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                className="w-full bg-[#050816]/50 border border-gold-400/20 rounded-2xl py-4 text-center text-4xl font-tech text-gold-100 tracking-[0.5em] focus:outline-none focus:border-gold-400 focus:bg-[#050816]/80 transition-all placeholder-gold-900/20 shadow-inner"
                                placeholder="••••••"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={password.length !== 6 || loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all font-display tracking-wider ${password.length === 6
                                    ? 'bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 text-black shadow-lg shadow-gold-500/20'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                }`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    UNLOCK TERMINAL <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-[10px] mt-8 font-tech tracking-[0.2em] uppercase opacity-50">
                    &copy; 2026 FitTrack Pro. Secure System.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
