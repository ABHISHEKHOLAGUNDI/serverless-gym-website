import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: password })
            });

            if (res.ok) {
                navigate('/dashboard');
            } else {
                const data = await res.json();
                setError(data.error || 'Access Denied');
                setPassword(''); // Clear pin on error
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm bg-surface p-8 rounded-2xl shadow-lg border border-surfaceHighlight relative overflow-hidden"
            >
                {error && (
                    <div className="absolute top-0 left-0 w-full bg-red-500/20 border-b border-red-500/50 text-red-200 text-xs py-2 text-center font-bold animate-pulse">
                        {error}
                    </div>
                )}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-surfaceHighlight rounded-full">
                        <Lock className="text-neon-cyan" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">Enter your 6-digit PIN to access</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="flex flex-col items-center">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            className="bg-background border border-surfaceHighlight rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[1em] focus:outline-none focus:border-neon-cyan transition-all w-full font-mono placeholder-gray-700"
                            placeholder="••••••"
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={password.length !== 6}
                        className={`w-full font-bold py-4 rounded-xl transition-all ${password.length === 6
                            ? 'bg-gradient-to-r from-neon-cyan to-blue-500 text-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Unlock Dashboard
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
