import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UtensilsCrossed, Plus, Trash2, Save } from 'lucide-react';

const MEALS = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];

const DietAssignModal = ({ member, onClose }) => {
    const [dietPlans, setDietPlans] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!member?.id) return;
        fetch(`/api/diet?member_id=${member.id}`)
            .then(r => r.json())
            .then(data => {
                const mapped = {};
                (data || []).forEach(d => {
                    mapped[d.meal_type] = d.items || '';
                });
                setDietPlans(mapped);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [member]);

    const updateMeal = (mealType, value) => {
        setDietPlans(prev => ({ ...prev, [mealType]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const mealType of MEALS) {
                const items = dietPlans[mealType] || '';
                await fetch('/api/diet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId: member.id, mealType, items })
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
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <UtensilsCrossed className="text-orange-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-display font-bold text-white tracking-wider">ASSIGN DIET PLAN</h3>
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
                    <div className="p-5 space-y-4">
                        {MEALS.map(meal => (
                            <div key={meal}>
                                <label className="text-[10px] font-tech text-gray-500 tracking-wider mb-1.5 block">{meal.toUpperCase()}</label>
                                <textarea
                                    value={dietPlans[meal] || ''}
                                    onChange={e => updateMeal(meal, e.target.value)}
                                    placeholder={`Enter ${meal.toLowerCase()} items...`}
                                    rows={2}
                                    className="w-full bg-[#050816]/50 border border-white/[0.08] rounded-xl py-2.5 px-4 text-sm font-tech text-white placeholder-gray-600 focus:outline-none focus:border-gold-400/30 transition-all resize-none"
                                />
                            </div>
                        ))}

                        {/* Save Button */}
                        <button onClick={handleSave} disabled={saving}
                            className="w-full py-3 rounded-xl font-tech text-sm font-bold tracking-wider bg-gradient-to-r from-gold-500 to-amber-600 text-black flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                            style={{ boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
                            {saving ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                                : <><Save size={16} /> SAVE DIET PLAN</>}
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default DietAssignModal;
