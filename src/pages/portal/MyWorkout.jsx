import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Calendar } from 'lucide-react';

const dayColors = {
    Monday: 'from-blue-500/15 to-blue-600/5 border-blue-400/20',
    Tuesday: 'from-purple-500/15 to-purple-600/5 border-purple-400/20',
    Wednesday: 'from-green-500/15 to-green-600/5 border-green-400/20',
    Thursday: 'from-orange-500/15 to-orange-600/5 border-orange-400/20',
    Friday: 'from-pink-500/15 to-pink-600/5 border-pink-400/20',
    Saturday: 'from-cyan-500/15 to-cyan-600/5 border-cyan-400/20',
    Sunday: 'from-red-500/15 to-red-600/5 border-red-400/20',
};

const dayIconColors = {
    Monday: 'text-blue-400', Tuesday: 'text-purple-400', Wednesday: 'text-green-400',
    Thursday: 'text-orange-400', Friday: 'text-pink-400', Saturday: 'text-cyan-400', Sunday: 'text-red-400',
};

const MyWorkout = () => {
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        fetch('/api/portal/workouts').then(r => r.json()).then(setWorkouts).catch(console.error);
    }, []);

    const today = new Date().toLocaleString('en-US', { weekday: 'long' });

    return (
        <div className="space-y-6 pb-6">
            <h2 className="text-xl font-display font-bold text-gold-400 tracking-wider">MY WORKOUT PLAN</h2>

            {workouts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass-card rounded-2xl p-8 border border-white/[0.06] text-center">
                    <Dumbbell className="mx-auto text-gray-600 mb-3" size={40} />
                    <h3 className="text-sm font-tech text-gray-400 tracking-wider mb-1">NO WORKOUT PLAN ASSIGNED</h3>
                    <p className="text-xs font-tech text-gray-600">Your gym owner will assign a workout plan for you.</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {workouts.map((w, i) => {
                        const isToday = w.day === today;
                        let exercises = [];
                        try { exercises = JSON.parse(w.exercises || '[]'); } catch { exercises = [w.exercises]; }

                        return (
                            <motion.div
                                key={w.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`glass-card rounded-2xl p-5 border bg-gradient-to-r ${dayColors[w.day] || 'border-white/[0.06]'} ${isToday ? 'ring-1 ring-gold-400/30' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Dumbbell size={16} className={dayIconColors[w.day] || 'text-gold-400'} />
                                        <h3 className="text-sm font-tech font-bold text-white tracking-wider">{w.day?.toUpperCase()}</h3>
                                    </div>
                                    {isToday && (
                                        <span className="text-[9px] font-tech text-gold-400 tracking-wider px-2 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/20">
                                            TODAY
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    {exercises.map((ex, j) => (
                                        <div key={j} className="flex items-start gap-2 text-sm font-tech text-gray-300">
                                            <span className="text-gold-400/50 mt-0.5">•</span>
                                            <span>{typeof ex === 'string' ? ex : `${ex.name || ex} ${ex.sets ? `— ${ex.sets} sets × ${ex.reps} reps` : ''}`}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyWorkout;
