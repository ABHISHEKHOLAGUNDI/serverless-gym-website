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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden font-sans">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                {/* Glass Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-3xl p-8 text-center">

                    {/* Header Icon */}
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                        <Lock className="text-white" size={32} />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Access Control</h2>
                    <p className="text-blue-200 mb-8 text-sm font-medium">Enter your secure PIN to continue</p>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs py-2 px-4 rounded-lg mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
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
                                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 text-center text-4xl font-mono text-white tracking-[0.5em] focus:outline-none focus:border-blue-400 focus:bg-black/30 transition-all placeholder-white/10"
                                placeholder="••••••"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(37, 99, 235, 0.5)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={password.length !== 6 || loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${password.length === 6
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Unlock Dashboard <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-xs mt-8">
                    &copy; 2026 FitTrack Pro. Secure System.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
