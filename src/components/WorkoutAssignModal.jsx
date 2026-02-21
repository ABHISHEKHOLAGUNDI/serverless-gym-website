import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, Plus, Trash2, Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkoutAssignModal = ({ member, onClose }) => {
    const [workouts, setWorkouts] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeDay, setActiveDay] = useState('Monday');

    useEffect(() => {
        if (!member?.id) return;
        fetch(`/api/workouts?member_id=${member.id}`)
            .then(r => r.json())
            .then(data => {
                const mapped = {};
                (data || []).forEach(w => {
                    let exercises = [];
                    try { exercises = JSON.parse(w.exercises || '[]'); } catch { exercises = [w.exercises]; }
                    mapped[w.day] = exercises;
                });
                setWorkouts(mapped);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [member]);

    const getExercises = (day) => workouts[day] || [];

    const addExercise = (day) => {
        setWorkouts(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), '']
        }));
    };

    const updateExercise = (day, index, value) => {
        setWorkouts(prev => ({
            ...prev,
            [day]: prev[day].map((ex, i) => i === index ? value : ex)
        }));
    };

    const removeExercise = (day, index) => {
        setWorkouts(prev => ({
            ...prev,
            [day]: prev[day].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each day that has exercises
            for (const day of DAYS) {
                const exercises = (workouts[day] || []).filter(e => e.trim());
                await fetch('/api/workouts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId: member.id, day, exercises })
                });
            }
            onClose();
        } catch (e) {
            console.error('Save failed', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            onClick={onClose}>
            <div className="absolute inset-0 bg-[#020408]/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass-card rounded-2xl border border-gold-400/20"
                style={{ background: 'linear-gradient(180deg, rgba(12,17,30,0.98), rgba(8,13,26,0.99))' }}
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 z-10 p-5 border-b border-white/[0.06] flex items-center justify-between"
                    style={{ background: 'rgba(12,17,30,0.98)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Dumbbell className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-display font-bold text-white tracking-wider">ASSIGN WORKOUT</h3>
                            <p className="text-[10px] font-tech text-gray-500 mt-0.5">{member?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl border border-white/[0.06] text-gray-400 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 font-tech">Loading...</div>
                ) : (
                    <div className="p-5">
                        {/* Day Tabs */}
                        <div className="flex gap-1 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                            {DAYS.map(day => (
                                <button key={day} onClick={() => setActiveDay(day)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-tech tracking-wider whitespace-nowrap transition-all ${activeDay === day
                                        ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                                        : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                                    {day.slice(0, 3).toUpperCase()}
                                    {(workouts[day]?.length > 0) && <span className="ml-1 text-[9px] text-gold-400">•</span>}
                                </button>
                            ))}
                        </div>

                        {/* Exercises for active day */}
                        <div className="space-y-2 mb-4">
                            <div className="text-[10px] font-tech text-gray-500 tracking-wider mb-2">{activeDay.toUpperCase()} EXERCISES</div>
                            {getExercises(activeDay).map((ex, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={ex}
                                        onChange={e => updateExercise(activeDay, i, e.target.value)}
                                        placeholder={`Exercise ${i + 1}`}
                                        className="flex-1 bg-[#050816]/50 border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm font-tech text-white placeholder-gray-600 focus:outline-none focus:border-gold-400/30 transition-all"
                                    />
                                    <button onClick={() => removeExercise(activeDay, i)}
                                        className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => addExercise(activeDay)}
                                className="w-full py-2.5 border border-dashed border-white/[0.08] rounded-xl text-xs font-tech text-gray-500 hover:text-gold-400 hover:border-gold-400/20 transition-all flex items-center justify-center gap-1">
                                <Plus size={14} /> Add Exercise
                            </button>
                        </div>

                        {/* Save Button */}
                        <button onClick={handleSave} disabled={saving}
                            className="w-full py-3 rounded-xl font-tech text-sm font-bold tracking-wider bg-gradient-to-r from-gold-500 to-amber-600 text-black flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
                            {saving ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                                : <><Save size={16} /> SAVE ALL DAYS</>}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default WorkoutAssignModal;
