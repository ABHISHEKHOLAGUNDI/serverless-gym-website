import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Placeholder for API Call
        console.log("Attempting Login:", { username, password });
        // Simulate success for UI testing
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm bg-surface p-8 rounded-2xl shadow-lg border border-surfaceHighlight"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-surfaceHighlight rounded-full">
                        <Lock className="text-neon-cyan" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-6">Admin Access</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-background border border-surfaceHighlight rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="Enter admin ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border border-surfaceHighlight rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-neon-cyan to-blue-500 text-black font-bold py-3 rounded-lg mt-4 shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-shadow"
                    >
                        Secure Login
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
